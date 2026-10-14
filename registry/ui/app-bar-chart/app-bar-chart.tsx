'use client';

import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppChartTooltip, type ChartCursor } from '@/components/ds/ui/app-chart-tooltip';

/** Chart colors, as token names. Series run blue, teal, amber, violet; red is kept for errors. */
export const CHART_COLORS = {
	brand: { dot: 'bg-brand', fill: 'var(--ds-color-bg-brand)' },
	'series-1': { dot: 'bg-series-1', fill: 'var(--ds-color-chart-series-1)' },
	'series-2': { dot: 'bg-series-2', fill: 'var(--ds-color-chart-series-2)' },
	'series-3': { dot: 'bg-series-3', fill: 'var(--ds-color-chart-series-3)' },
	'series-4': { dot: 'bg-series-4', fill: 'var(--ds-color-chart-series-4)' },
	ok: { dot: 'bg-chart-ok', fill: 'var(--ds-color-chart-ok)' },
	'client-error': { dot: 'bg-chart-client-error', fill: 'var(--ds-color-chart-client-error)' },
	'server-error': { dot: 'bg-chart-server-error', fill: 'var(--ds-color-chart-server-error)' },
	alert: { dot: 'bg-alert', fill: 'var(--ds-color-chart-alert)' },
	'alert-strong': { dot: 'bg-alert-strong', fill: 'var(--ds-color-chart-alert-strong)' },
	other: { dot: 'bg-neutral-10', fill: 'var(--ds-color-neutral-10)' },
} as const;
export type ChartColor = keyof typeof CHART_COLORS;

export type ChartSeries = { key: string; label: string; color: ChartColor };
export type ChartBucket = { label: string; values: Record<string, number> };

// Five gridlines: 0 and four round steps (1, 2, 2.5 or 5 times a power of ten), at least 0 to 4.
const Y_INTERVALS = 4;
export function niceMax(peak: number) {
	const raw = Math.max(1, peak / Y_INTERVALS);
	const power = 10 ** Math.floor(Math.log10(raw));
	const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
	return step * Y_INTERVALS;
}

// Room around the plot, in px: value labels in the left gutter, dates in the bottom one.
const PAD = { top: 12, right: 4, bottom: 26, left: 36 };
const BAR_SHARE = 0.72;
const BAR_MIN = 3;
const BAR_MAX = 28;
const BAR_RADIUS = 3;
// Data changes glide over MORPH_MS on the emphasized curve (ease-out quint); the first draw-in is done by DRAW_IN_MS.
const MORPH_MS = 250;
const DRAW_IN_MS = 800;
const easeEmphasized = (t: number) => 1 - (1 - t) ** 5;

type Bucket = { label: string; values: Record<string, number>; total: number };
type Shown = { buckets: Bucket[]; top: number; generation: number };

const totalOf = (b: ChartBucket): Bucket => ({ ...b, total: Object.values(b.values).reduce((a, v) => a + v, 0) });
const same = (a: Bucket, b: Bucket) => a.total === b.total && Object.keys({ ...a.values, ...b.values }).every((k) => (a.values[k] ?? 0) === (b.values[k] ?? 0));
function mix(from: Bucket, to: Bucket, t: number): Bucket {
	const values: Record<string, number> = {};
	for (const k of Object.keys({ ...from.values, ...to.values })) values[k] = (from.values[k] ?? 0) + ((to.values[k] ?? 0) - (from.values[k] ?? 0)) * t;
	return { label: to.label, values, total: from.total + (to.total - from.total) * t };
}

/** Same number of bars: glide from what is on screen (interruptible). A new number of bars swaps in and crossfades. */
function useMorphed(buckets: Bucket[], top: number): Shown {
	const [shown, setShown] = useState<Shown>({ buckets, top, generation: 0 });
	const ref = useRef(shown);
	useLayoutEffect(() => {
		const from = ref.current;
		const show = (next: Shown) => {
			ref.current = next;
			setShown(next);
		};
		const unchanged = from.top === top && from.buckets.length === buckets.length && from.buckets.every((b, i) => same(b, buckets[i]));
		const canMorph = from.buckets.length === buckets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (unchanged || !canMorph) {
			show({ buckets, top, generation: from.generation + (from.buckets.length === buckets.length ? 0 : 1) });
			return;
		}
		const start = performance.now();
		let frame = requestAnimationFrame(function step(now) {
			const p = Math.min(1, (now - start) / MORPH_MS);
			const e = easeEmphasized(p);
			show(p === 1 ? { buckets, top, generation: from.generation } : { buckets: buckets.map((b, i) => mix(from.buckets[i], b, e)), top: from.top + (top - from.top) * e, generation: from.generation });
			if (p < 1) frame = requestAnimationFrame(step);
		});
		return () => cancelAnimationFrame(frame);
	}, [buckets, top]);
	return shown;
}

export type AppBarChartProps = {
	buckets: ChartBucket[];
	series: ChartSeries[];
	/** Plural unit for the hover card ("calls", "credits"). */
	unit: string;
	/** Accessible name for the chart. */
	label: string;
	/** Legend picks a series out; the rest fade to 18%. Omit to manage it inside the chart. */
	focusKey?: string;
	onFocusChange?: (key: string | undefined) => void;
	/** A control at the legend row's right end, such as a metric switch. */
	legendAside?: ReactNode;
	className?: string;
};

/** Stacked bars over a value axis and three dates. The legend row is the series picker. */
export function AppBarChart({ buckets: input, series, unit, label, focusKey: focusProp, onFocusChange, legendAside, className }: AppBarChartProps) {
	const areaRef = useRef<HTMLDivElement>(null);
	const id = `chart${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [cursor, setCursor] = useState<ChartCursor>();
	const [ownFocus, setOwnFocus] = useState<string>();
	const focusKey = onFocusChange ? focusProp : ownFocus;
	const setFocus = onFocusChange ?? setOwnFocus;
	const [hasDrawnIn, setHasDrawnIn] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setHasDrawnIn(true), DRAW_IN_MS);
		return () => clearTimeout(t);
	}, []);
	useLayoutEffect(() => {
		const area = areaRef.current;
		if (!area) return;
		const measure = () => setSize({ width: area.clientWidth, height: area.clientHeight });
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(area);
		return () => observer.disconnect();
	}, []);

	const [buckets, setBuckets] = useState(() => input.map(totalOf));
	const [lastInput, setLastInput] = useState(input);
	if (lastInput !== input) {
		setLastInput(input);
		setBuckets(input.map(totalOf));
	}
	const plotWidth = Math.max(0, size.width - PAD.left - PAD.right);
	const plotHeight = Math.max(0, size.height - PAD.top - PAD.bottom);
	const top = niceMax(Math.max(0, ...buckets.map((b) => b.total)));
	const shown = useMorphed(buckets, top);
	const slot = buckets.length > 0 ? plotWidth / buckets.length : 0;
	const barWidth = Math.min(BAR_MAX, Math.max(BAR_MIN, slot * BAR_SHARE));
	const centerAt = (i: number) => PAD.left + slot * (i + 0.5);
	const baseline = PAD.top + plotHeight;
	const yAt = (v: number) => baseline - (v / shown.top) * plotHeight;
	const labelIndexes = [...new Set([0, Math.floor((buckets.length - 1) / 2), buckets.length - 1])].filter((i) => i >= 0);
	const active = activeIndex === null ? null : buckets[activeIndex];

	return (
		<div className={cx('flex flex-1 flex-col gap-2', className)}>
			<div
				ref={areaRef}
				role="img"
				aria-label={label}
				onMouseMove={(event) => {
					if (slot === 0) return;
					const x = event.clientX - event.currentTarget.getBoundingClientRect().left - PAD.left;
					setCursor({ x: event.clientX, y: event.clientY });
					setActiveIndex(Math.min(buckets.length - 1, Math.max(0, Math.floor(x / slot))));
				}}
				onMouseLeave={() => setActiveIndex(null)}
				className="relative min-h-28 flex-1"
			>
				{size.width > 0 && size.height > 0 && (
					<svg width={size.width} height={size.height} className="absolute inset-0 overflow-visible" aria-hidden>
						{Array.from({ length: Y_INTERVALS + 1 }, (_, step) => {
							const value = (top * step) / Y_INTERVALS;
							const y = baseline - (value / top) * plotHeight;
							return (
								<g key={step}>
									<line x1={PAD.left} x2={size.width - PAD.right} y1={y} y2={y} stroke="var(--ds-color-border-subtle)" />
									<text x={PAD.left - 8} y={y} dy="0.32em" textAnchor="end" className="fill-fg-subtle text-micro tabular-nums">
										{value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}
									</text>
								</g>
							);
						})}
						<g key={shown.generation} className={cx(shown.generation > 0 && 'chart-swap')}>
							{shown.buckets.map((bucket, index) => {
								const x = centerAt(index) - barWidth / 2;
								let below = 0;
								const bands = series.map((entry) => {
									const value = bucket.values[entry.key] ?? 0;
									const band = { entry, y: yAt(below + value), height: (value / shown.top) * plotHeight };
									below += value;
									return band;
								});
								const barTop = yAt(below);
								const barHeight = baseline - barTop;
								const r = Math.min(BAR_RADIUS, barHeight, barWidth / 2);
								return (
									<g key={index}>
										<rect x={x - 3} y={PAD.top - 4} width={barWidth + 6} height={plotHeight + 8} rx={3} fill="var(--ds-color-bg-wash)" opacity={activeIndex === index ? 0.04 : 0} className="transition-opacity duration-150" />
										{barHeight > 0 && (
											<g className={cx(!hasDrawnIn && 'chart-bar-in')} style={hasDrawnIn ? undefined : { animationDelay: `${Math.round((index / Math.max(1, shown.buckets.length - 1)) * 300)}ms` }}>
												<clipPath id={`${id}-${index}`}>
													<path d={`M${x},${baseline}V${barTop + r}q0,-${r} ${r},-${r}H${x + barWidth - r}q${r},0 ${r},${r}V${baseline}Z`} />
												</clipPath>
												<g clipPath={`url(#${id}-${index})`}>
													{bands.map(({ entry, y, height }) =>
														height > 0 ? <rect key={entry.key} x={x} y={y} width={barWidth} height={height} fill={CHART_COLORS[entry.color].fill} opacity={focusKey !== undefined && entry.key !== focusKey ? 0.18 : 1} className="transition-opacity duration-200" /> : null,
													)}
												</g>
											</g>
										)}
									</g>
								);
							})}
						</g>
						{labelIndexes.map((index) => {
							const isFirst = index === 0 && buckets.length > 1;
							const isLast = index === buckets.length - 1 && buckets.length > 1;
							const x = isFirst ? centerAt(index) - barWidth / 2 : isLast ? centerAt(index) + barWidth / 2 : centerAt(index);
							return (
								<text key={index} x={x} y={size.height - 6} textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'} className="fill-fg-subtle text-micro">
									{buckets[index].label}
								</text>
							);
						})}
					</svg>
				)}
				{active && cursor && <AppChartTooltip cursor={cursor} title={active.label} total={active.total} unit={unit} rows={series.map((s) => ({ key: s.key, label: s.label, dotClass: CHART_COLORS[s.color].dot, value: active.values[s.key] ?? 0 }))} />}
			</div>
			{/* One line at the switch's height, so the card's bottom never moves; a long legend scrolls sideways. */}
			<div className="flex h-7 items-center gap-3">
				<ul className="flex min-w-0 flex-1 items-center gap-x-2.5 overflow-x-auto pl-1 text-micro whitespace-nowrap text-fg-muted">
					{series.map((entry) => (
						<li key={entry.key} className={cx('shrink-0 transition-opacity duration-200', focusKey !== undefined && entry.key !== focusKey && 'opacity-40')}>
							<button type="button" aria-pressed={entry.key === focusKey} onClick={() => setFocus(entry.key === focusKey ? undefined : entry.key)} className="flex items-center gap-1 rounded-sm outline-none transition-colors duration-150 hover:text-fg focus-visible:shadow-ring-hover">
								<span className={cx('size-1.5 rounded-pill', CHART_COLORS[entry.color].dot)} aria-hidden />
								{entry.label}
							</button>
						</li>
					))}
				</ul>
				{legendAside}
			</div>
		</div>
	);
}

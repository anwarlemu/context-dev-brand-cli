'use client';

import { BENCHMARKS, PROVIDERS, type BenchmarkData, type ProviderKey } from '@/components/ds/ui/benchmark-data';
import { RING_CLEAR_ATTRIBUTE, RingBackdrop } from '@/components/ds/ui/ring-backdrop';
import { cx as cn } from '@/components/ds/ui/cx';
import { useInView, useReducedMotion } from 'motion/react';
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

// Airy, in the manner of parallel.ai: small mono tabs over one chart drawn in the brand's dots, every axis named.
// Context's marks are the brand blue; everyone else's a quiet neutral, each named by its own logo and
// label, never by colour alone.

const LOGO_SQUARE = 'M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0Z';
const LOGO_HOLE = 'M260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z';

function ContextDevLogo({ className, style, ...props }: { className?: string; style?: CSSProperties; 'aria-hidden'?: boolean | 'true' }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 772.32 531.2" className={className} style={style} {...props}>
			<path fill="currentColor" fillRule="evenodd" d={LOGO_SQUARE + LOGO_HOLE} />
			<circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
		</svg>
	);
}

function ArrowRight({ className, ...props }: { className?: string; 'aria-hidden'?: boolean | 'true' }) {
	return (
		<svg viewBox="0 0 16 16" fill="none" className={className} {...props}>
			<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

// The figures the charts draw: the bundled sample by default, or verified results passed to the panel.
const BenchmarkDataContext = createContext<BenchmarkData>(BENCHMARKS);

const MONO = 'font-mono uppercase';
const AXIS = cn(MONO, 'text-caption tabular-nums text-fg-subtle');
// The brand's hollow circle as the chart backdrop, faint enough that the bars and labels stay on top. It is drawn ring by
// ring so none is sliced by the chart's edges or half-hidden under a bar or label (marked RING_CLEAR_ATTRIBUTE).
const RING_CLEAR = { [RING_CLEAR_ATTRIBUTE]: '' };
function ChartRings({ className }: { className?: string }) {
	return <RingBackdrop color="var(--ds-color-brand)" opacity={0.14} pitch={12} ringRadius={3} className={cn('inset-0', className)} />;
}

const TABS = [
	{ id: 'success', label: 'Success rate' },
	{ id: 'latency', label: 'Latency' },
	{ id: 'cost', label: 'Cost vs success' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const provider = (key: ProviderKey) => PROVIDERS.find((p) => p.key === key)!;

function ProviderLogo({ id, size = 16, onBrand = false }: { id: ProviderKey; size?: number; onBrand?: boolean }) {
	const { name, logo } = provider(id);
	if (!logo) return <ContextDevLogo aria-hidden="true" className={cn('w-auto shrink-0', onBrand ? 'text-on-brand' : 'text-brand')} style={{ height: size * 0.7 }} />;
	return <img src={logo} alt="" aria-hidden="true" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} title={name} />;
}

// Marks grow in once the chart is on screen, and again each time a tab mounts a new chart.
function useGrowIn() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.35 });
	const prefersReducedMotion = useReducedMotion() ?? false;
	const [grown, setGrown] = useState(false);
	useEffect(() => {
		if (!isInView || grown) return;
		const frame = requestAnimationFrame(() => setGrown(true));
		return () => cancelAnimationFrame(frame);
	}, [isInView, grown]);
	return { ref, shown: grown || prefersReducedMotion };
}

// Shown on hover or keyboard focus of the mark it sits in.
function Tooltip({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span role="tooltip" className={cn('pointer-events-none absolute z-20 w-max max-w-[min(14rem,calc(100vw-5rem))] rounded-card bg-surface-inverse px-2 py-1 text-left font-mono text-caption leading-snug text-white opacity-0 transition-opacity duration-150 group-hover/mark:opacity-100 group-focus-visible/mark:opacity-100', className)}>
			{children}
		</span>
	);
}

// A meter drawn in the brand's dots: solid up to the value, hollow for the rest of the scale.
const DOT_TONES = {
	context: { solid: 'border-brand bg-brand', hollow: 'border-brand/70 bg-transparent', label: 'text-brand' },
	other: { solid: 'border-neutral-20 bg-neutral-20', hollow: 'border-neutral-20 bg-transparent', label: 'text-neutral-80' },
};
const toneFor = (key: ProviderKey) => DOT_TONES[key === 'context' ? 'context' : 'other'];
const DOT_FILL_STAGGER_MS = 14;

function MeterDot({ solid, tone, delay }: { solid: boolean; tone: (typeof DOT_TONES)[keyof typeof DOT_TONES]; delay: number }) {
	return (
		<span className="flex items-center justify-center">
			<span className={cn('aspect-square w-full max-w-2.5 rounded-full border transition-colors duration-300 motion-reduce:transition-none', solid ? tone.solid : tone.hollow)} style={{ transitionDelay: `${delay}ms` }} />
		</span>
	);
}

const AXIS_TITLE = cn(MONO, 'text-caption text-neutral-60');

// Names both axes: the y title runs up the left side, the x title sits under the tick labels, centred on the
// plot (xInset matches the gutter the y tick labels take).
function AxisFrame({ y, x, xInset, children }: { y: string; x: string; xInset: string; children: ReactNode }) {
	return (
		<div className="flex gap-0 sm:gap-3">
			<span className={cn('hidden shrink-0 rotate-180 self-center whitespace-nowrap [writing-mode:vertical-rl] sm:block', AXIS_TITLE)}>{y}</span>
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				{children}
				<p className={cn('text-center', AXIS_TITLE, xInset)}>{x}</p>
			</div>
		</div>
	);
}

const SUCCESS_STEPS = 20;
const SUCCESS_DOT_COLUMNS = 2;

/** Grouped dot columns, one step per 5%, each topped with its provider's logo and score. */
function SuccessChart() {
	const { ref, shown } = useGrowIn();
	const data = useContext(BenchmarkDataContext);
	const { groups, values } = data.successRate;
	const ticks = [0, 25, 50, 75, 100];

	return (
		<AxisFrame y="Success rate (%)" x="Kind of page" xInset="ml-8">
			<div ref={ref} className="flex flex-col gap-3">
				<div className="relative ml-8 mt-10 h-60 sm:mt-12 sm:h-72">
					{/* On a phone the meters are narrower than a ring, so the backdrop would only show as half rings between them. */}
					<ChartRings className="hidden sm:block" />
					{ticks.map((tick) => (
						<span key={tick} className={cn('absolute -left-8 translate-y-1/2', AXIS)} style={{ bottom: `${tick}%` }}>{/* ds-override: chart position computed from the data, not layout spacing */}
							{tick}%
						</span>
					))}
					<div className="absolute inset-x-0 -bottom-px z-10 border-t border-neutral-20" />
					<div className="absolute inset-0 flex items-end justify-around gap-3 px-3 sm:gap-10">
						{groups.map((group, groupIndex) => (
							<div key={group} className="flex h-full w-full max-w-48 items-end justify-center gap-1.5 sm:gap-3">
								{PROVIDERS.map(({ key, name }, providerIndex) => {
									const value = values[key][groupIndex];
									const filledSteps = Math.round((value / 100) * SUCCESS_STEPS);
									const tone = toneFor(key);
									const baseDelay = groupIndex * 120 + providerIndex * 60;
									return (
										<div key={key} tabIndex={0} aria-label={`${name}, ${group}: ${value}%`} data-chart-mark className="group/mark relative h-full w-full max-w-7 outline-none focus-visible:ring-2 focus-visible:ring-focus">
											<div className="absolute bottom-full left-1/2 mb-1.5 flex -translate-x-1/2 flex-col items-center gap-1">
												<span className="hidden sm:block">
													<ProviderLogo id={key} size={14} />
												</span>
												{/* Four values side by side run together on a phone, so there only Context's is written; the rest are in the tooltips. */}
												<span {...RING_CLEAR} className={cn('bg-surface px-0.5 font-data text-body-sm leading-none tabular-nums sm:text-body', tone.label, key !== 'context' && 'hidden sm:inline')}>{value}</span>
											</div>
											<div {...RING_CLEAR} className="grid h-full grid-cols-2 gap-x-0.5 bg-surface px-0.5" style={{ gridTemplateRows: `repeat(${SUCCESS_STEPS}, minmax(0, 1fr))` }}>
												{Array.from({ length: SUCCESS_STEPS * SUCCESS_DOT_COLUMNS }, (_, cell) => {
													const stepFromBottom = SUCCESS_STEPS - 1 - Math.floor(cell / SUCCESS_DOT_COLUMNS);
													const solid = shown && stepFromBottom < filledSteps;
													return <MeterDot key={cell} solid={solid} tone={tone} delay={baseDelay + stepFromBottom * DOT_FILL_STAGGER_MS} />;
												})}
											</div>
											<Tooltip className="bottom-1/2 left-1/2 -translate-x-1/2">
												{name} · {group}: {value}%
											</Tooltip>
										</div>
									);
								})}
							</div>
						))}
					</div>
				</div>
				<div className="ml-8 flex justify-around gap-3 px-3 sm:gap-10">
					{groups.map((group) => (
						<span key={group} className={cn('w-full max-w-48 text-center text-caption text-neutral-60 sm:text-caption', MONO)}>
							{group}
						</span>
					))}
				</div>
			</div>
		</AxisFrame>
	);
}

const LATENCY_STEPS = 30;

/** Dot meters, fastest first. Provider labels get their own column, so they can never run into the axis. */
function LatencyChart() {
	const { ref, shown } = useGrowIn();
	const data = useContext(BenchmarkDataContext);
	const rows = PROVIDERS.map((p) => ({ ...p, seconds: data.latency[p.key] })).sort((a, b) => a.seconds - b.seconds);
	const max = Math.ceil(Math.max(...rows.map((row) => row.seconds)));
	const ticks = Array.from({ length: max + 1 }, (_, i) => i);

	return (
		<AxisFrame y="Provider" x="Median time to content (seconds)" xInset="ml-24 mr-12 sm:ml-32">
			<div ref={ref} className="flex flex-col gap-2">
				{/* Same plot height as the other charts, so switching tabs never moves anything around it. */}
				<div className="mt-4 grid h-64 grid-cols-[6rem_minmax(0,1fr)] sm:h-80 sm:grid-cols-[8rem_minmax(0,1fr)]">
					<div className="flex flex-col justify-around pr-3 sm:pr-4">
						{rows.map((row) => (
							<span key={row.key} className={cn('flex h-9 items-center justify-end gap-2 text-caption sm:text-caption', MONO, row.key === 'context' ? 'text-brand' : 'text-fg')}>
								<ProviderLogo id={row.key} size={16} />
								{row.name}
							</span>
						))}
					</div>
					<div className="relative flex flex-col justify-around border-l border-neutral-20 pr-12">
						<ChartRings />
						{rows.map((row, index) => {
							const tone = toneFor(row.key);
							const filledSteps = Math.round((row.seconds / max) * LATENCY_STEPS);
							return (
								<div key={row.key} tabIndex={0} aria-label={`${row.name}: ${row.seconds} seconds`} data-chart-mark className="group/mark relative flex h-9 items-center outline-none focus-visible:ring-2 focus-visible:ring-focus">
									<div {...RING_CLEAR} className="relative grid w-full gap-x-0.5 bg-surface py-1" style={{ gridTemplateColumns: `repeat(${LATENCY_STEPS}, minmax(0, 1fr))` }}>
										{Array.from({ length: LATENCY_STEPS }, (_, step) => (
											<MeterDot key={step} solid={shown && step < filledSteps} tone={tone} delay={index * 90 + step * DOT_FILL_STAGGER_MS} />
										))}
									</div>
									<span {...RING_CLEAR} className={cn('absolute left-full ml-2 bg-surface px-1 font-data text-body-sm leading-none tabular-nums sm:text-body', tone.label)}>{row.seconds.toFixed(1)}s</span>
									<Tooltip className="bottom-full left-0 mb-1">
										{row.name}: {row.seconds.toFixed(1)}s median
									</Tooltip>
								</div>
							);
						})}
					</div>
				</div>
				<div className="relative ml-24 mr-12 h-4 sm:ml-32">
					{ticks.map((tick) => (
						<span key={tick} className={cn(AXIS, 'absolute -translate-x-1/2 normal-case')} style={{ left: `${(tick / max) * 100}%` }}>{/* ds-override: chart position computed from the data, not layout spacing */}
							{tick}s
						</span>
					))}
				</div>
			</div>
		</AxisFrame>
	);
}

// Log scale for cost, so $0.50 and $5 sit comfortably on one axis.
const COST_TICKS = [0.5, 1, 2, 5, 10];
const costToX = (cost: number) => (Math.log(cost / COST_TICKS[0]) / Math.log(COST_TICKS.at(-1)! / COST_TICKS[0])) * 100;
const successToY = (success: number) => ((success - 50) / 50) * 100;

/** Parallel-style scatter: each provider's logo placed by success rate against cost. */
function CostChart() {
	const { ref, shown } = useGrowIn();
	const data = useContext(BenchmarkDataContext);
	const yTicks = [50, 60, 70, 80, 90, 100];

	return (
		<AxisFrame y="Success rate (%)" x="Cost per 1,000 pages (USD, log scale)" xInset="ml-8">
			<div ref={ref} className="flex flex-col gap-2">
				<div className="relative ml-8 mt-4 h-64 sm:h-80">
					<ChartRings />
					{yTicks.map((tick) => (
						<span key={tick} className={cn('absolute -left-8 translate-y-1/2', AXIS)} style={{ bottom: `${successToY(tick)}%` }}>{/* ds-override: chart position computed from the data, not layout spacing */}
							{tick}%
						</span>
					))}
					<div className="absolute inset-x-0 -bottom-px z-10 border-t border-neutral-20" />
					<div className="absolute inset-y-0 left-0 border-l border-neutral-20" />
					{PROVIDERS.map(({ key, name }, index) => {
						const { cost, success } = data.costVsSuccess[key];
						const x = costToX(cost);
						const isContext = key === 'context';
						const labelLeft = x > 62;
						return (
							<div
								key={key}
								tabIndex={0}
								aria-label={`${name}: ${success}% success at $${cost.toFixed(2)} per 1,000 pages`}
								data-chart-mark
								className="group/mark absolute flex -translate-x-1/2 translate-y-1/2 items-center outline-none transition-[opacity,scale] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
								style={{ left: `${x}%`, bottom: `${successToY(success)}%`, opacity: shown ? 1 : 0, scale: shown ? '1' : '0.6', transitionDelay: `${index * 90}ms` }} /* ds-override: chart position computed from the data, not layout spacing */
							>
								<span {...RING_CLEAR} className={cn('flex size-8 items-center justify-center rounded-card bg-surface ring-1', isContext ? 'ring-2 ring-focus' : 'ring-line')}>
									<ProviderLogo id={key} size={18} />
								</span>
								<span {...RING_CLEAR} className={cn('absolute top-1/2 flex -translate-y-1/2 flex-col whitespace-nowrap bg-surface/85 px-1 text-caption leading-tight', MONO, labelLeft ? 'right-full mr-2 items-end' : 'left-full ml-2 items-start', isContext ? 'text-brand' : 'text-fg')}>
									<span>{name}</span>
									<span className="tabular-nums text-fg-subtle">
										{success}% / ${cost.toFixed(2)}
									</span>
								</span>
							</div>
						);
					})}
				</div>
				<div className="relative ml-8 h-4">
					{COST_TICKS.map((tick) => (
						<span key={tick} className={cn('absolute -translate-x-1/2', AXIS)} style={{ left: `${costToX(tick)}%` }}>{/* ds-override: chart position computed from the data, not layout spacing */}
							${tick < 1 ? tick.toFixed(2) : tick}
						</span>
					))}
				</div>
			</div>
		</AxisFrame>
	);
}

const CHARTS: Record<TabId, () => ReactNode> = { success: SuccessChart, latency: LatencyChart, cost: CostChart };

function Legend() {
	return (
		<ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
			{PROVIDERS.map(({ key, name }) => (
				<li key={key} className={cn('flex items-center gap-1.5 text-caption', MONO, key === 'context' ? 'text-brand' : 'text-fg-muted')}>
					<ProviderLogo id={key} size={14} />
					{name}
				</li>
			))}
		</ul>
	);
}

// Each tab shows this long before the panel moves on to the next.
const CYCLE_MS = 6000;

export function BenchmarkPanel({ data = BENCHMARKS, sourceHref = '/compare/the-top-firecrawl-alternative', sourceLabel = 'See full comparisons' }: { data?: BenchmarkData; sourceHref?: string; sourceLabel?: string }) {
	const [activeTab, setActiveTab] = useState<TabId>('success');
	const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ success: null, latency: null, cost: null });
	const Chart = CHARTS[activeTab];

	// Cycles through the tabs while the panel is on screen; picking a tab jumps there and restarts its timer, and
	// the cycle carries on from it. It pauses only while a bar or point is hovered or focused (its tooltip is being read), not whenever the pointer happens
	// to rest over the section, which is most of the time on a large chart. Not at all with reduced motion.
	const panelRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(panelRef, { amount: 0.4 });
	const prefersReducedMotion = useReducedMotion() ?? false;
	const [isPaused, setIsPaused] = useState(false);
	const isRunning = !isPaused && isInView && !prefersReducedMotion;
	// Bumped on every pick, even of the tab already showing, so the timer and progress bar start over.
	const [pick, setPick] = useState(0);
	// How long a tab has been shown so far, so a pause resumes where it left off, in step with the progress bar.
	// Keyed by tab and pick: a new tab, or a fresh pick, starts from zero; time only carries over across a pause.
	const shownFor = useRef<{ tab: TabId; pick: number; ms: number }>({ tab: activeTab, pick: 0, ms: 0 });

	useEffect(() => {
		if (!isRunning) return;
		if (shownFor.current.tab !== activeTab || shownFor.current.pick !== pick) shownFor.current = { tab: activeTab, pick, ms: 0 };
		const shown = shownFor.current;
		const startedAt = performance.now();
		const timer = window.setTimeout(() => {
			const index = TABS.findIndex((t) => t.id === activeTab);
			setActiveTab(TABS[(index + 1) % TABS.length].id);
		}, CYCLE_MS - shown.ms);
		return () => {
			window.clearTimeout(timer);
			shown.ms += performance.now() - startedAt;
		};
	}, [activeTab, isRunning, pick]);

	const chooseTab = (id: TabId) => {
		setActiveTab(id);
		setPick((count) => count + 1);
	};

	const handleTabKeys = (event: KeyboardEvent<HTMLDivElement>) => {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const index = TABS.findIndex((tab) => tab.id === activeTab);
		const next = TABS[(index + step + TABS.length) % TABS.length].id;
		chooseTab(next);
		tabRefs.current[next]?.focus();
	};

	const isChartMark = (target: EventTarget | null) => target instanceof Element && !!target.closest('[data-chart-mark]');
	const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => setIsPaused(isChartMark(event.target));
	const handleFocus = (event: FocusEvent<HTMLDivElement>) => setIsPaused(isChartMark(event.target));
	const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (!isChartMark(event.relatedTarget)) setIsPaused(false);
	};

	const comparisonsLink = (
		<a href={sourceHref} className="group/compare inline-flex shrink-0 items-center gap-1 rounded-card py-2 text-body-sm font-medium text-brand/85 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
			{sourceLabel}
			<ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 group-hover/compare:translate-x-0.5 motion-reduce:transition-none" />
		</a>
	);

	return (
		<BenchmarkDataContext.Provider value={data}>
		<style>{'@keyframes benchmark-tab-donut{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}'}</style>
		<div ref={panelRef} onPointerOver={handlePointerOver} onPointerLeave={() => setIsPaused(false)} onFocus={handleFocus} onBlur={handleBlur} className="rounded-card border border-line">
			<div className="flex items-end gap-4 border-b border-line px-2 pt-2.5 sm:px-4">
				<div aria-hidden="true" className="hidden shrink-0 items-center gap-1.5 self-center sm:flex">
					<span className="size-2.5 rounded-full border border-line-strong" />
					<span className="size-2.5 rounded-full border border-line-strong" />
					<span className="size-2.5 rounded-full border border-line-strong" />
				</div>
				<div role="tablist" aria-label="Benchmark" onKeyDown={handleTabKeys} className="[scrollbar-width:none] -mb-px flex min-w-0 flex-1 overflow-x-auto">
					{TABS.map((tab) => {
						const isActive = tab.id === activeTab;
						return (
							<button
								key={tab.id}
								ref={(node) => {
									tabRefs.current[tab.id] = node;
								}}
								type="button"
								role="tab"
								id={`benchmark-tab-${tab.id}`}
								aria-selected={isActive}
								aria-controls="benchmark-chart"
								tabIndex={isActive ? 0 : -1}
								onClick={() => chooseTab(tab.id)}
								className={cn(
									'relative flex shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-t-card border border-b-0 px-2.5 py-2.5 font-mono text-caption transition-colors sm:px-4 duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
									isActive ? 'border-line bg-surface text-fg' : 'border-transparent text-neutral-60 hover:bg-surface-subtle hover:text-fg'
								)}
							>
								{isActive && !prefersReducedMotion && (
									<svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 -rotate-90">
										<circle cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" className="stroke-neutral-70/15" />
										{/* Fills over CYCLE_MS; keyed so it restarts on each tab or pick, paused along with the timer. */}
										<circle key={`${activeTab}-${pick}`} cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="stroke-neutral-70" style={{ animation: `benchmark-tab-donut ${CYCLE_MS}ms linear forwards`, animationPlayState: isRunning ? 'running' : 'paused' }} />
									</svg>
								)}
								{tab.label}
							</button>
						);
					})}
				</div>
				<div className="hidden shrink-0 self-center md:block">{comparisonsLink}</div>
			</div>
			<div className="p-3 sm:p-6">
				<div className="-m-2 rounded-card bg-tint p-2">
					<div className="flex min-w-0 flex-col gap-5 rounded-card bg-surface p-4 ring-1 ring-line sm:gap-6 sm:p-8">
						{/* A fixed height, so switching charts never shifts the tabs, legend, or anything below the section. */}
						<div id="benchmark-chart" role="tabpanel" aria-labelledby={`benchmark-tab-${activeTab}`} className="h-[22rem] sm:h-[26rem]">
							{/* Keyed so each tab's chart grows in fresh. */}
							<Chart key={activeTab} />
						</div>
						<div className="flex justify-center">
							<Legend />
						</div>
					</div>
				</div>
				<div className="mt-4 flex justify-center md:hidden">{comparisonsLink}</div>
			</div>
		</div>
		</BenchmarkDataContext.Provider>
	);
}

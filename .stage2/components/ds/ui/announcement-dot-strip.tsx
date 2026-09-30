'use client';

import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useRef, useState } from 'react';

const PITCH = 12;
const DOT_RADIUS = PITCH * 0.32 - 0.5;
const ROWS = 3;
const RESTING_OPACITY = 0.14;
const RAISED_OPACITY = 0.34;
const TWINKLE_INTERVAL_MS = 500;
const RAISE_HOLD_MS = 1000;
const RAISE_TRANSITION_MS = 150;
const LABEL_CLEARANCE = PITCH * 3;
const LABEL_SELECTOR = '[data-announcement-text]';

interface Dot {
	key: string;
	cx: number;
	cy: number;
}

interface LabelBox {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

function cellKey(column: number, row: number) {
	return `${column}:${row}`;
}

// Offsets rather than client rects: the strip has an entrance animation, and a transformed label would be measured in
// the wrong place with nothing to trigger a re-measure once it settles.
function measureLabelBox(host: HTMLElement): LabelBox | null {
	const label = host.querySelector<HTMLElement>(LABEL_SELECTOR);
	if (!label) return null;
	return {
		left: label.offsetLeft - LABEL_CLEARANCE,
		right: label.offsetLeft + label.offsetWidth + LABEL_CLEARANCE,
		top: label.offsetTop,
		bottom: label.offsetTop + label.offsetHeight,
	};
}

function buildDots(width: number, height: number, labelBox: LabelBox | null): Dot[] {
	const columns = Math.floor(width / PITCH);
	const offsetX = (width - columns * PITCH) / 2;
	const offsetY = (height - ROWS * PITCH) / 2;
	const dots: Dot[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < columns; column++) {
			const cx = offsetX + column * PITCH + PITCH / 2;
			const cy = offsetY + row * PITCH + PITCH / 2;
			const isBesideLabel = labelBox && cx > labelBox.left && cx < labelBox.right;
			const overlapsLabelLine = labelBox && cy + DOT_RADIUS > labelBox.top && cy - DOT_RADIUS < labelBox.bottom;
			if (isBesideLabel && overlapsLabelLine) continue;
			dots.push({ key: cellKey(column, row), cx, cy });
		}
	}
	return dots;
}

function pickRandom<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)];
}

function animateStrip(host: HTMLElement, svg: SVGSVGElement, dots: Dot[]) {
	const circles = new Map<string, SVGCircleElement>();
	for (const circle of svg.querySelectorAll<SVGCircleElement>('circle[data-dot]')) circles.set(circle.dataset.dot ?? '', circle);
	const gridLeft = (host.clientWidth % PITCH) / 2;
	const gridTop = (host.clientHeight - ROWS * PITCH) / 2;
	const raised = new Set<string>();
	const timers = new Set<number>();

	const raise = (key: string) => {
		const circle = circles.get(key);
		if (!circle || raised.has(key)) return;
		raised.add(key);
		circle.style.transitionDuration = `${RAISE_TRANSITION_MS}ms`;
		circle.style.fillOpacity = String(RAISED_OPACITY);
		const timer = window.setTimeout(() => {
			timers.delete(timer);
			raised.delete(key);
			circle.style.removeProperty('transition-duration');
			circle.style.fillOpacity = String(RESTING_OPACITY);
		}, RAISE_HOLD_MS);
		timers.add(timer);
	};

	const dotKeys = dots.map((dot) => dot.key);
	const twinkle = window.setInterval(() => {
		if (!document.hidden && dotKeys.length > 0) raise(pickRandom(dotKeys));
	}, TWINKLE_INTERVAL_MS);

	let origin: DOMRect | null = null;
	const onPointerEnter = () => {
		origin = host.getBoundingClientRect();
	};
	const onPointerMove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		origin ??= host.getBoundingClientRect();
		const column = Math.floor((event.clientX - origin.left - gridLeft) / PITCH);
		const row = Math.floor((event.clientY - origin.top - gridTop) / PITCH);
		for (let dx = -1; dx <= 1; dx++) raise(cellKey(column + dx, row));
	};

	host.addEventListener('pointerenter', onPointerEnter);
	host.addEventListener('pointermove', onPointerMove, { passive: true });

	return () => {
		window.clearInterval(twinkle);
		for (const timer of timers) window.clearTimeout(timer);
		host.removeEventListener('pointerenter', onPointerEnter);
		host.removeEventListener('pointermove', onPointerMove);
	};
}

/** A few rows of faint dots along the announcement strip, with a clear gap around its label: dots brighten briefly at random and under the pointer. */
export function AnnouncementDotStrip({ className }: { className?: string }) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [dots, setDots] = useState<Dot[] | null>(null);

	useEffect(() => {
		const host = svgRef.current?.parentElement;
		if (!host) return;
		const relayout = () => setDots(buildDots(host.clientWidth, host.clientHeight, measureLabelBox(host)));
		const observer = new ResizeObserver(relayout);
		observer.observe(host);
		const label = host.querySelector(LABEL_SELECTOR);
		if (label) observer.observe(label);
		let isMounted = true;
		void document.fonts.ready.then(() => {
			if (isMounted) relayout();
		});
		return () => {
			isMounted = false;
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const svg = svgRef.current;
		const host = svg?.parentElement;
		if (!svg || !host || !dots || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return animateStrip(host, svg, dots);
	}, [dots]);

	return (
		<svg ref={svgRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-10 size-full transition-opacity duration-700 motion-reduce:transition-none', dots ? 'opacity-100' : 'opacity-0', className)}>
			<g fill="currentColor" className="[&>circle]:transition-[fill-opacity] [&>circle]:duration-700 [&>circle]:ease-in-out motion-reduce:[&>circle]:transition-none">
				{dots?.map((dot) => (
					<circle key={dot.key} data-dot={dot.key} cx={dot.cx} cy={dot.cy} r={DOT_RADIUS} fillOpacity={RESTING_OPACITY} />
				))}
			</g>
		</svg>
	);
}

'use client';

import { HERO_PATTERN_HOLE_ATTRIBUTE, type HeroPatternHole } from '@/components/ds/ui/hero-pattern-hole';
import { dotsPath } from '@/components/ds/ui/dot-svg-path';
import { cx as cn } from '@/components/ds/ui/cx';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

const DESKTOP_PITCH = 16;
const MOBILE_PITCH = 12;
const MOBILE_BREAKPOINT = 640;
const DOT_RADIUS_RATIO = 0.31;
const CLEARANCE_RATIO = 1.25;
// Leaves a column of dots in the gap between carousel cards.
const TIGHT_CLEARANCE_RATIO = 0.25;
// Brings the dots up to a card without letting a ring touch it.
const SNUG_CLEARANCE_RATIO = 0.75;

// Solid clusters sit off-centre, loosely around the content, like the brand pattern posts.
const CLUSTER_TARGETS = [
	{ x: 0.12, y: 0.2 },
	{ x: 0.86, y: 0.3 },
	{ x: 0.1, y: 0.78 },
	{ x: 0.9, y: 0.84 },
];

interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

interface Hole extends Rect {
	kind: HeroPatternHole;
}

interface Dot {
	key: string;
	cx: number;
	cy: number;
}

interface ClusterShape {
	footprint: [number, number][];
	solid: [number, number][];
}

interface PatternLayout {
	radius: number;
	hollow: Dot[];
	solid: Dot[];
}

function diamondShape(radius: number): ClusterShape {
	const cells: [number, number][] = [];
	for (let dy = -radius; dy <= radius; dy++) {
		for (let dx = -radius; dx <= radius; dx++) {
			if (Math.abs(dx) + Math.abs(dy) <= radius) cells.push([dx, dy]);
		}
	}
	return { footprint: cells, solid: cells };
}

// Text holes follow each rendered line rather than the element's box, so the cut-out traces a headline's ragged edge.
function measureHoles(container: HTMLElement): Hole[] {
	const origin = container.getBoundingClientRect();
	const rects: Hole[] = [];
	for (const element of container.querySelectorAll<HTMLElement>(`[${HERO_PATTERN_HOLE_ATTRIBUTE}]`)) {
		const kind = element.getAttribute(HERO_PATTERN_HOLE_ATTRIBUTE) as HeroPatternHole;
		const boxes = kind === 'text' ? textLineBoxes(element) : [element.getBoundingClientRect()];
		for (const box of boxes) {
			if (box.width === 0 || box.height === 0) continue;
			rects.push({ left: box.left - origin.left, top: box.top - origin.top, right: box.right - origin.left, bottom: box.bottom - origin.top, kind });
		}
	}
	return rects;
}

function textLineBoxes(element: HTMLElement) {
	const range = document.createRange();
	range.selectNodeContents(element);
	return Array.from(range.getClientRects());
}

// Rows and columns are stretched by a fraction of a pixel so the outer dots sit exactly half a pitch inside every edge:
// no dot is cropped, and two patterned sections that touch continue at the same spacing across their seam.
function fitAxis(extent: number, pitch: number) {
	const count = Math.max(1, Math.round(extent / pitch));
	const step = count > 1 ? (extent - pitch) / (count - 1) : 0;
	return { count, position: (index: number) => pitch / 2 + index * step };
}

function isInside(hole: Rect, x: number, y: number, clearance: number) {
	return x > hole.left - clearance && x < hole.right + clearance && y > hole.top - clearance && y < hole.bottom + clearance;
}

function buildLayout(width: number, height: number, holes: Hole[], withClusters: boolean): PatternLayout {
	const isMobile = width < MOBILE_BREAKPOINT;
	const pitch = isMobile ? MOBILE_PITCH : DESKTOP_PITCH;
	const clearanceFor = (hole: Hole) => pitch * (hole.kind === 'tight-box' ? TIGHT_CLEARANCE_RATIO : hole.kind === 'snug-box' ? SNUG_CLEARANCE_RATIO : CLEARANCE_RATIO);
	const { count: columns, position: columnX } = fitAxis(width, pitch);
	const { count: rows, position: rowY } = fitAxis(height, pitch);
	const clearingHoles = holes.filter((hole) => hole.kind !== 'cover');
	const covers = holes.filter((hole) => hole.kind === 'cover');

	const visible = new Uint8Array(columns * rows);
	const covered = new Uint8Array(columns * rows);
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			const index = row * columns + column;
			visible[index] = clearingHoles.some((hole) => isInside(hole, columnX(column), rowY(row), clearanceFor(hole))) ? 0 : 1;
			covered[index] = covers.some((cover) => isInside(cover, columnX(column), rowY(row), pitch * TIGHT_CLEARANCE_RATIO)) ? 1 : 0;
		}
	}
	const inGrid = (column: number, row: number) => column >= 0 && row >= 0 && column < columns && row < rows;
	const isVisible = (column: number, row: number) => inGrid(column, row) && visible[row * columns + column] === 1;

	const diamond = diamondShape(isMobile ? 2 : 3);
	const solidCells = new Set<string>();
	const claimedCells = new Set<string>();
	const isFree = (column: number, row: number) => isVisible(column, row) && covered[row * columns + column] === 0 && !claimedCells.has(`${column}:${row}`);
	for (const target of withClusters ? CLUSTER_TARGETS : []) {
		const anchor = nearestClusterAnchor(target.x * (columns - 1), target.y * (rows - 1), diamond.footprint, isFree, columns, rows);
		if (!anchor) continue;
		for (const [dx, dy] of diamond.footprint) claimedCells.add(`${anchor.column + dx}:${anchor.row + dy}`);
		for (const [dx, dy] of diamond.solid) solidCells.add(`${anchor.column + dx}:${anchor.row + dy}`);
	}

	const hollow: Dot[] = [];
	const solid: Dot[] = [];
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			if (!isVisible(column, row)) continue;
			const key = `${column}:${row}`;
			const dot = { key, cx: columnX(column), cy: rowY(row) };
			(solidCells.has(key) ? solid : hollow).push(dot);
		}
	}
	return { radius: pitch * DOT_RADIUS_RATIO, hollow, solid };
}

function nearestClusterAnchor(targetColumn: number, targetRow: number, cluster: [number, number][], isVisible: (column: number, row: number) => boolean, columns: number, rows: number) {
	let best: { column: number; row: number; distance: number } | null = null;
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			const distance = (column - targetColumn) ** 2 + (row - targetRow) ** 2;
			if (best && distance >= best.distance) continue;
			if (cluster.every(([dx, dy]) => isVisible(column + dx, row + dy))) best = { column, row, distance };
		}
	}
	return best;
}

// Only the plain ring tone lights up under the pointer; the other tones sit behind animated demos, where a moving
// spotlight would be one motion too many.
const PATTERN_TONES = {
	onBlue: { color: 'var(--ds-color-white)', hollowOpacity: 1, solidOpacity: 1, hoverOpacity: 0 },
	subtle: { color: 'var(--ds-color-brand)', hollowOpacity: 0.14, solidOpacity: 0.3, hoverOpacity: 0 },
	rings: { color: 'var(--ds-color-brand)', hollowOpacity: 0.25, solidOpacity: 0.4, hoverOpacity: 0.5 },
} as const;

const SPOTLIGHT_RADIUS_IN_DOTS = 6;

// Fills the rings nearest the pointer through a soft radial mask. Only the mask's circle moves, so following the
// pointer costs two attribute writes a frame rather than repainting dots one by one.
function useSpotlight(container: HTMLDivElement | null, enabled: boolean) {
	const spotlightRef = useRef<SVGCircleElement>(null);
	const [lit, setLit] = useState(false);

	useEffect(() => {
		const spotlight = spotlightRef.current;
		if (!container || !spotlight || !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let frame = 0;
		let point = { x: 0, y: 0 };
		const place = () => {
			frame = 0;
			spotlight.setAttribute('cx', String(point.x));
			spotlight.setAttribute('cy', String(point.y));
		};
		const onPointerMove = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			const origin = container.getBoundingClientRect();
			point = { x: event.clientX - origin.left, y: event.clientY - origin.top };
			if (!frame) frame = requestAnimationFrame(place);
			setLit(true);
		};
		const onPointerLeave = () => setLit(false);
		container.addEventListener('pointermove', onPointerMove, { passive: true });
		container.addEventListener('pointerleave', onPointerLeave);
		return () => {
			cancelAnimationFrame(frame);
			container.removeEventListener('pointermove', onPointerMove);
			container.removeEventListener('pointerleave', onPointerLeave);
		};
	}, [container, enabled]);

	return { spotlightRef, lit };
}

/**
 * Brand dot grid that clears itself around every descendant marked with the hole attribute, so the empty space takes
 * the content's shape. Its solid clusters are the brand's diamonds; `clusters={false}` leaves only the plain rings.
 */
export function HeroCirclePatternSurface({ className, tone = 'onBlue', clusters = true, children }: { className?: string; tone?: keyof typeof PATTERN_TONES; clusters?: boolean; children: ReactNode }) {
	const toneStyle = PATTERN_TONES[tone];
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [layout, setLayout] = useState<PatternLayout | null>(null);
	const hasSpotlight = toneStyle.hoverOpacity > 0;
	const { spotlightRef, lit } = useSpotlight(container, hasSpotlight && layout !== null);
	const maskId = `pattern-spotlight-${useId().replace(/:/g, '')}`;

	useEffect(() => {
		if (!container) return;

		let frame = 0;
		const relayout = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => setLayout(buildLayout(container.clientWidth, container.clientHeight, measureHoles(container), clusters)));
		};

		const observer = new ResizeObserver(relayout);
		observer.observe(container);
		for (const hole of container.querySelectorAll(`[${HERO_PATTERN_HOLE_ATTRIBUTE}]`)) {
			observer.observe(hole);
			if (hole.parentElement) observer.observe(hole.parentElement);
		}
		void document.fonts.ready.then(relayout);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [clusters, container]);

	return (
		<div ref={setContainer} className={cn('relative', className)}>
			<svg aria-hidden="true" className={cn('pointer-events-none absolute inset-0 size-full transition-opacity duration-700 motion-reduce:transition-none', layout ? 'opacity-100' : 'opacity-0')}>
				{layout && (
					<>
						<path fill="none" style={{ stroke: toneStyle.color }} strokeWidth="1" opacity={toneStyle.hollowOpacity} d={dotsPath(layout.hollow, layout.radius - 0.5)} />
						<path style={{ fill: toneStyle.color }} opacity={toneStyle.solidOpacity} d={dotsPath(layout.solid, layout.radius)} />
						{hasSpotlight && (
							<>
								<defs>
									<radialGradient id={`${maskId}-falloff`}>
										<stop offset="0%" stopColor="white" />
										<stop offset="100%" stopColor="black" />
									</radialGradient>
									<mask id={maskId}>
										<circle ref={spotlightRef} cx={-9999} cy={-9999} r={(layout.radius / DOT_RADIUS_RATIO) * SPOTLIGHT_RADIUS_IN_DOTS} fill={`url(#${maskId}-falloff)`} />
									</mask>
								</defs>
								<path mask={`url(#${maskId})`} className="transition-opacity duration-500 ease-out motion-reduce:transition-none" style={{ fill: toneStyle.color, opacity: lit ? toneStyle.hoverOpacity : 0 }} d={dotsPath([...layout.hollow, ...layout.solid], layout.radius - 0.5)} />
							</>
						)}
					</>
				)}
			</svg>
			{children}
		</div>
	);
}

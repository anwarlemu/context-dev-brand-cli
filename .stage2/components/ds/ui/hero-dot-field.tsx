'use client';

import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import { LOGO_MARK_HEIGHT, LOGO_MARK_WIDTH, logoMarkKindAt } from '@/components/ds/ui/hero-dot-logo-shape';
import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useRef, useState } from 'react';

const DESKTOP_PITCH = 16;
const MOBILE_PITCH = 12;
const MOBILE_BREAKPOINT = 640;
const DOT_RADIUS_RATIO = 0.32;
const NOISE_CELL_SIZE_IN_DOTS = 11;
const BAND_LEVELS = [0.32, 0.5, 0.68];
const BAND_HALF_WIDTH = 0.045;
// A lively field sits behind a page's main content, so its bands run thinner and it fades toward the middle.
const LIVELY_BAND_HALF_WIDTH = 0.028;
const LIVELY_CENTRE_FADE = 'radial-gradient(ellipse 42% 48% at 50% 48%, rgb(0 0 0 / 0.2), rgb(0 0 0 / 0.55) 60%, black 100%)';
const LIT_DOT_SHARE = 0.07;
// A lively field lights about a tenth of its dots, so the blue carries across the whole surface.
const LIVELY_LIT_DOT_SHARE = 0.09;
const RING_DOT_SHARE = 0.1;
const DIM_OPACITY = 0.14;
const RING_OPACITY = 0.55;
const HOLE_CLEARANCE_RATIO = 1;
const SWAP_INTERVAL_MS = 900;
const SWAPS_PER_TICK = 2;
const SWAP_REACH_IN_DOTS = 2;
// A lively field moves its light around faster and has dots flicker between kinds on their own, not only under the pointer.
const LIVELY_SWAP_INTERVAL_MS = 600;
const LIVELY_SWAPS_PER_TICK = 3;
const LIVELY_TWINKLE_INTERVAL_MS = 450;
const LIVELY_TWINKLES_PER_TICK = 1;
const TRAIL_HOLD_MS = 1200;
const TRAIL_TRANSITION_MS = 150;
const TRAIL_SPAWN_COUNT = 4;
const TRAIL_SPAWN_REACH_IN_DOTS = 2;
const TRAIL_MAX_SPAWNED = 160;
const SEED = 7;
const WORD_SIZE = 12;
// Doto is monospaced, each letter three fifths of its size wide.
const WORD_ADVANCE = 0.6;
const WORD_MARGIN_CELLS = 1;
// Doto sets a tenth of its size of empty space after the last letter, which would leave the border wider on the right.
const WORD_TRAILING_BEARING = 0.1;
const WORD_BORDER = { paddingX: 5, height: 18, radius: 2, opacity: 0.35 };

type DotKind = 'dim' | 'lit' | 'ring';

const KINDS: DotKind[] = ['dim', 'lit', 'ring'];

const INVERTED_KIND: Record<DotKind, DotKind> = { dim: 'ring', ring: 'lit', lit: 'ring' };

interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
	/** An opaque box (the hole kind `box`): the logo mark may run on underneath it, where it is simply hidden. */
	opaque?: boolean;
}

interface Dot {
	key: string;
	cx: number;
	cy: number;
	kind: DotKind;
}

interface PlacedWord {
	text: string;
	x: number;
	y: number;
}

interface FieldLayout {
	pitch: number;
	radius: number;
	dots: Dot[];
	words: PlacedWord[];
	clearedCells: Set<string>;
	/** Dots that belong to the logo mark: the pointer trail flips them like any other, but the drifting light leaves them be. */
	markCells: Set<string>;
}

// The mark in the field's bottom-right corner, running off the right and bottom edges. Only shown on wide fields, where
// it clears the hero's content.
const LOGO_MARK = { widthPx: 640, overhangRightPx: 64, overhangBottomPx: 96, minFieldWidth: 1024 };

function hash(x: number, y: number) {
	let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(SEED, 2147483647);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothstep(t: number) {
	return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number) {
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const tx = smoothstep(x - x0);
	const ty = smoothstep(y - y0);
	const top = hash(x0, y0) + (hash(x0 + 1, y0) - hash(x0, y0)) * tx;
	const bottom = hash(x0, y0 + 1) + (hash(x0 + 1, y0 + 1) - hash(x0, y0 + 1)) * tx;
	return top + (bottom - top) * ty;
}

function layeredNoise(x: number, y: number) {
	return (valueNoise(x, y) * 2 + valueNoise(x * 2 + 17, y * 2 + 31)) / 3;
}

// Dots sit on a few of the noise's contour levels, so they gather into winding bands rather than scattered blobs, with
// the bands close enough together that no stretch of the hero is left bare.
function isOnBand(column: number, row: number, halfWidth = BAND_HALF_WIDTH) {
	const level = layeredNoise(column / NOISE_CELL_SIZE_IN_DOTS, row / NOISE_CELL_SIZE_IN_DOTS);
	return BAND_LEVELS.some((bandLevel) => Math.abs(level - bandLevel) < halfWidth);
}

function textLineBoxes(element: Element) {
	const range = document.createRange();
	range.selectNodeContents(element);
	return Array.from(range.getClientRects());
}

function measureContentHoles(section: HTMLElement): Rect[] {
	const origin = section.getBoundingClientRect();
	const holes: Rect[] = [];
	for (const element of section.querySelectorAll(`[${HERO_PATTERN_HOLE_ATTRIBUTE}]`)) {
		const kind = element.getAttribute(HERO_PATTERN_HOLE_ATTRIBUTE);
		const boxes = kind === 'text' ? textLineBoxes(element) : [element.getBoundingClientRect()];
		for (const box of boxes) {
			if (box.width > 0 && box.height > 0) holes.push({ left: box.left - origin.left, top: box.top - origin.top, right: box.right - origin.left, bottom: box.bottom - origin.top, opaque: kind === 'box' });
		}
	}
	return holes;
}

// Clears the column under the announcement strip and the nav card, down to the card's resting place at the top of the
// page, so no row of dots peeks out below it; the strip beside the card stays patterned. The header is sticky, so it is
// placed under the announcement rather than measured where it currently sits.
function measureHeaderHole(section: HTMLElement): Rect[] {
	const announcement = document.querySelector('[data-header-announcement]');
	const header = document.querySelector<HTMLElement>('[data-mobile-header]');
	const card = header?.querySelector('[data-header-card]');
	if (!announcement || !header || !card) return [];
	const origin = section.getBoundingClientRect();
	const cardBox = card.getBoundingClientRect();
	const bottom = announcement.getBoundingClientRect().bottom - origin.top + header.offsetHeight;
	return [{ left: cardBox.left - origin.left, top: -Infinity, right: cardBox.right - origin.left, bottom }];
}

function cellKey(column: number, row: number) {
	return `${column}:${row}`;
}

function buildLayout(width: number, height: number, holes: Rect[], words: string[], fixedPitch?: number, litShare = LIT_DOT_SHARE, logoMark = false): FieldLayout {
	const pitch = fixedPitch ?? (width < MOBILE_BREAKPOINT ? MOBILE_PITCH : DESKTOP_PITCH);
	const clearance = pitch * HOLE_CLEARANCE_RATIO;
	const isInHole = (x: number, y: number, hole: Rect) => x > hole.left - clearance && x < hole.right + clearance && y > hole.top - clearance && y < hole.bottom + clearance;
	const isCleared = (x: number, y: number) => holes.some((hole) => isInHole(x, y, hole));
	// The mark passes under opaque content such as the demo panel rather than stopping short of it, but still keeps
	// clear of text, so it never runs behind a label.
	const isClearedForMark = (x: number, y: number) => holes.some((hole) => !hole.opaque && isInHole(x, y, hole));
	const dots: Dot[] = [];
	const clearedCells = new Set<string>();
	const markCells = new Set<string>();
	const showMark = logoMark && width >= LOGO_MARK.minFieldWidth;
	const markUnitsPerPx = LOGO_MARK_WIDTH / LOGO_MARK.widthPx;
	const markLeft = width - LOGO_MARK.widthPx + LOGO_MARK.overhangRightPx;
	const markTop = height + LOGO_MARK.overhangBottomPx - LOGO_MARK.widthPx / (LOGO_MARK_WIDTH / LOGO_MARK_HEIGHT);
	const columns = Math.floor(width / pitch);
	const rows = Math.floor(height / pitch);
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			const key = cellKey(column, row);
			const cx = column * pitch + pitch / 2;
			const cy = row * pitch + pitch / 2;
			const inMarkBox = showMark && cx >= markLeft - clearance && cy >= markTop - clearance;
			if (inMarkBox ? isClearedForMark(cx, cy) : isCleared(cx, cy)) {
				clearedCells.add(key);
				continue;
			}
			if (inMarkBox) {
				const markKind = logoMarkKindAt((cx - markLeft) * markUnitsPerPx, (cy - markTop) * markUnitsPerPx, pitch * DOT_RADIUS_RATIO * markUnitsPerPx);
				if (markKind) {
					markCells.add(key);
					dots.push({ key, cx, cy, kind: markKind });
				}
				continue;
			}
			if (!isOnBand(column, row, litShare === LIVELY_LIT_DOT_SHARE ? LIVELY_BAND_HALF_WIDTH : BAND_HALF_WIDTH)) continue;
			const roll = hash(column + 101, row + 211);
			const kind: DotKind = roll < RING_DOT_SHARE ? 'ring' : roll > 1 - litShare ? 'lit' : 'dim';
			dots.push({ key, cx, cy, kind });
		}
	}
	return { pitch, radius: pitch * DOT_RADIUS_RATIO, dots, words: placeWords(words, columns, rows, pitch, dots, clearedCells), clearedCells, markCells };
}

// Each word takes a run of open cells, with a cell of open space around it, so it reads as sitting in a gap of the
// pattern. Words spread out: each goes to the open spot farthest from those already placed. Their cells are then
// cleared, so the pointer's trail never scatters dots over them.
function placeWords(words: string[], columns: number, rows: number, pitch: number, dots: Dot[], clearedCells: Set<string>): PlacedWord[] {
	if (words.length === 0) return [];
	const taken = new Set([...dots.map((dot) => dot.key), ...clearedCells]);
	const isOpen = (column: number, row: number) => column >= 0 && row >= 0 && column < columns && row < rows && !taken.has(cellKey(column, row));
	const placed: { word: PlacedWord; column: number; row: number }[] = [];

	for (const text of words) {
		const span = Math.ceil((text.length * WORD_ADVANCE * WORD_SIZE) / pitch);
		const fits = (column: number, row: number) => {
			for (let dy = -WORD_MARGIN_CELLS; dy <= WORD_MARGIN_CELLS; dy++) {
				for (let dx = -WORD_MARGIN_CELLS; dx < span + WORD_MARGIN_CELLS; dx++) if (!isOpen(column + dx, row + dy)) return false;
			}
			return true;
		};
		let best: { column: number; row: number; score: number } | null = null;
		for (let row = WORD_MARGIN_CELLS; row < rows - WORD_MARGIN_CELLS; row++) {
			for (let column = WORD_MARGIN_CELLS; column < columns - span - WORD_MARGIN_CELLS; column++) {
				if (!fits(column, row)) continue;
				const distance = placed.length ? Math.min(...placed.map((other) => Math.hypot(other.column - column, other.row - row))) : hash(column + 17, row + 29);
				if (!best || distance > best.score) best = { column, row, score: distance };
			}
		}
		if (!best) continue;
		for (let dx = 0; dx < span; dx++) taken.add(cellKey(best.column + dx, best.row));
		for (let dx = -WORD_MARGIN_CELLS; dx < span + WORD_MARGIN_CELLS; dx++) {
			for (let dy = -WORD_MARGIN_CELLS; dy <= WORD_MARGIN_CELLS; dy++) clearedCells.add(cellKey(best.column + dx, best.row + dy));
		}
		placed.push({ word: { text, x: best.column * pitch, y: (best.row + 0.5) * pitch }, column: best.column, row: best.row });
	}
	return placed.map(({ word }) => word);
}

function kindStyle(kind: DotKind) {
	return {
		fillOpacity: kind === 'ring' ? 0 : kind === 'lit' ? 1 : DIM_OPACITY,
		strokeOpacity: kind === 'ring' ? RING_OPACITY : 0,
	};
}

function paint(circle: SVGCircleElement | undefined, kind: DotKind) {
	if (!circle) return;
	const style = kindStyle(kind);
	circle.style.fillOpacity = String(style.fillOpacity);
	circle.style.strokeOpacity = String(style.strokeOpacity);
}

function pickRandom<T>(items: T[]) {
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * Brings the field to life: lit dots hand their light to a dim neighbour in the same band, and the pointer leaves a
 * trail, flipping the kind of each dot it crosses and scattering a few short-lived dots wherever it crosses open space.
 */
function animateField(section: HTMLElement, svg: SVGSVGElement, spawnLayer: SVGGElement, layout: FieldLayout, lively: boolean) {
	const circles = new Map<string, SVGCircleElement>();
	for (const circle of svg.querySelectorAll<SVGCircleElement>('circle[data-dot]')) circles.set(circle.dataset.dot ?? '', circle);
	const kinds = new Map(layout.dots.map((dot) => [dot.key, dot.kind]));
	for (const [key, kind] of kinds) paint(circles.get(key), kind);
	const inverted = new Map<string, number>();
	const spawnedCells = new Set<string>();
	const timers = new Set<number>();
	const later = (callback: () => void, delay: number) => {
		const timer = window.setTimeout(() => {
			timers.delete(timer);
			callback();
		}, delay);
		timers.add(timer);
	};

	let onScreen = true;
	const visibility = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting;
	});
	visibility.observe(section);

	const drift = window.setInterval(() => {
		if (document.hidden || !onScreen) return;
		const lit = Array.from(kinds).filter(([key, kind]) => kind === 'lit' && !inverted.has(key) && !layout.markCells.has(key));
		for (let swap = 0; swap < (lively ? LIVELY_SWAPS_PER_TICK : SWAPS_PER_TICK) && lit.length > 0; swap++) {
			const [from] = pickRandom(lit);
			const [column, row] = from.split(':').map(Number);
			const candidates: string[] = [];
			for (let dy = -SWAP_REACH_IN_DOTS; dy <= SWAP_REACH_IN_DOTS; dy++) {
				for (let dx = -SWAP_REACH_IN_DOTS; dx <= SWAP_REACH_IN_DOTS; dx++) {
					const key = cellKey(column + dx, row + dy);
					if (kinds.get(key) === 'dim' && !inverted.has(key)) candidates.push(key);
				}
			}
			if (candidates.length === 0) continue;
			const to = pickRandom(candidates);
			kinds.set(from, 'dim');
			kinds.set(to, 'lit');
			paint(circles.get(from), 'dim');
			paint(circles.get(to), 'lit');
		}
	}, lively ? LIVELY_SWAP_INTERVAL_MS : SWAP_INTERVAL_MS);

	const invert = (key: string) => {
		const kind = kinds.get(key);
		if (!kind || inverted.has(key)) return;
		const circle = circles.get(key);
		inverted.set(key, 1);
		circle?.style.setProperty('transition-duration', `${TRAIL_TRANSITION_MS}ms`);
		paint(circle, INVERTED_KIND[kind]);
		later(() => {
			inverted.delete(key);
			circle?.style.removeProperty('transition-duration');
			paint(circle, kinds.get(key) ?? kind);
		}, TRAIL_HOLD_MS);
	};

	const dotKeys = Array.from(kinds.keys()).filter((key) => !layout.markCells.has(key));
	const twinkle = lively
		? window.setInterval(() => {
				if (document.hidden || !onScreen || dotKeys.length === 0) return;
				for (let count = 0; count < LIVELY_TWINKLES_PER_TICK; count++) invert(pickRandom(dotKeys));
			}, LIVELY_TWINKLE_INTERVAL_MS)
		: 0;

	const scatter = (column: number, row: number) => {
		const origin = cellKey(column, row);
		if (spawnedCells.has(origin) || spawnLayer.childElementCount >= TRAIL_MAX_SPAWNED) return;
		spawnedCells.add(origin);
		later(() => spawnedCells.delete(origin), TRAIL_HOLD_MS);
		const open: [number, number][] = [];
		for (let dy = -TRAIL_SPAWN_REACH_IN_DOTS; dy <= TRAIL_SPAWN_REACH_IN_DOTS; dy++) {
			for (let dx = -TRAIL_SPAWN_REACH_IN_DOTS; dx <= TRAIL_SPAWN_REACH_IN_DOTS; dx++) {
				const key = cellKey(column + dx, row + dy);
				if (column + dx >= 0 && row + dy >= 0 && !kinds.has(key) && !layout.clearedCells.has(key) && !spawnedCells.has(key)) open.push([column + dx, row + dy]);
			}
		}
		for (let count = 0; count < TRAIL_SPAWN_COUNT && open.length > 0; count++) {
			const [spawnColumn, spawnRow] = open.splice(Math.floor(Math.random() * open.length), 1)[0];
			const spawnKey = cellKey(spawnColumn, spawnRow);
			spawnedCells.add(spawnKey);
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.setAttribute('cx', String(spawnColumn * layout.pitch + layout.pitch / 2));
			circle.setAttribute('cy', String(spawnRow * layout.pitch + layout.pitch / 2));
			circle.setAttribute('r', String(layout.radius - 0.5));
			circle.style.opacity = '0';
			circle.style.transitionDuration = `${TRAIL_TRANSITION_MS}ms`;
			paint(circle, pickRandom(KINDS));
			spawnLayer.appendChild(circle);
			requestAnimationFrame(() => (circle.style.opacity = '1'));
			later(() => {
				circle.style.removeProperty('transition-duration');
				circle.style.opacity = '0';
			}, TRAIL_HOLD_MS);
			later(() => {
				circle.remove();
				spawnedCells.delete(spawnKey);
			}, TRAIL_HOLD_MS * 2);
		}
	};

	const visit = (column: number, row: number) => {
		const key = cellKey(column, row);
		if (layout.clearedCells.has(key)) return;
		if (kinds.has(key)) invert(key);
		else scatter(column, row);
	};

	// Steps along the segment since the last event, so a fast flick still marks every cell it crosses.
	let last: { x: number; y: number } | null = null;
	// Measured once per scroll or resize rather than on every pointer move, which would force a layout each time.
	let origin: DOMRect | null = null;
	const forgetOrigin = () => {
		origin = null;
	};
	const onPointerMove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		origin ??= section.getBoundingClientRect();
		const point = { x: event.clientX - origin.left, y: event.clientY - origin.top };
		const from = last ?? point;
		const steps = Math.max(1, Math.ceil(Math.hypot(point.x - from.x, point.y - from.y) / (layout.pitch / 2)));
		let previousCell = '';
		for (let step = 1; step <= steps; step++) {
			const column = Math.floor((from.x + ((point.x - from.x) * step) / steps) / layout.pitch);
			const row = Math.floor((from.y + ((point.y - from.y) * step) / steps) / layout.pitch);
			const key = cellKey(column, row);
			if (key === previousCell) continue;
			previousCell = key;
			visit(column, row);
		}
		last = point;
	};
	const onPointerLeave = () => {
		last = null;
	};

	section.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('scroll', forgetOrigin, { passive: true });
	window.addEventListener('resize', forgetOrigin, { passive: true });
	section.addEventListener('pointerleave', onPointerLeave);

	return () => {
		window.clearInterval(drift);
		window.clearInterval(twinkle);
		visibility.disconnect();
		for (const timer of timers) window.clearTimeout(timer);
		section.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('scroll', forgetOrigin);
		window.removeEventListener('resize', forgetOrigin);
		section.removeEventListener('pointerleave', onPointerLeave);
		spawnLayer.replaceChildren();
	};
}

const DOT_TRANSITION_CLASS = '[&>circle]:transition-[fill-opacity,stroke-opacity,opacity] [&>circle]:duration-700 [&>circle]:ease-in-out motion-reduce:[&>circle]:transition-none';

/**
 * The hero's dot-grid backdrop: winding bands of faint dots, rings and a few lit dots. It fills the whole hero, clearing
 * around the announcement strip and every descendant of its parent marked with the hole attribute; the nav card covers it.
 */
export function HeroDotField({ className, words = [], wordClassName, fine = false, lively = false, logoMark = false }: { className?: string; /** Short labels set in open gaps of the pattern. */ words?: string[]; wordClassName?: string; /** The smaller dots of a narrow field, at any width, so a wide field can match them. */ fine?: boolean; /** More motion on its own: faster drifting light and dots that flicker without the pointer. */ lively?: boolean; /** The Context.dev mark, large in the bottom-right corner, drawn in the field's own dots. */ logoMark?: boolean }) {
	const wordsKey = words.join(' ');
	const svgRef = useRef<SVGSVGElement>(null);
	const spawnLayerRef = useRef<SVGGElement>(null);
	const [layout, setLayout] = useState<FieldLayout | null>(null);

	useEffect(() => {
		const section = svgRef.current?.parentElement;
		if (!section) return;

		let frame = 0;
		const relayout = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => setLayout(buildLayout(section.clientWidth, section.clientHeight, [...measureHeaderHole(section), ...measureContentHoles(section)], wordsKey ? wordsKey.split(' ') : [], fine ? MOBILE_PITCH : undefined, lively ? LIVELY_LIT_DOT_SHARE : LIT_DOT_SHARE, logoMark)));
		};

		const observer = new ResizeObserver(relayout);
		observer.observe(section);
		for (const hole of section.querySelectorAll(`[${HERO_PATTERN_HOLE_ATTRIBUTE}]`)) observer.observe(hole);
		void document.fonts.ready.then(relayout);
		// An entrance animation moves the content without resizing it, so the holes are measured again once it settles.
		section.addEventListener('animationend', relayout);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			section.removeEventListener('animationend', relayout);
		};
	}, [wordsKey, fine, lively, logoMark]);

	useEffect(() => {
		const svg = svgRef.current;
		const section = svg?.parentElement;
		const spawnLayer = spawnLayerRef.current;
		if (!svg || !section || !spawnLayer || !layout || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return animateField(section, svg, spawnLayer, layout, lively);
	}, [layout, lively]);

	return (
		<svg ref={svgRef} aria-hidden="true" data-dot-field className={cn('pointer-events-none absolute inset-0 size-full text-white transition-opacity duration-700 motion-reduce:transition-none', layout ? 'opacity-100' : 'opacity-0', className)} style={lively ? { maskImage: LIVELY_CENTRE_FADE, WebkitMaskImage: LIVELY_CENTRE_FADE } : undefined}>
			<g fill="currentColor" stroke="currentColor" strokeWidth="1" className={DOT_TRANSITION_CLASS}>
				{layout?.dots.map((dot) => (
					<circle key={dot.key} data-dot={dot.key} cx={dot.cx} cy={dot.cy} r={layout.radius - 0.5} style={kindStyle(dot.kind)} />
				))}
			</g>
			<g ref={spawnLayerRef} fill="currentColor" stroke="currentColor" strokeWidth="1" className={DOT_TRANSITION_CLASS} />
			<g fill="currentColor" fontSize={WORD_SIZE} fontWeight={800} className={cn('font-data', wordClassName)}>
				{layout?.words.map((word) => (
					<g key={word.text}>
						<rect
							x={word.x - WORD_BORDER.paddingX + 0.5}
							y={Math.round(word.y - WORD_BORDER.height / 2) + 0.5}
							width={Math.round(word.text.length * WORD_ADVANCE * WORD_SIZE - WORD_TRAILING_BEARING * WORD_SIZE + WORD_BORDER.paddingX * 2)}
							height={WORD_BORDER.height}
							rx={WORD_BORDER.radius}
							fill="none"
							stroke="currentColor"
							strokeOpacity={WORD_BORDER.opacity}
						/>
						<text x={word.x} y={word.y} dominantBaseline="central">
							{word.text}
						</text>
					</g>
				))}
			</g>
		</svg>
	);
}

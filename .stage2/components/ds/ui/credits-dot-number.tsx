'use client';

import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useMemo, useRef } from 'react';

// Strokes two dots thick, so the number reads as a heading rather than as more of the ring pattern.
const GLYPHS: Record<string, string[]> = {
	'1': ['.##.', '###.', '.##.', '.##.', '.##.', '.##.', '####'],
	'0': ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
	'2': ['.####.', '##..##', '....##', '...##.', '..##..', '.##...', '######'],
	'3': ['######', '...##.', '..##..', '...##.', '....##', '##..##', '.####.'],
	',': ['..', '..', '..', '..', '##', '##', '#.'],
};
// The same characters as Doto draws them, read from the font. Its last row hangs below the baseline.
const DOTO_GLYPHS: Record<string, string[]> = {
	'1': ['..#..', '.##..', '#.#..', '..#..', '..#..', '..#..', '#####', '.....'],
	'0': ['..#..', '.#.#.', '#...#', '#...#', '#...#', '.#.#.', '..#..', '.....'],
	'2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####', '.....'],
	'3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.', '.....'],
	A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#', '.....'],
	D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.', '.....'],
	I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####', '.....'],
	K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '.....'],
	L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####', '.....'],
	P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....', '.....'],
	R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#', '.....'],
	S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.', '.....'],
	U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.', '.....'],
	',': ['.....', '.....', '.....', '.....', '.....', '..##.', '..#..', '.#...'],
};
const DOTO_ADVANCE = 6;
const DOTO_SIDE_BEARING = 1;
const GLYPH_ROWS = 7;
const GLYPH_GAP = 1;
const SIDE_COLUMNS = 7;
const PITCH = 7;
const DOT_RADIUS = 2.5;
// Doto's bold dots are squares four fifths of its pitch.
const DOTO_DOT_SIDE = PITCH * 0.8;
const RING_STROKE = 0.8;
const RING_OPACITY = 0.4;
const FADED_RING_OPACITY = 0.08;

const HOLD_MS = 2200;
const MORPH_MS = 1300;
const CYCLE_MS = (HOLD_MS + MORPH_MS) * 2;
// How much of the morph the left-to-right sweep takes up; the rest is each dot's own travel.
const SWEEP = 0.45;
const RING_HASTE = 1.8;
// A background tab hands back one huge frame gap, which would skip the morph.
const LONGEST_FRAME_MS = 50;

interface Point {
	x: number;
	y: number;
}

interface MorphingDot {
	pattern: Point;
	doto: Point;
}

interface Ring extends Point {
	opacity: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mix = (from: number, to: number, share: number) => from + (to - from) * share;
const centre = (index: number) => (index + 0.5) * PITCH;

function glyphDots(rows: string[], left: number): Point[] {
	return rows.flatMap((line, row) => [...line].flatMap((mark, column) => (mark === '#' ? [{ x: centre(left + column), y: centre(row) }] : [])));
}

// Dots are matched by where they sit within their own glyph, so a glyph reshapes on its way across instead of collapsing
// onto its nearest edge.
function placeWithinGlyph(dots: Point[]) {
	const xs = dots.map((dot) => dot.x);
	const ys = dots.map((dot) => dot.y);
	const left = Math.min(...xs);
	const top = Math.min(...ys);
	const width = Math.max(...xs) - left || 1;
	const height = Math.max(...ys) - top || 1;
	return dots.map((dot) => ({ x: (dot.x - left) / width, y: (dot.y - top) / height }));
}

function nearest(to: Point, candidates: number[], places: Point[]) {
	return candidates.reduce((best, candidate) => (Math.hypot(places[candidate].x - to.x, places[candidate].y - to.y) < Math.hypot(places[best].x - to.x, places[best].y - to.y) ? candidate : best));
}

function pairGlyphDots(pattern: Point[], doto: Point[]): MorphingDot[] {
	const patternPlaces = placeWithinGlyph(pattern);
	const dotoPlaces = placeWithinGlyph(doto);
	const everyPatternDot = pattern.map((_, index) => index);
	const unclaimed = new Set(everyPatternDot);

	const pairs = doto.map((target, index) => {
		const source = nearest(dotoPlaces[index], unclaimed.size ? [...unclaimed] : everyPatternDot, patternPlaces);
		unclaimed.delete(source);
		return { pattern: pattern[source], doto: target };
	});
	const everyDotoDot = doto.map((_, index) => index);
	for (const source of unclaimed) pairs.push({ pattern: pattern[source], doto: doto[nearest(patternPlaces[source], everyDotoDot, dotoPlaces)] });
	return pairs;
}

function numberGeometry(text: string, dotoText: string, sideColumns: number) {
	const characters = [...text];
	const dotoCharacters = [...dotoText];
	const patternColumns = characters.reduce((total, character) => total + GLYPHS[character][0].length + GLYPH_GAP, -GLYPH_GAP);
	const dotoColumns = dotoCharacters.length * DOTO_ADVANCE - DOTO_SIDE_BEARING;
	const numberColumns = Math.max(patternColumns, dotoColumns);
	const columns = numberColumns + sideColumns * 2;
	const patternLeft = sideColumns + Math.floor((numberColumns - patternColumns) / 2);
	const dotoLeft = sideColumns + (numberColumns - dotoColumns) / 2;

	let left = patternLeft;
	const patternGlyphs = characters.map((character) => {
		const glyph = glyphDots(GLYPHS[character], left);
		left += GLYPHS[character][0].length + GLYPH_GAP;
		return glyph;
	});
	const dotoGlyphs = dotoCharacters.map((character, index) => glyphDots(DOTO_GLYPHS[character], dotoLeft + index * DOTO_ADVANCE));
	// Glyph by glyph when the number turns into itself; a number turning into a word of another length is matched whole.
	const dots: MorphingDot[] = characters.length === dotoCharacters.length ? patternGlyphs.flatMap((glyph, index) => pairGlyphDots(glyph, dotoGlyphs[index])) : pairGlyphDots(patternGlyphs.flat(), dotoGlyphs.flat());

	const lit = new Set(dots.map(({ pattern }) => `${pattern.x}:${pattern.y}`));
	const ringOpacity = (column: number) => {
		const reach = column < sideColumns ? sideColumns - column : column - (sideColumns + numberColumns - 1);
		return reach <= 0 ? RING_OPACITY : RING_OPACITY - ((RING_OPACITY - FADED_RING_OPACITY) * reach) / sideColumns;
	};
	const rings: Ring[] = Array.from({ length: columns * GLYPH_ROWS }, (_, index) => ({ column: index % columns, row: Math.floor(index / columns) }))
		.map(({ column, row }) => ({ x: centre(column), y: centre(row), opacity: ringOpacity(column) }))
		.filter((ring) => !lit.has(`${ring.x}:${ring.y}`));

	return { width: columns * PITCH, height: GLYPH_ROWS * PITCH, dots, rings };
}

function morphAt(elapsed: number) {
	const time = elapsed % CYCLE_MS;
	if (time < HOLD_MS) return 0;
	if (time < HOLD_MS + MORPH_MS) return (time - HOLD_MS) / MORPH_MS;
	if (time < HOLD_MS * 2 + MORPH_MS) return 1;
	return 1 - (time - HOLD_MS * 2 - MORPH_MS) / MORPH_MS;
}

/**
 * A number drawn in the brand dot grid: solid dots for the digits on a field of rings, with the rings carrying on
 * either side and fading out towards the edges. While on screen it keeps morphing into the same number set in Doto,
 * or into `morphTo`, and back: the rings drain away and the dots gather into Doto's square ones.
 */
export function CreditsDotNumber({ value, morphTo = value, sideColumns = SIDE_COLUMNS, className }: { value: string; /** What the number turns into in Doto; by default the number itself. */ morphTo?: string; /** Columns of fading rings either side of the number. */ sideColumns?: number; className?: string }) {
	const { width, height, dots, rings } = useMemo(() => numberGeometry(value, morphTo, sideColumns), [value, morphTo, sideColumns]);
	const svgRef = useRef<SVGSVGElement>(null);
	const ringsRef = useRef<SVGGElement>(null);
	const dotsRef = useRef<SVGGElement>(null);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg || !ringsRef.current || !dotsRef.current) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const ringElements = [...ringsRef.current.children];
		const dotElements = [...dotsRef.current.children];

		const progressAt = (morph: number, x: number) => clamp01((morph - (x / width) * SWEEP) / (1 - SWEEP));
		const paint = (morph: number) => {
			rings.forEach((ring, index) => {
				const drained = easeInOut(clamp01(progressAt(morph, ring.x) * RING_HASTE));
				ringElements[index].setAttribute('r', String((DOT_RADIUS - RING_STROKE / 2) * (1 - drained)));
				ringElements[index].setAttribute('stroke-width', String(RING_STROKE * (1 - drained)));
			});
			dots.forEach(({ pattern, doto }, index) => {
				const arrived = easeInOut(progressAt(morph, pattern.x));
				const side = mix(DOT_RADIUS * 2, DOTO_DOT_SIDE, arrived);
				const dot = dotElements[index];
				dot.setAttribute('x', String(mix(pattern.x, doto.x, arrived) - side / 2));
				dot.setAttribute('y', String(mix(pattern.y, doto.y, arrived) - side / 2));
				dot.setAttribute('width', String(side));
				dot.setAttribute('height', String(side));
				dot.setAttribute('rx', String(mix(DOT_RADIUS, 0, arrived)));
			});
		};

		let frame = 0;
		let lastFrameAt = 0;
		let elapsed = 0;
		let paintedMorph = 0;
		let isOnScreen = false;

		const tick = (now: number) => {
			elapsed += Math.min(LONGEST_FRAME_MS, Math.max(0, now - lastFrameAt));
			lastFrameAt = now;
			const morph = morphAt(elapsed);
			if (morph !== paintedMorph) {
				paint(morph);
				paintedMorph = morph;
			}
			frame = requestAnimationFrame(tick);
		};

		const sync = () => {
			const shouldPlay = isOnScreen && !document.hidden;
			if (shouldPlay && !frame) {
				lastFrameAt = performance.now();
				frame = requestAnimationFrame(tick);
			} else if (!shouldPlay && frame) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		};

		const visibility = new IntersectionObserver(([entry]) => {
			isOnScreen = entry.isIntersecting;
			sync();
		});
		visibility.observe(svg);
		document.addEventListener('visibilitychange', sync);

		return () => {
			visibility.disconnect();
			document.removeEventListener('visibilitychange', sync);
			cancelAnimationFrame(frame);
			paint(0);
		};
	}, [width, dots, rings]);

	return (
		// Doto's comma hangs a dot below the grid.
		<svg ref={svgRef} aria-hidden="true" viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible text-brand-primary', className)}>
			<g ref={ringsRef} fill="none" stroke="currentColor" strokeWidth={RING_STROKE}>
				{rings.map((ring) => (
					<circle key={`${ring.x}:${ring.y}`} cx={ring.x} cy={ring.y} r={DOT_RADIUS - RING_STROKE / 2} strokeOpacity={ring.opacity} />
				))}
			</g>
			<g ref={dotsRef} fill="currentColor">
				{dots.map(({ pattern }, index) => (
					<rect key={index} x={pattern.x - DOT_RADIUS} y={pattern.y - DOT_RADIUS} width={DOT_RADIUS * 2} height={DOT_RADIUS * 2} rx={DOT_RADIUS} />
				))}
			</g>
		</svg>
	);
}

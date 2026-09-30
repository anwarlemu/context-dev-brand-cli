import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_ABSENT, DOT_FILLED, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellsOfStates, clamp01, hasRippleReached, paintedStates, type DotPainter, type GridPoint } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage, type DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * A story told as a loop of beats. Each beat is a picture, how it arrives from the one before, and what moves or is
 * written while it holds. A dense picture melts into the next; one that is mostly outline has too little in it to
 * melt, so it is built up dot by dot or swept in by a wave instead.
 */

export interface StoryPicture {
	states: Uint8Array;
	cells: GlyphCell[];
}

type Arrival =
	| { kind: 'melts'; seconds: number }
	/** Each dot changes once the arrival has reached its share, from 0 (first) to 1 (last). */
	| { kind: 'builds'; seconds: number; order: (column: number, row: number) => number }
	/** The change spreads out from `origin`, lighting each dot as it passes. */
	| { kind: 'waves'; seconds: number; origin: GridPoint };

export interface StoryBeat {
	picture: StoryPicture;
	arrival: Arrival;
	holdSeconds: number;
	/** Moves the held picture's parts: `states` starts as the picture and is changed in place. */
	animate?: (states: Uint8Array, heldSeconds: number) => void;
	/** What `animate` has made of the picture by the end of the hold, when that differs: the next beat arrives from it. */
	departure?: StoryPicture;
	/** Writes over the held picture; `presence` fades the writing in as the beat holds and out as the next arrives. */
	write?: (pen: StoryPen, heldSeconds: number) => void;
	/**
	 * Fills, in the card's colour, the part of the picture left empty for writing, so a backdrop pattern does not show
	 * through it. It stays filled while the next beat arrives, until that beat's own dots have covered it.
	 */
	clears?: (context: CanvasRenderingContext2D) => void;
}

export interface StoryPen {
	text: (text: DotStoryText, presence?: number) => void;
	/** Types `text` from `startsAt` seconds into the hold, with a cursor until `cursorUntil` (the end of typing if unset). */
	type: (text: DotStoryText, heldSeconds: number, typing: { startsAt: number; charactersPerSecond: number; cursorLingers?: number }) => void;
}

const WAVE_CREST_IN_CELLS = 2.5;
const TEXT_FADE_SECONDS = 0.3;
const CURSOR_GAP = 3;

export const pictureOf = (grid: DotGrid, painter: DotPainter): StoryPicture => {
	const states = paintedStates(grid, painter);
	return { states, cells: cellsOfStates(grid, states) };
};

/** How long `text` takes to type, so whatever follows can wait for it. */
export const typingSeconds = (text: DotStoryText, charactersPerSecond: number) => text.text.length / charactersPerSecond;

interface BeatStoryOptions {
	grid: DotGrid;
	beats: StoryBeat[];
	/** The beat the static art shows, and how far into its hold. */
	resting: { beat: number; heldSeconds: number };
}

export function createBeatStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage, { grid, beats, resting }: BeatStoryOptions): DotStoryPlayer {
	const { columns, rows, pitch } = grid;
	const states = new Uint8Array(columns * rows);
	const previous = (beat: number) => beats[(beat + beats.length - 1) % beats.length];
	const leftBy = (beat: number) => previous(beat).departure ?? previous(beat).picture;
	const startsAt = beats.map((_, index) => beats.slice(0, index).reduce((total, beat) => total + beat.arrival.seconds + beat.holdSeconds, 0));
	const loopSeconds = startsAt[beats.length - 1] + beats[beats.length - 1].arrival.seconds + beats[beats.length - 1].holdSeconds;
	const farthestCorner = Math.hypot(columns, rows);

	const melts = beats.map((beat, index) => (beat.arrival.kind === 'melts' ? createGlyphShader({ grid, box: { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) }, cells: leftBy(index).cells, drawTarget: (target) => drawGlyphCells(target, beat.picture.cells, pitch) }) : null));

	const arriving = (index: number, arrived: number) => {
		const { picture, arrival } = beats[index];
		const before = leftBy(index).states;
		if (arrival.kind === 'melts') return melts[index]!({ morph: arrived, spin: 0 });
		for (let cell = 0; cell < states.length; cell++) {
			const column = cell % columns;
			const row = Math.floor(cell / columns);
			if (arrival.kind === 'builds') {
				states[cell] = hasRippleReached(arrival.order(column, row), arrived) ? picture.states[cell] : before[cell];
				continue;
			}
			const crest = arrived * (farthestCorner + WAVE_CREST_IN_CELLS);
			const fromOrigin = Math.hypot(column - arrival.origin.column, row - arrival.origin.row);
			if (fromOrigin > crest) states[cell] = before[cell];
			else if (fromOrigin <= crest - WAVE_CREST_IN_CELLS) states[cell] = picture.states[cell];
			else states[cell] = before[cell] === DOT_ABSENT && picture.states[cell] === DOT_ABSENT ? DOT_ABSENT : DOT_FILLED;
		}
		return states;
	};

	const holding = (index: number, heldSeconds: number) => {
		const { picture, animate } = beats[index];
		if (!animate) return picture.states;
		states.set(picture.states);
		animate(states, heldSeconds);
		return states;
	};

	const penFor = (context: CanvasRenderingContext2D, presence: number): StoryPen => ({
		text: (text, own = 1) => paintDotStoryText(context, fontFamily, text, presence * own),
		type(text, heldSeconds, { startsAt: from, charactersPerSecond, cursorLingers = 0.4 }) {
			const typed = text.text.slice(0, Math.max(0, Math.floor((heldSeconds - from) * charactersPerSecond)));
			paintDotStoryText(context, fontFamily, { ...text, text: typed }, presence);
			if (heldSeconds < from || heldSeconds > from + typingSeconds(text, charactersPerSecond) + cursorLingers) return;
			context.font = dotStoryFont(text, fontFamily);
			paintDotStoryCursor(context, text.x + context.measureText(typed).width + CURSOR_GAP, text, presence);
		},
	});

	const clearingFor = (...cleared: StoryBeat[]) => {
		const clears = cleared.flatMap((beat) => beat.clears ?? []);
		if (clears.length === 0) return undefined;
		return (context: CanvasRenderingContext2D) => {
			context.fillStyle = surfaceColor;
			for (const clear of clears) clear(context);
		};
	};

	for (const beat of beats) beat.write?.({ text: (text) => void document.fonts.load(dotStoryFont(text, fontFamily), text.text), type: (text) => void document.fonts.load(dotStoryFont(text, fontFamily), text.text) }, Infinity);

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid,
		resting: { states: Uint8Array.from(holding(resting.beat, resting.heldSeconds)), atSeconds: startsAt[resting.beat] + beats[resting.beat].arrival.seconds + resting.heldSeconds },
		frameAt(storySeconds) {
			const seconds = storySeconds % loopSeconds;
			let index = beats.length - 1;
			while (seconds < startsAt[index]) index--;
			const since = seconds - startsAt[index];
			const { arrival, holdSeconds } = beats[index];
			if (since < arrival.seconds) {
				const leaving = previous(index);
				return {
					states: arriving(index, since / arrival.seconds),
					paintBeneath: clearingFor(beats[index], leaving),
					paintAbove: leaving.write ? (context) => leaving.write!(penFor(context, 1 - clamp01(since / TEXT_FADE_SECONDS)), leaving.holdSeconds) : undefined,
				};
			}
			const heldSeconds = Math.min(since - arrival.seconds, holdSeconds);
			const { write } = beats[index];
			return { states: holding(index, heldSeconds), paintBeneath: clearingFor(beats[index]), paintAbove: write ? (context) => write(penFor(context, clamp01(heldSeconds / TEXT_FADE_SECONDS)), heldSeconds) : undefined };
		},
	});
}

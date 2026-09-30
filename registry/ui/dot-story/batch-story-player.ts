import { BATCH_RESTING, BATCH_SIZE, BATCH_STORY_GRID, BOX_BACK, BOX_FRONT, BOX_RIM_ROW, BOX_SHIFT, CENTRED_BOX, CLOSED_BOX, COUNTER, EMPTY_PROGRESS, FULL_PROGRESS, OPEN_BOX, PAGE_STOPS, PROGRESS_CELLS, RESULTS_PAGE, SUMMARY } from '@/components/ds/ui/batch-story-scenes';
import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_ABSENT, DOT_FILLED } from '@/components/ds/ui/dot-morph-dots';
import { cellIndexIn, cellState, clamp01, hasRippleReached, placeCells } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryText, type DotStoryPlayer, type DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One batch, played as a loop: the job counts up to 25,000 URLs while its progress fills dot by dot, the full
 * progress melts into a page of results beside an open box, the page lifts over the box and drops in, the box
 * closes and moves to the middle, and its summary appears over it. Then the box melts back into an empty job.
 */

const RUN = { startsAt: 0.4, seconds: 3 };
const SPLIT = { startsAt: RUN.startsAt + RUN.seconds + 0.5, seconds: 1.1 };
const PACK = { startsAt: SPLIT.startsAt + SPLIT.seconds + 0.4, seconds: 1.7, liftShare: 0.55, liftInCells: 3 };
const CLOSE = { startsAt: PACK.startsAt + PACK.seconds + 0.2, seconds: 0.6 };
const CENTRE = { startsAt: CLOSE.startsAt + CLOSE.seconds + 0.15, seconds: 0.7 };
const SUMMARY_AT = CENTRE.startsAt + CENTRE.seconds + 0.15;
const RESET = { startsAt: SUMMARY_AT + 2, seconds: 1.1 };
const LOOP_SECONDS = RESET.startsAt + RESET.seconds + 0.3;
// The box stands in the middle with its summary over it: the picture the static art shows.
const RESTING_AT_SECONDS = SUMMARY_AT + 1;
const TEXT_FADE_SECONDS = 0.3;

const { columns, rows, pitch } = BATCH_STORY_GRID;
const cellIndex = cellIndexIn(BATCH_STORY_GRID);
const WHOLE_GRID = { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) };
const FARTHEST_FROM_RIM = Math.max(BOX_RIM_ROW, rows - 1 - BOX_RIM_ROW);

const easeInOut = (t: number) => t * t * (3 - 2 * t);
// Slows only a little towards the end, so the count is still visibly counting when it lands on the total.
const settle = (t: number) => 1 - (1 - t) ** 1.6;
const between = (from: number, to: number, share: number) => from + (to - from) * share;
const melt = (from: GlyphCell[], into: GlyphCell[]) => createGlyphShader({ grid: BATCH_STORY_GRID, box: WHOLE_GRID, cells: from, drawTarget: (target) => drawGlyphCells(target, into, pitch) });

// Over to the box in an arc, then straight down into it.
function pageAt(packed: number) {
	const { start, over, packed: rest } = PAGE_STOPS;
	if (packed >= PACK.liftShare) return { column: over.column, row: Math.round(between(over.row, rest.row, easeInOut((packed - PACK.liftShare) / (1 - PACK.liftShare)))) };
	const lifted = easeInOut(clamp01(packed / PACK.liftShare));
	return { column: Math.round(between(start.column, over.column, lifted)), row: Math.round(between(start.row, over.row, lifted) - PACK.liftInCells * Math.sin(Math.PI * lifted)) };
}

export function createBatchStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);
	const pageAtStart = placeCells(RESULTS_PAGE.ink, { left: PAGE_STOPS.start.column, top: PAGE_STOPS.start.row });
	const split = melt(FULL_PROGRESS.cells, [...OPEN_BOX.cells, ...pageAtStart]);
	const reset = melt(CENTRED_BOX.cells, EMPTY_PROGRESS.cells);

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is set.
	for (const text of [COUNTER, ...SUMMARY]) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const paintProgress = (run: number) => {
		states.set(EMPTY_PROGRESS.states);
		const done = Math.round(settle(clamp01(run)) * PROGRESS_CELLS.length);
		for (let step = 0; step < done; step++) states[cellIndex(PROGRESS_CELLS[step])] = DOT_FILLED;
		return states;
	};

	// The page goes in front of the box's back wall and behind its front, so it sinks out of sight below the rim.
	const paintPacking = (packed: number) => {
		states.set(BOX_BACK.states);
		const corner = pageAt(packed);
		const isOnGrid = (cell: GlyphCell) => cell.column >= 0 && cell.column < columns && cell.row >= 0 && cell.row < rows;
		for (const cell of placeCells(RESULTS_PAGE.paper, { left: corner.column, top: corner.row }).filter(isOnGrid)) states[cellIndex(cell)] = DOT_ABSENT;
		for (const cell of placeCells(RESULTS_PAGE.ink, { left: corner.column, top: corner.row }).filter(isOnGrid)) states[cellIndex(cell)] = cellState(cell);
		BOX_FRONT.states.forEach((state, cell) => {
			if (state !== DOT_ABSENT) states[cell] = state;
		});
		return states;
	};

	// The lid comes down onto the rim, so the change spreads up and down from there.
	const paintClosing = (closed: number) => {
		for (let cell = 0; cell < states.length; cell++) {
			const fromRim = Math.abs(Math.floor(cell / columns) - BOX_RIM_ROW) / FARTHEST_FROM_RIM;
			states[cell] = hasRippleReached(fromRim, closed) ? CLOSED_BOX.states[cell] : OPEN_BOX.states[cell];
		}
		return states;
	};

	const paintCentring = (centred: number) => {
		if (centred >= 1) return CENTRED_BOX.states;
		states.fill(DOT_ABSENT);
		for (const cell of placeCells(CLOSED_BOX.cells, { left: Math.round(BOX_SHIFT * easeInOut(clamp01(centred))), top: 0 })) states[cellIndex(cell)] = cellState(cell);
		return states;
	};

	const statesAt = (seconds: number) => {
		if (seconds >= RESET.startsAt) return reset({ morph: clamp01((seconds - RESET.startsAt) / RESET.seconds), spin: 0 });
		if (seconds >= CENTRE.startsAt) return paintCentring((seconds - CENTRE.startsAt) / CENTRE.seconds);
		if (seconds >= CLOSE.startsAt) return paintClosing((seconds - CLOSE.startsAt) / CLOSE.seconds);
		if (seconds >= SPLIT.startsAt + SPLIT.seconds) return paintPacking(clamp01((seconds - PACK.startsAt) / PACK.seconds));
		if (seconds >= SPLIT.startsAt) return split({ morph: (seconds - SPLIT.startsAt) / SPLIT.seconds, spin: 0 });
		return paintProgress((seconds - RUN.startsAt) / RUN.seconds);
	};

	const paintCounter = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = 1 - clamp01((seconds - SPLIT.startsAt) / TEXT_FADE_SECONDS);
		const counted = Math.round(settle(clamp01((seconds - RUN.startsAt) / RUN.seconds)) * BATCH_SIZE);
		paintDotStoryText(context, fontFamily, { ...COUNTER, text: `${counted.toLocaleString('en-US')} URLs` }, presence);
	};

	const paintSummary = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = clamp01((seconds - SUMMARY_AT) / TEXT_FADE_SECONDS) * (1 - clamp01((seconds - RESET.startsAt) / TEXT_FADE_SECONDS));
		for (const text of SUMMARY) paintDotStoryText(context, fontFamily, text, presence);
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: BATCH_STORY_GRID,
		resting: { states: BATCH_RESTING.states, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			return {
				states: statesAt(seconds),
				paintAbove(context) {
					paintCounter(context, seconds);
					paintSummary(context, seconds);
				},
			};
		},
	});
}

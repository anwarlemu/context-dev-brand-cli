import { BRAIN, QUERY, RAG_RESTING, RAG_STORY_GRID, SEARCH, SEARCH_BAND, SEARCH_FILLED, SEARCH_INSIDE, SOURCE_CARDS } from '@/components/ds/ui/rag-story-scenes';
import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { cellIndexIn, cellState, clamp01, hasRippleReached } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One question, played as a loop: it is typed into the search field, a scan runs round the field while the search is
 * out, the field fills and melts into a brain, and the brain hands out the pages that answer it, one card at a time.
 * Then it all melts back into the field, which empties for the next question.
 */

const TYPING = { startsAt: 0.4, charactersPerSecond: 12 };
const TYPED_AT = TYPING.startsAt + QUERY.text.length / TYPING.charactersPerSecond;
const SCAN = { startsAt: TYPED_AT + 0.2, seconds: 0.8, length: 10 };
const WIPE_SECONDS = 0.35;
const FILL_AT = SCAN.startsAt + SCAN.seconds;
const THINK = { startsAt: FILL_AT + WIPE_SECONDS, seconds: 1.1 };
const RETRIEVED_AT = THINK.startsAt + THINK.seconds;
const CARD = { firstAt: RETRIEVED_AT + 0.4, everySeconds: 0.8, linkSeconds: 0.3, seconds: 0.45, titleSeconds: 0.3 };
const PAGE = { everySeconds: 1.1, length: 2 };
const SHIMMER = { startsAt: CARD.firstAt + SOURCE_CARDS.length * CARD.everySeconds + 0.4, seconds: 1.1, width: 1.5 };
const RESET = { startsAt: SHIMMER.startsAt + SHIMMER.seconds + 1.2, seconds: 1.1 };
const EMPTY_AT = RESET.startsAt + RESET.seconds;
const LOOP_SECONDS = EMPTY_AT + WIPE_SECONDS + 0.3;
// Everything has been handed out and the shimmer has passed: the picture the static art shows.
const RESTING_AT_SECONDS = SHIMMER.startsAt + SHIMMER.seconds + 0.2;
const TEXT_FADE_SECONDS = 0.3;
const CURSOR_GAP = 3;
const CURSOR_BLINKS_PER_SECOND = 1.4;

const { columns, rows, pitch } = RAG_STORY_GRID;
const cellIndex = cellIndexIn(RAG_STORY_GRID);
const WHOLE_GRID = { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) };
const BRAIN_RINGS = BRAIN.cells.filter((cell) => !cell.filled);
const DIAGONALS = BRAIN_RINGS.map((cell) => cell.column + cell.row);
const FIRST_DIAGONAL = Math.min(...DIAGONALS) - SHIMMER.width;
const LAST_DIAGONAL = Math.max(...DIAGONALS) + SHIMMER.width;

const cardStartsAt = (index: number) => CARD.firstAt + index * CARD.everySeconds;
const melt = (from: GlyphCell[], into: GlyphCell[]) => createGlyphShader({ grid: RAG_STORY_GRID, box: WHOLE_GRID, cells: from, drawTarget: (target) => drawGlyphCells(target, into, pitch) });

export function createRagStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);
	const think = melt(SEARCH_FILLED.cells, BRAIN.cells);
	const reset = melt(RAG_RESTING.cells, SEARCH_FILLED.cells);

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is typed.
	for (const text of [QUERY, ...RAG_RESTING.texts]) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const paintScan = (seconds: number) => {
		const since = seconds - SCAN.startsAt;
		if (since < 0 || since >= SCAN.seconds) return;
		const head = Math.floor((since / SCAN.seconds) * SEARCH_BAND.length);
		for (let step = 0; step < SCAN.length; step++) states[cellIndex(SEARCH_BAND[(head + step) % SEARCH_BAND.length])] = DOT_FILLED;
	};

	const paintCards = (seconds: number) => {
		SOURCE_CARDS.forEach((card, index) => {
			const since = seconds - cardStartsAt(index);
			if (since <= 0) return;
			card.link.forEach((cell, step) => {
				if (hasRippleReached(step / card.link.length, since / CARD.linkSeconds)) states[cellIndex(cell)] = DOT_HOLLOW;
			});
			const arrived = (since - CARD.linkSeconds) / CARD.seconds;
			if (arrived <= 0) return;
			// The card draws itself from the side its link comes in on.
			const entry = card.link[card.link.length - 1].column;
			for (const cell of card.cells) {
				if (hasRippleReached(Math.abs(cell.column - entry) / card.region.columns, arrived)) states[cellIndex(cell)] = cellState(cell);
			}
			if (arrived < 1) return;
			const head = Math.floor((((since - CARD.linkSeconds - CARD.seconds) % PAGE.everySeconds) / PAGE.everySeconds) * (card.link.length + PAGE.length));
			for (let step = 0; step < PAGE.length; step++) {
				const travelling = card.link[head - step];
				if (travelling) states[cellIndex(travelling)] = DOT_FILLED;
			}
		});
	};

	const paintShimmer = (seconds: number) => {
		const passed = (seconds - SHIMMER.startsAt) / SHIMMER.seconds;
		if (passed < 0 || passed >= 1) return;
		const crest = FIRST_DIAGONAL + passed * (LAST_DIAGONAL - FIRST_DIAGONAL);
		BRAIN_RINGS.forEach((cell, index) => {
			if (Math.abs(DIAGONALS[index] - crest) < SHIMMER.width) states[cellIndex(cell)] = DOT_FILLED;
		});
	};

	// The rings sweep across the field, left to right, whether they are filling it or leaving it.
	const paintWipe = (wiped: number, before: Uint8Array, after: Uint8Array) => {
		states.set(before);
		for (let row = SEARCH_INSIDE.top; row < SEARCH_INSIDE.top + SEARCH_INSIDE.rows; row++) {
			for (let step = 0; step < SEARCH_INSIDE.columns; step++) {
				const cell = cellIndex({ column: SEARCH_INSIDE.left + step, row });
				if (hasRippleReached(step / SEARCH_INSIDE.columns, wiped)) states[cell] = after[cell];
			}
		}
		return states;
	};

	const statesAt = (seconds: number) => {
		if (seconds >= EMPTY_AT) return paintWipe((seconds - EMPTY_AT) / WIPE_SECONDS, SEARCH_FILLED.states, SEARCH.states);
		if (seconds >= RESET.startsAt) return reset({ morph: clamp01((seconds - RESET.startsAt) / RESET.seconds), spin: 0 });
		if (seconds >= RETRIEVED_AT) {
			states.set(BRAIN.states);
			paintCards(seconds);
			paintShimmer(seconds);
			return states;
		}
		if (seconds >= THINK.startsAt) return think({ morph: (seconds - THINK.startsAt) / THINK.seconds, spin: 0 });
		if (seconds >= FILL_AT) return paintWipe((seconds - FILL_AT) / WIPE_SECONDS, SEARCH.states, SEARCH_FILLED.states);
		states.set(SEARCH.states);
		paintScan(seconds);
		return states;
	};

	const paintQuery = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = 1 - clamp01((seconds - FILL_AT) / TEXT_FADE_SECONDS);
		if (presence <= 0) return;
		const typed = QUERY.text.slice(0, Math.max(0, Math.floor((seconds - TYPING.startsAt) * TYPING.charactersPerSecond)));
		paintDotStoryText(context, fontFamily, { ...QUERY, text: typed }, presence);
		const isTyping = seconds >= TYPING.startsAt && typed.length < QUERY.text.length;
		if (!isTyping && Math.floor(seconds * CURSOR_BLINKS_PER_SECOND * 2) % 2 === 1) return;
		context.font = dotStoryFont(QUERY, fontFamily);
		paintDotStoryCursor(context, QUERY.x + context.measureText(typed).width + CURSOR_GAP, QUERY, presence);
	};

	const paintTitles = (context: CanvasRenderingContext2D, seconds: number) => {
		const leaving = 1 - clamp01((seconds - RESET.startsAt) / TEXT_FADE_SECONDS);
		SOURCE_CARDS.forEach((card, index) => paintDotStoryText(context, fontFamily, card.title, clamp01((seconds - cardStartsAt(index) - CARD.linkSeconds - CARD.seconds) / CARD.titleSeconds) * leaving));
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: RAG_STORY_GRID,
		resting: { states: RAG_RESTING.states, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			return {
				states: statesAt(seconds),
				paintAbove(context) {
					paintQuery(context, seconds);
					paintTitles(context, seconds);
				},
			};
		},
	});
}

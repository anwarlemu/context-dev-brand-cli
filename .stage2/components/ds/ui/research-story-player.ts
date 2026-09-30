import { CARD_FRAMES, DOMAIN, LENS_PATH, PAGE_PICTURE, PROFILE_CARDS, RESEARCH_RESTING, RESEARCH_STORY_GRID, paintMagnifier } from '@/components/ds/ui/research-story-scenes';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { cellIndexIn, cellState, clamp01, hasRippleReached } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One piece of research, played as a loop: the domain is typed at the top of its page, a magnifying glass wanders the
 * page reading it, the page turns into four empty cards, and the brand profile fills them in one card at a time. Then
 * the cards turn back into the page for the next domain.
 *
 * The page and the cards are mostly outline, too little for one to melt into the other, so the change travels through
 * them as a wave instead: it spreads out from the glass, lighting each dot as it passes and leaving the new picture.
 */

const TYPING = { startsAt: 0.4, charactersPerSecond: 11 };
const RESEARCH = { startsAt: TYPING.startsAt + DOMAIN.text.length / TYPING.charactersPerSecond + 0.2, seconds: 3.6 };
const RESOLVE = { startsAt: RESEARCH.startsAt + RESEARCH.seconds + 0.2, seconds: 1.1 };
const WAVE_CREST_IN_CELLS = 2.5;
const CARD = { firstAt: RESOLVE.startsAt + RESOLVE.seconds + 0.1, everySeconds: 0.5, seconds: 0.45, textSeconds: 0.3 };
const SHIMMER = { startsAt: CARD.firstAt + PROFILE_CARDS.length * CARD.everySeconds + 0.6, seconds: 1.1, width: 1.5 };
const RESET = { startsAt: SHIMMER.startsAt + SHIMMER.seconds + 1.6, seconds: 1.1 };
const LOOP_SECONDS = RESET.startsAt + RESET.seconds + 0.3;
// Every card is filled in and the shimmer has passed: the picture the static art shows.
const RESTING_AT_SECONDS = SHIMMER.startsAt + SHIMMER.seconds + 0.3;
const TEXT_FADE_SECONDS = 0.3;
const CURSOR_GAP = 3;

const { columns, rows } = RESEARCH_STORY_GRID;
const cellIndex = cellIndexIn(RESEARCH_STORY_GRID);
const SHIMMERING_CELLS = PROFILE_CARDS.flatMap((card) => card.contents).filter((cell) => !cell.filled);
const DIAGONALS = SHIMMERING_CELLS.map((cell) => cell.column + cell.row);
const FIRST_DIAGONAL = Math.min(...DIAGONALS) - SHIMMER.width;
const LAST_DIAGONAL = Math.max(...DIAGONALS) + SHIMMER.width;

const easeInOut = (t: number) => t * t * (3 - 2 * t);
const cardStartsAt = (index: number) => CARD.firstAt + index * CARD.everySeconds;

// The glass ends its round where it began, so the page it melts out of and back into is one picture.
function lensAt(wandered: number) {
	const turn = easeInOut(clamp01(wandered)) * Math.PI * 2;
	return { column: LENS_PATH.centre.column + LENS_PATH.reach.column * Math.cos(turn), row: LENS_PATH.centre.row + LENS_PATH.reach.row * Math.sin(turn * 2) };
}

function pageWithGlass(states: Uint8Array, wandered: number) {
	states.set(PAGE_PICTURE.states);
	paintMagnifier(states, PAGE_PICTURE.states, lensAt(wandered), DOT_FILLED, DOT_ABSENT);
	return states;
}

export function createResearchStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);
	const pageAtRest = pageWithGlass(new Uint8Array(columns * rows), 0);
	const glassAtRest = lensAt(0);
	const farthestFromGlass = Math.hypot(Math.max(glassAtRest.column, columns - glassAtRest.column), Math.max(glassAtRest.row, rows - glassAtRest.row));

	const paintWave = (travelled: number, before: Uint8Array, after: Uint8Array) => {
		const crest = travelled * (farthestFromGlass + WAVE_CREST_IN_CELLS);
		for (let cell = 0; cell < states.length; cell++) {
			const fromGlass = Math.hypot((cell % columns) - glassAtRest.column, Math.floor(cell / columns) - glassAtRest.row);
			if (fromGlass > crest) states[cell] = before[cell];
			else if (fromGlass <= crest - WAVE_CREST_IN_CELLS) states[cell] = after[cell];
			else states[cell] = before[cell] === DOT_ABSENT && after[cell] === DOT_ABSENT ? DOT_ABSENT : DOT_FILLED;
		}
		return states;
	};

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is typed.
	for (const text of [DOMAIN, ...RESEARCH_RESTING.texts]) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const paintCards = (seconds: number) => {
		PROFILE_CARDS.forEach((card, index) => {
			const filledIn = (seconds - cardStartsAt(index)) / CARD.seconds;
			if (filledIn <= 0) return;
			for (const cell of card.contents) {
				if (hasRippleReached((cell.column - card.region.left) / card.region.columns, filledIn)) states[cellIndex(cell)] = cellState(cell);
			}
		});
	};

	const paintShimmer = (seconds: number) => {
		const passed = (seconds - SHIMMER.startsAt) / SHIMMER.seconds;
		if (passed < 0 || passed >= 1) return;
		const crest = FIRST_DIAGONAL + passed * (LAST_DIAGONAL - FIRST_DIAGONAL);
		SHIMMERING_CELLS.forEach((cell, index) => {
			if (Math.abs(DIAGONALS[index] - crest) < SHIMMER.width && states[cellIndex(cell)] === DOT_HOLLOW) states[cellIndex(cell)] = DOT_FILLED;
		});
	};

	const statesAt = (seconds: number) => {
		if (seconds >= RESET.startsAt) return paintWave(clamp01((seconds - RESET.startsAt) / RESET.seconds), RESEARCH_RESTING.states, pageAtRest);
		if (seconds >= RESOLVE.startsAt + RESOLVE.seconds) {
			states.set(CARD_FRAMES.states);
			paintCards(seconds);
			paintShimmer(seconds);
			return states;
		}
		if (seconds >= RESOLVE.startsAt) return paintWave((seconds - RESOLVE.startsAt) / RESOLVE.seconds, pageAtRest, CARD_FRAMES.states);
		return pageWithGlass(states, (seconds - RESEARCH.startsAt) / RESEARCH.seconds);
	};

	const paintDomain = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = 1 - clamp01((seconds - RESOLVE.startsAt) / TEXT_FADE_SECONDS);
		if (presence <= 0) return;
		const typed = DOMAIN.text.slice(0, Math.max(0, Math.floor((seconds - TYPING.startsAt) * TYPING.charactersPerSecond)));
		paintDotStoryText(context, fontFamily, { ...DOMAIN, text: typed }, presence);
		if (seconds >= RESEARCH.startsAt) return;
		context.font = dotStoryFont(DOMAIN, fontFamily);
		paintDotStoryCursor(context, DOMAIN.x + context.measureText(typed).width + CURSOR_GAP, DOMAIN);
	};

	const paintProfile = (context: CanvasRenderingContext2D, seconds: number) => {
		const leaving = 1 - clamp01((seconds - RESET.startsAt) / TEXT_FADE_SECONDS);
		PROFILE_CARDS.forEach((card, index) => {
			const presence = clamp01((seconds - cardStartsAt(index)) / CARD.textSeconds) * leaving;
			for (const text of card.texts) paintDotStoryText(context, fontFamily, text, presence);
		});
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: RESEARCH_STORY_GRID,
		resting: { states: RESEARCH_RESTING.states, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			return {
				states: statesAt(seconds),
				paintAbove(context) {
					paintDomain(context, seconds);
					paintProfile(context, seconds);
				},
			};
		},
	});
}

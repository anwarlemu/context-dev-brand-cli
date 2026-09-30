import { ENRICH_RESTING, ENRICH_STORY_GRID, EYE_AT_REST, EYE_LOOK, ICONS, IDENTIFIER, LINK, PROFILES, paintEye } from '@/components/ds/ui/enrich-story-scenes';
import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { cellIndexIn, cellState, clamp01, hasRippleReached } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One sighting, played as a loop: an identifier is typed while the agent's eye reads along, the eye melts into the
 * company and the person behind it, a card draws itself round each and fills in line by line, and a link joins the
 * two. Then both profiles melt back into the eye.
 */

const TYPING = { startsAt: 0.4, charactersPerSecond: 11 };
const LOOKING = { startsAt: TYPING.startsAt, glances: 2, glanceSeconds: 1.4 };
const SPLIT = { startsAt: LOOKING.startsAt + LOOKING.glances * LOOKING.glanceSeconds + 0.3, seconds: 1.1 };
const FRAME = { startsAt: SPLIT.startsAt + SPLIT.seconds + 0.2, seconds: 0.5 };
const DETAIL = { firstAt: FRAME.startsAt + FRAME.seconds, everySeconds: 0.3, staggerSeconds: 0.15, seconds: 0.3 };
const LINK_UP = { startsAt: DETAIL.firstAt + PROFILES[0].details.length * DETAIL.everySeconds + 0.3, seconds: 0.4, pulseSeconds: 0.9 };
const RESET = { startsAt: LINK_UP.startsAt + 2.6, seconds: 1.1 };
const LOOP_SECONDS = RESET.startsAt + RESET.seconds + 0.3;
// Both profiles are filled in and linked, between two pulses: the picture the static art shows.
const RESTING_AT_SECONDS = LINK_UP.startsAt + LINK_UP.seconds + LINK_UP.pulseSeconds * 1.5;
const TEXT_FADE_SECONDS = 0.3;
const CURSOR_GAP = 3;

const { columns, rows, pitch } = ENRICH_STORY_GRID;
const cellIndex = cellIndexIn(ENRICH_STORY_GRID);
const WHOLE_GRID = { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) };

const melt = (from: GlyphCell[], into: GlyphCell[]) => createGlyphShader({ grid: ENRICH_STORY_GRID, box: WHOLE_GRID, cells: from, drawTarget: (target) => drawGlyphCells(target, into, pitch) });
const detailStartsAt = (card: number, detail: number) => DETAIL.firstAt + card * DETAIL.staggerSeconds + detail * DETAIL.everySeconds;

// The glances are whole, so the eye is looking straight ahead again when it starts to melt.
function lookAt(seconds: number) {
	const looking = clamp01((seconds - LOOKING.startsAt) / (LOOKING.glances * LOOKING.glanceSeconds));
	return Math.round(EYE_LOOK * Math.sin(looking * LOOKING.glances * Math.PI * 2));
}

export function createEnrichStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);
	const split = melt(EYE_AT_REST.cells, ICONS.cells);
	const reset = melt(ENRICH_RESTING.cells, EYE_AT_REST.cells);

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is typed.
	for (const text of [IDENTIFIER, ...ENRICH_RESTING.texts]) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const paintProfiles = (seconds: number) => {
		states.set(ICONS.states);
		const framed = (seconds - FRAME.startsAt) / FRAME.seconds;
		PROFILES.forEach((card, index) => {
			// The card draws itself outwards from its icon, in the corner it starts from.
			const farthest = Math.hypot(card.region.columns, card.region.rows);
			for (const cell of card.frame) {
				if (framed > 0 && hasRippleReached(Math.hypot(cell.column - card.region.left, cell.row - card.region.top) / farthest, framed)) states[cellIndex(cell)] = cellState(cell);
			}
			card.details.forEach((detail, step) => {
				const filledIn = (seconds - detailStartsAt(index, step)) / DETAIL.seconds;
				for (const cell of detail.cells) {
					if (filledIn > 0 && hasRippleReached((cell.column - card.region.left) / card.region.columns, filledIn)) states[cellIndex(cell)] = cellState(cell);
				}
			});
		});
	};

	const paintLink = (seconds: number) => {
		const since = seconds - LINK_UP.startsAt;
		if (since <= 0) return;
		LINK.forEach((cell, step) => {
			if (hasRippleReached(step / LINK.length, since / LINK_UP.seconds)) states[cellIndex(cell)] = DOT_HOLLOW;
		});
		if (since < LINK_UP.seconds) return;
		const head = Math.floor((((since - LINK_UP.seconds) % LINK_UP.pulseSeconds) / LINK_UP.pulseSeconds) * (LINK.length * 2));
		const travelling = LINK[head];
		if (travelling) states[cellIndex(travelling)] = DOT_FILLED;
	};

	const statesAt = (seconds: number) => {
		if (seconds >= RESET.startsAt) return reset({ morph: clamp01((seconds - RESET.startsAt) / RESET.seconds), spin: 0 });
		if (seconds >= SPLIT.startsAt + SPLIT.seconds) {
			paintProfiles(seconds);
			paintLink(seconds);
			return states;
		}
		if (seconds >= SPLIT.startsAt) return split({ morph: (seconds - SPLIT.startsAt) / SPLIT.seconds, spin: 0 });
		return paintEye(states, lookAt(seconds));
	};

	const paintIdentifier = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = 1 - clamp01((seconds - SPLIT.startsAt) / TEXT_FADE_SECONDS);
		if (presence <= 0) return;
		const typed = IDENTIFIER.text.slice(0, Math.max(0, Math.floor((seconds - TYPING.startsAt) * TYPING.charactersPerSecond)));
		// The line is centred on what it will read once typed, so it grows to the right rather than from its middle.
		context.font = dotStoryFont(IDENTIFIER, fontFamily);
		const left = IDENTIFIER.x - context.measureText(IDENTIFIER.text).width / 2;
		paintDotStoryText(context, fontFamily, { ...IDENTIFIER, text: typed, x: left, anchor: 'start' }, presence);
		if (typed.length === IDENTIFIER.text.length) return;
		paintDotStoryCursor(context, left + context.measureText(typed).width + CURSOR_GAP, IDENTIFIER, presence);
	};

	const paintDetails = (context: CanvasRenderingContext2D, seconds: number) => {
		const leaving = 1 - clamp01((seconds - RESET.startsAt) / TEXT_FADE_SECONDS);
		PROFILES.forEach((card, index) => {
			card.details.forEach((detail, step) => {
				const presence = clamp01((seconds - detailStartsAt(index, step)) / DETAIL.seconds) * leaving;
				for (const text of detail.texts) paintDotStoryText(context, fontFamily, text, presence);
			});
		});
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: ENRICH_STORY_GRID,
		resting: { states: ENRICH_RESTING.states, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			return {
				states: statesAt(seconds),
				paintAbove(context) {
					paintIdentifier(context, seconds);
					paintDetails(context, seconds);
				},
			};
		},
	});
}

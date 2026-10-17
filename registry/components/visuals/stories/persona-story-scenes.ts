import { storyCaption } from '@/components/visuals/dot-engine/story-caption';
import type { GlyphCell } from '@/components/visuals/dot-engine/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import type { StoryPicture } from '@/components/visuals/dot-engine/dot-story-beats';
import { cellStates, cellsOfStates, paintShape, roundedBox, type DotBox } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';
import { PERSONA_GLYPH_GRID, personaGlyph, personaOutcome, type PersonaGlyphName } from '@/components/visuals/stories/persona-glyphs';

/**
 * A persona card's story pictures, in the brand dot grid: the card's own glyph grown large for what the team builds,
 * the window a request is answered in, and the glyph for what the API gives it.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const PERSONA_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = PERSONA_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(PERSONA_STORY_GRID, states) });
const pictureOfCells = (cells: GlyphCell[]) => pictureOfStates(cellStates(PERSONA_STORY_GRID, cells));
const blank = () => new Uint8Array(COLUMNS * ROWS);

// Every picture stands in the same place, left of the words that say what it means. Doto is a wide monospace, so
// the words get the larger share: thirteen characters of the big line fit beside the picture.
export const PICTURE_CENTER = { column: 14, row: 19 };
const CAPTION_COLUMN = 30;
const GROWTH = 2;
const GLYPH_SIDE = PERSONA_GLYPH_GRID.columns * GROWTH;
const GLYPH_ORIGIN = { left: PICTURE_CENTER.column - GLYPH_SIDE / 2, top: PICTURE_CENTER.row - GLYPH_SIDE / 2 };

/** The card's small glyph grown to twice its size, each of its dots a block of four; `filled` overrides what they are. */
function grown(cells: GlyphCell[], filled?: boolean): GlyphCell[] {
	return cells.flatMap((cell) =>
		Array.from({ length: GROWTH * GROWTH }, (_, part) => ({
			column: GLYPH_ORIGIN.left + cell.column * GROWTH + (part % GROWTH),
			row: GLYPH_ORIGIN.top + cell.row * GROWTH + Math.floor(part / GROWTH),
			filled: filled ?? cell.filled,
		}))
	);
}

export interface PersonaPictures {
	/** What the team builds, standing. */
	built: StoryPicture;
	/** The same, hollowed out: the challenge has got to it. */
	broken: StoryPicture;
	/** What the API gives it. */
	outcome: StoryPicture;
}

export function personaPictures(name: PersonaGlyphName): PersonaPictures {
	const team = personaGlyph(name);
	return { built: pictureOfCells(grown(team)), broken: pictureOfCells(grown(team, false)), outcome: pictureOfCells(grown(personaOutcome(name))) };
}

const WINDOW: DotBox = { left: 1, right: 27, top: 8, bottom: 30 };
const WINDOW_PARTS = { lights: { row: 10, columns: [4, 6, 8] }, divider: 12, lines: [{ row: 15, right: 23 }, { row: 18, right: 19 }, { row: 21, right: 24 }, { row: 24, right: 17 }, { row: 27, right: 21 }], indent: 4 };
const isWindow = roundedBox(WINDOW, 2);

/** The window a request is answered in, its lines `fetched` of the way filled from the top as the content comes in. */
export function paintWindow(states: Uint8Array, fetched: number) {
	states.fill(DOT_ABSENT);
	return paintShape(PERSONA_STORY_GRID, states, isWindow, (column, row) => {
		if (row === WINDOW_PARTS.lights.row) return WINDOW_PARTS.lights.columns.includes(column) ? DOT_FILLED : DOT_ABSENT;
		if (row === WINDOW_PARTS.divider) return column > WINDOW.left && column < WINDOW.right ? DOT_HOLLOW : DOT_ABSENT;
		const line = WINDOW_PARTS.lines.findIndex((candidate) => candidate.row === row);
		if (line < 0 || column < WINDOW_PARTS.indent || column > WINDOW_PARTS.lines[line].right) return DOT_ABSENT;
		const along = (column - WINDOW_PARTS.indent) / (WINDOW_PARTS.lines[line].right - WINDOW_PARTS.indent);
		return (line + along) / WINDOW_PARTS.lines.length < fetched ? DOT_FILLED : DOT_HOLLOW;
	});
}

export const WINDOW_EMPTY = pictureOfStates(paintWindow(blank(), 0));
export const WINDOW_FETCHED = pictureOfStates(paintWindow(blank(), 1));

/** The words beside each picture: the line that matters, up to 13 characters, and a line of detail under it, up to 33. */
export type PersonaStoryPhase = keyof PersonaStoryCaptions;

export interface PersonaStoryCaptions {
	challenge: [value: string, detail: string];
	solution: [value: string, detail: string];
	impact: [value: string, detail: string];
}

export const personaCaption = (label: keyof PersonaStoryCaptions, [value, detail]: PersonaStoryCaptions[keyof PersonaStoryCaptions]): DotStoryText[] => storyCaption(PERSONA_STORY_GRID, CAPTION_COLUMN, label, value, detail);

/** What the API gives the team: what the picture shows before it plays, and instead of playing with reduced motion. */
export const personaResting = (name: PersonaGlyphName, captions: PersonaStoryCaptions) => ({ ...personaPictures(name).outcome, texts: personaCaption('impact', captions.impact) });

import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, paintShape, ringsWithSpeckle, solidWithSpeckle, type DotPainter, type DotShape, type GridPoint } from '@/components/ds/ui/dot-story-cells';
import { storyCaption } from '@/components/ds/ui/story-caption';

/**
 * The "Start with a question" card's pictures, in the brand dot grid: the pile of pages a research task used to
 * mean gathering by hand, the question that replaces it, and the magnifier that reads the pages for you.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const QUESTION_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = QUESTION_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(QUESTION_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

// Every picture stands in the same place, left of the words that say what it means.
const CENTRE = 16;

const SHEET = { columns: 18, rows: 22 };
// Back to front, each sheet lower and further right than the one behind it.
const PILE = [
	{ left: 2, top: 3, paper: solidWithSpeckle },
	{ left: 7, top: 8, paper: ringsWithSpeckle },
	{ left: 12, top: 13, paper: null },
];

// The top sheet is the only one that can be read: a heading and lines of copy.
const writing: DotPainter = (across, down) => {
	if (between(down, 3, 4)) return between(across, 3, 11) ? DOT_FILLED : DOT_ABSENT;
	if (down >= 7 && down <= 17 && down % 2 === 1) return between(across, 3, down % 3 === 0 ? 10 : 14) ? DOT_HOLLOW : DOT_ABSENT;
	return DOT_ABSENT;
};

// Each sheet covers the ones behind it, so its empty paper hides them rather than letting them show through.
const pile: DotPainter = (column, row) => {
	const sheet = PILE.findLast(({ left, top }) => between(column, left, left + SHEET.columns - 1) && between(row, top, top + SHEET.rows - 1));
	if (!sheet) return DOT_ABSENT;
	const across = column - sheet.left;
	const down = row - sheet.top;
	if (across === 0 || down === 0 || across === SHEET.columns - 1 || down === SHEET.rows - 1) return DOT_FILLED;
	return sheet.paper ? sheet.paper(column, row) : writing(across, down);
};

export const PAGES = pictureOf(QUESTION_STORY_GRID, pile);

const MARK = { hook: { centre: { column: CENTRE, row: 11 }, radius: 6.2, from: -1.05, to: 0.42, steps: 24 }, stem: { column: CENTRE, from: 19.5, to: 23.5 }, stroke: 2.3, dot: { centre: { column: CENTRE, row: 30.5 }, radius: 2.3 } };
const hookPoint = (step: number): GridPoint => {
	const angle = Math.PI * (MARK.hook.from + ((MARK.hook.to - MARK.hook.from) * step) / MARK.hook.steps);
	return { column: MARK.hook.centre.column + MARK.hook.radius * Math.cos(angle), row: MARK.hook.centre.row + MARK.hook.radius * Math.sin(angle) };
};
// The stroke of the mark: round the hook, back in under it, and straight down the stem.
const MARK_STROKE: GridPoint[] = [...Array.from({ length: MARK.hook.steps + 1 }, (_, step) => hookPoint(step)), { column: MARK.stem.column, row: MARK.stem.from }, { column: MARK.stem.column, row: MARK.stem.to }];
const isQuestionMark: DotShape = (column, row) =>
	Math.hypot(column - MARK.dot.centre.column, row - MARK.dot.centre.row) <= MARK.dot.radius || MARK_STROKE.some((point, index) => index > 0 && distanceToSegment(column, row, MARK_STROKE[index - 1], point) <= MARK.stroke);

export const QUESTION_MARK = pictureOfStates(paintShape(QUESTION_STORY_GRID, blank(), isQuestionMark, solidWithSpeckle));

const LENS = { centre: { column: 13, row: 15 }, radius: 11.4, rim: 2 };
const HANDLE = { from: { column: 21.5, row: 23.5 }, to: { column: 28, row: 30 }, width: 2.2 };
const READING = { every: 3, left: -7, right: 7, lines: 3, word: { columns: 4, step: 4, from: -6 } };
const isMagnifier: DotShape = (column, row) => Math.hypot(column - LENS.centre.column, row - LENS.centre.row) <= LENS.radius || distanceToSegment(column, row, HANDLE.from, HANDLE.to) <= HANDLE.width;

/** The magnifier, with the lines of the page under its glass moved `read` rows up it. */
export function paintMagnifier(states: Uint8Array, read: number) {
	states.fill(DOT_ABSENT);
	return paintShape(QUESTION_STORY_GRID, states, isMagnifier, (column, row) => {
		const fromCentre = Math.hypot(column - LENS.centre.column, row - LENS.centre.row);
		if (fromCentre > LENS.radius) return DOT_FILLED;
		if (fromCentre > LENS.radius - 1 - LENS.rim) return DOT_HOLLOW;
		const line = row + Math.floor(read);
		const across = column - LENS.centre.column;
		if (line % READING.every !== 0 || !between(across, READING.left, READING.right)) return DOT_ABSENT;
		// Every third line is short, and one word in each is solid: it reads as copy going by, not as stripes.
		const lineNumber = line / READING.every;
		const lineOfThree = ((lineNumber % READING.lines) + READING.lines) % READING.lines;
		if (lineOfThree === 0 && across > 2) return DOT_ABSENT;
		const wordFrom = READING.word.from + lineOfThree * READING.word.step;
		return between(across, wordFrom, wordFrom + READING.word.columns - 1) ? DOT_FILLED : DOT_HOLLOW;
	});
}

export const MAGNIFIER_AT_REST = pictureOfStates(paintMagnifier(blank(), 0));
/** How far the page moves under the glass before it looks the same again. */
export const READING_REPEATS_EVERY = READING.every * READING.lines;

export const CAPTIONS = {
	byHand: storyCaption(QUESTION_STORY_GRID, 34, 'by hand', '9 pages', 'to find, open and read'),
	ask: storyCaption(QUESTION_STORY_GRID, 34, 'instead', 'ask', '"What does Linear cost?"'),
	read: storyCaption(QUESTION_STORY_GRID, 34, 'then it', 'reads', 'the pages that answer it'),
};

/** The question: what the picture shows before it plays, and instead of playing with reduced motion. */
export const QUESTION_RESTING = { ...QUESTION_MARK, texts: CAPTIONS.ask };

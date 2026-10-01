import { promptField } from '@/components/ds/ui/prompt-field';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, isInDotBox, paintShape, roundedBox, solidWithSpeckle, type DotBox, type DotPainter, type DotShape } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Generative AI page's pictures, in the brand dot grid: a prompt that names a company, the spark of the model
 * working with that company's brand, and what it makes, an email, a social post and a landing page, each wearing the
 * brand's mark.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const GENERATE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = GENERATE_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(GENERATE_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const PROMPT: DotBox = { left: 4, right: 53, top: 13, bottom: 23 };
const FIELD = promptField(GENERATE_STORY_GRID, PROMPT);
export const PROMPT_FIELD = FIELD.empty;
export const PROMPT_FILLED = FIELD.filled;
export const alongPrompt = FIELD.along;
export const PROMPT_TEXT: DotStoryText = { text: 'launch email for daily.dev', x: x(PROMPT.left + 4), y: baselineOn((PROMPT.top + PROMPT.bottom) / 2, 21), size: 21, weight: 700 };

// A four-pointed spark: its edge curves in between the points, the sharper the smaller `roundness`.
const spark =
	(centre: { column: number; row: number }, radius: number, roundness = 0.62): DotShape =>
	(column, row) =>
		Math.abs(column - centre.column) ** roundness + Math.abs(row - centre.row) ** roundness <= radius ** roundness;
const SPARK = { centre: { column: 28.5, row: 16 }, radius: 14 };
const SPARKLES = [
	{ centre: { column: 45, row: 7 }, radius: 5 },
	{ centre: { column: 12, row: 26 }, radius: 4 },
];

/** The model at work: a large spark, and the small ones beside it, of which the `lit` one is solid and the other rings. */
export function paintSpark(states: Uint8Array, lit: number) {
	states.fill(DOT_ABSENT);
	SPARKLES.forEach((sparkle, index) => paintShape(GENERATE_STORY_GRID, states, spark(sparkle.centre, sparkle.radius), () => (index === lit ? DOT_FILLED : DOT_HOLLOW)));
	return paintShape(GENERATE_STORY_GRID, states, spark(SPARK.centre, SPARK.radius), solidWithSpeckle);
}

export const SPARK_PICTURE = pictureOfStates(paintSpark(blank(), 0));
export const SPARK_LABEL: DotStoryText = { text: 'with its logo, colors and voice', x: x(COLUMNS / 2), y: baselineOn(34, 14), size: 14, weight: 700, muted: true, anchor: 'middle' };

const CARD = { top: 3, bottom: 28, columns: 16, lefts: [2, 21, 40] };
const cardBox = (index: number): DotBox => ({ left: CARD.lefts[index], right: CARD.lefts[index] + CARD.columns - 1, top: CARD.top, bottom: CARD.bottom });

// A made-up mark, so no real company's logo is redrawn: a square with a disc over its corner. It is cut out of the
// solid ground it sits on, in rings.
const markAt = (left: number, top: number, size: number): DotShape => (column, row) =>
	isInDotBox({ left: left + size * 0.35, right: left + size, top, bottom: top + size * 0.65 }, column, row) || Math.hypot(column - left - size * 0.35, row - top - size * 0.65) <= size * 0.36;

// Each card is drawn from its own top-left corner: `across` and `down` count from just inside its outline.
const EMAIL: DotPainter = (across, down) => {
	if (between(down, 1, 7)) return markAt(2, 2, 4)(across, down) ? DOT_HOLLOW : DOT_FILLED;
	if ([10, 12, 14].includes(down)) return between(across, 2, down === 14 ? 8 : 11) ? DOT_HOLLOW : DOT_ABSENT;
	return between(down, 18, 20) && between(across, 2, 9) ? DOT_FILLED : DOT_ABSENT;
};
const POST: DotPainter = (across, down) => {
	if (between(down, 2, 15) && between(across, 1, 12)) return markAt(3, 5, 7)(across, down) ? DOT_HOLLOW : DOT_FILLED;
	if ([18, 20].includes(down)) return between(across, 1, down === 18 ? 11 : 7) ? DOT_HOLLOW : DOT_ABSENT;
	return down === 23 && [1, 3, 5].includes(across) ? DOT_FILLED : DOT_ABSENT;
};
const LANDING: DotPainter = (across, down) => {
	if (between(down, 1, 3)) return markAt(1, 1, 2)(across, down) ? DOT_FILLED : down === 2 && [8, 9, 11, 12].includes(across) ? DOT_HOLLOW : DOT_ABSENT;
	if (between(down, 6, 7)) return between(across, 1, 10) ? DOT_FILLED : DOT_ABSENT;
	if ([10, 12].includes(down)) return between(across, 1, down === 10 ? 12 : 8) ? DOT_HOLLOW : DOT_ABSENT;
	if (between(down, 15, 17)) return between(across, 1, 6) ? DOT_FILLED : DOT_ABSENT;
	return between(down, 20, 23) && between(across, 1, 12) ? solidWithSpeckle(across, down) : DOT_ABSENT;
};
const CONTENTS = [EMAIL, POST, LANDING];

const outputStates = blank();
CONTENTS.forEach((content, index) => {
	const box = cardBox(index);
	paintShape(GENERATE_STORY_GRID, outputStates, roundedBox(box, 2), (column, row) => content(column - box.left - 1, row - box.top - 1));
});
export const OUTPUTS = pictureOfStates(outputStates);

const OUTPUT_NAMES = ['Email', 'Social post', 'Landing page'];
export const OUTPUT_TEXTS: DotStoryText[][] = OUTPUT_NAMES.map((name, index) => [
	{ text: name, x: x(CARD.lefts[index]), y: baselineOn(CARD.bottom + 3, 15), size: 15, weight: 800 },
	{ text: 'on brand', x: x(CARD.lefts[index]), y: baselineOn(CARD.bottom + 5.5, 12), size: 12, weight: 700, muted: true },
]);

/** What the model made: what the picture shows before it plays, and instead of playing with reduced motion. */
export const GENERATE_RESTING = { ...OUTPUTS, texts: OUTPUT_TEXTS.flat() };


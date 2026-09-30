import { storyCaption } from '@/components/ds/ui/story-caption';
import { typeSpecimen } from '@/components/ds/ui/style-guide-parts';
import { DOT_ABSENT, DOT_FILLED, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, rings, roundedBox, solid, solidWithSpeckle } from '@/components/ds/ui/dot-story-cells';

/**
 * The "Colors and typography" card's pictures, in the brand dot grid: a type specimen that can be set from light to
 * bold, and the site's colors as a stack of chips from its darkest role to its lightest.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const TYPE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS } = TYPE_STORY_GRID;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(TYPE_STORY_GRID, states) });
const blank = () => new Uint8Array(COLUMNS * ROWS);

const SPECIMEN = { origin: { column: 4, row: 10 }, size: 17 };
/** The stroke of each weight the specimen is set in, lightest first, and what the site calls it. */
export const WEIGHTS = [
	{ stroke: 0.55, name: '400' },
	{ stroke: 1, name: '500' },
	{ stroke: 1.5, name: '600' },
];

/** The specimen set with strokes `stroke` dots either side of their line. */
export function paintSpecimen(states: Uint8Array, stroke: number) {
	const specimen = typeSpecimen(SPECIMEN.origin, SPECIMEN.size, stroke);
	for (let cell = 0; cell < states.length; cell++) states[cell] = specimen(cell % COLUMNS, Math.floor(cell / COLUMNS)) ? DOT_FILLED : DOT_ABSENT;
	return states;
}

export const SPECIMEN_LIGHT = pictureOfStates(paintSpecimen(blank(), WEIGHTS[0].stroke));
export const SPECIMEN_BOLD = pictureOfStates(paintSpecimen(blank(), WEIGHTS[WEIGHTS.length - 1].stroke));

const CHIP = { left: 3, right: 28, rows: 8, top: 5, every: 10, radius: 2, pull: 3 };
// Three color roles, darkest to lightest, told apart by how many of their dots are solid.
const ROLES = [
	{ hex: '#222326', role: 'text', tone: solid }, // ds-override: example output data, a third-party palette shown being extracted
	{ hex: '#5E6AD2', role: 'primary', tone: solidWithSpeckle }, // ds-override: example output data, a third-party palette shown being extracted
	{ hex: '#F4F5F8', role: 'surface', tone: rings }, // ds-override: example output data, a third-party palette shown being extracted
];
const chipBox = (index: number) => ({ left: CHIP.left, right: CHIP.right, top: CHIP.top + index * CHIP.every, bottom: CHIP.top + index * CHIP.every + CHIP.rows - 1 });

/** The color chips, the one being read (none when negative) pulled out to the right of the stack. */
export function paintChips(states: Uint8Array, reading: number) {
	states.fill(DOT_ABSENT);
	ROLES.forEach(({ tone }, index) => {
		const box = chipBox(index);
		const pulled = index === reading ? CHIP.pull : 0;
		paintShape(TYPE_STORY_GRID, states, roundedBox({ ...box, left: box.left + pulled, right: box.right + pulled }, CHIP.radius), tone);
	});
	return states;
}

export const CHIPS_AT_REST = pictureOfStates(paintChips(blank(), -1));
export const ROLE_COUNT = ROLES.length;

const caption = (label: string, value: string, detail: string) => storyCaption(TYPE_STORY_GRID, 35, label, value, detail);
export const TYPE_CAPTION = caption('font', 'Inter', 'weight 400, 16px / 1.5');
export const weightDetail = (weight: number) => `weight ${WEIGHTS[weight].name}, 16px / 1.5`;
export const COLOR_CAPTIONS = ROLES.map(({ hex, role }) => caption('color', hex, `role: ${role}`));

/** The bold specimen: what the picture shows before it plays, and instead of playing with reduced motion. */
export const TYPE_RESTING = { ...SPECIMEN_BOLD, texts: [TYPE_CAPTION[0], TYPE_CAPTION[1], { ...TYPE_CAPTION[2], text: weightDetail(WEIGHTS.length - 1) }] };

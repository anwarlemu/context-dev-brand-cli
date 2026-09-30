import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellStates, cellsOfStates, outlineCells, placeCells, ringsWithSpeckle, solidWithSpeckle, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Enrich any entity your agent sees" card's pictures, in the brand dot grid: the agent's eye reads an
 * identifier, and what it saw becomes the two things behind it, a company and a person, each with its profile.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const ENRICH_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = ENRICH_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => y(row + 0.5) + size / 3;

export interface StoryPicture {
	states: Uint8Array;
	cells: GlyphCell[];
}

const pictureOf = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(ENRICH_STORY_GRID, states) });

const EYE = { centre: { column: 28.5, row: 14.5 }, halfWidth: 16, halfHeight: 9, iris: 5.6, pupil: 2.2 };
/** How far the eye looks to either side, in columns. */
export const EYE_LOOK = 6;

const isInEye = (column: number, row: number) => {
	const across = (column - EYE.centre.column) / EYE.halfWidth;
	return Math.abs(across) <= 1 && Math.abs(row - EYE.centre.row) <= EYE.halfHeight * (1 - across * across);
};
const isOnEyelid = (column: number, row: number) => !isInEye(column - 1, row) || !isInEye(column + 1, row) || !isInEye(column, row - 1) || !isInEye(column, row + 1);

/** The eye, looking `look` columns off centre: a ringed white, a solid iris and the brand's hollow circle for a pupil. */
export function paintEye(states: Uint8Array, look: number) {
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS; column++) {
			const cell = row * COLUMNS + column;
			if (!isInEye(column, row)) states[cell] = DOT_ABSENT;
			else if (isOnEyelid(column, row)) states[cell] = DOT_FILLED;
			else {
				const fromIris = Math.hypot(column - EYE.centre.column - look, row - EYE.centre.row);
				states[cell] = fromIris <= EYE.pupil ? DOT_HOLLOW : fromIris <= EYE.iris ? solidWithSpeckle(column, row) : ringsWithSpeckle(column, row);
			}
		}
	}
	return states;
}

export const EYE_AT_REST = pictureOf(paintEye(new Uint8Array(COLUMNS * ROWS), 0));
// daily.dev and its co-founder are a customer story on this site, so the picture enriches an entity the page already names.
export const IDENTIFIER: DotStoryText = { text: '@idoshamun, daily.dev', x: x(COLUMNS / 2), y: baselineOn(30, 24), size: 24, weight: 700, anchor: 'middle' };

const CARD = { columns: 26, rows: 32, top: 3 };
const COMPANY_CARD: Region = { left: 0, top: CARD.top, columns: CARD.columns, rows: CARD.rows };
const PERSON_CARD: Region = { left: COLUMNS - CARD.columns, top: CARD.top, columns: CARD.columns, rows: CARD.rows };

// A tower with a lower wing beside it: a plain tower on a base line read as a top hat.
const BUILDING_ROWS = ['     ##### ', '     #o#o# ', '     ##### ', ' #####o#o# ', ' #o#o##### ', ' #####o#o# ', ' #o#o##### ', ' #####o#o# ', ' #o#o##### ', ' ######o## ', ' ######o## '];
const PERSON_ROWS = ['    ###    ', '   #ooo#   ', '   #ooo#   ', '   #ooo#   ', '    ###    ', '           ', '  #######  ', ' ######### ', '###########', '###########', '###########'];
const ICON_INSET = 2;
const FACT_ROWS = [18, 22, 26];
const FOOT_ROW = 29;

export interface ProfileDetail {
	cells: GlyphCell[];
	texts: DotStoryText[];
}

export interface Profile {
	region: Region;
	icon: GlyphCell[];
	frame: GlyphCell[];
	/** The profile's lines, in the order they are filled in. */
	details: ProfileDetail[];
}

interface ProfileSpec {
	region: Region;
	iconRows: string[];
	name: string;
	handle: string;
	facts: string[];
	foot: ProfileDetail;
}

function profile({ region, iconRows, name, handle, facts, foot }: ProfileSpec): Profile {
	const textLeft = x(region.left + ICON_INSET + 12);
	const heading: ProfileDetail = {
		cells: [],
		texts: [
			{ text: name, x: textLeft, y: baselineOn(region.top + 6, 18), size: 18, weight: 800 },
			{ text: handle, x: textLeft, y: baselineOn(region.top + 9, 12), size: 12, weight: 700, muted: true },
		],
	};
	const lines = facts.map((fact, index): ProfileDetail => {
		const row = region.top + FACT_ROWS[index];
		return { cells: [{ column: region.left + 3, row, filled: true }], texts: [{ text: fact, x: x(region.left + 5), y: baselineOn(row, 14), size: 14, weight: 600 }] };
	});
	return { region, icon: placeCells(glyphCellsFromRows(iconRows), { left: region.left + ICON_INSET, top: region.top + ICON_INSET }), frame: outlineCells(region), details: [heading, ...lines, foot] };
}

// Three brand colours, as three densities of the brand's two circles.
const SWATCH = { columns: 3, rows: 2, gap: 1 };
const swatches: GlyphCell[] = [0, 1, 2].flatMap((shade) =>
	Array.from({ length: SWATCH.columns * SWATCH.rows }, (_, index) => {
		const column = index % SWATCH.columns;
		const row = Math.floor(index / SWATCH.columns);
		return { column: COMPANY_CARD.left + 3 + shade * (SWATCH.columns + SWATCH.gap) + column, row: COMPANY_CARD.top + FOOT_ROW + row, filled: [true, (column + row) % 2 === 0, false][shade] };
	})
);

export const PROFILES: Profile[] = [
	profile({ region: COMPANY_CARD, iconRows: BUILDING_ROWS, name: 'daily.dev', handle: 'Company', facts: ['Developer network', 'Programming news', 'Millions of devs'], foot: { cells: swatches, texts: [] } }),
	profile({
		region: PERSON_CARD,
		iconRows: PERSON_ROWS,
		name: 'Ido Shamun',
		handle: '@idoshamun',
		facts: ['Co-founder', 'at daily.dev'],
		foot: { cells: [], texts: [{ text: 'x.com/idoshamun', x: x(PERSON_CARD.left + 3), y: baselineOn(PERSON_CARD.top + FOOT_ROW + 0.5, 13), size: 13, weight: 700, muted: true }] },
	}),
];

/** The company and the person on their own: dense enough for the eye to melt into. */
export const ICONS = pictureOf(
	cellStates(
		ENRICH_STORY_GRID,
		PROFILES.flatMap((card) => card.icon)
	)
);

const LINK_ROW = CARD.top + Math.floor(CARD.rows / 2);
/** The rule that joins the person to the company, in the order a pulse travels it. */
export const LINK: GlyphCell[] = Array.from({ length: PERSON_CARD.left - CARD.columns }, (_, step) => ({ column: PERSON_CARD.left - 1 - step, row: LINK_ROW, filled: false }));

/** Both profiles, linked: what the picture shows before it plays, and instead of playing with reduced motion. */
export const ENRICH_RESTING = {
	...pictureOf(cellStates(ENRICH_STORY_GRID, [...PROFILES.flatMap((card) => [...card.frame, ...card.icon, ...card.details.flatMap((detail) => detail.cells)]), ...LINK])),
	texts: PROFILES.flatMap((card) => card.details.flatMap((detail) => detail.texts)),
};

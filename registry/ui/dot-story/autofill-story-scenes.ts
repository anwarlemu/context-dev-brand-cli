import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { cellStates, fillCells, outlineCells, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Autofill onboarding forms" card's picture, in the brand dot grid: a domain goes into the field at the top, and
 * pressing Auto-fill fills the signup form below it, one field at a time.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const AUTOFILL_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = AUTOFILL_STORY_GRID;
const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => y(row + 0.5) + size / 3;

const LABEL_SIZE = 14;
const VALUE_SIZE = 15;

const DOMAIN_FIELD: Region = { left: 0, top: 0, columns: COLUMNS, rows: 7 };
const DOMAIN_ICON = { column: 2, row: 3 };
export const BUTTON: Region = { left: 43, top: 1, columns: 13, rows: 5 };
export const BUTTON_INSIDE: Region = { left: BUTTON.left + 1, top: BUTTON.top + 1, columns: BUTTON.columns - 2, rows: BUTTON.rows - 2 };
const FORM: Region = { left: 0, top: 8, columns: COLUMNS, rows: 30 };
const HEADER_ROW = 10;

const INPUT_LEFT = 16;
const INPUT_COLUMNS = 33;
const INPUT_ROWS = 4;
const FIRST_INPUT_TOP = 12;
const INPUT_SPACING = 5;
const TICK_LEFT = 52;
const TICK_ROWS = ['   #', '# # ', ' #  '];
const MARK_LEFT = INPUT_LEFT + 2;
const VALUE_AFTER_MARK = INPUT_LEFT + 5;

/** The parts that never change: the domain field with its Auto-fill button, and the form's panel. */
export const FRAME_CELLS: GlyphCell[] = [...outlineCells(DOMAIN_FIELD), { ...DOMAIN_ICON, filled: false }, ...outlineCells(BUTTON), ...outlineCells(FORM)];

export interface FormField {
	/** The input's border, left to right, so it can fill in from where the typing starts. */
	border: GlyphCell[];
	tick: GlyphCell[];
	/** A swatch or logo shown before the value, for the fields that have one. */
	mark: GlyphCell[];
	label: DotStoryText;
	value: DotStoryText;
}

function formField(label: string, value: string, markRows: string[] | null, index: number): FormField {
	const top = FIRST_INPUT_TOP + index * INPUT_SPACING;
	const textRow = top + 1.5;
	const border = outlineCells({ left: INPUT_LEFT, top, columns: INPUT_COLUMNS, rows: INPUT_ROWS }).sort((a, b) => a.column - b.column);
	const tick = glyphCellsFromRows(TICK_ROWS).map((cell) => ({ ...cell, column: cell.column + TICK_LEFT, row: cell.row + top + 1 }));
	const mark = markRows ? glyphCellsFromRows(markRows).map((cell) => ({ ...cell, column: cell.column + MARK_LEFT, row: cell.row + top + 1 })) : [];
	return {
		border,
		tick,
		mark,
		label: { text: label, x: x(2), y: baselineOn(textRow, LABEL_SIZE), size: LABEL_SIZE, weight: 700, muted: true },
		value: { text: value, x: x(markRows ? VALUE_AFTER_MARK : MARK_LEFT), y: baselineOn(textRow, VALUE_SIZE), size: VALUE_SIZE, weight: 700 },
	};
}

export const FORM_FIELDS: FormField[] = [
	formField('Company', 'Linear', null, 0),
	formField('Industry', 'Developer Tools', null, 1),
	// ds-override: example output data, the Linear brand color the story shows being extracted
	formField('Brand color', '#5E6AD2', ['##', '##'], 2),
	formField('Description', 'Issue tracking for modern teams', null, 3),
	formField('Logo', 'linear-logo.svg', ['#o', 'o#'], 4),
];

export const DOMAIN_TEXT: DotStoryText = { text: 'linear.app', x: x(4.5), y: baselineOn(DOMAIN_ICON.row, 20), size: 20, weight: 700 };
export const BUTTON_LABEL: DotStoryText = { text: 'Auto-fill', x: x(BUTTON.left + BUTTON.columns / 2), y: baselineOn(BUTTON.top + 2, LABEL_SIZE), size: LABEL_SIZE, weight: 800, anchor: 'middle' };
export const FORM_TITLE: DotStoryText = { text: 'Signup form', x: x(2), y: baselineOn(HEADER_ROW, LABEL_SIZE), size: LABEL_SIZE, weight: 700, muted: true };
export const FILLED_COUNT: DotStoryText = { text: `${FORM_FIELDS.length} fields filled`, x: x(COLUMNS - 2), y: baselineOn(HEADER_ROW, LABEL_SIZE), size: LABEL_SIZE, weight: 800, anchor: 'end' };
export const filledCountText = (count: number): DotStoryText => ({ ...FILLED_COUNT, text: `${count} fields filled`, muted: count === 0 });

/** The form's cells before anything is filled: the inputs and their ticks, all rings. */
export const EMPTY_FIELD_CELLS: GlyphCell[] = FORM_FIELDS.flatMap((field) => [...field.border, ...field.tick].map((cell) => ({ ...cell, filled: false })));
export const BUTTON_PRESSED_CELLS = fillCells(BUTTON_INSIDE, true);

const FILLED_FIELD_CELLS = FORM_FIELDS.flatMap((field) => [...field.border, ...field.tick, ...field.mark]);

/** Everything filled: what the picture shows before it plays, and instead of playing with reduced motion. */
export const AUTOFILL_RESTING = {
	cells: [...FRAME_CELLS, ...FILLED_FIELD_CELLS],
	texts: [DOMAIN_TEXT, BUTTON_LABEL, FORM_TITLE, FILLED_COUNT, ...FORM_FIELDS.flatMap((field) => [field.label, field.value])],
};
export const AUTOFILL_RESTING_STATES = cellStates(AUTOFILL_STORY_GRID, AUTOFILL_RESTING.cells);

import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { LINE_WIDTH, distanceToSegment, polygon, rectangle, ringsWithSpeckle, solidWithSpeckle, stack, type DotPainter } from '@/components/ds/ui/dot-story-cells';

/**
 * The pictures the "Do it yourself" card tells its three steps with, each drawn in the brand dot grid: the sign-up
 * email arrives and is opened, the dashboard hands over an API key, and the SDK arrives as a package and is unpacked.
 */

export const SETUP_STORY_GRID: DotGrid = { columns: 30, rows: 28, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 14 };

export interface SetupScene {
	states: Uint8Array;
	cells: GlyphCell[];
}

const { columns: COLUMNS, rows: ROWS } = SETUP_STORY_GRID;
const MIDDLE = (COLUMNS - 1) / 2;

const ENVELOPE = { left: 1, right: COLUMNS - 2, top: 8, bottom: ROWS - 2 };
const FOLD_DEPTH = 10;
const FLAP_RISE = 7;
const FOLD_TIP = { column: MIDDLE, row: ENVELOPE.top + FOLD_DEPTH };
const FLAP_APEX = { column: MIDDLE, row: ENVELOPE.top - FLAP_RISE };
const ENVELOPE_TOP_LEFT = { column: ENVELOPE.left, row: ENVELOPE.top };
const ENVELOPE_TOP_RIGHT = { column: ENVELOPE.right, row: ENVELOPE.top };
const LETTER = { left: ENVELOPE.left + 4, right: ENVELOPE.right - 4, top: ENVELOPE.top - 4, bottom: ENVELOPE.top + 9 };
const LETTER_LINES = [
	{ row: LETTER.top + 2, right: LETTER.right - 2 },
	{ row: LETTER.top + 4, right: LETTER.right - 5 },
	{ row: LETTER.top + 6, right: LETTER.right - 3 },
];

const nearFold = (column: number, row: number) => Math.min(distanceToSegment(column, row, ENVELOPE_TOP_LEFT, FOLD_TIP), distanceToSegment(column, row, ENVELOPE_TOP_RIGHT, FOLD_TIP)) < LINE_WIDTH;
const aboveFold = (column: number, row: number) => row < ENVELOPE.top + ((column <= MIDDLE ? column - ENVELOPE.left : ENVELOPE.right - column) / (MIDDLE - ENVELOPE.left)) * FOLD_DEPTH;
const inEnvelope = (column: number, row: number) => column >= ENVELOPE.left && column <= ENVELOPE.right && row >= ENVELOPE.top && row <= ENVELOPE.bottom;
const onEnvelopeOutline = (column: number, row: number) => inEnvelope(column, row) && (row === ENVELOPE.top || row === ENVELOPE.bottom || column === ENVELOPE.left || column === ENVELOPE.right);

const closedEnvelope: DotPainter = (column, row) => {
	if (!inEnvelope(column, row)) return DOT_ABSENT;
	if (onEnvelopeOutline(column, row)) return DOT_FILLED;
	if (nearFold(column, row)) return DOT_ABSENT;
	return aboveFold(column, row) ? ringsWithSpeckle(column, row) : solidWithSpeckle(column, row);
};

const envelopePocket: DotPainter = (column, row) => {
	if (!inEnvelope(column, row) || aboveFold(column, row)) return DOT_ABSENT;
	if (onEnvelopeOutline(column, row) || nearFold(column, row)) return DOT_FILLED;
	return solidWithSpeckle(column, row);
};

const letter: DotPainter = (column, row) => {
	if (column < LETTER.left || column > LETTER.right || row < LETTER.top || row > LETTER.bottom) return DOT_ABSENT;
	if (column === LETTER.left || column === LETTER.right || row === LETTER.top) return DOT_FILLED;
	const line = LETTER_LINES.find((candidate) => candidate.row === row);
	return line && column >= LETTER.left + 2 && column <= line.right ? DOT_FILLED : DOT_HOLLOW;
};

const liftedFlap: DotPainter = (column, row) => {
	const rise = ENVELOPE.top - row;
	const halfWidth = (MIDDLE - ENVELOPE.left) * (1 - rise / FLAP_RISE);
	if (rise <= 0 || Math.abs(column - MIDDLE) > halfWidth + LINE_WIDTH) return DOT_ABSENT;
	const onEdge = Math.min(distanceToSegment(column, row, ENVELOPE_TOP_LEFT, FLAP_APEX), distanceToSegment(column, row, ENVELOPE_TOP_RIGHT, FLAP_APEX)) < LINE_WIDTH;
	return onEdge ? DOT_FILLED : ringsWithSpeckle(column, row);
};

const envelopeBack: DotPainter = (column, row) => {
	if (!inEnvelope(column, row)) return DOT_ABSENT;
	return onEnvelopeOutline(column, row) ? DOT_FILLED : ringsWithSpeckle(column, row);
};

const openEnvelope = stack(envelopePocket, letter, liftedFlap, envelopeBack);

const TERMINAL = { left: 1, right: COLUMNS - 2, top: 3, bottom: 25 };
const TITLE_BAR_BOTTOM = TERMINAL.top + 2;
const WINDOW_BUTTONS = { row: TERMINAL.top + 1, columns: [3, 5, 7] };

export const TERMINAL_BOUNDS = TERMINAL;
/** The clear space inside the terminal, in cells, where the key is typed. */
export const TERMINAL_SCREEN = { left: TERMINAL.left + 2, right: TERMINAL.right - 2, top: TITLE_BAR_BOTTOM + 2, bottom: TERMINAL.bottom - 2 };

function terminal(screen: ReturnType<DotPainter>): DotPainter {
	return (column, row) => {
		if (column < TERMINAL.left || column > TERMINAL.right || row < TERMINAL.top || row > TERMINAL.bottom) return DOT_ABSENT;
		if (row <= TITLE_BAR_BOTTOM) return row === WINDOW_BUTTONS.row && WINDOW_BUTTONS.columns.includes(column) ? DOT_HOLLOW : DOT_FILLED;
		return column === TERMINAL.left || column === TERMINAL.right || row === TERMINAL.bottom ? DOT_FILLED : screen;
	};
}

const BOX = { left: 3, right: COLUMNS - 4, top: 12, bottom: ROWS - 2 };
const LID = { left: BOX.left - 1, right: BOX.right + 1, top: 7, bottom: BOX.top - 1 };
const TAPE_COLUMNS = [Math.floor(MIDDLE), Math.ceil(MIDDLE)];
const TAPE_BOTTOM = BOX.top + 5;
const OPENING_DEPTH = 4;
const OPENING_INSET = 3;
const FLAP_REACH = 3;
const CONTENTS = { column: MIDDLE, row: 4, reach: 3 };

const onTape = (column: number) => TAPE_COLUMNS.includes(column);

const boxBody: DotPainter = (column, row) => {
	const body = rectangle(BOX, solidWithSpeckle)(column, row);
	if (body === DOT_ABSENT) return DOT_ABSENT;
	if (onTape(column) && row > BOX.top && row <= TAPE_BOTTOM) return DOT_HOLLOW;
	return body;
};

const closedLid: DotPainter = (column, row) => {
	const lid = rectangle(LID, ringsWithSpeckle)(column, row);
	return lid !== DOT_ABSENT && onTape(column) ? DOT_FILLED : lid;
};

// The lid's shadow: the body's top edge drops out under the closed lid, the way the envelope's fold does.
const closedBox: DotPainter = (column, row) => (row === BOX.top ? DOT_ABSENT : stack(closedLid, boxBody)(column, row));

const OPENING_BACK = BOX.top - OPENING_DEPTH;
const opening = polygon(
	[
		{ column: BOX.left, row: BOX.top },
		{ column: BOX.right, row: BOX.top },
		{ column: BOX.right - OPENING_INSET, row: OPENING_BACK },
		{ column: BOX.left + OPENING_INSET, row: OPENING_BACK },
	],
	ringsWithSpeckle
);

function sideFlap(hinge: number, outwards: 1 | -1) {
	return polygon(
		[
			{ column: hinge, row: BOX.top },
			{ column: hinge - outwards * OPENING_INSET, row: OPENING_BACK },
			{ column: hinge - outwards * OPENING_INSET + outwards * FLAP_REACH, row: OPENING_BACK - FLAP_REACH },
			{ column: hinge + outwards * FLAP_REACH, row: BOX.top - FLAP_REACH },
		],
		ringsWithSpeckle
	);
}

// What was packed: the brand pattern's solid cluster, lifting out of the box.
const contents: DotPainter = (column, row) => (Math.abs(column - CONTENTS.column) + Math.abs(row - CONTENTS.row) <= CONTENTS.reach ? DOT_FILLED : DOT_ABSENT);

const openBox = stack(contents, boxBody, sideFlap(BOX.left, -1), sideFlap(BOX.right, 1), opening);

function paint(painter: DotPainter): SetupScene {
	const states = new Uint8Array(COLUMNS * ROWS);
	const cells: GlyphCell[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS; column++) {
			const state = painter(column, row);
			states[row * COLUMNS + column] = state;
			if (state !== DOT_ABSENT) cells.push({ column, row, filled: state === DOT_FILLED });
		}
	}
	return { states, cells };
}

export const ENVELOPE_FLAP_ROW = ENVELOPE.top;
export const TERMINAL_TITLE_ROW = TITLE_BAR_BOTTOM;
export const BOX_RIM_ROW = BOX.top;

export const CLOSED_ENVELOPE = paint(closedEnvelope);
export const OPEN_ENVELOPE = paint(openEnvelope);
// A window that is only an outline has too little in it to melt into or out of, so the terminal arrives and leaves
// with its screen full of rings and wipes it clear in between.
export const TERMINAL_BLANK = paint(terminal(DOT_HOLLOW));
export const TERMINAL_WINDOW = paint(terminal(DOT_ABSENT));
export const CLOSED_BOX = paint(closedBox);
export const OPEN_BOX = paint(openBox);

import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The "Scrape anything" card's picture, in the brand dot grid: a URL goes in at the top, its Markdown comes out on the
 * left, and on the right the page is captured as a screenshot and its images are lifted out.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const SCRAPE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

export interface Region {
	left: number;
	top: number;
	columns: number;
	rows: number;
}

const { columns: COLUMNS, pitch: PITCH } = SCRAPE_STORY_GRID;

const INPUT: Region = { left: 0, top: 0, columns: COLUMNS, rows: 5 };
const OUTPUT: Region = { left: 0, top: 7, columns: 34, rows: 31 };
export const SCREENSHOT: Region = { left: 36, top: 7, columns: 22, rows: 14 };
const GALLERY_TOP = 23;
export const IMAGE_TILES: Region[] = [
	{ left: 36, top: GALLERY_TOP, columns: 10, rows: 15 },
	{ left: 48, top: GALLERY_TOP, columns: 10, rows: 7 },
	{ left: 48, top: GALLERY_TOP + 8, columns: 10, rows: 7 },
];

const INPUT_ICON = { column: 2, row: 2 };
const TAB_RULE_ROW = 5;
const ACTIVE_TAB = { from: 2, to: 9 };

function outline({ columns, rows }: Region): GlyphCell[] {
	const cells: GlyphCell[] = [];
	for (let row = 0; row < rows; row++) {
		for (let column = 0; column < columns; column++) {
			if (row === 0 || row === rows - 1 || column === 0 || column === columns - 1) cells.push({ column, row, filled: true });
		}
	}
	return cells;
}

const placed = (cells: GlyphCell[], { left, top }: Region): GlyphCell[] => cells.map((cell) => ({ ...cell, column: cell.column + left, row: cell.row + top }));

/** Art is drawn inside a region's outline, so its first row and column sit one cell in. */
const inside = (rows: string[], region: Region) => placed(glyphCellsFromRows(rows), { ...region, left: region.left + 1, top: region.top + 1 });

const tabRule: GlyphCell[] = Array.from({ length: OUTPUT.columns - 2 }, (_, index) => ({ column: index + 1, row: TAB_RULE_ROW, filled: index + 1 >= ACTIVE_TAB.from && index + 1 <= ACTIVE_TAB.to }));

/** The parts that never change: the URL field and the output panel, with its tab rule. */
export const FRAME_CELLS: GlyphCell[] = [...placed(outline(INPUT), INPUT), { ...INPUT_ICON, filled: false }, ...placed(outline(OUTPUT), OUTPUT), ...placed(tabRule, OUTPUT)];

const PAGE_ROWS = ['##    oo oo oo    ##', '', '    ############    ', '      ########      ', '', '     oooooooooo     ', '', '       ######       ', '', 'oooooooooooooooooooo', 'oo#ooooo#oooo#oooo#o', 'oooooooooooooooooooo'];
const PHOTO_ROWS = ['oooooooo', 'ooooo##o', 'ooooo##o', 'oooooooo', 'oooooooo', 'oooooooo', 'oo#ooooo', 'o###oo#o', '#####o##', '########', '########', '########', '########'];
const LOGO_ROWS = ['oooo###o', 'o#oo###o', '###o###o', 'o#oooooo', 'oooooooo'];
const TEXTURE_ROWS = ['########', '#o######', 'o#o#o###', 'oooo#o#o', 'oooooooo'];

export const SCREENSHOT_BORDER = placed(outline(SCREENSHOT), SCREENSHOT);
export const PAGE_CELLS = inside(PAGE_ROWS, SCREENSHOT);
export const IMAGE_CELLS = [PHOTO_ROWS, LOGO_ROWS, TEXTURE_ROWS].map((rows, index) => [...placed(outline(IMAGE_TILES[index]), IMAGE_TILES[index]), ...inside(rows, IMAGE_TILES[index])]);

export const cellIndex = ({ column, row }: Pick<GlyphCell, 'column' | 'row'>) => row * COLUMNS + column;
export const cellState = (cell: GlyphCell) => (cell.filled ? DOT_FILLED : DOT_HOLLOW);

const x = (column: number) => column * PITCH;
const y = (row: number) => row * PITCH;
const CONTENT_SIZE = 17;

export const URL_TEXT: DotStoryText = { text: 'context.dev', x: x(4.5), y: y(3.2), size: 20, weight: 700 };
export const CONTENT_LINES: DotStoryText[] = [
	{ text: '# Web data API for AI agents', x: x(2), y: y(16), size: CONTENT_SIZE, weight: 800 },
	{ text: 'Web scraping, data, and', x: x(2), y: y(21), size: CONTENT_SIZE, weight: 600 },
	{ text: 'search infrastructure', x: x(2), y: y(23.8), size: CONTENT_SIZE, weight: 600 },
	{ text: 'for AI products.', x: x(2), y: y(26.6), size: CONTENT_SIZE, weight: 600 },
];
export const LABELS: DotStoryText[] = [
	{ text: 'Webpages & PDFs', x: x(COLUMNS - 2), y: y(3.05), size: 15, weight: 700, muted: true, anchor: 'end' },
	{ text: 'Markdown', x: x(2), y: y(OUTPUT.top + 3.6), size: 15, weight: 800 },
	{ text: 'HTML', x: x(11.5), y: y(OUTPUT.top + 3.6), size: 15, weight: 700, muted: true },
	{ text: 'JSON', x: x(17), y: y(OUTPUT.top + 3.6), size: 15, weight: 700, muted: true },
];

/** Everything delivered: what the picture shows before it plays, and instead of playing with reduced motion. */
export const SCRAPE_RESTING = {
	cells: [...FRAME_CELLS, ...SCREENSHOT_BORDER, ...PAGE_CELLS, ...IMAGE_CELLS.flat()],
	texts: [URL_TEXT, ...LABELS, ...CONTENT_LINES],
};

import { storyCaption } from '@/components/ds/ui/story-caption';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf, type StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { polygon, solidWithSpeckle, stack, type DotPainter } from '@/components/ds/ui/dot-story-cells';

/**
 * The Parse File card's pictures, in the brand dot grid: an uploaded PDF, its scanned page read by a bar of OCR, and
 * the Markdown document it is converted into.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const PARSE_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS } = PARSE_STORY_GRID;
const between = (value: number, from: number, to: number) => value >= from && value <= to;

const SHEET = { left: 5, right: 27, top: 3, bottom: 34, fold: 4 };
const FOLD = { column: SHEET.right - SHEET.fold, row: SHEET.top + SHEET.fold };

// A sheet of paper with its top corner folded over.
const sheet = (content: DotPainter): DotPainter =>
	stack(
		(column, row) => ((column === FOLD.column && between(row, SHEET.top, FOLD.row)) || (row === FOLD.row && between(column, FOLD.column, SHEET.right)) ? DOT_FILLED : DOT_ABSENT),
		polygon(
			[
				{ column: SHEET.left, row: SHEET.top },
				{ column: FOLD.column, row: SHEET.top },
				{ column: SHEET.right, row: FOLD.row },
				{ column: SHEET.right, row: SHEET.bottom },
				{ column: SHEET.left, row: SHEET.bottom },
			],
			content
		)
	);

const SCAN = { left: 8, right: 24, top: 9, bottom: 23 };
const BADGE = { left: 8, top: 26, columns: 13, rows: 7 };
// The file type, cut out of its solid badge in rings: type set over the dots would only show between them.
const BADGE_LETTERS = ['oo  oo  ooo', 'o o o o o  ', 'oo  o o oo ', 'o   o o o  ', 'o   oo  o  '];

// A scanned page: a block of uneven ink where its text is, and the badge that says what kind of file it is.
const scannedPage: DotPainter = (column, row) => {
	if (between(column, SCAN.left, SCAN.right) && between(row, SCAN.top, SCAN.bottom)) return (row - SCAN.top) % 3 === 2 ? DOT_ABSENT : solidWithSpeckle(column, row);
	if (!between(column, BADGE.left, BADGE.left + BADGE.columns - 1) || !between(row, BADGE.top, BADGE.top + BADGE.rows - 1)) return DOT_ABSENT;
	return BADGE_LETTERS[row - BADGE.top - 1]?.[column - BADGE.left - 1] === 'o' ? DOT_HOLLOW : DOT_FILLED;
};

export const PDF: StoryPicture = pictureOf(PARSE_STORY_GRID, sheet(scannedPage));

/** The PDF with a bar of OCR `read` of the way down its scanned page (none at 0 or 1). */
export function paintOcr(states: Uint8Array, read: number) {
	if (read <= 0 || read >= 1) return states;
	const bar = SCAN.top - 1 + Math.round(read * (SCAN.bottom + 2 - SCAN.top));
	for (let column = SHEET.left + 1; column < SHEET.right; column++) states[bar * COLUMNS + column] = DOT_FILLED;
	return states;
}

// Markdown, drawn one string per row inside the sheet: `#` a solid dot, `o` a ring.
const MARKDOWN_ROWS = ['', '', '', '', '', '   # #', '  #####', '   # #', '  #####', '   # #', '', '', '  ############', '', '  oooooooooooooooo', '  oooooooooooo', '', '  ## ooooooo', '', '  # oooooooooooo', '  # ooooooooo', '  # ooooooooooo', '', '  ooooooooooooooo', '  ooooooooo'];
const markdown: DotPainter = (column, row) => {
	const mark = MARKDOWN_ROWS[row - SHEET.top - 1]?.[column - SHEET.left - 1];
	return mark === '#' ? DOT_FILLED : mark === 'o' ? DOT_HOLLOW : DOT_ABSENT;
};

export const MARKDOWN_FILE: StoryPicture = pictureOf(PARSE_STORY_GRID, sheet(markdown));

const caption = (label: string, value: string, detail: string) => storyCaption(PARSE_STORY_GRID, 34, label, value, detail);
export const CAPTIONS = {
	upload: caption('upload', 'PDF', 'scanned pages, read by OCR'),
	parsed: caption('parsed to', 'Markdown', 'ready for your index'),
};

/** The Markdown file: what the picture shows before it plays, and instead of playing with reduced motion. */
export const PARSE_RESTING = { ...MARKDOWN_FILE, texts: CAPTIONS.parsed };

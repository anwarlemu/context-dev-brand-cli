import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { pictureOf } from '@/components/ds/ui/dot-story-beats';
import { rectangle, rings, solidWithSpeckle, stack, within, type DotPainter } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Scrape card's pictures, in the brand dot grid: a live webpage in a browser, and the window it is scraped into,
 * one output format per tab (Markdown, HTML, JSON, images, a screenshot and highlights).
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const EXTRACT_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const PITCH = EXTRACT_STORY_GRID.pitch;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;

interface Box {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

const inBox = (box: Box, column: number, row: number) => column >= box.left && column <= box.right && row >= box.top && row <= box.bottom;

/**
 * A marketing page's layout inside `box`, scaled to it: nav, a hero with a heading, copy and two buttons beside a
 * picture, and a row of three cards. Used for the live page and, smaller, for its screenshot.
 */
function webpageLayout(box: Box): DotPainter {
	const width = box.right - box.left;
	const height = box.bottom - box.top;
	const at = (share: number) => box.left + Math.round(share * width);
	const down = (share: number) => box.top + Math.round(share * height);
	const nav = { row: down(0.08), logoTo: at(0.1), links: [at(0.62), at(0.74), at(0.86)], linkWidth: Math.max(1, Math.round(width * 0.07)) };
	const heading = { top: down(0.2), bottom: down(0.2) + Math.max(1, Math.round(height * 0.05)), to: at(0.52) };
	const copy = [
		{ row: down(0.36), to: at(0.56) },
		{ row: down(0.44), to: at(0.46) },
	];
	const buttons = { top: down(0.54), bottom: down(0.54) + Math.max(1, Math.round(height * 0.04)), primaryTo: at(0.18), secondaryFrom: at(0.22), secondaryTo: at(0.38) };
	const picture = { left: at(0.64), right: at(0.96), top: down(0.2), bottom: down(0.6) };
	const cardsTop = down(0.7);
	const cards = [0, 1, 2].map((index) => ({ left: at(0.04 + index * 0.32), right: at(0.3 + index * 0.32) }));
	return (column, row) => {
		if (row === nav.row) return column <= nav.logoTo || nav.links.some((from) => column >= from && column < from + nav.linkWidth) ? (column <= nav.logoTo ? DOT_FILLED : DOT_HOLLOW) : DOT_ABSENT;
		if (row >= heading.top && row <= heading.bottom && column <= heading.to) return DOT_FILLED;
		const line = copy.find((candidate) => candidate.row === row);
		if (line && column <= line.to) return DOT_HOLLOW;
		if (row >= buttons.top && row <= buttons.bottom) {
			if (column <= buttons.primaryTo) return DOT_FILLED;
			if (column >= buttons.secondaryFrom && column <= buttons.secondaryTo) return row === buttons.top || row === buttons.bottom || column === buttons.secondaryFrom || column === buttons.secondaryTo ? DOT_FILLED : DOT_ABSENT;
		}
		if (inBox(picture, column, row)) return solidWithSpeckle(column, row);
		const card = cards.find((candidate) => column >= candidate.left && column <= candidate.right);
		if (card && row >= cardsTop && row < box.bottom) {
			const cardHeight = box.bottom - cardsTop;
			if (row < cardsTop + Math.round(cardHeight * 0.55)) return solidWithSpeckle(column, row);
			return (row - cardsTop) % 2 === 0 && column < card.right - 1 ? DOT_HOLLOW : DOT_ABSENT;
		}
		return DOT_ABSENT;
	};
}

export const PAGE = { left: 4, right: 53, top: 1, bottom: 36 };
const ADDRESS_BAR = { top: PAGE.top, bottom: PAGE.top + 3, from: PAGE.left + 10, to: PAGE.right - 2 };
const BROWSER_BUTTONS = { row: PAGE.top + 2, columns: [PAGE.left + 2, PAGE.left + 4, PAGE.left + 6] };
const PAGE_BODY: Box = { left: PAGE.left + 3, right: PAGE.right - 3, top: ADDRESS_BAR.bottom + 2, bottom: PAGE.bottom - 2 };

const browser = rectangle(PAGE, (column, row) => {
	if (row <= ADDRESS_BAR.bottom) {
		if (row === BROWSER_BUTTONS.row && BROWSER_BUTTONS.columns.includes(column)) return DOT_HOLLOW;
		// The address field is left empty, and the page's URL is written in it.
		if (row > ADDRESS_BAR.top && row < ADDRESS_BAR.bottom && column >= ADDRESS_BAR.from && column <= ADDRESS_BAR.to) return DOT_ABSENT;
		return DOT_FILLED;
	}
	return inBox(PAGE_BODY, column, row) ? webpageLayout(PAGE_BODY)(column, row) : DOT_ABSENT;
});

export const PUBLISHED_PAGE = pictureOf(EXTRACT_STORY_GRID, browser);
export const PAGE_LABELS: DotStoryText[] = [{ text: 'https://atlas.example/pricing', x: x(ADDRESS_BAR.from + 1), y: baselineOn(ADDRESS_BAR.top + 1.5, 13), size: 13, weight: 700, muted: true }];

const WINDOW = { left: 3, right: 54, top: 2, bottom: 35 };
const TITLE_BAR_BOTTOM = WINDOW.top + 3;
const BUTTONS = { row: WINDOW.top + 2, columns: [6, 8, 10] };
const TAB_RULE_ROW = TITLE_BAR_BOTTOM + 5;
export const WINDOW_TOP_ROW = TITLE_BAR_BOTTOM;
export const WINDOW_ROWS = WINDOW.bottom - TITLE_BAR_BOTTOM;

const TAB_SIZE = 13;
// Doto is monospaced, each letter three fifths of its size wide.
const tabWidthInColumns = (text: string) => (text.length * 0.6 * TAB_SIZE) / PITCH;
export const FORMATS = ['Markdown', 'HTML', 'JSON', 'Images', 'Screenshot', 'Highlights'] as const;
export type Format = (typeof FORMATS)[number];
const TAB_GAP_COLUMNS = 2;
const TAB_POSITIONS = FORMATS.reduce<{ format: Format; from: number; to: number }[]>((positions, format) => {
	const from = positions.length === 0 ? WINDOW.left + 3 : positions[positions.length - 1].to + TAB_GAP_COLUMNS;
	return [...positions, { format, from, to: from + tabWidthInColumns(format) }];
}, []);

const tabRule = (active: Format): DotPainter => {
	const tab = TAB_POSITIONS.find((position) => position.format === active)!;
	return (column, row) => {
		if (row !== TAB_RULE_ROW || column < WINDOW.left + 2 || column > WINDOW.right - 2) return DOT_ABSENT;
		return column >= Math.floor(tab.from) && column <= Math.ceil(tab.to) - 1 ? DOT_FILLED : DOT_HOLLOW;
	};
};

// A window that is only an outline has too little in it to melt into or out of, so it arrives and leaves full of
// rings and wipes clear in between.
function outputWindow(body: DotPainter): DotPainter {
	return rectangle(WINDOW, (column, row) => {
		if (row <= TITLE_BAR_BOTTOM) return row === BUTTONS.row && BUTTONS.columns.includes(column) ? DOT_HOLLOW : DOT_FILLED;
		return body(column, row);
	});
}

const CONTENT: Box = { left: WINDOW.left + 3, right: WINDOW.right - 3, top: TAB_RULE_ROW + 3, bottom: WINDOW.bottom - 3 };

// Three image thumbnails pulled off the page, each with its file name written under it.
const THUMBNAILS = [0, 1, 2].map((index) => {
	const width = (CONTENT.right - CONTENT.left - 4) / 3;
	const left = Math.round(CONTENT.left + index * (width + 2));
	return { left, right: Math.round(left + width - 1), top: CONTENT.top, bottom: CONTENT.top + 11 };
});
const thumbnails: DotPainter = (column, row) => {
	const thumbnail = THUMBNAILS.find((box) => inBox(box, column, row));
	if (!thumbnail) return DOT_ABSENT;
	return column === thumbnail.left || column === thumbnail.right || row === thumbnail.top || row === thumbnail.bottom ? DOT_FILLED : solidWithSpeckle(column, row);
};

// The page as captured: the same layout, framed and smaller.
const SCREENSHOT: Box = { left: CONTENT.left + 4, right: CONTENT.right - 4, top: CONTENT.top, bottom: CONTENT.bottom + 1 };
const SCREENSHOT_BODY: Box = { left: SCREENSHOT.left + 2, right: SCREENSHOT.right - 2, top: SCREENSHOT.top + 2, bottom: SCREENSHOT.bottom - 1 };
const screenshot = stack(
	within(
		(column, row) => inBox(SCREENSHOT, column, row) && (column === SCREENSHOT.left || column === SCREENSHOT.right || row === SCREENSHOT.top || row === SCREENSHOT.bottom),
		() => DOT_FILLED
	),
	within((column, row) => inBox(SCREENSHOT_BODY, column, row), webpageLayout(SCREENSHOT_BODY))
);

const BODIES: Record<Format, DotPainter> = {
	Markdown: () => DOT_ABSENT,
	HTML: () => DOT_ABSENT,
	JSON: () => DOT_ABSENT,
	Images: thumbnails,
	Screenshot: screenshot,
	Highlights: () => DOT_ABSENT,
};

export const BLANK_WINDOW = pictureOf(EXTRACT_STORY_GRID, outputWindow(rings));
export const OUTPUT_WINDOWS = Object.fromEntries(FORMATS.map((format) => [format, pictureOf(EXTRACT_STORY_GRID, outputWindow(stack(tabRule(format), BODIES[format])))])) as Record<Format, ReturnType<typeof pictureOf>>;

export const tabsFor = (active: Format): DotStoryText[] => TAB_POSITIONS.map((tab) => ({ text: tab.format, x: x(tab.from), y: baselineOn(TAB_RULE_ROW - 2.5, TAB_SIZE), size: TAB_SIZE, weight: tab.format === active ? 800 : 700, muted: tab.format !== active }));

const TEXT_LEFT = x(CONTENT.left);
const line = (text: string, rowOffset: number, isStrong: boolean, size = 16): DotStoryText => ({ text, x: TEXT_LEFT, y: baselineOn(CONTENT.top + rowOffset, size), size, weight: isStrong ? 800 : 600 });

export const OUTPUT_TEXT: Record<Format, DotStoryText[]> = {
	Markdown: [line('# Atlas pricing', 0, true), line('## Starter', 4, true), line('- $19 / month', 7, false), line('- 10,000 requests / month', 10, false), line('## Team', 14, true), line('- $49 / month', 17, false)],
	HTML: [line('<h1>Atlas pricing</h1>', 0, true, 15), line('<h2>Starter</h2>', 4, false, 15), line('<p>$19 / month</p>', 7, false, 15), line('<h2>Team</h2>', 11, false, 15), line('<p>$49 / month</p>', 14, false, 15)],
	JSON: [line('{', 0, false, 15), line('  "title": "Atlas pricing",', 3, false, 15), line('  "plans": ["Starter", "Team"],', 6, false, 15), line('  "prices": [19, 49]', 9, false, 15), line('}', 12, false, 15)],
	Images: THUMBNAILS.map((box, index) => ({ text: ['hero.webp', 'logo.svg', 'team.jpg'][index], x: x(box.left), y: baselineOn(box.bottom + 2.5, 12), size: 12, weight: 700, muted: true })),
	Screenshot: [],
	Highlights: [line('> Starter is $19 / month', 0, true, 15), line('> Team adds shared access', 4, false, 15), line('> 50,000 requests on Team', 8, false, 15), line('> Annual billing saves 20%', 12, false, 15)],
};

/** The live page: what the picture shows before it plays (the story starts from it), and instead of playing with reduced motion. */
export const EXTRACT_RESTING = { ...PUBLISHED_PAGE, texts: PAGE_LABELS };

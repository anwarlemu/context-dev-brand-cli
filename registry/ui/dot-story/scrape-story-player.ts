import { CONTENT_LINES, FRAME_CELLS, IMAGE_CELLS, IMAGE_TILES, LABELS, PAGE_CELLS, SCRAPE_RESTING, SCRAPE_STORY_GRID, SCREENSHOT, SCREENSHOT_BORDER, URL_TEXT, cellIndex, cellState, type Region } from '@/components/ds/ui/scrape-story-scenes';
import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage, type DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * One request, played as a loop: the URL is typed, its Markdown streams into the output panel, and meanwhile a
 * marquee is dragged out over the page, the page loads inside it, a flash captures it, and its images are lifted out
 * below. Then the results clear and the request is made again.
 */

const URL_TYPING = { startsAt: 0.4, charactersPerSecond: 11 };
const CONTENT_TYPING = { startsAt: 1.6, charactersPerSecond: 45 };
const MARQUEE = { startsAt: 1.6, seconds: 0.8, marchesPerSecond: 8, dash: 3 };
const PAGE_LOAD = { startsAt: 2.5, seconds: 0.7 };
const FLASH = { startsAt: 3.8, litSeconds: 0.12, glowSeconds: 0.4, glowOpacity: 0.3 };
const IMAGES = { startsAt: 4.6, staggerSeconds: 0.35, seconds: 0.5 };
const SHIMMERS = [
	{ startsAt: 6.2, seconds: 1.2 },
	{ startsAt: 8.4, seconds: 0.8 },
];
const SHIMMER_WIDTH = 1.5;
const CLEAR = { startsAt: 9.2, textSeconds: 0.3, seconds: 0.8 };
const LOOP_SECONDS = 10.4;
// Everything has arrived and no shimmer is passing: the picture the static art shows.
const RESTING_AT_SECONDS = 8;

// The last dot of a reveal appears this far into it, leaving the rest for it to settle.
const RIPPLE_SHARE = 0.7;
const CURSOR_LINGERS_SECONDS = 0.5;
const CURSOR_GAP = 3;

const { columns, rows, pitch } = SCRAPE_STORY_GRID;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function statesOf(cells: GlyphCell[]) {
	const states = new Uint8Array(columns * rows);
	for (const cell of cells) states[cellIndex(cell)] = cellState(cell);
	return states;
}

const FRAME_STATES = statesOf(FRAME_CELLS);
const RESTING_STATES = statesOf(SCRAPE_RESTING.cells);
const MEDIA_CELLS = [...SCREENSHOT_BORDER, ...PAGE_CELLS, ...IMAGE_CELLS.flat()];
const SHIMMERING_CELLS = MEDIA_CELLS.filter((cell) => !cell.filled);
const DIAGONALS = SHIMMERING_CELLS.map((cell) => cell.column + cell.row);
const FIRST_DIAGONAL = Math.min(...DIAGONALS) - SHIMMER_WIDTH;
const LAST_DIAGONAL = Math.max(...DIAGONALS) + SHIMMER_WIDTH;

const perimeterLength = (width: number, height: number) => Math.max(1, (width + height) * 2);

// The marquee's border as a walk round its rectangle, so the dashes can march along it.
function perimeterStep(column: number, row: number, width: number, height: number) {
	if (row === 0) return column;
	if (column === width) return width + row;
	if (row === height) return width + height + (width - column);
	return width * 2 + height + (height - row);
}

const centreOf = ({ left, top, columns: width, rows: height }: Region) => ({ column: left + (width - 1) / 2, row: top + (height - 1) / 2 });
const farthestFrom = (region: Region) => Math.hypot((region.columns - 1) / 2, (region.rows - 1) / 2);

export function createScrapeStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);
	const meltAway = createGlyphShader({ grid: SCRAPE_STORY_GRID, box: { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) }, cells: MEDIA_CELLS, drawTarget: () => {} });

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is typed.
	for (const text of [URL_TEXT, ...LABELS, ...CONTENT_LINES]) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const paintMarquee = (seconds: number) => {
		const grown = easeOut(clamp01((seconds - MARQUEE.startsAt) / MARQUEE.seconds));
		const width = Math.round((SCREENSHOT.columns - 1) * grown);
		const height = Math.round((SCREENSHOT.rows - 1) * grown);
		const march = Math.floor((seconds - MARQUEE.startsAt) * MARQUEE.marchesPerSecond);
		const length = perimeterLength(width, height);
		for (let row = 0; row <= height; row++) {
			for (let column = 0; column <= width; column++) {
				if (row !== 0 && row !== height && column !== 0 && column !== width) continue;
				const step = (perimeterStep(column, row, width, height) + length - (march % length)) % length;
				if (step % MARQUEE.dash !== MARQUEE.dash - 1) states[cellIndex({ column: SCREENSHOT.left + column, row: SCREENSHOT.top + row })] = DOT_FILLED;
			}
		}
	};

	const paintPage = (seconds: number) => {
		const loaded = (seconds - PAGE_LOAD.startsAt) / PAGE_LOAD.seconds;
		for (const cell of PAGE_CELLS) {
			if (((cell.row - SCREENSHOT.top) / SCREENSHOT.rows) * RIPPLE_SHARE <= loaded) states[cellIndex(cell)] = cellState(cell);
		}
	};

	const paintFlash = () => {
		for (let row = 1; row < SCREENSHOT.rows - 1; row++) {
			for (let column = 1; column < SCREENSHOT.columns - 1; column++) states[cellIndex({ column: SCREENSHOT.left + column, row: SCREENSHOT.top + row })] = DOT_FILLED;
		}
	};

	const paintImages = (seconds: number) => {
		IMAGE_TILES.forEach((tile, index) => {
			const arrived = (seconds - IMAGES.startsAt - index * IMAGES.staggerSeconds) / IMAGES.seconds;
			if (arrived <= 0) return;
			const centre = centreOf(tile);
			const reach = (arrived / RIPPLE_SHARE) * farthestFrom(tile);
			for (const cell of IMAGE_CELLS[index]) {
				if (Math.hypot(cell.column - centre.column, cell.row - centre.row) <= reach) states[cellIndex(cell)] = cellState(cell);
			}
		});
	};

	const paintShimmer = (seconds: number) => {
		const shimmer = SHIMMERS.find(({ startsAt, seconds: length }) => seconds >= startsAt && seconds < startsAt + length);
		if (!shimmer) return;
		const crest = FIRST_DIAGONAL + ((seconds - shimmer.startsAt) / shimmer.seconds) * (LAST_DIAGONAL - FIRST_DIAGONAL);
		SHIMMERING_CELLS.forEach((cell, index) => {
			if (Math.abs(DIAGONALS[index] - crest) < SHIMMER_WIDTH && states[cellIndex(cell)] === DOT_HOLLOW) states[cellIndex(cell)] = DOT_FILLED;
		});
	};

	const paintMedia = (seconds: number) => {
		if (seconds >= CLEAR.startsAt) {
			const melted = meltAway({ morph: clamp01((seconds - CLEAR.startsAt) / CLEAR.seconds), spin: 0 });
			for (const cell of MEDIA_CELLS) states[cellIndex(cell)] = melted[cellIndex(cell)];
			return;
		}
		if (seconds < MARQUEE.startsAt) return;
		if (seconds < FLASH.startsAt) paintMarquee(seconds);
		else for (const cell of SCREENSHOT_BORDER) states[cellIndex(cell)] = DOT_FILLED;
		if (seconds >= FLASH.startsAt && seconds < FLASH.startsAt + FLASH.litSeconds) paintFlash();
		else paintPage(seconds);
		paintImages(seconds);
		paintShimmer(seconds);
	};

	const typed = (text: DotStoryText, secondsTyping: number, charactersPerSecond: number): DotStoryText => ({ ...text, text: text.text.slice(0, Math.max(0, Math.floor(secondsTyping * charactersPerSecond))) });

	const paintText = (context: CanvasRenderingContext2D, seconds: number) => {
		for (const label of LABELS) paintDotStoryText(context, fontFamily, label);
		const presence = 1 - clamp01((seconds - CLEAR.startsAt) / CLEAR.textSeconds);

		const url = typed(URL_TEXT, seconds - URL_TYPING.startsAt, URL_TYPING.charactersPerSecond);
		paintDotStoryText(context, fontFamily, url, presence);
		const typedUntil = URL_TYPING.startsAt + URL_TEXT.text.length / URL_TYPING.charactersPerSecond;
		if (seconds < typedUntil + CURSOR_LINGERS_SECONDS) {
			context.font = dotStoryFont(URL_TEXT, fontFamily);
			paintDotStoryCursor(context, URL_TEXT.x + context.measureText(url.text).width + CURSOR_GAP, URL_TEXT);
		}

		let secondsTyping = seconds - CONTENT_TYPING.startsAt;
		for (const line of CONTENT_LINES) {
			paintDotStoryText(context, fontFamily, typed(line, secondsTyping, CONTENT_TYPING.charactersPerSecond), presence);
			secondsTyping -= line.text.length / CONTENT_TYPING.charactersPerSecond;
		}
	};

	const paintGlow = (context: CanvasRenderingContext2D, seconds: number) => {
		const glow = 1 - (seconds - FLASH.startsAt) / FLASH.glowSeconds;
		if (glow <= 0 || glow > 1) return;
		context.globalAlpha = FLASH.glowOpacity * glow;
		context.fillRect(SCREENSHOT.left * pitch, SCREENSHOT.top * pitch, SCREENSHOT.columns * pitch, SCREENSHOT.rows * pitch);
		context.globalAlpha = 1;
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: SCRAPE_STORY_GRID,
		resting: { states: RESTING_STATES, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			states.fill(DOT_ABSENT);
			paintMedia(seconds);
			for (const cell of FRAME_CELLS) states[cellIndex(cell)] = FRAME_STATES[cellIndex(cell)];
			return {
				states,
				paintAbove(context) {
					paintText(context, seconds);
					paintGlow(context, seconds);
				},
			};
		},
	});
}

import { BLANK_WINDOW, EXTRACT_STORY_GRID, FORMATS, OUTPUT_TEXT, OUTPUT_WINDOWS, PAGE, PAGE_LABELS, PUBLISHED_PAGE, tabsFor, WINDOW_ROWS, WINDOW_TOP_ROW, type Format } from '@/components/ds/ui/extract-story-scenes';
import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { createBeatStoryPlayer, typingSeconds, type StoryBeat } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One scrape, played as a loop: a scan runs down a live webpage, reading its rings into solid dots; the page melts
 * into a window; then the window steps through each output format in turn, typing the text ones and building the
 * image and screenshot ones.
 */

const SCAN = { startsAt: 0.5, seconds: 2.2 };
const MELT_SECONDS = 1.1;
const WIPE_SECONDS = 0.5;
const TAB_SWITCH_SECONDS = 0.35;
const TYPING = { startsAt: 0.25, charactersPerSecond: 44, pauseSeconds: 0.1 };
const PICTURE_HOLD_SECONDS = 2.2;

const { columns } = EXTRACT_STORY_GRID;

// Everything above the scan has been read; the scan itself is a solid bar across the page.
function scanPage(states: Uint8Array, heldSeconds: number) {
	const scanned = clamp01((heldSeconds - SCAN.startsAt) / SCAN.seconds);
	if (scanned <= 0) return;
	const bar = PAGE.top + Math.round(scanned * (PAGE.bottom - PAGE.top));
	for (let row = PAGE.top + 4; row <= Math.min(bar, PAGE.bottom - 1); row++) {
		for (let column = PAGE.left + 1; column < PAGE.right; column++) {
			const cell = row * columns + column;
			if (states[cell] === DOT_HOLLOW || (row === bar && scanned < 1 && PUBLISHED_PAGE.states[cell] === DOT_ABSENT)) states[cell] = DOT_FILLED;
		}
	}
}

const topToBottom = (_column: number, row: number) => clamp01((row - WINDOW_TOP_ROW) / WINDOW_ROWS);

function formatBeat(format: Format, isFirst: boolean): StoryBeat {
	const texts = OUTPUT_TEXT[format];
	const typed = format === 'Markdown' || format === 'HTML' || format === 'JSON' || format === 'Highlights';
	const startsAt = texts.map((_, index) => TYPING.startsAt + texts.slice(0, index).reduce((total, text) => total + typingSeconds(text, TYPING.charactersPerSecond) + TYPING.pauseSeconds, 0));
	const typingEnds = texts.length === 0 ? 0 : startsAt[texts.length - 1] + typingSeconds(texts[texts.length - 1], TYPING.charactersPerSecond);
	return {
		picture: OUTPUT_WINDOWS[format],
		arrival: { kind: 'builds', seconds: isFirst ? WIPE_SECONDS : TAB_SWITCH_SECONDS, order: topToBottom },
		holdSeconds: typed ? typingEnds + 0.9 : PICTURE_HOLD_SECONDS,
		write(pen, heldSeconds) {
			tabsFor(format).forEach((tab) => pen.text(tab));
			if (typed) texts.forEach((text, index) => pen.type(text, heldSeconds, { startsAt: startsAt[index], charactersPerSecond: TYPING.charactersPerSecond }));
			else texts.forEach((text) => pen.text(text));
		},
	};
}

export function createExtractStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: EXTRACT_STORY_GRID,
		// It starts on the live page, so a visitor first sees what is being scraped, then each output in turn.
		resting: { beat: 0, heldSeconds: 0 },
		beats: [
			{ picture: PUBLISHED_PAGE, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: SCAN.startsAt + SCAN.seconds + 0.5, animate: scanPage, write: (pen) => PAGE_LABELS.forEach((label) => pen.text(label)) },
			{ picture: BLANK_WINDOW, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
			...FORMATS.map((format, index) => formatBeat(format, index === 0)),
			{ picture: BLANK_WINDOW, arrival: { kind: 'builds', seconds: WIPE_SECONDS, order: topToBottom }, holdSeconds: 0.1 },
		],
	});
}


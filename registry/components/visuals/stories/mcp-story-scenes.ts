import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { clear, disc, isInDotBox, rectangle, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

export const MCP_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { pitch: PITCH } = MCP_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const centerOf = (left: number, right: number) => ((left + right + 1) / 2) * PITCH;

const WINDOW: DotBox = { left: 1, right: 20, top: 7, bottom: 30 };
const TITLE_BAR_ROW = 10;
const COMPOSER_ROW = 26;
export const QUESTION_BUBBLE = [
	{ row: 13, left: 8, right: 18 },
	{ row: 15, left: 11, right: 18 },
];
export const REPLY_LINES = [
	{ row: 19, left: 3, right: 16 },
	{ row: 21, left: 3, right: 12 },
	{ row: 23, left: 3, right: 15 },
];
export const CABLE = { row: 18, left: 21, right: 37 };
const PLUG: DotBox = { left: 26, right: 29, top: 15, bottom: 21 };
const PRONGS = { left: 30, right: 31, rows: [16, 20] };
const SOCKET: DotBox = { left: 33, right: 34, top: 14, bottom: 22 };
export const CONNECTOR: DotBox = { left: CABLE.left, right: CABLE.right, top: SOCKET.top, bottom: SOCKET.bottom };
// A whole-number radius leaves a lone dot at each pole and on each side of the rim.
const GLOBE = { center: { column: 46, row: 18 }, radius: 8.6, parallelOffset: 4, meridianWidth: 4.5 };

const lines = (bars: { row: number; left: number; right: number }[], state: typeof DOT_FILLED | typeof DOT_HOLLOW): DotPainter => (column, row) => (bars.some((bar) => bar.row === row && column >= bar.left && column <= bar.right) ? state : DOT_ABSENT);

const assistantWindow = stack((column, row) => {
	if (row === TITLE_BAR_ROW && column > WINDOW.left && column < WINDOW.right) return DOT_FILLED;
	if (row === COMPOSER_ROW && column > WINDOW.left && column < WINDOW.right) return DOT_HOLLOW;
	return DOT_ABSENT;
}, rectangle(WINDOW, clear));

const globe = disc(GLOBE.center, GLOBE.radius, (column, row) => {
	const across = column - GLOBE.center.column;
	const down = row - GLOBE.center.row;
	const meridianOffset = Math.round(GLOBE.meridianWidth * Math.sqrt(Math.max(0, 1 - (down / GLOBE.radius) ** 2)));
	const isParallel = down === 0 || Math.abs(down) === GLOBE.parallelOffset;
	const isMeridian = across === 0 || Math.abs(across) === meridianOffset;
	return isParallel || isMeridian ? DOT_FILLED : DOT_HOLLOW;
});

const connector: DotPainter = (column, row) => {
	if (isInDotBox(PLUG, column, row)) return DOT_FILLED;
	if (column >= PRONGS.left && column <= PRONGS.right && PRONGS.rows.includes(row)) return DOT_FILLED;
	if (isInDotBox(SOCKET, column, row)) return DOT_HOLLOW;
	return row === CABLE.row && column >= CABLE.left && column <= CABLE.right ? DOT_HOLLOW : DOT_ABSENT;
};

export const UNPLUGGED = pictureOf(MCP_STORY_GRID, stack(assistantWindow, globe));
export const PLUGGED_IN = pictureOf(MCP_STORY_GRID, stack(assistantWindow, connector, globe));
export const ASKED = pictureOf(MCP_STORY_GRID, stack(assistantWindow, lines(QUESTION_BUBBLE, DOT_FILLED), connector, globe));
export const ANSWERED = pictureOf(MCP_STORY_GRID, stack(assistantWindow, lines(QUESTION_BUBBLE, DOT_FILLED), lines(REPLY_LINES, DOT_HOLLOW), connector, globe));

export const ASSISTANT_LABEL: DotStoryText = { text: 'assistant', x: x(WINDOW.left + 2), y: baselineOn(8.5, 12), size: 12, weight: 700, muted: true };
export const PROMPT: DotStoryText = { text: 'search the web', x: x(WINDOW.left + 2), y: baselineOn(28, 12), size: 12, weight: 700 };
export const CONNECTION_TEXTS: DotStoryText[] = [
	{ text: 'MCP', x: centerOf(PLUG.left, SOCKET.right), y: baselineOn(11.5, 14), size: 14, weight: 700, anchor: 'middle' },
	{ text: 'mcp.context.dev', x: centerOf(GLOBE.center.column, GLOBE.center.column), y: baselineOn(30.5, 13), size: 13, weight: 700, anchor: 'middle' },
	{ text: 'OAuth, no API key', x: centerOf(GLOBE.center.column, GLOBE.center.column), y: baselineOn(33.5, 12), size: 12, weight: 700, muted: true, anchor: 'middle' },
];

export const MCP_RESTING = { ...ANSWERED, texts: [ASSISTANT_LABEL, ...CONNECTION_TEXTS] };

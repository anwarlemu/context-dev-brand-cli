import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { clear, rectangle, solid, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

export const HIGHLIGHTS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { pitch: PITCH } = HIGHLIGHTS_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const centerOf = (left: number, right: number) => ((left + right + 1) / 2) * PITCH;

export const CARD: DotBox = { left: 3, right: 54, top: 2, bottom: 33 };
const FAVICON: DotBox = { left: 6, right: 8, top: 5, bottom: 7 };
const CHIP: DotBox = { left: 42, right: 51, top: 5, bottom: 9 };
const DIVIDER = { row: 11, left: 4, right: 53 };
export const PASSAGE_LEFT = 10;
const PASSAGE_LINES = [
	{ row: 14, right: 50 },
	{ row: 16, right: 46 },
	{ row: 19, right: 49 },
	{ row: 21, right: 51 },
	{ row: 23, right: 41 },
	{ row: 26, right: 48 },
	{ row: 28, right: 44 },
];
export const HIGHLIGHTED_LINES = PASSAGE_LINES.filter(({ row }) => row >= 19 && row <= 23);
export const MARKER = { column: 7, top: HIGHLIGHTED_LINES[0].row, bottom: HIGHLIGHTED_LINES[HIGHLIGHTED_LINES.length - 1].row };

function passages(isHighlighted: boolean): DotPainter {
	return (column, row) => {
		if (isHighlighted && column === MARKER.column && row >= MARKER.top && row <= MARKER.bottom) return DOT_FILLED;
		const line = PASSAGE_LINES.find((candidate) => candidate.row === row);
		if (!line || column < PASSAGE_LEFT || column > line.right) return DOT_ABSENT;
		return isHighlighted && HIGHLIGHTED_LINES.includes(line) ? DOT_FILLED : DOT_HOLLOW;
	};
}

const divider: DotPainter = (column, row) => (row === DIVIDER.row && column >= DIVIDER.left && column <= DIVIDER.right ? DOT_HOLLOW : DOT_ABSENT);
const card = (isHighlighted: boolean) => stack(rectangle(FAVICON, solid), rectangle(CHIP, clear), divider, passages(isHighlighted), rectangle(CARD, clear));

export const BLANK = pictureOf(HIGHLIGHTS_STORY_GRID, clear);
export const RESULT_READ = pictureOf(HIGHLIGHTS_STORY_GRID, card(false));
export const RESULT_HIGHLIGHTED = pictureOf(HIGHLIGHTS_STORY_GRID, card(true));

export const RESULT_TEXTS: DotStoryText[] = [
	{ text: 'arxiv.org/abs/2404.07220', x: x(11), y: baselineOn(5, 12), size: 12, weight: 700, muted: true },
	{ text: 'Hybrid search for RAG', x: x(11), y: baselineOn(7.6, 15), size: 15, weight: 700 },
	{ text: 'high', x: centerOf(CHIP.left, CHIP.right), y: baselineOn(7, 12), size: 12, weight: 700, anchor: 'middle' },
];
export const RELEVANCE_LABEL: DotStoryText = { text: 'relevance: high', x: x(CARD.right), y: baselineOn(35.5, 12), size: 12, weight: 700, muted: true, anchor: 'end' };
export const HIGHLIGHTS_LABEL: DotStoryText = { text: 'highlights', x: x(CARD.left + 1), y: baselineOn(35.5, 12), size: 12, weight: 700, muted: true };

export const HIGHLIGHTS_RESTING = { ...RESULT_HIGHLIGHTED, texts: [...RESULT_TEXTS, RELEVANCE_LABEL, HIGHLIGHTS_LABEL] };

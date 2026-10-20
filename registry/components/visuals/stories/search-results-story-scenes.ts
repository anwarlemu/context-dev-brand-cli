import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { pictureOf } from '@/components/visuals/dot-engine/dot-story-beats';
import { clear, rectangle, stack, type DotBox, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';

export const SEARCH_RESULTS_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, pitch: PITCH } = SEARCH_RESULTS_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const centerOf = (left: number, right: number) => ((left + right + 1) / 2) * PITCH;

const FIELD: DotBox = { left: 0, right: COLUMNS - 1, top: 0, bottom: 4 };
const FIELD_ICON = { column: 2, row: 2 };
const RESULT = { left: 0, right: COLUMNS - 1, rows: 10, firstTop: 6, every: 11 };
const CHIP = { left: 45, right: 55, top: 2, bottom: 5 };
export const PASSAGE = { row: 7, left: 2, right: 48 };

const RESULTS = [
	{ source: 'arxiv.org/abs/2404.07220', title: 'Blended RAG: hybrid retrieval', relevance: 'high', highlight: { from: 6, to: 30 } },
	{ source: 'weaviate.io/blog/hybrid-search', title: 'Hybrid search, explained', relevance: 'high', highlight: { from: 12, to: 38 } },
	{ source: 'docs.pinecone.io/guides/hybrid', title: 'Sparse and dense vectors', relevance: 'medium', highlight: { from: 4, to: 18 } },
];
export const RESULT_COUNT = RESULTS.length;
export const HIGHLIGHTS = RESULTS.map(({ highlight }) => highlight);

export const resultTop = (index: number) => RESULT.firstTop + index * RESULT.every;
export const resultAt = (row: number) => (row < RESULT.firstTop ? -1 : Math.min(RESULT_COUNT - 1, Math.floor((row - RESULT.firstTop) / RESULT.every)));

const field: DotPainter = stack((column, row) => (column === FIELD_ICON.column && row === FIELD_ICON.row ? DOT_HOLLOW : DOT_ABSENT), rectangle(FIELD, clear));

function result(index: number, isHighlighted: boolean): DotPainter {
	const top = resultTop(index);
	const { relevance, highlight } = RESULTS[index];
	return rectangle({ left: RESULT.left, right: RESULT.right, top, bottom: top + RESULT.rows - 1 }, (column, row) => {
		const down = row - top;
		const isChip = column >= CHIP.left && column <= CHIP.right && down >= CHIP.top && down <= CHIP.bottom;
		if (isChip) {
			const isChipEdge = column === CHIP.left || column === CHIP.right || down === CHIP.top || down === CHIP.bottom;
			if (!isChipEdge) return DOT_ABSENT;
			return relevance === 'high' ? DOT_FILLED : DOT_HOLLOW;
		}
		if (down !== PASSAGE.row || column < PASSAGE.left || column > PASSAGE.right) return DOT_ABSENT;
		return isHighlighted && column >= highlight.from && column <= highlight.to ? DOT_FILLED : DOT_HOLLOW;
	});
}

const results = (isHighlighted: boolean) => RESULTS.map((_, index) => result(index, isHighlighted));

export const FIELD_ONLY = pictureOf(SEARCH_RESULTS_STORY_GRID, field);
export const RESULTS_FOUND = pictureOf(SEARCH_RESULTS_STORY_GRID, stack(field, ...results(false)));
export const RESULTS_HIGHLIGHTED = pictureOf(SEARCH_RESULTS_STORY_GRID, stack(field, ...results(true)));

export const QUERY: DotStoryText = { text: 'how does hybrid search improve RAG?', x: x(4.5), y: baselineOn(2, 17), size: 17, weight: 700 };
export const FRESHNESS_LABEL: DotStoryText = { text: 'last_month', x: x(COLUMNS - 2), y: baselineOn(2, 12), size: 12, weight: 700, muted: true, anchor: 'end' };

export const RESULT_TEXTS: DotStoryText[][] = RESULTS.map(({ source, title, relevance }, index) => {
	const top = resultTop(index);
	return [
		{ text: source, x: x(2), y: baselineOn(top + 2, 12), size: 12, weight: 700, muted: true },
		{ text: title, x: x(2), y: baselineOn(top + 4.5, 15), size: 15, weight: 700 },
		{ text: relevance, x: centerOf(CHIP.left, CHIP.right), y: baselineOn(top + 3.5, 12), size: 12, weight: 700, anchor: 'middle' },
	];
});

export const SEARCH_RESULTS_RESTING = { ...RESULTS_HIGHLIGHTED, texts: [QUERY, FRESHNESS_LABEL, ...RESULT_TEXTS.flat()] };

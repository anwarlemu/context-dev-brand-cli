import { DOT_ABSENT, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, paintShape, roundedBox, type DotBox } from '@/components/ds/ui/dot-story-cells';

const CORNER_RADIUS = 3;

/**
 * A wide field for something typed into a story. A field that is only a border has too little in it to melt into or
 * out of, so it comes in two pictures: `empty`, with room for the text, and `filled`, full of rings, which it arrives
 * and leaves as. `along` says how far along the field a dot is, so it can clear and refill from its left.
 */
export function promptField(grid: DotGrid, box: DotBox) {
	const picture = (isFilled: boolean): StoryPicture => {
		const states = paintShape(grid, new Uint8Array(grid.columns * grid.rows), roundedBox(box, CORNER_RADIUS), (column, row) =>
			isFilled || Math.min(column - box.left, box.right - column, row - box.top, box.bottom - row) <= 1 ? DOT_HOLLOW : DOT_ABSENT
		);
		return { states, cells: cellsOfStates(grid, states) };
	};
	return { empty: picture(false), filled: picture(true), along: (column: number) => Math.min(1, Math.max(0, (column - box.left) / (box.right - box.left))) };
}

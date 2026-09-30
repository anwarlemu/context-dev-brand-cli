import { distanceToSegment, type DotShape, type GridPoint } from '@/components/ds/ui/dot-story-cells';

const LETTER = { widthOfHeight: 0.8, crossbarAt: 0.62, gapOfHeight: 0.16, bowlOfHeight: 0.3 };

/**
 * A type specimen, "Aa", `size` rows tall with its top-left corner at `origin`, drawn with strokes `weight` dots
 * either side of their line, so the same letters can be set light or bold.
 */
export function typeSpecimen(origin: GridPoint, size: number, weight: number): DotShape {
	const width = size * LETTER.widthOfHeight;
	const foot = origin.row + size;
	const apex = { column: origin.column + width / 2, row: origin.row };
	const crossbarRow = origin.row + size * LETTER.crossbarAt;
	const crossbarInset = (width / 2) * (1 - LETTER.crossbarAt);
	const strokes: GridPoint[][] = [
		[{ column: origin.column, row: foot }, apex],
		[apex, { column: origin.column + width, row: foot }],
		[
			{ column: origin.column + crossbarInset, row: crossbarRow },
			{ column: origin.column + width - crossbarInset, row: crossbarRow },
		],
	];
	const bowl = { column: origin.column + width + size * (LETTER.gapOfHeight + LETTER.bowlOfHeight), row: foot - size * LETTER.bowlOfHeight, radius: size * LETTER.bowlOfHeight };
	const stem = [
		{ column: bowl.column + bowl.radius, row: bowl.row - bowl.radius },
		{ column: bowl.column + bowl.radius, row: foot },
	];
	return (column, row) =>
		strokes.some(([from, to]) => distanceToSegment(column, row, from, to) <= weight) ||
		distanceToSegment(column, row, stem[0], stem[1]) <= weight ||
		Math.abs(Math.hypot(column - bowl.column, row - bowl.row) - bowl.radius) <= weight;
}

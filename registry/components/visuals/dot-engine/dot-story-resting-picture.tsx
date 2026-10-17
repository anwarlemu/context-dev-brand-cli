import type { GlyphCell } from '@/components/visuals/dot-engine/dot-glyph-cells';
import type { DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import type { DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';
import { dotsPath } from '@/components/visuals/dot-engine/dot-svg-path';
import type { CSSProperties } from 'react';

interface DotStoryRestingPictureProps {
	grid: DotGrid;
	resting: { cells: GlyphCell[]; texts?: DotStoryText[]; clearedPath?: string };
	surfaceColor: string;
	surfaceBox: CSSProperties;
	textColor: string;
	mutedTextColor: string;
}

/** The dot story's first frame as static SVG, shown until its canvas player has drawn. Colors may be `var()` tokens. */
export function DotStoryRestingPicture({ grid, resting, surfaceColor, surfaceBox, textColor, mutedTextColor }: DotStoryRestingPictureProps) {
	const { columns, rows, pitch, dotRadius, ringStroke, haloRadius } = grid;
	const width = columns * pitch;
	const height = rows * pitch;
	const centersOf = (cells: GlyphCell[]) => cells.map((cell) => ({ cx: (cell.column + 0.5) * pitch, cy: (cell.row + 0.5) * pitch }));
	return (
		<svg viewBox={`${-haloRadius} ${-haloRadius} ${width + haloRadius * 2} ${height + haloRadius * 2}`} className="pointer-events-none absolute font-data" style={surfaceBox}>
			{haloRadius > 0 && <path style={{ fill: surfaceColor }} d={dotsPath(centersOf(resting.cells), haloRadius)} />}
			{resting.clearedPath && <path style={{ fill: surfaceColor }} d={resting.clearedPath} />}
			<path fill="none" stroke="currentColor" strokeWidth={ringStroke} d={dotsPath(centersOf(resting.cells.filter((cell) => !cell.filled)), dotRadius - ringStroke / 2)} />
			<g fill="currentColor">
				<path d={dotsPath(centersOf(resting.cells.filter((cell) => cell.filled)), dotRadius)} />
				{resting.texts?.map(({ text, x, y, size, weight, muted = false, anchor = 'start' }) => (
					<text key={`${x}:${y}`} x={x} y={y} fontSize={size} fontWeight={weight} style={{ fill: muted ? mutedTextColor : textColor }} textAnchor={anchor} className="whitespace-pre">
						{text}
					</text>
				))}
			</g>
		</svg>
	);
}

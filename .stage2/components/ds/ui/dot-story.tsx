'use client';

import type { GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { DOT_STORY_MUTED_TEXT_COLOR, DOT_STORY_TEXT_COLOR, type DotStoryPlayer, type DotStoryStage, type DotStoryText } from '@/components/ds/ui/dot-story-player';
import { dotsPath } from '@/components/ds/ui/dot-svg-path';
import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useRef, useState } from 'react';

export type LoadDotStory = (stage: DotStoryStage) => Promise<DotStoryPlayer>;

interface DotStoryProps {
	grid: DotGrid;
	/** The picture shown before the story plays, and instead of it with reduced motion. */
	resting: { cells: GlyphCell[]; texts?: DotStoryText[]; clearedPath?: string };
	/** Kept outside the component, so the story is only loaded once. */
	load: LoadDotStory;
	surfaceColor?: string;
	className?: string;
}

const percent = (share: number) => `${share * 100}%`;

/**
 * A looping picture in the brand dot grid. It plays only while on screen, and its code only downloads once it first
 * scrolls into view. The picture repaints the surface's colour around its dots (the grid's halo), and reaches that far
 * past its own box, so it can sit on a backdrop pattern.
 */
export function DotStory({ grid, resting, load, surfaceColor = '#FFFFFF', className }: DotStoryProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [hasTakenOver, setHasTakenOver] = useState(false);

	const { columns, rows, pitch, dotRadius, ringStroke, haloRadius } = grid;
	const width = columns * pitch;
	const height = rows * pitch;
	const centresOf = (cells: GlyphCell[]) => cells.map((cell) => ({ cx: (cell.column + 0.5) * pitch, cy: (cell.row + 0.5) * pitch }));
	// A canvas keeps its own size when only its insets are set, so the box is spelled out in full.
	const surfaceBox = { left: percent(-haloRadius / width), top: percent(-haloRadius / height), width: percent(1 + (haloRadius * 2) / width), height: percent(1 + (haloRadius * 2) / height) };

	useEffect(() => {
		const frame = frameRef.current;
		const canvas = canvasRef.current;
		if (!frame || !canvas) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let player: DotStoryPlayer | null = null;
		let isLoading = false;
		let isDisposed = false;
		let isOnScreen = false;

		const sync = () => player?.setRunning(isOnScreen && !document.hidden);

		// If the story fails to load, the resting picture simply stays.
		const start = async () => {
			isLoading = true;
			try {
				const style = getComputedStyle(canvas);
				const loaded = await load({ canvas, dotColor: style.color, surfaceColor, fontFamily: style.fontFamily, onFirstFrame: () => setHasTakenOver(true) });
				if (isDisposed) {
					loaded.destroy();
					return;
				}
				player = loaded;
				sync();
			} catch {
				player = null;
			} finally {
				isLoading = false;
			}
		};

		const visibility = new IntersectionObserver(([entry]) => {
			isOnScreen = entry.isIntersecting;
			if (player) sync();
			else if (isOnScreen && !isLoading) void start();
		});
		visibility.observe(frame);
		document.addEventListener('visibilitychange', sync);
		const resizeObserver = new ResizeObserver(() => player?.resize());
		resizeObserver.observe(canvas);

		return () => {
			isDisposed = true;
			visibility.disconnect();
			document.removeEventListener('visibilitychange', sync);
			resizeObserver.disconnect();
			player?.destroy();
			setHasTakenOver(false);
		};
	}, [load, surfaceColor]);

	return (
		<div ref={frameRef} aria-hidden="true" className={cn('relative text-brand-primary', className)} style={{ aspectRatio: `${width} / ${height}` }}>
			{/* Once the canvas has drawn, the static picture is dropped rather than hidden, so its dots leave the DOM. */}
			{!hasTakenOver && (
				<svg viewBox={`${-haloRadius} ${-haloRadius} ${width + haloRadius * 2} ${height + haloRadius * 2}`} className="absolute font-data" style={surfaceBox}>
					{haloRadius > 0 && <path fill={surfaceColor} d={dotsPath(centresOf(resting.cells), haloRadius)} />}
					{resting.clearedPath && <path fill={surfaceColor} d={resting.clearedPath} />}
					<path fill="none" stroke="currentColor" strokeWidth={ringStroke} d={dotsPath(centresOf(resting.cells.filter((cell) => !cell.filled)), dotRadius - ringStroke / 2)} />
					<g fill="currentColor">
						<path d={dotsPath(centresOf(resting.cells.filter((cell) => cell.filled)), dotRadius)} />
						{resting.texts?.map(({ text, x, y, size, weight, muted = false, anchor = 'start' }) => (
							<text key={`${x}:${y}`} x={x} y={y} fontSize={size} fontWeight={weight} fill={muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR} textAnchor={anchor} className="whitespace-pre">
								{text}
							</text>
						))}
					</g>
				</svg>
			)}
			<canvas ref={canvasRef} className={cn('absolute font-data', !hasTakenOver && 'invisible')} style={surfaceBox} />
		</div>
	);
}

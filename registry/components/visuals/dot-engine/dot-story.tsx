"use client";

'use client';

import { DotStoryRestingPicture } from '@/components/visuals/dot-engine/dot-story-resting-picture';
import type { GlyphCell } from '@/components/visuals/dot-engine/dot-glyph-cells';
import type { DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { DOT_STORY_MUTED_TEXT_COLOR, DOT_STORY_TEXT_COLOR, canvasColor, forgetCanvasColors, type DotStoryPlayer, type DotStoryStage, type DotStoryText } from '@/components/visuals/dot-engine/dot-story-player';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type RefObject } from 'react';

export type LoadDotStory = (stage: DotStoryStage) => Promise<DotStoryPlayer>;

interface DotStoryProps {
	grid: DotGrid;
	/** The picture shown before the story plays, and instead of it with reduced motion. */
	resting: { cells: GlyphCell[]; texts?: DotStoryText[]; clearedPath?: string };
	/** Kept outside the component, so the story is only loaded once. */
	load: LoadDotStory;
	/** The card's color, repainted around the dots. A brand token (`var(--ds-color-...)`) or any CSS color. */
	surfaceColor?: string;
	/** Shows the resting picture only, as with reduced motion: for a glyph that sits beside a story already playing. */
	still?: boolean;
	className?: string;
}

const percent = (share: number) => `${share * 100}%`;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// Followed live, so turning reduced motion on mid-loop stops the story and brings back its resting picture.
function usePrefersReducedMotion() {
	const [isReduced, setIsReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia(REDUCED_MOTION);
		const update = () => setIsReduced(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);
	return isReduced;
}

// The colors a theme switch re-points: the dots (the frame's text color), the type and the surface around the dots.
function readThemeColors(canvas: HTMLCanvasElement, surfaceColor: string) {
	const style = getComputedStyle(canvas);
	const tokenValue = (color: string) => {
		const token = /^var\((--[\w-]+)\)$/.exec(color.trim())?.[1];
		return token ? style.getPropertyValue(token).trim() : color;
	};
	return [style.color, tokenValue(DOT_STORY_TEXT_COLOR), tokenValue(DOT_STORY_MUTED_TEXT_COLOR), tokenValue(surfaceColor)].join('|');
}

// Counts theme switches (a class or data-theme change on <html> that re-points the story's colors), so the canvas
// reloads and repaints its dots, type and halos in the new colors. Other attribute changes leave a playing story alone.
function useThemeVersion(canvasRef: RefObject<HTMLCanvasElement | null>, surfaceColor: string) {
	const [version, setVersion] = useState(0);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let colors = readThemeColors(canvas, surfaceColor);
		const observer = new MutationObserver(() => {
			const next = readThemeColors(canvas, surfaceColor);
			if (next === colors) return;
			colors = next;
			setVersion((current) => current + 1);
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => observer.disconnect();
	}, [canvasRef, surfaceColor]);
	return version;
}

/**
 * A looping picture in the brand dot grid. It plays only while on screen, and its code only downloads once it first
 * scrolls into view. The picture repaints the surface's color around its dots (the grid's halo), and reaches that far
 * past its own box, so it can sit on a backdrop pattern. With reduced motion it shows the resting picture only.
 */
export function DotStory({ grid, resting, load, surfaceColor = 'var(--ds-color-bg-default)', still = false, className }: DotStoryProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [hasTakenOver, setHasTakenOver] = useState(false);
	const isReducedMotion = usePrefersReducedMotion();
	const themeVersion = useThemeVersion(canvasRef, surfaceColor);

	const { columns, rows, pitch, haloRadius } = grid;
	const width = columns * pitch;
	const height = rows * pitch;
	// A canvas keeps its own size when only its insets are set, so the box is spelled out in full.
	const surfaceBox = { left: percent(-haloRadius / width), top: percent(-haloRadius / height), width: percent(1 + (haloRadius * 2) / width), height: percent(1 + (haloRadius * 2) / height) };

	useEffect(() => {
		const frame = frameRef.current;
		const canvas = canvasRef.current;
		if (!frame || !canvas || still || isReducedMotion) return;
		if (window.matchMedia(REDUCED_MOTION).matches) return;

		let player: DotStoryPlayer | null = null;
		let isLoading = false;
		let isDisposed = false;
		let isOnScreen = false;

		const sync = () => player?.setRunning(isOnScreen && !document.hidden);

		// If the story fails to load, the resting picture simply stays.
		const start = async () => {
			isLoading = true;
			try {
				forgetCanvasColors(canvas);
				const style = getComputedStyle(canvas);
				const loaded = await load({ canvas, dotColor: style.color, surfaceColor: canvasColor(canvas, surfaceColor), fontFamily: style.fontFamily, onFirstFrame: () => setHasTakenOver(true) });
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
	}, [load, surfaceColor, still, isReducedMotion, themeVersion]);

	return (
		<div ref={frameRef} aria-hidden="true" className={cn('relative text-brand', className)} style={{ aspectRatio: `${width} / ${height}` }}>
			{/* Once the canvas has drawn, the static picture is dropped rather than hidden, so its dots leave the DOM. */}
			{!hasTakenOver && <DotStoryRestingPicture grid={grid} resting={resting} surfaceColor={surfaceColor} surfaceBox={surfaceBox} textColor={DOT_STORY_TEXT_COLOR} mutedTextColor={DOT_STORY_MUTED_TEXT_COLOR} />}
			<canvas ref={canvasRef} className={cn('pointer-events-none absolute font-data', !hasTakenOver && 'invisible')} style={surfaceBox} />
		</div>
	);
}

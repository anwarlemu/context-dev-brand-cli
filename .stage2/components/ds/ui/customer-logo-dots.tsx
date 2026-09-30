'use client';

import { LOGO_CELLS, LOGO_GRID, LOGO_LEFT, LOGO_TOP } from '@/components/ds/ui/customer-logo-grid';
import { type LogoCell, sampleLogoCells } from '@/components/ds/ui/logo-dot-sampling';
import { useHoverDotMorph, type LoadDotMorph } from '@/components/ds/ui/use-hover-dot-morph';
import { dotsPath } from '@/components/ds/ui/dot-svg-path';
import { cx as cn } from '@/components/ds/ui/cx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { columns: GRID_COLUMNS, rows: GRID_ROWS, pitch: DOT_PITCH, dotRadius: DOT_RADIUS, ringStroke: RING_STROKE } = LOGO_GRID;
// The backdrop uses every other cell at low opacity so it reads as texture, and keeps this many cells clear of the
// logo's dots so the logo keeps a clean silhouette.
const FIELD_STEP = 2;
const FIELD_CLEARANCE = 2;
const FIELD_OPACITY = 0.22;
const VIEW_WIDTH = GRID_COLUMNS * DOT_PITCH;
const VIEW_HEIGHT = GRID_ROWS * DOT_PITCH;
// Rings stay this far inside the visible edge, so the card never slices one in half.
const FIELD_EDGE_MARGIN = DOT_PITCH / 2;

interface ViewBounds {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

// The part of the viewBox that `slice` actually shows for this element's size, in viewBox units.
function visibleBounds(width: number, height: number): ViewBounds {
	const scale = Math.max(width / VIEW_WIDTH, height / VIEW_HEIGHT);
	const visibleWidth = width / scale;
	const visibleHeight = height / scale;
	const left = (VIEW_WIDTH - visibleWidth) / 2;
	const top = (VIEW_HEIGHT - visibleHeight) / 2;
	return { left, top, right: left + visibleWidth, bottom: top + visibleHeight };
}

interface FieldCell {
	column: number;
	row: number;
}

// The backdrop's rings, split into the ones drawn and the ones left out because they sit too near the logo.
function fieldCells(logoCells: LogoCell[], bounds: ViewBounds) {
	const nearLogo = new Set<string>();
	for (const cell of logoCells) {
		for (let dy = -FIELD_CLEARANCE; dy <= FIELD_CLEARANCE; dy++) {
			for (let dx = -FIELD_CLEARANCE; dx <= FIELD_CLEARANCE; dx++) nearLogo.add(`${cell.column + LOGO_LEFT + dx}:${cell.row + LOGO_TOP + dy}`);
		}
	}
	const shown: FieldCell[] = [];
	const cleared: FieldCell[] = [];
	for (let row = 0; row < GRID_ROWS; row += FIELD_STEP) {
		for (let column = 0; column < GRID_COLUMNS; column += FIELD_STEP) {
			const cx = centre(column);
			const cy = centre(row);
			const fitsInView = cx - DOT_RADIUS - FIELD_EDGE_MARGIN >= bounds.left && cx + DOT_RADIUS + FIELD_EDGE_MARGIN <= bounds.right && cy - DOT_RADIUS - FIELD_EDGE_MARGIN >= bounds.top && cy + DOT_RADIUS + FIELD_EDGE_MARGIN <= bounds.bottom;
			if (fitsInView) (nearLogo.has(`${column}:${row}`) ? cleared : shown).push({ column, row });
		}
	}
	return { shown, cleared };
}

const centre = (index: number) => (index + 0.5) * DOT_PITCH;

/**
 * The customer's logo redrawn in the brand dot grid, over a faint backdrop of rings that stays clear of it.
 * Inside a link, hovering the link melts the logo into an arrow.
 */
export function CustomerLogoDots({ src, background, className }: { src: string; background?: string; className?: string }) {
	const [cells, setCells] = useState<LogoCell[] | null>(null);
	const [samplingFailed, setSamplingFailed] = useState(false);
	const [bounds, setBounds] = useState<ViewBounds | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const field = useMemo(() => (cells && bounds ? fieldCells(cells, bounds) : null), [cells, bounds]);
	const loadMorph = useCallback<LoadDotMorph>(
		async (canvas, onPlayingChange) => {
			if (!cells || !field) return null;
			const surface = canvas.closest('article');
			const { createCustomerLogoMorph } = await import('@/components/ds/ui/customer-logo-morph');
			return createCustomerLogoMorph({
				canvas,
				cells,
				clearedBackdrop: { cells: field.cleared.map((cell) => cell.row * GRID_COLUMNS + cell.column), opacity: FIELD_OPACITY },
				palette: { dots: 'white', background: surface ? getComputedStyle(surface).backgroundColor : 'transparent' },
				onPlayingChange,
			});
		},
		[cells, field]
	);
	const isMorphing = useHoverDotMorph(canvasRef, loadMorph);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const observer = new ResizeObserver(([entry]) => setBounds(visibleBounds(entry.contentRect.width, entry.contentRect.height)));
		observer.observe(svg);
		return () => observer.disconnect();
	}, []);

	// Sampling fetches and decodes the logo, so it waits until the card is nearly on screen.
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		let cancelled = false;
		const nearView = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				nearView.disconnect();
				sampleLogoCells(src, { background, cellsPerSide: LOGO_CELLS })
					.then((sampled) => {
						if (cancelled) return;
						if (sampled.length === 0) throw new Error(`No logo pixels found in ${src}`);
						setCells(sampled);
					})
					// A logo that can't be sampled into dots falls back to the plain image, so the card is never left blank.
					.catch((error: unknown) => {
						if (cancelled) return;
						if (process.env.NODE_ENV !== 'production') console.error('CustomerLogoDots could not sample', src, error);
						setSamplingFailed(true);
					});
			},
			{ rootMargin: '600px' }
		);
		nearView.observe(svg);
		return () => {
			cancelled = true;
			nearView.disconnect();
		};
	}, [src, background]);

	const ringRadius = DOT_RADIUS - RING_STROKE / 2;
	const logoCell = (cell: LogoCell) => ({ cx: centre(cell.column + LOGO_LEFT), cy: centre(cell.row + LOGO_TOP) });

	return (
		<div className={cn('relative', className)} aria-hidden="true">
			<svg ref={svgRef} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid slice" className={cn('block size-full transition-opacity duration-500 motion-reduce:transition-none', cells ? 'opacity-100' : 'opacity-0')}>
				{field && (
					<path
						fill="none"
						stroke="white"
						strokeWidth={RING_STROKE}
						opacity={FIELD_OPACITY}
						d={dotsPath(
							field.shown.map((cell) => ({ cx: centre(cell.column), cy: centre(cell.row) })),
							ringRadius
						)}
					/>
				)}
				{cells && (
					<g className={cn(isMorphing && 'invisible')}>
						<path fill="none" stroke="white" strokeWidth={RING_STROKE} d={dotsPath(cells.filter((cell) => !cell.filled).map(logoCell), ringRadius)} />
						<path fill="white" d={dotsPath(cells.filter((cell) => cell.filled).map(logoCell), DOT_RADIUS)} />
					</g>
				)}
			</svg>
			<canvas ref={canvasRef} className={cn('absolute inset-0 size-full', !isMorphing && 'invisible')} />
			{samplingFailed && (
				<span className="absolute inset-0 flex items-center justify-center">
					{/* eslint-disable-next-line @next/next/no-img-element -- a plain fallback for a logo of unknown size and origin */}
					<img src={src} alt="" className="size-24 rounded-2xl object-contain" style={{ background }} />
				</span>
			)}
		</div>
	);
}

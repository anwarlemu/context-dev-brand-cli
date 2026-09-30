'use client';

import { TRUST_MARK_DOT_RADIUS, TRUST_MARK_PITCH, TRUST_MARK_RING_STROKE, TRUST_MARK_ROWS, type TrustMarkId } from '@/components/ds/ui/trust-marks';
import { glyphCellsFromRows, type GlyphCell } from '@/components/ds/ui/dot-glyph-cells';
import { dotsPath } from '@/components/ds/ui/dot-svg-path';
import { useHoverDotMorph, type LoadDotMorph } from '@/components/ds/ui/use-hover-dot-morph';
import { cx as cn } from '@/components/ds/ui/cx';
import { useCallback, useRef } from 'react';

const centresOf = (dots: GlyphCell[]) => dots.map((dot) => ({ cx: (dot.column + 0.5) * TRUST_MARK_PITCH, cy: (dot.row + 0.5) * TRUST_MARK_PITCH }));

/** A trust card's dot mark, which morphs while its card is hovered. */
export function TrustMark({ mark }: { mark: TrustMarkId }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const load = useCallback<LoadDotMorph>(
		async (canvas, onPlayingChange) => {
			const { createTrustMarkMorph } = await import('@/components/ds/ui/trust-mark-morph');
			return createTrustMarkMorph({ canvas, mark, dotColor: getComputedStyle(canvas).color, onPlayingChange });
		},
		[mark]
	);
	const isMorphing = useHoverDotMorph(canvasRef, load);

	const rows = TRUST_MARK_ROWS[mark];
	const size = rows.length * TRUST_MARK_PITCH;
	const dots = glyphCellsFromRows(rows);

	return (
		<div aria-hidden="true" className="relative size-[4.6875rem] text-brand">
			<svg viewBox={`0 0 ${size} ${size}`} className={cn('size-full', isMorphing && 'invisible')}>
				<path fill="none" stroke="currentColor" strokeWidth={TRUST_MARK_RING_STROKE} d={dotsPath(centresOf(dots.filter((dot) => !dot.filled)), TRUST_MARK_DOT_RADIUS - TRUST_MARK_RING_STROKE / 2)} />
				<path fill="currentColor" d={dotsPath(centresOf(dots.filter((dot) => dot.filled)), TRUST_MARK_DOT_RADIUS)} />
			</svg>
			<canvas ref={canvasRef} className={cn('absolute inset-0 size-full', !isMorphing && 'invisible')} />
		</div>
	);
}

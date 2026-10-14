import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export const GLYPH_PITCH = 3.2;
export const GLYPH_DOT_RADIUS = 1.25;
const GLYPH_RING_STROKE = 0.55;

/** The credits gem, beside the credits left in the top bar and on plan cards. */
export const GEM_GLYPH = ['..2..', '.222.', '22222', '.222.', '..2..'] as const;

const MOTION = { none: '', sweep: 'ds-glyph-sweep', pop: 'ds-glyph-pop' } as const;

export type AppDotGlyphProps = {
	/** One string per row: 2 is a solid dot, 1 a hollow ring, anything else an empty cell. */
	rows: readonly string[];
	/** none: still. sweep: each dot swells in turn while the glyph's parent is hovered or focused. pop: dots pop in once, then pulse softly. */
	motion?: keyof typeof MOTION;
	/** The delay between diagonals for sweep and pop, in ms. 40 suits a 5 by 5 glyph. */
	dotStaggerMs?: number;
	className?: string;
	children?: ReactNode;
};

/**
 * An icon drawn on a small square grid of dots, in the brand's dot language. Each dot carries --dot-delay, growing along
 * the diagonal from the top left, so the motion sweeps corner to corner. Children draw on the same grid, above the dots.
 */
export function AppDotGlyph({ rows, motion = 'none', dotStaggerMs = 40, className, children }: AppDotGlyphProps) {
	const size = rows.length * GLYPH_PITCH;
	return (
		<svg aria-hidden="true" viewBox={`0 0 ${size} ${size}`} className={cx('text-accent', MOTION[motion], className)}>
			{rows.flatMap((row, y) =>
				[...row].map((cell, x) => {
					if (cell !== '1' && cell !== '2') return null;
					const isSolid = cell === '2';
					return (
						<circle
							key={`${x}:${y}`}
							cx={(x + 0.5) * GLYPH_PITCH}
							cy={(y + 0.5) * GLYPH_PITCH}
							r={isSolid ? GLYPH_DOT_RADIUS : GLYPH_DOT_RADIUS - GLYPH_RING_STROKE / 2}
							fill={isSolid ? 'currentColor' : 'none'}
							stroke={isSolid ? 'none' : 'currentColor'}
							strokeWidth={GLYPH_RING_STROKE}
							style={{ '--dot-delay': `${(x + y) * dotStaggerMs}ms` } as CSSProperties}
						/>
					);
				}),
			)}
			{children}
		</svg>
	);
}

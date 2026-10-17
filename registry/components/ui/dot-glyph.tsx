import type { CSSProperties, ReactNode } from "react";

export const GLYPH_PITCH = 3.2;
export const GLYPH_DOT_RADIUS = 1.25;
const GLYPH_RING_STROKE = 0.55;

/**
 * An icon drawn on a small square grid of dots, the brand's dot language. Each row is a string: 2 is a solid dot,
 * 1 a hollow ring, anything else an empty cell. Each dot carries --dot-delay, growing along the diagonal from the top
 * left, for animations that sweep across the glyph. Children draw on the same grid, above the dots.
 */
export function DotGlyph({ rows, className, dotStaggerMs = 0, children }: { rows: readonly string[]; className?: string; dotStaggerMs?: number; children?: ReactNode }) {
  const size = rows.length * GLYPH_PITCH;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${size} ${size}`} data-slot="dot-glyph" className={className}>
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => {
          if (cell !== "1" && cell !== "2") return null;
          const solid = cell === "2";
          return (
            <circle
              key={`${x}:${y}`}
              cx={(x + 0.5) * GLYPH_PITCH}
              cy={(y + 0.5) * GLYPH_PITCH}
              r={solid ? GLYPH_DOT_RADIUS : GLYPH_DOT_RADIUS - GLYPH_RING_STROKE / 2}
              fill={solid ? "currentColor" : "none"}
              stroke={solid ? "none" : "currentColor"}
              strokeWidth={GLYPH_RING_STROKE}
              style={{ "--dot-delay": `${(x + y) * dotStaggerMs}ms` } as CSSProperties}
            />
          );
        }),
      )}
      {children}
    </svg>
  );
}

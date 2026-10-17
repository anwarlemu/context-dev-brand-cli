import { GLYPH_GRID, glyphSubject, type GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { GlyphLoop } from "@/components/visuals/glyph/glyph-loop";
import { GlyphStory } from "@/components/visuals/glyph/glyph-story";
import { SURFACE_COLOR } from "@/components/visuals/glyph/surface-color";
import { cn } from "@/lib/utils";

type GlyphTileProps = {
  name: GlyphPairName;
  className?: string;
  /** The large, featured glyph: fine brand-blue dots on the page instead of a small bordered tile. */
  ringed?: boolean;
  /** How far into its loop this tile starts, so neighbors don't change in step. */
  startsAtSeconds?: number;
  /** Holds the pair's first picture instead of looping between the two. */
  still?: boolean;
};

/**
 * A page's glyph as the dashboard's cards show it. Small, it is a brand-blue glyph in a plain bordered square that
 * loops between what the page is about and what it gives you; `ringed`, it is drawn large in the fine dot pattern.
 */
export function GlyphTile({ name, className, ringed = false, startsAtSeconds, still = false }: GlyphTileProps) {
  // The large, featured glyph is drawn like the Browse APIs and Upgrade plan cards: fine brand-blue dots on the page.
  if (ringed) return <GlyphStory name={name} still={still} className={cn("shrink-0 text-brand", className)} />;
  // A small brand-blue glyph in a plain bordered square, like the chart cards' icons.
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-control border border-line bg-surface", className)}>
      {still ? (
        <StillGlyph name={name} className="w-full text-brand" />
      ) : (
        <GlyphLoop name={name} surfaceColor={SURFACE_COLOR} startsAtSeconds={startsAtSeconds} className="w-full text-brand" />
      )}
    </span>
  );
}

// Drawn small, the usual dots leave more gap than ink and a glyph reads faded; dense ones nearly touch, so a 20px icon
// keeps its weight and one-dot lines (a key's shaft, a trend line) stay joined up.
const DENSE_DOT_RADIUS = 4.7;

/** A glyph's first picture as a still SVG, in the current text color. */
export function StillGlyph({
  name,
  className = "w-full text-white",
  dense = false,
}: {
  name: GlyphPairName;
  className?: string;
  /** Bigger dots for icon sizes, where the default spacing looks thin. */
  dense?: boolean;
}) {
  const { columns, rows, pitch, ringStroke } = GLYPH_GRID;
  const dotRadius = dense ? DENSE_DOT_RADIUS : GLYPH_GRID.dotRadius;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${columns * pitch} ${rows * pitch}`} className={className}>
      {glyphSubject(name).map(({ column, row, filled }) => (
        <circle
          key={`${column}:${row}`}
          cx={(column + 0.5) * pitch}
          cy={(row + 0.5) * pitch}
          r={filled ? dotRadius : dotRadius - ringStroke / 2}
          fill={filled ? "currentColor" : "none"}
          stroke={filled ? "none" : "currentColor"}
          strokeWidth={ringStroke}
        />
      ))}
    </svg>
  );
}

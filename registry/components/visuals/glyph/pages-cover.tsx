"use client";

import { useCallback, useRef } from "react";
import { PAGES_COVER_MASK } from "@/components/visuals/glyph/pages-cover-art";
import { resolveColor, SURFACE_COLOR } from "@/components/visuals/glyph/surface-color";
import { type LoadDotMorph, useHoverDotMorph } from "@/components/visuals/glyph/use-hover-dot-morph";
import { useResolvedTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// The cover is drawn on an 800 x 600 page but its pictures only use the middle: the three pages at rest and the one big
// page they bind into both sit inside this box. Cropping to it lets the dots be drawn about twice as large.
const COVER = { width: 800, height: 600 };
const CROP = { left: 60, top: 80, width: 680, height: 440 };
const percent = (value: number) => `${value * 100}%`;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ART_BOX = {
  left: percent(-CROP.left / CROP.width),
  top: percent(-CROP.top / CROP.height),
  width: percent(COVER.width / CROP.width),
  height: percent(COVER.height / CROP.height),
};

// The big page the three bind into, in cover units: labels sit just off its sides once it has formed.
const BIG_PAGE = { left: 245, right: 555 };
const LABEL_GAP_PX = 8;
const cropX = (x: number) => (x - CROP.left) / CROP.width;
const cropY = (y: number) => (y - CROP.top) / CROP.height;

export type PagesCoverLabel = { text: string; side: "left" | "right"; /** Height on the 800 x 600 cover. */ y: number };

// What feeds the page on its left, and what it hands back on its right.
const DEFAULT_LABELS: PagesCoverLabel[] = [
  { text: "API", side: "left", y: 230 },
  { text: "SCRAPE", side: "left", y: 370 },
  { text: "JSON", side: "right", y: 300 },
];
// Labels arrive over the end of the bind, once the big page stands on its own, and leave as soon as it breaks up.
const LABELS_FROM = 0.6;

/**
 * The website's "pages" blog cover in the brand blue: three pages that gather and bind into one big page, as its blog
 * card does, while the nearest link, button or `data-hover-morph` is in view or hovered, with what goes in and what
 * comes out labeled either side of the big page. At rest, and with reduced motion, it is the art alone.
 */
export function PagesCover({
  labels = DEFAULT_LABELS,
  surfaceColor = SURFACE_COLOR,
  className,
}: {
  labels?: PagesCoverLabel[];
  surfaceColor?: string;
  className?: string;
}) {
  const theme = useResolvedTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLSpanElement>(null);
  const load = useCallback<LoadDotMorph>(
    async (canvas, onPlayingChange) => {
      const { createPagesCoverMorph } = await import("@/components/visuals/glyph/cover-morph-engine");
      // Written straight to the style every frame, so the labels follow the morph without re-rendering.
      const onFrame = ({ morph }: { morph: number }) =>
        labelsRef.current?.style.setProperty("--labels-in", String(clamp01((morph - LABELS_FROM) / (1 - LABELS_FROM))));
      return createPagesCoverMorph({
        canvas,
        palette: { dots: getComputedStyle(canvas).color, background: resolveColor(canvas, surfaceColor) },
        onPlayingChange,
        onFrame,
      });
    },
    // `theme` reloads the morph so it repaints in the new surface color.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [surfaceColor, theme],
  );
  const isPlaying = useHoverDotMorph(canvasRef, load, { playOnView: true });

  return (
    <span aria-hidden="true" className={cn("relative block text-brand", className)} style={{ aspectRatio: `${CROP.width} / ${CROP.height}` }}>
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute" style={ART_BOX}>
          <span className={cn("absolute inset-0 bg-current", isPlaying && "invisible")} style={{ mask: PAGES_COVER_MASK, WebkitMask: PAGES_COVER_MASK }} />
          <canvas ref={canvasRef} className={cn("absolute inset-0 h-full w-full", !isPlaying && "invisible")} />
        </span>
      </span>
      <span ref={labelsRef} className="absolute inset-0 [--labels-in:0]">
        {labels.map(({ text, side, y }) => (
          <span
            key={text}
            className="absolute font-data text-axis leading-none font-medium whitespace-nowrap"
            style={{
              top: percent(cropY(y)),
              ...(side === "left"
                ? { right: percent(1 - cropX(BIG_PAGE.left)), marginRight: LABEL_GAP_PX }
                : { left: percent(cropX(BIG_PAGE.right)), marginLeft: LABEL_GAP_PX }),
              opacity: "var(--labels-in)",
              // Each drifts in toward the page as it appears.
              transform: `translate(calc((1 - var(--labels-in)) * ${side === "left" ? -6 : 6}px), -50%)`,
            }}
          >
            {text}
          </span>
        ))}
      </span>
    </span>
  );
}

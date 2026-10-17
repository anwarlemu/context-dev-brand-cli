"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  DOT_SHADER_SURFACES,
  type DotShaderSurface,
  type DotStates,
  dotLayers,
  SHADER_BACKDROP_PATH,
  SHADER_BACKDROP_RING_STROKE,
  SHADER_DOT_RADIUS,
  SHADER_HALO_RADIUS,
  SHADER_HEIGHT,
  SHADER_PITCH,
  SHADER_RING_STROKE,
  SHADER_WIDTH,
  shadeImageSrc,
} from "@/components/visuals/image-dot-shader";

/**
 * An image drawn by the brand dot shader: every subject built from hollow and solid circles over a faint ring backdrop,
 * on white (brand blue dots), blue or black (white dots). The image is shaded in the browser; until it is (or if it
 * cannot be read) the surface and its rings rest on their own, and the dots fade in once, without motion under reduced
 * motion. Pass `states` instead of `src` to draw dots shaded elsewhere. Colors are brand tokens, so a theme applies.
 */
export function DotShaderImage({
  src,
  states: givenStates,
  surface = "blue",
  size,
  alt,
  className,
}: {
  /** The image to shade. A remote one must allow CORS. A PNG with a transparent background works best. */
  src?: string;
  /** Dot states shaded elsewhere (`shadeImage`, `parseShadedDots`); used instead of `src`. */
  states?: DotStates | null;
  surface?: DotShaderSurface;
  /** Width in pixels (the picture is 4:3). Leave it out to fill the width of the parent. */
  size?: number;
  /** What the picture shows. Without it the picture is decorative. */
  alt?: string;
  className?: string;
}) {
  const [shaded, setShaded] = React.useState<{ src: string; states: DotStates } | null>(null);
  const maskId = `dot-shader-${React.useId().replace(/[^a-zA-Z0-9-]/g, "")}`;

  React.useEffect(() => {
    if (givenStates !== undefined || !src) return;
    let current = true;
    shadeImageSrc(src)
      .then((states) => current && setShaded({ src, states }))
      .catch(() => current && setShaded(null));
    return () => {
      current = false;
    };
  }, [src, givenStates]);

  const states = givenStates !== undefined ? givenStates : shaded && shaded.src === src ? shaded.states : null;
  const layers = React.useMemo(() => (states ? dotLayers(states) : null), [states]);
  const palette = DOT_SHADER_SURFACES[surface];
  const dash = `0 ${SHADER_PITCH}`;

  return (
    <svg
      data-slot="dot-shader-image"
      viewBox={`0 0 ${SHADER_WIDTH} ${SHADER_HEIGHT}`}
      width={size}
      height={size ? (size * SHADER_HEIGHT) / SHADER_WIDTH : undefined}
      fill="none"
      strokeLinecap="round"
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("block h-auto max-w-full", !size && "w-full", className)}
      style={{ stroke: palette.dots }}
    >
      <rect width={SHADER_WIDTH} height={SHADER_HEIGHT} stroke="none" style={{ fill: palette.background }} />
      <path strokeWidth={SHADER_BACKDROP_RING_STROKE} strokeOpacity={palette.ringOpacity} d={SHADER_BACKDROP_PATH} />
      {/* The dots appear once, after the image is shaded: a short fade so they do not pop in over the resting rings. */}
      <g className={cn("transition-opacity duration-200 ease-out motion-reduce:transition-none", layers ? "opacity-100" : "opacity-0")}>
        {layers && (
          <>
            <path strokeWidth={SHADER_HALO_RADIUS * 2} d={layers.halo} style={{ stroke: palette.background }} />
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={SHADER_WIDTH} height={SHADER_HEIGHT}>
                <rect width={SHADER_WIDTH} height={SHADER_HEIGHT} stroke="none" style={{ fill: "var(--ds-color-white)" }} />
                <path strokeDasharray={dash} strokeWidth={(SHADER_DOT_RADIUS - SHADER_RING_STROKE) * 2} d={layers.hollow} style={{ stroke: "var(--ds-color-black)" }} />
              </mask>
            </defs>
            <path strokeWidth={SHADER_DOT_RADIUS * 2} strokeDasharray={dash} d={layers.filled} />
            <path strokeWidth={SHADER_DOT_RADIUS * 2} strokeDasharray={dash} d={layers.hollow} mask={`url(#${maskId})`} />
          </>
        )}
      </g>
    </svg>
  );
}

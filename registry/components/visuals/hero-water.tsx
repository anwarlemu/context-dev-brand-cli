"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { createHeroWater } from "./hero-water-renderer";

// Phones, short touch screens and reduced motion get the still water only: the shader costs too much there, or moves
// when it should not.
const STATIC_QUERY = "(prefers-reduced-motion: reduce), (max-width: 47.99rem), (pointer: coarse) and (max-height: 47.99rem)";

// The still water under the shader, and its stand-in wherever the shader does not run: deep brand blue at the foot with
// lighter swells, drawn from the brand blues.
const STILL_WATER = [
  "radial-gradient(70% 45% at 22% 100%, color-mix(in srgb, var(--ds-color-blue-40) 70%, transparent), transparent 70%)",
  "radial-gradient(55% 40% at 78% 92%, color-mix(in srgb, var(--ds-color-blue-60) 80%, transparent), transparent 70%)",
  "radial-gradient(90% 30% at 50% 62%, color-mix(in srgb, var(--ds-color-blue-40) 60%, transparent), transparent 75%)",
  "linear-gradient(180deg, var(--ds-color-blue-60) 40%, var(--ds-color-blue-90) 75%, var(--ds-color-brand) 100%)",
].join(", ");

// The hero's sky: white at the top fading through the pale blues into the water, which shows through below.
const SKY =
  "linear-gradient(180deg, var(--ds-color-white) 0%, var(--ds-color-blue-10) 21.87%, var(--ds-color-blue-20) 55%, color-mix(in srgb, var(--ds-color-blue-40) 85%, transparent) 72%, color-mix(in srgb, var(--ds-color-blue-60) 40%, transparent) 85%, transparent 100%)";

// The halftone look prints the still water as a dot screen.
const HALFTONE_MASK = "radial-gradient(circle, var(--ds-color-black) 2.2px, transparent 2.8px)";

/**
 * The hero's water backdrop: a WebGL water surface under a white-to-blue sky, rippling on its own and in the pointer's
 * wake (a click drops a stone). `halftone` prints it as a dot screen. Where WebGL is unavailable, on small or touch
 * screens, or under reduced motion, a still picture of the water shows instead. It fills its parent, never takes
 * pointer events, and stops drawing off screen.
 */
export function HeroWater({ halftone = false, className }: { halftone?: boolean; className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const layer = canvas?.parentElement;
    const surface = layer?.closest<HTMLElement>("[data-slot='hero'], section") ?? layer;
    if (!canvas || !surface) return;

    const staticQuery = window.matchMedia(STATIC_QUERY);
    let dispose: (() => void) | undefined;
    const sync = () => {
      dispose?.();
      dispose = undefined;
      if (!staticQuery.matches) dispose = createHeroWater(canvas, surface, undefined, halftone ? "halftone" : "water");
    };

    sync();
    staticQuery.addEventListener("change", sync);
    return () => {
      staticQuery.removeEventListener("change", sync);
      dispose?.();
    };
  }, [halftone]);

  return (
    <div aria-hidden="true" data-slot="hero-water" className={cn("pointer-events-none absolute inset-0 overflow-hidden", halftone ? "bg-blue-20" : "bg-blue-80", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: STILL_WATER,
          ...(halftone ? { maskImage: HALFTONE_MASK, WebkitMaskImage: HALFTONE_MASK, maskSize: "7px 7px", WebkitMaskSize: "7px 7px" } : {}),
        }}
      />
      {/* The renderer sets its opacity once the first frame is drawn, so it fades in over the still water. */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 ease-out motion-reduce:hidden max-md:hidden" />
      <div className="absolute inset-0" style={{ backgroundImage: SKY }} />
    </div>
  );
}

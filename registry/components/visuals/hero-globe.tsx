"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { GLOBE_PATH, HERO_GLOBE_RISE_CLASS, NODES, RADIUS, TRACE_SHAPES, VIEWBOX_SIZE, WIDTH } from "./hero-globe-geometry";

export { HERO_GLOBE_RISE_CLASS };

const TRACE_CYCLE_MS = 4800;
const TRACE_STAGGER_MS = 900;
// Head position along the trace, from its start node (0) to its end node (1); the comet's tail trails this far behind.
const COMET_TAIL = 0.45;
const COMET_EXIT = 1 + COMET_TAIL;
const COMET_TRAVEL_SHARE = 0.4;
// When the head reaches the end node (1 of COMET_EXIT) within the eased travel: the end node pulses from here.
const ARRIVAL_SHARE = 0.25;
// The comet's travel: an ease-out spline, fast off its node and settling into the next.
const EASE_OUT = "0.45 0 0.25 1";

/**
 * A hairline wireframe globe rising from the bottom of the hero; the hero's edge cuts it to a dome. Comets run along
 * its grid lines from node to node and the node they reach pulses. It draws in `currentColor`, pauses off screen, and
 * holds a still frame (the grid and its traces) under reduced motion.
 */
export function HeroGlobe({ className }: { className?: string }) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const id = React.useId().replace(/:/g, "");

  // SMIL keeps ticking (and repainting) whether or not anyone can see it, so the SVG pauses while off screen.
  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    const sync = () => {
      if (onScreen && !reducedMotion.matches) svg.unpauseAnimations();
      else svg.pauseAnimations();
    };
    sync();
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(svg);
    reducedMotion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div aria-hidden="true" data-slot="hero-globe" className={cn("pointer-events-none absolute inset-0 overflow-hidden text-brand", HERO_GLOBE_RISE_CLASS, className)}>
      <svg
        ref={svgRef}
        viewBox={`${-RADIUS - 1} ${-RADIUS - 1} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        style={{ width: WIDTH }}
        className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-(--hero-globe-rise)"
      >
        <circle r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.35} vectorEffect="non-scaling-stroke" />
        <path d={GLOBE_PATH} fill="none" stroke="currentColor" strokeOpacity={0.2} vectorEffect="non-scaling-stroke" />
        <defs>
          {TRACE_SHAPES.map(({ from, to }, index) => (
            <linearGradient key={`base-${index}`} id={`${id}-trace-${index}`} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
            </linearGradient>
          ))}
          {TRACE_SHAPES.map(({ from, to }, index) => {
            const timing = {
              dur: `${TRACE_CYCLE_MS}ms`,
              begin: `${index * TRACE_STAGGER_MS}ms`,
              repeatCount: "indefinite",
              calcMode: "spline",
              keyTimes: `0;${COMET_TRAVEL_SHARE};1`,
              keySplines: `${EASE_OUT};0 0 1 1`,
            };
            return (
              <linearGradient key={`comet-${index}`} id={`${id}-comet-${index}`} gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                <stop offset="0" stopColor="currentColor" stopOpacity="0">
                  <animate attributeName="offset" values={`${-COMET_TAIL};1;1`} {...timing} />
                </stop>
                <stop offset="0" stopColor="currentColor" stopOpacity="1">
                  <animate attributeName="offset" values={`0;${COMET_EXIT};${COMET_EXIT}`} {...timing} />
                </stop>
                <stop offset="0" stopColor="currentColor" stopOpacity="0">
                  <animate attributeName="offset" values={`0;${COMET_EXIT};${COMET_EXIT}`} {...timing} />
                </stop>
              </linearGradient>
            );
          })}
        </defs>
        {TRACE_SHAPES.map(({ path }, index) => (
          <path key={`base-${index}`} d={path} fill="none" stroke={`url(#${id}-trace-${index})`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        <g>
          {TRACE_SHAPES.map(({ path }, index) => (
            <path key={`comet-${index}`} d={path} fill="none" stroke={`url(#${id}-comet-${index})`} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ))}
          {TRACE_SHAPES.map(({ to }, index) => {
            const timing = {
              dur: `${TRACE_CYCLE_MS}ms`,
              begin: `${index * TRACE_STAGGER_MS}ms`,
              repeatCount: "indefinite",
              keyTimes: `0;${ARRIVAL_SHARE};${ARRIVAL_SHARE + 0.18};1`,
            };
            return (
              <circle key={`pulse-${index}`} cx={to.x} cy={to.y} r={0.45} fill="none" stroke="currentColor" strokeWidth={1} strokeOpacity={0} vectorEffect="non-scaling-stroke">
                <animate attributeName="r" values="0.45;0.45;2.6;2.6" {...timing} />
                <animate attributeName="stroke-opacity" values="0;0.9;0;0" {...timing} />
              </circle>
            );
          })}
        </g>
        {NODES.map((node, index) => (
          <circle key={index} cx={node.x} cy={node.y} r={0.45} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

import type * as React from "react";

import { cn } from "@/lib/utils";

import { type GridPoint, HERO_GLOBE_RISE_CLASS, heroGlobePointPlacement } from "./hero-globe-geometry";

type Side = "left" | "right";
type Tier = "upper" | "lower";

export interface HeroGlobeStat {
  value: string;
  label: string;
  side: Side;
  /** `upper` stands level with the demo, beside it; `lower` sits below it, near the hero's foot. */
  tier: Tier;
  /** The globe node its hairline runs to. */
  node: GridPoint;
}

const DEFAULT_STATS: HeroGlobeStat[] = [
  { value: "76.0%", label: "WebCode groundedness, highest of six tools", side: "left", tier: "upper", node: { latitude: 60, longitude: -45 } },
  { value: "68%", label: "Fewer tokens than Zilliz, at higher accuracy", side: "left", tier: "lower", node: { latitude: 50, longitude: -45 } },
  { value: "99.9%", label: "Uptime SLA on Enterprise", side: "right", tier: "upper", node: { latitude: 60, longitude: 45 } },
  { value: "1,000", label: "Free credits every month", side: "right", tier: "lower", node: { latitude: 50, longitude: 45 } },
];

// How far the frame's inner verticals sit in from the screen edge (the ruled column is min(85vw, column-wide) on wide
// screens), and how much further out its outer verticals sit.
const FRAME_GEOMETRY_CLASS =
  "[--hero-frame-gutter:calc((100vw_-_min(85vw,var(--ds-layout-column-wide)))_/_2)] [--hero-frame-chamfer:clamp(1.5rem,var(--hero-frame-gutter)_-_1rem,5rem)]";

const WINDOW_WIDTH = "13rem";
// The upper windows stand level with the demo card, so they keep clear of its half-width (28.125rem) by a gap.
const UPPER_INNER_EDGE = "30.125rem";
const UPPER_FOOT = "11rem";
const LOWER_FOOT = "0.75rem";
// The lower windows sit below the demo card, so they can straddle the frame's outer verticals.
const LOWER_INSET = `max(1rem, var(--hero-frame-gutter) - var(--hero-frame-chamfer) - ${WINDOW_WIDTH} / 2)`;
const RING_RADIUS = "0.3125rem";
const RISER_HEIGHT = "1.25rem";

function fromSide(side: Side, value: string): React.CSSProperties {
  return side === "left" ? { left: value } : { right: value };
}

function windowPlacement({ side, tier }: HeroGlobeStat): React.CSSProperties {
  const inset = tier === "upper" ? `calc(50% - ${UPPER_INNER_EDGE} - ${WINDOW_WIDTH})` : LOWER_INSET;
  return { ...fromSide(side, inset), bottom: tier === "upper" ? UPPER_FOOT : LOWER_FOOT };
}

function Leader({ stat }: { stat: HeroGlobeStat }) {
  const { fromCenter, fromFoot } = heroGlobePointPlacement(stat.node);
  const ringTop = `(${fromFoot} + ${RING_RADIUS} - 1px)`;
  const elbow = `(${ringTop} + ${RISER_HEIGHT})`;
  const ring = (
    <>
      <span
        className="absolute size-2.5 rounded-full border border-current"
        style={{ ...fromSide(stat.side, `calc(50% - ${fromCenter} - ${RING_RADIUS})`), bottom: `calc(${fromFoot} - ${RING_RADIUS})` }}
      />
      <span className="absolute w-px bg-current/50" style={{ ...fromSide(stat.side, `calc(50% - ${fromCenter} - 0.5px)`), bottom: `calc${ringTop}`, height: RISER_HEIGHT }} />
    </>
  );

  if (stat.tier === "lower") {
    const windowEdge = `(${LOWER_INSET} + ${WINDOW_WIDTH})`;
    return (
      <>
        <span
          className="absolute h-px bg-current/50"
          style={{ ...fromSide(stat.side, `calc${windowEdge}`), width: `calc(50% - ${fromCenter} - ${windowEdge} + 0.5px)`, bottom: `calc${elbow}` }}
        />
        {ring}
      </>
    );
  }

  const anchorFromCenter = `(${UPPER_INNER_EDGE} + ${WINDOW_WIDTH} / 2)`;
  return (
    <>
      <span
        className={cn("absolute border-b border-current/50", stat.side === "left" ? "border-l" : "border-r")}
        style={{
          ...fromSide(stat.side, `calc(50% - ${anchorFromCenter})`),
          width: `calc(${anchorFromCenter} - ${fromCenter} + 0.5px)`,
          bottom: `calc${elbow}`,
          height: `calc(${UPPER_FOOT} - ${elbow})`,
        }}
      />
      {ring}
    </>
  );
}

/**
 * Four stat windows flanking the globe's crown, each wired to a node on the globe by an elbowed hairline. Shown only on
 * screens 90rem and wider, where they clear a centered demo. The lines take `currentColor`.
 */
export function HeroGlobeStats({ stats = DEFAULT_STATS, label = "Context.dev in numbers", className }: { stats?: HeroGlobeStat[]; label?: string; className?: string }) {
  return (
    <div
      data-slot="hero-globe-stats"
      className={cn("pointer-events-none absolute inset-0 hidden overflow-hidden text-brand min-[90rem]:block", HERO_GLOBE_RISE_CLASS, FRAME_GEOMETRY_CLASS, className)}
    >
      <div aria-hidden="true">
        {stats.map((stat) => (
          <Leader key={stat.value} stat={stat} />
        ))}
      </div>
      <ul aria-label={label}>
        {stats.map((stat) => (
          <li key={stat.value} className="absolute" style={{ ...windowPlacement(stat), width: WINDOW_WIDTH }}>
            <div className="flex flex-col items-center gap-2 rounded-card bg-surface p-3.5 text-center text-fg-brand shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]">
              <span className="font-data text-h2 leading-none font-medium tabular-nums">{stat.value}</span>
              <span className="text-body-sm text-fg-muted">{stat.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

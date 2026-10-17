import * as React from "react";

import { UseCaseDemoFrame, UseCaseIconChip } from "@/components/site/use-case-features";
import { cn } from "@/lib/utils";

// The use case pages' "who this is for": a card per persona, two across, each with its glyph (or icon tile), the persona
// and its role, then either the challenge, solution and impact as a short list, or a dot story in a demo window with
// the description of whichever part the story is playing written beneath the picture. Each card hands its two rows to
// the list's grid, so the windows start level across a row however long the roles above them run.

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-6 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";
const SUBGRID = "md:row-span-2 md:grid md:grid-rows-subgrid";

export type PersonaPhase = "challenge" | "solution" | "impact";
const PHASES: { key: PersonaPhase; label: string }[] = [
  { key: "challenge", label: "Challenge" },
  { key: "solution", label: "Solution" },
  { key: "impact", label: "Impact" },
];

export type UseCasePersona = {
  type: string;
  role: string;
  challenge: React.ReactNode;
  solution: React.ReactNode;
  impact: React.ReactNode;
  /** A line icon on the blue tile, when there is no glyph. */
  icon?: React.ReactNode;
  /** The persona's dot glyph. */
  glyph?: React.ReactNode;
  /** A dot story that plays the challenge, solution and impact; its phase picks the description shown under it. */
  story?: React.ReactNode;
  /** The part the story is playing (the story reports it). It rests on the impact, what the resting picture shows. */
  phase?: PersonaPhase;
};

/**
 * A persona's story in its demo window, the description of the part it is playing beneath. All three share one grid
 * cell, so the window is as tall as the longest and never jumps; the hidden two stay readable to screen readers.
 */
function PersonaStoryWindow({ story, descriptions, phase = "impact" }: { story: React.ReactNode; descriptions: Record<PersonaPhase, React.ReactNode>; phase?: PersonaPhase }) {
  return (
    <div className="flex flex-col">
      <UseCaseDemoFrame
        footer={
          <div className="grid flex-1 items-center px-5 py-5 sm:px-6 sm:py-6">
            {PHASES.map(({ key, label }) => (
              <div key={key} className={cn("col-start-1 row-start-1 flex gap-4 transition-opacity duration-300 ease-out motion-reduce:transition-none", key === phase ? "opacity-100" : "opacity-0")}>
                {/* The glass rule that frames the brand's white cards, as on the blog's quotes. */}
                <span aria-hidden="true" className="w-2 shrink-0 rounded-card bg-brand/10 ring-1 ring-brand/12 ring-inset" />
                <div className="flex flex-col gap-1.5">
                  <p className={cn("text-body-sm leading-snug font-medium", key === "impact" ? "text-fg-brand" : "text-fg")}>{label}</p>
                  <p className={cn("text-body leading-snug", key === "impact" ? "text-fg" : "text-fg-secondary")}>{descriptions[key]}</p>
                </div>
              </div>
            ))}
          </div>
        }
      >
        {story}
      </UseCaseDemoFrame>
    </div>
  );
}

function UseCasePersonas({ items, className }: { items: readonly UseCasePersona[]; className?: string }) {
  return (
    <ul data-slot="use-case-personas" className={cn("grid grid-cols-1 gap-6 md:grid-cols-2", className)}>
      {items.map((persona) => (
        <li key={persona.type} className={cn(RING, SUBGRID)}>
          <div className={cn(CARD, SUBGRID, "md:gap-6")}>
            <div className="flex items-center gap-4">
              {persona.glyph ?? (persona.icon && <UseCaseIconChip>{persona.icon}</UseCaseIconChip>)}
              <div className="min-w-0">
                <h3 className="text-h5 leading-snug font-normal tracking-normal text-fg">{persona.type}</h3>
                <p className="mt-1 text-body-sm leading-snug text-fg-subtle">{persona.role}</p>
              </div>
            </div>
            {persona.story ? (
              <PersonaStoryWindow story={persona.story} phase={persona.phase} descriptions={{ challenge: persona.challenge, solution: persona.solution, impact: persona.impact }} />
            ) : (
              <dl className="flex flex-col gap-5">
                {PHASES.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <dt className={cn("text-body-sm leading-snug font-medium", key === "impact" ? "text-fg-brand" : "text-fg")}>{label}</dt>
                    <dd className={cn("text-body leading-snug", key === "impact" ? "text-fg" : "text-fg-secondary")}>{persona[key]}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export { UseCasePersonas, PersonaStoryWindow };

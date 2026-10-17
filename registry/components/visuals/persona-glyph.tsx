"use client";

import { useCallback, useMemo } from "react";

import { DotStory, type LoadDotStory } from "@/components/visuals/dot-engine/dot-story";
import { PERSONA_GLYPH_GRID, personaGlyph, type PersonaGlyphName } from "@/components/visuals/stories/persona-glyphs";
import { cn } from "@/lib/utils";

// Cards join the loop this far apart, so neighbors never melt at the same moment.
const STAGGER_SECONDS = 0.85;

/**
 * A small picture in white dots on the brand's blue: a glyph for what a team builds or a product does, giving way to
 * one for what the API gives it and back. The site uses it for menu icons, persona cards and use-case links; pass
 * each one's place in its list as `index` so a row of them never changes in step. `still` keeps the glyph. With
 * reduced motion it shows the glyph.
 */
function PersonaGlyph({ name, index = 0, still = false, className }: { name: PersonaGlyphName; index?: number; still?: boolean; className?: string }) {
  const resting = useMemo(() => ({ cells: personaGlyph(name) }), [name]);
  const load = useCallback<LoadDotStory>(
    async (stage) => {
      const { createPersonaGlyphPlayer } = await import("@/components/visuals/persona-glyph-player");
      return createPersonaGlyphPlayer(stage, name, index * STAGGER_SECONDS);
    },
    [name, index],
  );
  return (
    <span data-slot="persona-glyph" className={cn("flex size-14 shrink-0 items-center justify-center rounded-card bg-brand p-2", className)}>
      <DotStory grid={PERSONA_GLYPH_GRID} resting={resting} load={load} still={still} className="w-full text-white" />
    </span>
  );
}

/**
 * The header menus' icon: a persona glyph in a 36px blue tile, as the site's Products and Use cases menus draw them.
 * Held still: an icon in a menu should not move while the pointer is over it.
 */
function MenuGlyph({ name, className }: { name: PersonaGlyphName; className?: string }) {
  return <PersonaGlyph name={name} still className={cn("size-9 rounded-control p-2.5", className)} />;
}

export { MenuGlyph, PersonaGlyph, type PersonaGlyphName };

"use client";

import { useEffect, useRef, useState } from "react";
import type { GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { StillGlyph } from "@/components/visuals/glyph/glyph-tile";
import { cn } from "@/lib/utils";

const STEP_MS = 1100;

export type ApiGridItem = { title: string; glyph: GlyphPairName };

/** The dashboard's Data APIs, in their playground order. */
export const DATA_APIS: ApiGridItem[] = [
  { title: "Scrape Anything", glyph: "scrape" },
  { title: "Map URLs", glyph: "map" },
  { title: "Crawl Website", glyph: "crawl" },
  { title: "Search Web", glyph: "search" },
  { title: "Answers", glyph: "answers" },
  { title: "Brand Retrieval", glyph: "retrieve" },
  { title: "Search Brands", glyph: "brandSearch" },
  { title: "Extract Styleguide", glyph: "styleguide" },
  { title: "Enrich Person", glyph: "peopleEnrich" },
  { title: "Search News", glyph: "newsSearch" },
  { title: "NAICS Lookup", glyph: "naics" },
  { title: "Parse File", glyph: "parse" },
];

/**
 * The Browse APIs card's picture: every API as a small dot tile in one grid, with a highlight that hops between them
 * the way a pick moves through a menu, so the card reads as a choice of many rather than a single thing. The hop runs
 * only while on screen, and holds on the first tile with reduced motion.
 */
export function ApiGridGlyph({ apis = DATA_APIS, className }: { apis?: ApiGridItem[]; className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || apis.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let isOnScreen = false;
    const hop = () =>
      // Never the same tile twice in a row, and never just the neighbor (when there are enough), so the hop reads as a
      // jump across the grid.
      setActive((current) => (apis.length > 3 ? (current + 2 + Math.floor(Math.random() * (apis.length - 3))) % apis.length : (current + 1) % apis.length));
    const sync = () => {
      window.clearInterval(timer);
      if (isOnScreen && !document.hidden) timer = window.setInterval(hop, STEP_MS);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [apis]);

  const current = apis[active % Math.max(apis.length, 1)];

  return (
    <span ref={rootRef} aria-hidden className={cn("flex flex-col items-center gap-2", className)}>
      <span className="grid grid-cols-4 gap-1.5">
        {apis.map(({ title, glyph }, index) => (
          <span
            key={title}
            className={cn(
              "grid size-7 place-items-center rounded-control p-1 transition-colors duration-300 ease-out",
              index === active ? "bg-brand text-on-brand" : "bg-blue-10/60 text-brand/60",
            )}
          >
            <StillGlyph name={glyph} className="w-full" />
          </span>
        ))}
      </span>
      {/* Names the highlighted tile, so each hop says which API it landed on. */}
      {current && (
        <span key={active} className="animate-content-in text-caption text-fg-subtle">
          {current.title}
        </span>
      )}
    </span>
  );
}

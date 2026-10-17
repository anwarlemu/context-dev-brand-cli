import type { ComponentType } from "react";

import { Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A neutral frame separates docs controls from the live example. Product examples use a product Surface (compact type,
// product radius and shadows, overlays kept inside it) on the canvas; site examples on the white page, at the 1.5 line
// height a site page's body has (these docs set a looser one for their own prose).
export function Preview({ example: Example, surface, label, block = false }: { example: ComponentType; surface: "site" | "product"; label: string; block?: boolean }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-card border border-line-subtle bg-surface">
      <figcaption className="flex items-center gap-2 border-b border-line-subtle px-4 py-3 text-caption text-fg-muted">
        <span aria-hidden className={cn("size-1.5 rounded-pill", surface === "product" ? "bg-neutral-50" : "bg-brand")} />
        {label}
      </figcaption>
      <Surface
        kind={surface}
        className={cn(
          "relative overflow-hidden",
          block ? "h-180" : "flex min-h-56 items-center justify-center p-6 sm:p-8",
          surface === "product" ? "bg-canvas" : "bg-surface leading-normal",
        )}
      >
        {/* Centered both ways: an example with its own width (a form, a card) sits in the middle with even space around it. */}
        <div className={cn(block ? "h-full w-full" : "flex w-full max-w-full justify-center")}>
          <Example />
        </div>
      </Surface>
    </figure>
  );
}

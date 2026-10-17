import type { ComponentType } from "react";

import { Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";

// Each example sits in the site's soft blue ring. Product examples render inside a product Surface (compact type,
// product radius and shadows, overlays kept inside it) on the canvas; site examples on the white page, at the 1.5 line
// height a site page's body has (these docs set a looser one for their own prose).
export function Preview({ example: Example, surface, label, block = false }: { example: ComponentType; surface: "site" | "product"; label: string; block?: boolean }) {
  return (
    <figure className="min-w-0 rounded-card bg-ring-tint p-2">
      <figcaption className="flex items-center gap-2 px-2 pt-0.5 pb-2 text-caption text-fg-muted">
        <span aria-hidden className={cn("size-1.5 rounded-pill", surface === "product" ? "bg-neutral-50" : "bg-brand")} />
        {label}
      </figcaption>
      <Surface
        kind={surface}
        className={cn(
          "relative overflow-hidden rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]",
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

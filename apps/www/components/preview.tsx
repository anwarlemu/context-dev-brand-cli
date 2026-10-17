import type { ComponentType } from "react";

import { Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";

// Product examples render inside a product Surface (compact text, product radius and shadows, overlays kept inside
// it) on the canvas; site examples on the white page.
export function Preview({ example: Example, surface, label }: { example: ComponentType; surface: "site" | "product"; label: string }) {
  return (
    <figure className="overflow-hidden rounded-card border border-line">
      <figcaption className="flex items-center justify-between border-b border-line-subtle bg-surface px-4 py-2 text-caption text-fg-subtle">
        {label}
      </figcaption>
      <Surface kind={surface} className={cn("flex min-h-48 items-center justify-center p-10", surface === "product" ? "bg-canvas" : "bg-surface")}>
        <Example />
      </Surface>
    </figure>
  );
}

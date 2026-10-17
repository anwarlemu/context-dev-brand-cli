import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

// Product examples render inside .ds-product (compact text, product radius and shadows) on the canvas; site examples
// on the white page.
export function Preview({ example: Example, surface, label }: { example: ComponentType; surface: "site" | "product"; label: string }) {
  return (
    <figure className="overflow-hidden rounded-card border border-line">
      <figcaption className="flex items-center justify-between border-b border-line-subtle bg-surface px-4 py-2 text-caption text-fg-subtle">
        {label}
      </figcaption>
      <div className={cn("flex min-h-48 items-center justify-center p-10", surface === "product" ? "ds-product bg-canvas" : "bg-surface")}>
        <Example />
      </div>
    </figure>
  );
}

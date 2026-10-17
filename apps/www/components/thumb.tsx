import type { ComponentType } from "react";

import { Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A live example drawn small: laid out at full size in a box 1/scale as large, then scaled down into the frame.
// Inert, so nothing in it takes focus or the pointer.
export function Thumb({ example: Example, surface, scale = 0.6, align = "center", className }: { example: ComponentType; surface: "site" | "product"; scale?: number; align?: "center" | "start"; className?: string }) {
  return (
    <Surface kind={surface} className={cn("relative h-52 overflow-hidden rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]", surface === "product" ? "bg-canvas" : "bg-surface", className)}>
      <div
        inert
        aria-hidden
        className={cn("pointer-events-none absolute top-0 left-0 flex justify-center", align === "center" ? "items-center p-8" : "items-stretch")}
        style={{ width: `${100 / scale}%`, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: "0 0" }}
      >
        <div className={align === "center" ? "w-full" : "h-full w-full"}>
          <Example />
        </div>
      </div>
    </Surface>
  );
}

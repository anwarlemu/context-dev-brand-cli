import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The brand's scales have their own names (text-body-sm, rounded-card, shadow-floating). Without teaching
// tailwind-merge, it reads text-body-sm as a text color and drops the real color beside it, and keeps a default
// rounded-md next to a brand radius meant to replace it.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["sm", "mark", "control", "card", "shell", "panel", "pill", "demo"],
      shadow: ["card", "raised", "floating", "key", "tooltip", "ring-hover", "rule-bottom"],
      tracking: ["tight", "title", "snug", "display", "figure", "normal", "label"],
      leading: ["hero", "hero-product", "lead", "lead-lg", "note", "display", "code", "question", "terminal", "demo-chip", "demo-label", "demo-title", "demo-score"],
    },
    classGroups: {
      "font-weight": [{ font: ["regular", "heavy", "score"] }],
      "font-size": [{ text: ["hero", "hero-tablet", "hero-desktop", "hero-product", "lead", "lead-lg", "note", "display", "h1", "h2", "h3", "h4", "h5", "body-lg", "body-md", "question", "ask", "body", "body-sm", "pill-sm", "caption", "figure", "figure-lg", "axis", "demo-glyph", "demo-meta", "demo-code", "demo-label", "demo-row", "demo-title", "demo-score"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

"use client";

import * as React from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

import { GlyphCard } from "@/components/product/glyph-card";
import { GlideTabs } from "@/components/product/glide-tabs";
import { useCopy } from "@/components/ui/copy-button";
import { maskSecret } from "@/components/ui/secret-field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { cn } from "@/lib/utils";

// The overview's quickstart: the shortest way from signing up to a working call, as numbered steps in a glyph card
// (copy the key, connect the agent, paste one prompt, explore the rest). The steps scroll inside the card when they
// run longer than the space beside them. Built from KeyField, SnippetBox and CopyPill.

function QuickstartCard({ title = "Quickstart", glyph = "apiKeys", aside, className, children }: { title?: React.ReactNode; glyph?: GlyphPairName; aside?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <GlyphCard glyph={glyph} title={title} aside={aside} className={cn("h-full min-h-0", className)}>
      {/* It reaches 4px past the card's content on each side, so the ring a hovered control draws isn't clipped. */}
      <div className="-mx-1 flex min-h-0 flex-1 flex-col border-t border-line-subtle">
        <ScrollArea className="flex flex-col gap-4 px-1 pt-3 pb-1">{children}</ScrollArea>
      </div>
    </GlyphCard>
  );
}

/** One numbered step: the number in a small outlined square, the title, then the step's control. */
function QuickstartStep({ number, title, aside, children }: { number: number; title: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section data-slot="quickstart-step" className="flex flex-col gap-2">
      <div className="flex min-h-7 items-center gap-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-tag border border-line text-axis text-fg-muted tabular-nums">{number}</span>
        <h4 className="flex-1 text-body-sm font-normal tracking-normal">{title}</h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Each icon and word shares a cell with its pair, so they cross-fade in place (with a little blur to blend them) and
// the pill never changes width.
const SWAP = "col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none";
const SWAP_HIDDEN = "scale-50 opacity-0 blur-[2px]";

/** A bordered copy pill that turns green with a check once copied; `compact` keeps the icon alone. */
function CopyPill({ value, label, compact = false }: { value: string; label: string; compact?: boolean }) {
  const { hasCopied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={hasCopied ? "Copied" : label}
      className={cn(
        "flex h-7 shrink-0 items-center gap-1.5 rounded-tag border bg-surface text-caption outline-none transition-[color,border-color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.96] motion-reduce:active:scale-100",
        compact ? "px-2" : "px-2.5",
        hasCopied ? "border-success/40 text-success" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
      )}
    >
      <span aria-hidden className="grid size-3.5 place-items-center">
        <Copy className={cn(SWAP, "size-3.5", hasCopied && SWAP_HIDDEN)} strokeWidth={1.5} />
        <Check className={cn(SWAP, "size-3.5", !hasCopied && SWAP_HIDDEN)} strokeWidth={1.75} />
      </span>
      {!compact && (
        <span aria-hidden className="grid justify-items-center">
          <span className={cn(SWAP, hasCopied && "opacity-0 blur-[2px]")}>Copy</span>
          <span className={cn(SWAP, !hasCopied && "opacity-0 blur-[2px]")}>Copied</span>
        </span>
      )}
    </button>
  );
}

/** The API key, masked to its first characters, with show and a copy pill; revealing it never changes the width. */
function KeyField({ secret, name = "key", visibleChars = 14 }: { secret: string; name?: string; visibleChars?: number }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div data-slot="key-field" className="flex h-10 items-center gap-1 rounded-control border border-line pr-1 pl-3">
      <code className="relative min-w-0 flex-1 font-mono text-caption text-fg-muted">
        <span className={cn("block truncate", revealed && "invisible")} aria-hidden={revealed}>
          {maskSecret(secret, visibleChars)}
        </span>
        {revealed && <span className="absolute inset-0 truncate">{secret}</span>}
      </code>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? `Hide ${name}` : `Show ${name}`}
            className="grid size-7 shrink-0 place-items-center rounded-tag text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-control hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {revealed ? <EyeOff className="size-3.5" strokeWidth={1.5} /> : <Eye className="size-3.5" strokeWidth={1.5} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{revealed ? "Hide" : "Show"}</TooltipContent>
      </Tooltip>
      <CopyPill value={secret} label={`Copy ${name}`} />
    </div>
  );
}

export type Snippet<T extends string> = { value: T; label: string; code: string; copy?: string; note?: React.ReactNode };

/**
 * Ways to do one thing as tabs over one snippet, its copy pill and anything else after them. Every snippet shares one
 * cell, so the box keeps the tallest one's height and switching never moves what's around it; the picked one fades and
 * settles in (300ms) while the others fade out faster (150ms).
 */
function SnippetBox<T extends string>({ label, snippets, value, onValueChange, aside }: { label: string; snippets: Snippet<T>[]; value: T; onValueChange: (value: T) => void; aside?: React.ReactNode }) {
  const shown = snippets.find((s) => s.value === value) ?? snippets[0];
  return (
    <div data-slot="snippet-box" className="rounded-control border border-line">
      <div className="flex h-10 items-center gap-2 border-b border-line-subtle pr-1 pl-1.5">
        <GlideTabs role="tab" className="[&>button]:px-3" label={label} value={shown.value} onValueChange={onValueChange} options={snippets.map((s) => ({ value: s.value, label: s.label }))} />
        <span className="ml-auto flex items-center gap-1.5">
          <CopyPill value={shown.copy ?? shown.code} label={`Copy ${label.toLowerCase()} snippet`} compact />
          {aside}
        </span>
      </div>
      <div className="grid overflow-hidden rounded-b-snippet bg-neutral-5">
        {snippets.map((s) => {
          const isShown = s.value === shown.value;
          return (
            <div
              key={s.value}
              aria-hidden={!isShown || undefined}
              inert={!isShown || undefined}
              className={cn(
                "col-start-1 row-start-1 flex flex-col transition-[opacity,translate,filter] ease-out motion-reduce:transition-none",
                isShown ? "translate-y-0 opacity-100 blur-none duration-300" : "pointer-events-none translate-y-1 opacity-0 blur-[2px] duration-150",
              )}
            >
              <pre className="px-3 py-2.5 font-mono text-axis leading-snippet wrap-anywhere whitespace-pre-wrap text-fg-muted">{s.code}</pre>
              {s.note && <p className="border-t border-line-subtle px-3 py-2 text-caption text-fg-subtle">{s.note}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CopyPill, KeyField, QuickstartCard, QuickstartStep, SnippetBox };

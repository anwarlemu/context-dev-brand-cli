import * as React from "react";

import { cn } from "@/lib/utils";

// A product page's hero demo (Parse, News, Brand search, People enrichment): what goes into the API on the left and
// what comes back on the right, in a blue-10 ring, plus the small parts its rows and capability panels are built from.
// The type is set in fixed px, as on the site, so it reads the same at the 90% desktop root and on phones.

interface ProductDemoCardProps {
  label: string;
  inputLabel: string;
  input: React.ReactNode;
  outputLabel: string;
  filename: string;
  output: string;
  className?: string;
}

/** A product page's hero demo: what goes into the API on the left and what comes back on the right, in a blue-10 ring. */
export function ProductDemoCard({ label, inputLabel, input, outputLabel, filename, output, className }: ProductDemoCardProps) {
  return (
    <figure data-slot="product-demo-card" aria-label={label} className={cn("rounded-demo bg-blue-10 p-1.5", className)}>
      <div className="flex flex-col overflow-hidden rounded-card border border-black/6 bg-surface lg:min-h-[420px] lg:flex-row">
        <div className="flex min-w-0 shrink-0 flex-col gap-5 border-b border-black/10 p-5 text-left sm:p-7 lg:w-[420px] lg:border-r lg:border-b-0">
          <p className="text-demo-label leading-demo-label text-black/50">{inputLabel}</p>
          {input}
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <div className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-black/10 px-5 sm:px-6">
            <p className="text-demo-label leading-demo-label text-black/50">{outputLabel}</p>
            <p className="truncate font-mono text-demo-code leading-demo-label text-brand">{filename}</p>
          </div>
          <pre
            tabIndex={0}
            aria-label={`${filename} example`}
            className="min-h-0 flex-1 overflow-x-auto p-5 font-mono text-demo-code leading-6 text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring sm:p-6 sm:text-demo-label"
          >
            <code>{output}</code>
          </pre>
        </div>
      </div>
    </figure>
  );
}

/** An outline file icon with its type set along the bottom edge. */
export function FileGlyph({ type, className }: { type: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-12 w-10 shrink-0 items-end justify-center rounded-icon border border-brand bg-surface pb-1.5 font-mono text-demo-glyph leading-3 text-brand", className)}
    >
      {type}
    </span>
  );
}

/** An outline mark for a row: a company's initial, a person's initials, or a small icon. */
export function MarkGlyph({ children, round = false, className }: { children: React.ReactNode; round?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-10 shrink-0 items-center justify-center border border-brand bg-surface text-demo-row leading-none text-brand", round ? "rounded-pill" : "rounded-card", className)}
    >
      {children}
    </span>
  );
}

/** A request's state as an outline pill with a dot: blue for the outcome shown, neutral for the rest. */
export function StatusChip({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1 text-demo-code leading-demo-chip",
        tone === "blue" ? "border-brand text-brand" : "border-black/20 text-black/60",
      )}
    >
      <span aria-hidden="true" className={cn("size-[7px] shrink-0 rounded-pill", tone === "blue" ? "bg-brand" : "border border-current")} />
      {children}
    </span>
  );
}

/** The thing sent to the API, as a hairline row: its mark, what it is, and how the request went. */
export function DemoRow({ glyph, title, detail, status }: { glyph: React.ReactNode; title: React.ReactNode; detail: React.ReactNode; status?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 rounded-card border border-black/10 p-4">
      {glyph}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-demo-title leading-demo-title text-fg">{title}</p>
        <p className="truncate text-demo-label leading-demo-label text-black/50">{detail}</p>
      </div>
      {status}
    </div>
  );
}

/** A capability card's picture when no dot story fits it: a small white panel of example values. */
export function CapabilityPanel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure aria-label={label} className={cn("flex w-full flex-col gap-3 rounded-card bg-surface p-4 text-left ring-1 ring-hairline", className)}>
      {children}
    </figure>
  );
}

/** One request parameter and the value it is set to. */
export function ParamRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3 first:border-0 first:pt-0">
      <code className="min-w-0 truncate font-mono text-demo-code leading-5 text-black/60">{name}</code>
      <code className="shrink-0 rounded-pill border border-brand px-2.5 py-0.5 font-mono text-demo-meta leading-4 text-brand">{value}</code>
    </div>
  );
}

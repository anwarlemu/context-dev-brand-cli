"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronRight, Copy, Download, Search, X } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// A response as a code viewer: numbered, wrapped lines (never sideways scrolling), folding objects and arrays,
// search with highlighted matches, copy and download. Keys in navy, strings in brand blue, numbers and booleans a
// lighter blue, null gray. `bare` drops the toolbar, for a viewer that sits inside a card that has its own.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Line =
  | { kind: "open"; path: string; depth: number; label?: string; bracket: "{" | "[" }
  | { kind: "close"; path: string; depth: number; bracket: "}" | "]"; comma: boolean }
  | { kind: "folded"; path: string; depth: number; label?: string; bracket: "{" | "["; size: number; comma: boolean }
  | { kind: "value"; path: string; depth: number; label?: string; value: Json; comma: boolean };

const ROOT = "$";
const isContainer = (v: Json): v is Json[] | { [key: string]: Json } => typeof v === "object" && v !== null;
const entriesOf = (v: Json[] | { [key: string]: Json }): [string, Json][] => (Array.isArray(v) ? v.map((item, i) => [String(i), item]) : Object.entries(v));

function linesOf(value: Json, folded: Set<string>, path = ROOT, depth = 0, label?: string, comma = false, lines: Line[] = []) {
  if (!isContainer(value) || entriesOf(value).length === 0) {
    lines.push({ kind: "value", path, depth, label, value, comma });
    return lines;
  }
  const isArray = Array.isArray(value);
  const entries = entriesOf(value);
  if (folded.has(path)) {
    lines.push({ kind: "folded", path, depth, label, bracket: isArray ? "[" : "{", size: entries.length, comma });
    return lines;
  }
  lines.push({ kind: "open", path, depth, label, bracket: isArray ? "[" : "{" });
  entries.forEach(([key, child], i) => linesOf(child, folded, `${path}/${key}`, depth + 1, isArray ? undefined : key, i < entries.length - 1, lines));
  lines.push({ kind: "close", path, depth, bracket: isArray ? "]" : "}", comma });
  return lines;
}

function containerPaths(value: Json, path = ROOT, paths: string[] = []) {
  if (!isContainer(value)) return paths;
  if (path !== ROOT && entriesOf(value).length > 0) paths.push(path);
  for (const [key, child] of entriesOf(value)) containerPaths(child, `${path}/${key}`, paths);
  return paths;
}

const valueClass = (v: Json) => (typeof v === "string" ? "text-fg-brand" : v === null ? "text-fg-subtle" : "text-blue-70");

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return <>{parts.map((part, i) => (i % 2 === 1 ? <mark key={i} className="rounded-sm bg-blue-10 text-fg-brand ring-1 ring-brand/30">{part}</mark> : part))}</>;
}

function ToolButton({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} onClick={onClick} className="grid size-8 shrink-0 place-items-center rounded-control border border-line text-fg-muted outline-none transition-colors duration-150 hover:border-line-strong hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-3.5">
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function JsonViewer({ value, fileName = "response.json", className, bodyClassName, bare = false }: { value: unknown; fileName?: string; className?: string; bodyClassName?: string; bare?: boolean }) {
  const json = value as Json;
  const [folded, setFolded] = React.useState<Set<string>>(() => new Set());
  const [searching, setSearching] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { hasCopied: copied, copy } = useCopy();
  const text = React.useMemo(() => JSON.stringify(value, null, 2), [value]);
  const lines = React.useMemo(() => linesOf(json, folded), [json, folded]);
  const all = React.useMemo(() => containerPaths(json), [json]);
  const allFolded = all.length > 0 && all.every((p) => folded.has(p));
  const q = query.trim();
  const matches = q ? text.toLowerCase().split(q.toLowerCase()).length - 1 : 0;

  const toggle = (path: string) =>
    setFolded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  return (
    <div data-slot="json-viewer" className={cn("flex min-h-0 flex-col", className)}>
      {!bare && (
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line-subtle px-4">
          {searching ? (
            <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-control border border-brand px-2.5 shadow-[0_0_0_3px_var(--ds-color-blue-10)]">
              <label className="flex min-w-0 flex-1 items-center gap-2 self-stretch">
                <Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearching(false)}
                  placeholder="Search the response"
                  aria-label="Search the response"
                  className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-fg-subtle"
                />
                {q && <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{matches} found</span>}
              </label>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearching(false);
                  setQuery("");
                }}
                className="grid size-5 shrink-0 place-items-center rounded-sm text-fg-subtle transition-colors duration-150 hover:text-fg"
              >
                <X className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              <span className="text-caption text-fg-subtle tabular-nums">{lines.length} lines</span>
              <button
                type="button"
                onClick={() => setFolded(allFolded ? new Set() : new Set(all))}
                disabled={all.length === 0}
                className="ml-auto h-8 shrink-0 rounded-control border border-line px-3 text-body-sm text-fg-muted outline-none transition-colors duration-150 hover:border-line-strong hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-40"
              >
                {allFolded ? "Expand all" : "Collapse all"}
              </button>
              <ToolButton label="Search" onClick={() => setSearching(true)}>
                <Search strokeWidth={1.5} />
              </ToolButton>
            </>
          )}
          <ToolButton
            label={copied ? "Copied" : "Copy JSON"}
            onClick={() => copy(text)}
          >
            {copied ? <Check strokeWidth={1.5} /> : <Copy strokeWidth={1.5} />}
          </ToolButton>
          <ToolButton
            label="Download JSON"
            onClick={() => {
              const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download strokeWidth={1.5} />
          </ToolButton>
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-3 font-mono text-caption leading-relaxed", bodyClassName)}>
        <ol>
          {lines.map((line, i) => {
            const canFold = line.kind === "open" || line.kind === "folded";
            const label =
              "label" in line && line.label !== undefined ? (
                <>
                  <span className="text-navy-60">
                    <Highlighted text={`"${line.label}"`} query={q} />
                  </span>
                  :{" "}
                </>
              ) : null;
            let body: React.ReactNode;
            if (line.kind === "open") body = <>{label}{line.bracket}</>;
            else if (line.kind === "close") body = <>{line.bracket}{line.comma && ","}</>;
            else if (line.kind === "folded")
              body = (
                <>
                  {label}
                  {line.bracket}
                  <button type="button" onClick={() => toggle(line.path)} className="mx-1 rounded-sm bg-neutral-5 px-1.5 text-fg-subtle transition-colors duration-150 hover:text-fg">
                    {line.size} {line.bracket === "[" ? (line.size === 1 ? "item" : "items") : line.size === 1 ? "key" : "keys"}
                  </button>
                  {line.bracket === "[" ? "]" : "}"}
                  {line.comma && ","}
                </>
              );
            else
              body = (
                <>
                  {label}
                  <span className={valueClass(line.value)}>
                    <Highlighted text={JSON.stringify(line.value)} query={q} />
                  </span>
                  {line.comma && ","}
                </>
              );
            return (
              <li key={`${line.path}:${line.kind}`} className="flex hover:bg-neutral-5/60">
                <span className="w-10 shrink-0 pr-2 text-right text-fg-subtle tabular-nums select-none">{i + 1}</span>
                <span className="w-4 shrink-0">
                  {canFold && (
                    <button type="button" aria-label={line.kind === "open" ? "Collapse" : "Expand"} onClick={() => toggle(line.path)} className="grid h-[1.65em] w-4 place-items-center text-fg-subtle transition-colors duration-150 hover:text-fg">
                      {line.kind === "open" ? <ChevronDown className="size-3" strokeWidth={2} /> : <ChevronRight className="size-3" strokeWidth={2} />}
                    </button>
                  )}
                </span>
                <span className="min-w-0 flex-1 pr-4 whitespace-pre-wrap text-fg [overflow-wrap:anywhere]" style={{ paddingLeft: `${line.depth * 2}ch` }}>
                  {body}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

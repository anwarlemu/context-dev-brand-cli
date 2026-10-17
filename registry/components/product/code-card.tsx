"use client";

import * as React from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// The playground's code card: the call in mono with light highlighting, folded to its first lines until expanded, a
// copy button in the corner, and a footer with the language chip and anything else (an "Open in" row).

const COLLAPSED_LINES = 5;
const TOKEN = /('[^']*'|"[^"]*"|--[a-z-]+|\b(?:curl|const|await|import|return|from)\b|\b\d+\b|\b(?:true|false|True|False)\b)/g;

function tokenClass(token: string) {
  if (/^['"]/.test(token)) return "text-fg-brand";
  if (token.startsWith("--") || /^(curl|const|await|import|return|from)$/.test(token)) return "text-fg-secondary";
  if (/^(\d+|true|false|True|False)$/.test(token)) return "text-blue-80";
  return undefined;
}

export type CodeSample = { language: string; code: string };

export function CodeCard({ samples, defaultExpanded = true, footer, className }: { samples: CodeSample[]; defaultExpanded?: boolean; footer?: React.ReactNode; className?: string }) {
  const [language, setLanguage] = React.useState(samples[0]?.language ?? "");
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const { hasCopied, copy } = useCopy();
  const code = samples.find((s) => s.language === language)?.code ?? "";
  const lines = code.split("\n");
  const canExpand = lines.length > COLLAPSED_LINES;
  return (
    <div data-slot="code-card" className={cn("@container flex min-h-0 flex-col rounded-card bg-surface text-fg shadow-card", className)}>
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <pre className={cn("py-4 pr-14 pl-5 font-mono text-caption leading-relaxed", !expanded && canExpand && "max-h-30 overflow-y-hidden")}>
          <code>
            {lines.map((line, i) => (
              <span key={i} className="block min-h-[1.65em] whitespace-pre-wrap [overflow-wrap:anywhere]">
                {line.split(TOKEN).map((part, j) => (
                  <span key={j} className={tokenClass(part)}>
                    {part}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
        {canExpand && !expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-surface to-transparent" />}
        <button
          type="button"
          onClick={() => copy(code)}
          aria-label={hasCopied ? "Copied" : "Copy code"}
          className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] [&_svg]:size-3.5"
        >
          {hasCopied ? <Check className="text-success" strokeWidth={1.75} /> : <Copy strokeWidth={1.5} />}
        </button>
      </div>
      <div className="flex h-11 shrink-0 items-center gap-3 border-t border-line-subtle pr-3 pl-2 text-caption whitespace-nowrap text-fg-subtle">
        {samples.length > 1 && (
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger appearance="chip" aria-label="Language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {samples.map((s) => (
                <SelectItem key={s.language} value={s.language}>
                  {s.language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {canExpand && (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="flex items-center gap-1 transition-colors duration-150 hover:text-fg">
            <ChevronDown className={cn("size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none", expanded && "rotate-180")} strokeWidth={1.5} />
            {expanded ? "Show less" : `Show all ${lines.length} lines`}
          </button>
        )}
        {footer && <span className="ml-auto flex items-center gap-1">{footer}</span>}
      </div>
    </div>
  );
}

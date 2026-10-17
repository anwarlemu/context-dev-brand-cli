"use client";

import * as React from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The playground's code card: the call straight on the card in mono with light highlighting (strings brand blue,
// keywords and flags navy, numbers a lighter blue), folded to its first five lines until expanded, copy waiting in the
// code's corner, and one quiet footer for everything about it: the language chip, the fold, and anything else (an
// "Open in" row of agents). Long lines wrap rather than scroll sideways. Not clipped, so the language menu can open
// over what's below.

const COLLAPSED_LINES = 5;
const KEYWORDS = "curl|const|let|await|import|from|return|require|def|func|package|use";
const LITERALS = "true|false|True|False|null|None|nil";
const TOKEN = new RegExp(`('[^']*'|"[^"]*"|--[a-z-]+|\\b(?:${KEYWORDS})\\b|\\b\\d+\\b|\\b(?:${LITERALS})\\b)`, "g");
const KEYWORD = new RegExp(`^(${KEYWORDS})$`);
const LITERAL = new RegExp(`^(\\d+|${LITERALS})$`);

function tokenClass(token: string) {
  if (/^['"]/.test(token)) return "text-fg-brand";
  if (token.startsWith("--") || KEYWORD.test(token)) return "text-navy-60";
  if (LITERAL.test(token)) return "text-blue-70";
  return undefined;
}

/** One language's code. `display` is what the card shows when it differs from what Copy puts on the clipboard (a masked key). */
export type CodeSample = { language: string; code: string; display?: string };

export function CodeCard({
  samples,
  language: languageProp,
  onLanguageChange,
  defaultExpanded = false,
  onCopy,
  footer,
  className,
}: {
  samples: CodeSample[];
  /** The shown language, when the page keeps it (so every card on the page follows one pick). */
  language?: string;
  onLanguageChange?: (language: string) => void;
  /** Whether every line shows at first; otherwise the code starts folded to its first few lines. */
  defaultExpanded?: boolean;
  onCopy?: (sample: CodeSample) => void;
  /** Sits at the end of the footer, e.g. "Open in" and a row of CodeCardAction buttons. */
  footer?: React.ReactNode;
  className?: string;
}) {
  const [ownLanguage, setOwnLanguage] = React.useState(samples[0]?.language ?? "");
  const language = languageProp ?? ownLanguage;
  const setLanguage = (next: string) => {
    setOwnLanguage(next);
    onLanguageChange?.(next);
  };
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const { hasCopied, copy } = useCopy();
  const sample = samples.find((s) => s.language === language) ?? samples[0];
  const lines = (sample?.display ?? sample?.code ?? "").split("\n");
  const canExpand = lines.length > COLLAPSED_LINES;
  const copyLabel = hasCopied ? "Copied" : "Copy code";

  return (
    <div data-slot="code-card" data-expanded={(expanded && canExpand) || undefined} className={cn("@container flex min-h-0 flex-col rounded-card bg-surface text-fg shadow-card", className)}>
      <div className="ds-scrollbar relative min-h-0 flex-1 overflow-y-auto">
        <pre className={cn("py-4 pr-14 pl-5 font-mono text-caption leading-code-card", !expanded && canExpand && "max-h-[122px] overflow-y-hidden")}>
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
        <span className="absolute top-2.5 right-2.5 flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  if (!sample) return;
                  void copy(sample.code);
                  onCopy?.(sample);
                }}
                aria-label={copyLabel}
                className="grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.97] motion-reduce:active:scale-100"
              >
                {hasCopied ? <Check className="size-3.5 text-success" strokeWidth={1.75} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{copyLabel}</TooltipContent>
          </Tooltip>
        </span>
      </div>
      <div className="flex h-11 shrink-0 items-center gap-3 border-t border-line-subtle pr-3 pl-2 text-caption whitespace-nowrap text-fg-subtle">
        {samples.length > 1 ? (
          <Select value={sample?.language} onValueChange={setLanguage}>
            <SelectTrigger appearance="chip" aria-label="Language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={16} className="w-auto min-w-40">
              {samples.map((s) => (
                <SelectItem key={s.language} value={s.language}>
                  {s.language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          sample && <span className="flex h-7 items-center rounded-sm bg-wash-hover px-2.5 text-fg-muted">{sample.language}</span>
        )}
        {canExpand && (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="flex items-center gap-1 outline-none transition-colors duration-150 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring">
            <ChevronDown className={cn("size-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none", expanded && "rotate-180")} strokeWidth={1.5} />
            {expanded ? "Show less" : `Show all ${lines.length} lines`}
          </button>
        )}
        {footer && <span className="ml-auto flex items-center gap-1">{footer}</span>}
      </div>
    </div>
  );
}

/** A small icon button for the footer (an agent's mark in an "Open in" row), named by its tooltip. */
export function CodeCardAction({ label, onClick, className, children }: { label: string; onClick?: () => void; className?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={cn("grid size-6 place-items-center rounded-sm text-fg outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-3.5", className)}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

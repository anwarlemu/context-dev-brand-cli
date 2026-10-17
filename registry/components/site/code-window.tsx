"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

// The site's code window: a near-black terminal with three window dots, an optional label chip and actions in its
// 44px chrome bar, set in the soft blue ring every card and frame on the site sits in. One accent color for strings and
// numbers, comments faded, the rest soft white: the brand never runs a full syntax theme on the site.

const TOKEN = /(\/\/.*$|^\s*#.*$|'[^']*'|"[^"]*"|`[^`]*`|\b\d+(?:\.\d+)?\b)/;

function tokenClass(token: string) {
  if (/^(\/\/|\s*#)/.test(token)) return "text-white/35";
  if (/^['"`]/.test(token) || /^\d/.test(token)) return "text-blue-60";
  return undefined;
}

/** Code in the window's mono type with the brand's light highlighting. */
function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre data-slot="code-block" className={cn("p-5 font-mono text-caption leading-code text-white/85 [tab-size:2] md:text-body-sm", className)}>
      <code>
        {code.split("\n").map((line, i) => (
          <span key={i} className="block min-h-[1.625em] whitespace-pre">
            {line.split(new RegExp(TOKEN, "g")).map((part, j) =>
              part ? (
                <span key={j} className={tokenClass(part)}>
                  {part}
                </span>
              ) : null,
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

// The chrome bar's small square buttons (copy, open in): faint white, a soft white wash on hover.
const windowButtonClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-card text-white/45 outline-none transition-[background-color,color,scale] duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-3.5";

/** Copies a value from inside the dark window; the icon turns to a check for a moment. */
function WindowCopyButton({ value, label = "Copy code", className }: { value: string; label?: string; className?: string }) {
  const { hasCopied, copy } = useCopy();
  return (
    <button type="button" onClick={() => copy(value)} aria-label={hasCopied ? "Copied" : label} className={cn(windowButtonClass, className)}>
      {hasCopied ? <Check strokeWidth={1.75} /> : <Copy strokeWidth={1.5} />}
    </button>
  );
}

type TerminalWindowProps = { label?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string };

/** The dark window alone, for places that draw their own ring (or none). */
function TerminalWindow({ label, actions, children, className }: TerminalWindowProps) {
  return (
    <div data-slot="terminal-window" className={cn("min-w-0 overflow-hidden rounded-card bg-code text-left text-white", className)}>
      <div className="flex min-h-11 items-center gap-2 border-b border-white/10 px-4 py-2">
        {/* The window dots: red, amber and green, the closest brand tokens to the classic window controls. */}
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-close" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-minimize" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-zoom" />
        {label && <span className="ml-2 inline-flex min-w-0 items-center gap-1.5 truncate rounded-card bg-white/10 px-2.5 py-1 font-mono text-caption font-medium text-white">{label}</span>}
        {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/** The dark window in the soft blue ring. The ring's radius repeats the window's, so both corners share one curve. */
function CodeWindow({ className, ...props }: TerminalWindowProps) {
  return (
    <div data-slot="code-window" className={cn("min-w-0 rounded-card bg-ring-tint p-2", className)}>
      <TerminalWindow {...props} />
    </div>
  );
}

export type CodeTabSample = { language: string; label?: string; code: string; filename?: string };

/**
 * The window with a row of language tabs under the chrome bar: the label shows the file, the copy button copies the
 * tab that is showing. Every sample shares one grid cell, so switching never resizes the window.
 */
function CodeTabs({ samples, defaultLanguage, className }: { samples: CodeTabSample[]; defaultLanguage?: string; className?: string }) {
  const baseId = React.useId();
  const [language, setLanguage] = React.useState(defaultLanguage ?? samples[0]?.language);
  const active = samples.find((s) => s.language === language) ?? samples[0];
  const tabs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  if (!active) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = samples[(samples.indexOf(active) + step + samples.length) % samples.length];
    setLanguage(next.language);
    tabs.current[next.language]?.focus();
  };

  return (
    <CodeWindow className={className} label={active.filename} actions={<WindowCopyButton value={active.code} label={`Copy ${active.label ?? active.language} code`} />}>
      {samples.length > 1 && (
        <div role="tablist" aria-label="Code language" onKeyDown={onKeyDown} className="flex min-w-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none]">
          {samples.map((sample) => {
            const selected = sample === active;
            return (
              <button
                key={sample.language}
                ref={(node) => {
                  tabs.current[sample.language] = node;
                }}
                id={`${baseId}-tab-${sample.language}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${sample.language}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setLanguage(sample.language)}
                className={cn(
                  "shrink-0 rounded-pill px-3 py-1.5 text-body-sm outline-none transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none",
                  selected ? "bg-white/10 text-white" : "text-white/55 hover:text-white",
                )}
              >
                {sample.label ?? sample.language}
              </button>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)]">
        {samples.map((sample) => (
          <div
            key={sample.language}
            id={`${baseId}-panel-${sample.language}`}
            role={samples.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={samples.length > 1 ? `${baseId}-tab-${sample.language}` : undefined}
            tabIndex={sample === active ? 0 : -1}
            aria-hidden={sample !== active || undefined}
            className={cn("col-start-1 row-start-1 overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset", sample !== active && "invisible")}
          >
            <CodeBlock code={sample.code} />
          </div>
        ))}
      </div>
    </CodeWindow>
  );
}

export { CodeWindow, TerminalWindow, CodeBlock, CodeTabs, WindowCopyButton, windowButtonClass };

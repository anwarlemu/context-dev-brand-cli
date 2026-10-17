"use client";

import * as React from "react";
import { ArrowRight, Globe, Loader2, Search } from "lucide-react";

import { GlideTabs } from "@/components/product/glide-tabs";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { cn } from "@/lib/utils";

export type TryApiTab<T extends string = string> = {
  value: T;
  label: string;
  /** A 5 by 5 dot glyph for the tab. */
  glyph: readonly string[];
  /** What the field takes: a URL gets a globe, anything else a magnifier. */
  inputKind?: "url" | "query";
  inputLabel: string;
  /** Example inputs, typed into the empty field one after another. */
  examples: string[];
  /** "Scrape, 1 credit": the run button's name. */
  runLabel: string;
};

const TYPE_MS = 45;
const HOLD_MS = 1800;

// The empty field types its examples in and out, so it shows what to try; it stops while the field has focus or text.
function useTypingPlaceholder(examples: string[], paused: boolean) {
  const [state, setState] = React.useState({ index: 0, length: 0, deleting: false });
  const example = examples[state.index % Math.max(1, examples.length)] ?? "";
  React.useEffect(() => {
    if (paused || !example || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const done = state.length === example.length;
    const t = setTimeout(
      () =>
        setState((s) =>
          s.deleting ? (s.length === 0 ? { index: s.index + 1, length: 0, deleting: false } : { ...s, length: s.length - 1 }) : done ? { ...s, deleting: true } : { ...s, length: s.length + 1 },
        ),
      done && !state.deleting ? HOLD_MS : state.deleting ? TYPE_MS / 2 : TYPE_MS,
    );
    return () => clearTimeout(t);
  }, [paused, example, state]);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { example, placeholder: reduced || paused ? example : example.slice(0, state.length) };
}

// The overview's lead: the website hero's demo field as a floating white card. A gray track of API tabs at the top
// (each a dot glyph and name, one white pill gliding to the picked one, hairlines between the rest), a link out at the
// right, then the input with its icon and a square blue run button. The card gains the translucent ring on hover.
// What a run returns renders below it (children), for example in a playground result card.
function TryApi<T extends string>({
  tabs,
  value,
  onValueChange,
  input,
  onInputChange,
  onRun,
  running = false,
  disabled = false,
  aside,
  className,
  children,
}: {
  tabs: TryApiTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  input: string;
  onInputChange: (input: string) => void;
  /** Runs the input, or the example in the field when it's empty. */
  onRun: (input: string) => void;
  running?: boolean;
  disabled?: boolean;
  /** At the right of the tabs, from 576px: "API playground". */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const tab = tabs.find((t) => t.value === value) ?? tabs[0];
  const [focused, setFocused] = React.useState(false);
  const typing = useTypingPlaceholder(tab.examples, focused || input.length > 0);
  const FieldIcon = tab.inputKind === "url" ? Globe : Search;
  const canRun = !running && !disabled;
  return (
    <section aria-label="Try an API" data-slot="try-api" className={cn("@container", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = input.trim() || typing.example;
          if (canRun && target) onRun(target);
        }}
        className="relative z-10 flex w-full flex-col rounded-card bg-surface shadow-card transition-shadow duration-150 ease-out hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)]"
      >
        <div className="flex items-center gap-3 pt-1.5 pr-3 pl-1.5">
          {/* Scrolls sideways rather than wrapping when the card is too narrow for every tab. */}
          <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <GlideTabs
              label="API"
              role="tab"
              appearance="track"
              value={tab.value}
              onValueChange={onValueChange}
              options={tabs.map((t) => ({
                value: t.value,
                label: t.label,
                // An unpicked tab's glyph at 55% ink: 4.6:1 on the gray track, past the 3:1 asked of icons.
                icon: (selected: boolean) => <DotGlyph rows={t.glyph} className={cn("size-3 shrink-0 transition-colors duration-150", selected ? "text-brand" : "text-fg/55")} />,
              }))}
            />
          </div>
          {aside && <span className="ml-auto hidden @xl:block">{aside}</span>}
        </div>
        {/* The label's ::before covers the whole row, so a click anywhere but the button focuses the field. */}
        <div className="relative flex h-11 shrink-0 items-center gap-2 pr-1.5">
          <label className="flex min-w-0 flex-1 cursor-text items-center gap-2.5 px-4 before:absolute before:inset-0 before:cursor-text before:content-['']">
            <FieldIcon aria-hidden className="relative size-3.5 shrink-0 text-fg/40" strokeWidth={1.5} />
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={typing.placeholder}
              aria-label={tab.inputLabel}
              spellCheck={false}
              autoComplete="off"
              className="relative min-w-0 flex-1 bg-transparent py-0 text-[calc(var(--ds-text-caption)+var(--ds-space-0-5))] leading-normal text-fg outline-none placeholder:text-fg/45"
            />
          </label>
          <button
            type="submit"
            disabled={!canRun}
            aria-busy={running}
            aria-label={tab.runLabel}
            className="relative isolate flex h-8 w-9 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-brand text-on-brand outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-blue-90 focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:active:scale-100"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
          </button>
        </div>
      </form>
      {children}
    </section>
  );
}

export { TryApi };

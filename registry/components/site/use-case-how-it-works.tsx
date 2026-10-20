"use client";

import * as React from "react";
import { ArrowRight, Check, Copy } from "lucide-react";

import { CodeBlock, TerminalWindow, WindowCopyButton } from "@/components/site/code-window";
import { buttonVariants } from "@/components/ui/button";
import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

// The use case pages' "how it works": the numbered steps in a card on the left, with the install command for the
// language that is picked, the docs pill and a free-tier note under them; the code in every SDK language in a tabbed
// code window on the right. The install command and the code share one language. `UseCaseStepCards` is the other page
// style: a card per step, each with its own example.

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";

export type UseCaseStep = { title: string; description: React.ReactNode };
export type UseCaseSample = { language: string; label: string; code: string; filename: string; install?: string | null };

function StepNumber({ n }: { n: number }) {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-brand/10 text-body leading-snug text-fg-brand">{n}</span>;
}

/** The install command as an outlined pill with a copy button, or a note when the language needs no install. */
function UseCaseInstallCommand({ sample, className }: { sample: UseCaseSample; className?: string }) {
  const { hasCopied, copy } = useCopy();
  if (!sample.install) {
    return <p className={cn("w-fit max-w-full rounded-pill px-4 py-2 text-body-sm leading-snug text-fg-secondary ring-1 ring-black/10 ring-inset", className)}>No install needed. Call the REST API directly.</p>;
  }
  return (
    <div className={cn("flex w-fit max-w-full items-center gap-2 rounded-pill py-1 pr-1 pl-4 ring-1 ring-black/10 ring-inset", className)}>
      <code className="min-w-0 overflow-x-auto font-mono text-body-sm leading-5 whitespace-nowrap text-fg-nav [scrollbar-width:none]">
        <span aria-hidden="true" className="text-black/35">
          ${" "}
        </span>
        {sample.install}
      </code>
      <button
        type="button"
        onClick={() => copy(sample.install ?? "")}
        aria-label={hasCopied ? `${sample.label} install command copied` : `Copy ${sample.label} install command`}
        className="flex size-8 shrink-0 items-center justify-center rounded-pill text-black/45 outline-none transition-[background-color,color] duration-150 ease-out hover:bg-tint hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
      >
        {hasCopied ? <Check aria-hidden="true" className="size-4 text-fg-brand" /> : <Copy aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

/** The tabbed code window: the file name as its label, a pill tab per language, a fixed height that scrolls. */
function UseCaseCodeTabs({ samples, language, onLanguageChange, className }: { samples: readonly UseCaseSample[]; language: string; onLanguageChange: (language: string) => void; className?: string }) {
  const baseId = React.useId();
  const active = samples.find((sample) => sample.language === language) ?? samples[0];
  if (!active) return null;

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = samples[(samples.indexOf(active) + step + samples.length) % samples.length];
    onLanguageChange(next.language);
    document.getElementById(`${baseId}-tab-${next.language}`)?.focus();
  };

  return (
    <div className={cn(RING, "flex min-w-0 flex-col", className)}>
      <TerminalWindow className="flex flex-1 flex-col" label={active.filename} actions={<WindowCopyButton value={active.code} label={`Copy ${active.label} code`} />}>
        <div role="tablist" aria-label="Code language" className="flex min-w-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none]">
          {samples.map((sample) => {
            const selected = sample === active;
            return (
              <button
                key={sample.language}
                id={`${baseId}-tab-${sample.language}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${sample.language}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onLanguageChange(sample.language)}
                onKeyDown={onKeyDown}
                className={cn(
                  "shrink-0 rounded-pill px-3 py-1.5 text-body-sm leading-snug outline-none transition-[background-color,color] duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none",
                  selected ? "bg-white/10 text-white" : "text-white/55 hover:text-white",
                )}
              >
                {sample.label}
              </button>
            );
          })}
        </div>
        <div className="relative h-88 lg:h-auto lg:min-h-88 lg:flex-1">
          {samples.map((sample) => (
            <div
              key={sample.language}
              id={`${baseId}-panel-${sample.language}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${sample.language}`}
              tabIndex={0}
              hidden={sample !== active}
              className="absolute inset-0 overflow-auto outline-none [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
            >
              <CodeBlock code={sample.code} language={sample.language} />
            </div>
          ))}
        </div>
      </TerminalWindow>
    </div>
  );
}

/**
 * The how it works block: the steps card (24rem wide from lg) and the code tabs beside it. `docs` is the outline pill
 * under the steps; `note` the muted line under that (the free tier, for example).
 */
function UseCaseHowItWorks({
  steps,
  samples,
  docs,
  note,
  defaultLanguage,
  className,
}: {
  steps: readonly UseCaseStep[];
  samples: readonly UseCaseSample[];
  docs?: { label: string; href: string };
  note?: React.ReactNode;
  defaultLanguage?: string;
  className?: string;
}) {
  const [language, setLanguage] = React.useState(defaultLanguage ?? samples[0]?.language ?? "");
  const active = samples.find((sample) => sample.language === language) ?? samples[0];
  return (
    <div data-slot="use-case-how-it-works" className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]", className)}>
      <div className={cn(RING, "min-w-0")}>
        <div className={cn(CARD, "gap-6")}>
          <ol className="flex flex-col">
            {steps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-4 border-t border-hairline py-4 first:border-0 first:pt-0">
                <StepNumber n={i + 1} />
                <span className="flex flex-col gap-1">
                  <span className="text-h5 leading-snug font-normal text-fg">{step.title}</span>
                  <span className="text-body-sm leading-snug text-fg-secondary">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>
          {(active || docs || note) && (
            <div className="mt-auto flex flex-col items-start gap-4 border-t border-hairline pt-6">
              {active && <UseCaseInstallCommand sample={active} />}
              {docs && (
                <a href={docs.href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "pill-outline" })}>
                  {docs.label}
                </a>
              )}
              {note && <p className="text-body-sm leading-snug text-fg-subtle">{note}</p>}
            </div>
          )}
        </div>
      </div>
      {samples.length > 0 && <UseCaseCodeTabs samples={samples} language={active?.language ?? ""} onLanguageChange={setLanguage} />}
    </div>
  );
}

export type UseCaseStepWithCode = UseCaseStep & { code: string };

/**
 * A card per step, three across (four when there are four): the number, the title, a sentence and the step's code. In a
 * row, the longest example scrolls at the height of the next longest, so one long example does not stretch every card.
 * `links` are outline pills to the APIs the workflow uses.
 */
function UseCaseStepCards({ steps, links, className }: { steps: readonly UseCaseStepWithCode[]; links?: readonly { label: string; href: string }[]; className?: string }) {
  const visibleLines = steps.map((step) => step.code.split("\n").length).sort((a, b) => b - a)[1] ?? 12;
  return (
    <div data-slot="use-case-step-cards" className={className}>
      <ol className={cn("grid grid-cols-1 gap-6", steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {steps.map((step, i) => (
          <li key={step.title} className={RING}>
            <div className={CARD}>
              <div className="flex flex-col gap-4">
                <StepNumber n={i + 1} />
                <h3 className="text-h4 leading-snug font-normal tracking-normal text-fg">{step.title}</h3>
                <p className="text-body leading-snug text-fg-secondary">{step.description}</p>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label={`${step.title} code example`}
                style={{ "--visible-code-lines": visibleLines } as React.CSSProperties}
                className="overflow-x-auto rounded-card bg-code outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring lg:max-h-[calc(var(--visible-code-lines)*1.7em+2.5rem)] lg:overflow-y-auto"
              >
                <CodeBlock code={step.code} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {links && links.length > 0 && (
        <nav aria-label="APIs for this workflow" className="mt-10 flex flex-wrap gap-3">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={cn(buttonVariants({ variant: "pill-outline" }), "gap-2 py-2.5")}>
              {link.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

export { UseCaseHowItWorks, UseCaseCodeTabs, UseCaseInstallCommand, UseCaseStepCards };

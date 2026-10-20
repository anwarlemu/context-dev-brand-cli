"use client";

import * as React from "react";
import { ArrowRight, Check, Copy } from "lucide-react";

import { CodeBlock, TerminalWindow, WindowCopyButton } from "@/components/site/code-window";
import { buttonVariants } from "@/components/ui/button";
import { useCopy } from "@/components/ui/copy-button";
import { useCodeLanguage } from "@/hooks/use-code-language";
import { cn } from "@/lib/utils";

// The use case pages' "how it works": the numbered steps in a card on the left, with the install command for the
// language that is picked, the docs pill and a free-tier note under them; the code in every SDK language in a tabbed
// code window on the right. Every code window and install command on the page shares one remembered language
// (useCodeLanguage). `UseCaseStepCards` is the other page style: a card per step, each with its own example, and
// `UseCaseSectionLinks` the outline pills to the APIs or guides that close a section.

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";

export type UseCaseStep = { title: string; description: React.ReactNode };
export type UseCaseSample = { language: string; label: string; code: string; filename: string; install?: string | null };

/** The sample in the page's remembered language, else `defaultLanguage`, else the first. */
function useActiveSample(samples: readonly UseCaseSample[], defaultLanguage?: string) {
  const [stored, store] = useCodeLanguage();
  const active = samples.find((sample) => sample.language === stored) ?? samples.find((sample) => sample.language === defaultLanguage) ?? samples[0];
  return [active as UseCaseSample | undefined, store] as const;
}

function StepNumber({ n }: { n: number }) {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-brand/10 text-body leading-snug text-fg-brand">{n}</span>;
}

/**
 * The install command as an outlined pill with a copy button, or a note when the language needs no install. Pass
 * `samples` to follow the page's remembered language, or one `sample` to show it alone.
 */
function UseCaseInstallCommand({ sample, samples, defaultLanguage, className }: { sample?: UseCaseSample; samples?: readonly UseCaseSample[]; defaultLanguage?: string; className?: string }) {
  const [followed] = useActiveSample(samples ?? [], defaultLanguage);
  const shown = sample ?? followed;
  const { hasCopied, copy } = useCopy();
  if (!shown) return null;
  if (!shown.install) {
    return <p className={cn("w-fit max-w-full rounded-pill px-4 py-2 text-body-sm leading-snug text-fg-secondary ring-1 ring-black/10 ring-inset", className)}>No install needed. Call the REST API directly.</p>;
  }
  return (
    <div className={cn("flex w-fit max-w-full items-center gap-2 rounded-pill py-1 pr-1 pl-4 ring-1 ring-black/10 ring-inset", className)}>
      <code className="min-w-0 overflow-x-auto font-mono text-body-sm leading-5 whitespace-nowrap text-fg-nav [scrollbar-width:none]">
        <span aria-hidden="true" className="text-black/35">
          ${" "}
        </span>
        {shown.install}
      </code>
      <button
        type="button"
        onClick={() => copy(shown.install ?? "")}
        aria-label={hasCopied ? `${shown.label} install command copied` : `Copy ${shown.label} install command`}
        className="flex size-8 shrink-0 items-center justify-center rounded-pill text-black/45 outline-none transition-[background-color,color] duration-150 ease-out hover:bg-tint hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
      >
        {hasCopied ? <Check aria-hidden="true" className="size-4 text-fg-brand" /> : <Copy aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

/**
 * The tabbed code window: the file name (or `label`) in the chrome bar, `actions` and a round copy button beside it, a
 * pill tab per language and a fixed height that scrolls. `actions` can be a function of the sample showing, for buttons
 * that need its code. `showInstall` sets the window to one height and adds the install command as its footer. The
 * language is the page's remembered one unless `language` and `onLanguageChange` control it.
 */
function UseCaseCodeTabs({
  samples,
  language,
  onLanguageChange,
  defaultLanguage,
  label,
  actions,
  showInstall = false,
  className,
}: {
  samples: readonly UseCaseSample[];
  language?: string;
  onLanguageChange?: (language: string) => void;
  defaultLanguage?: string;
  /** The chrome bar's label; the sample's file name by default. */
  label?: React.ReactNode;
  /** Buttons before the copy button, or a function of the sample that is showing. */
  actions?: React.ReactNode | ((sample: UseCaseSample) => React.ReactNode);
  /** The install command for the picked language under the code, and one fixed height for the window. */
  showInstall?: boolean;
  className?: string;
}) {
  const baseId = React.useId();
  const [followed, store] = useActiveSample(samples, defaultLanguage);
  const active = (language !== undefined ? samples.find((sample) => sample.language === language) : undefined) ?? followed;
  if (!active) return null;
  const pick = (next: string) => (onLanguageChange ?? store)(next);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const offset = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[event.key];
    if (offset === undefined && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? samples.length - 1 : (samples.indexOf(active) + offset + samples.length) % samples.length;
    const next = samples[index];
    pick(next.language);
    document.getElementById(`${baseId}-tab-${next.language}`)?.focus();
  };

  return (
    <div className={cn(RING, "flex min-w-0 flex-col", className)}>
      <TerminalWindow
        className="flex flex-1 flex-col"
        label={label ?? active.filename}
        actions={
          <>
            {typeof actions === "function" ? actions(active) : actions}
            <WindowCopyButton round value={active.code} label={`Copy ${active.label} code`} />
          </>
        }
      >
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
                onClick={() => pick(sample.language)}
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
        <div className={cn("relative h-88 lg:h-auto lg:min-h-88 lg:flex-1", showInstall && "h-104 lg:h-104 lg:flex-none")}>
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
        {showInstall && (
          <div className="flex min-h-12 items-center gap-2 border-t border-white/10 px-4 py-2">
            {active.install ? (
              <>
                <code className="min-w-0 flex-1 overflow-x-auto font-mono text-caption whitespace-nowrap text-white/80 [scrollbar-width:none]">{active.install}</code>
                <WindowCopyButton round value={active.install} label={`Copy ${active.label} install command`} />
              </>
            ) : (
              <span className="text-caption text-white/70">No install needed. Call the REST API directly.</span>
            )}
          </div>
        )}
      </TerminalWindow>
    </div>
  );
}

/** Outline pills with a still arrow that close a section: the APIs a workflow uses, or guides for it. */
function UseCaseSectionLinks({ label, links, className }: { label: string; links: readonly { label: React.ReactNode; href: string }[]; className?: string }) {
  return (
    <nav aria-label={label} data-slot="use-case-section-links" className={cn("mt-10 flex flex-wrap gap-3", className)}>
      {links.map((link) => (
        <a key={link.href} href={link.href} className={cn(buttonVariants({ variant: "pill-outline" }), "gap-2 py-2.5")}>
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      ))}
    </nav>
  );
}

/**
 * The how it works block: the steps card (24rem wide from lg) and the code tabs beside it. `docs` is the outline pill
 * under the steps; `note` the muted line under that (the free tier, for example). `defaultLanguage` shows until the
 * visitor picks one; after that the page's remembered language wins.
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
  const [active] = useActiveSample(samples, defaultLanguage);
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
                <a href={docs.href} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "pill-outline" }))}>
                  {docs.label}
                </a>
              )}
              {note && <p className="text-body-sm leading-snug text-fg-subtle">{note}</p>}
            </div>
          )}
        </div>
      </div>
      {samples.length > 0 && <UseCaseCodeTabs samples={samples} defaultLanguage={defaultLanguage} />}
    </div>
  );
}

export type UseCaseStepWithCode = UseCaseStep & { code: string };

/**
 * A card per step, three across (four when there are four): the number, the title, a sentence and the step's code. In a
 * row, the longest example scrolls at the height of the next longest, so one long example does not stretch every card.
 * `links` are outline pills to the APIs the workflow uses (UseCaseSectionLinks).
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
      {links && links.length > 0 && <UseCaseSectionLinks label="APIs for this workflow" links={links} />}
    </div>
  );
}

export { UseCaseHowItWorks, UseCaseCodeTabs, UseCaseInstallCommand, UseCaseStepCards, UseCaseSectionLinks };

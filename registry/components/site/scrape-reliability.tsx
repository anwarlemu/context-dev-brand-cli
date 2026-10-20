import * as React from "react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { DotWindow } from "@/components/visuals/dot-engine/dot-window";
import { cn } from "@/lib/utils";

// The home page's reliability section ("Every page, fully loaded."): a white card with the success rate as one large
// blue figure, beside a request log framed as a dot window (the URL and its status pill, each step with its time, a mark
// and a detail, then what came back), and three cards on what runs on every request. The log uses the brand's two
// marks: a solid dot for a step that went through, a hollow ring for the attempt that was blocked.

export type ReliabilityLogEntry = { time: React.ReactNode; event: React.ReactNode; detail?: React.ReactNode; blocked?: boolean };
export type ReliabilityLog = { url: React.ReactNode; status: React.ReactNode; entries: ReliabilityLogEntry[]; result: React.ReactNode; meta?: React.ReactNode };
export type ReliabilityPillar = { title: React.ReactNode; description: React.ReactNode };

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "flex h-full min-w-0 flex-col gap-3 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";

/** A log mark: a solid blue dot, or a hollow ring when the step was blocked. */
function LogMark({ blocked = false }: { blocked?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5 shrink-0 text-fg-brand">
      {blocked ? <circle cx="5" cy="5" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" /> : <circle cx="5" cy="5" r="5" fill="currentColor" />}
    </svg>
  );
}

/** The request log: one request's steps in a dot window, on a white card in the soft blue ring. */
function ReliabilityRequestLog({ log, className }: { log: ReliabilityLog; className?: string }) {
  return (
    <div className={cn(RING, className)}>
      <div className="flex h-full items-center rounded-card bg-surface p-4 ring-1 ring-hairline sm:p-6">
        <DotWindow className="w-full">
          <div className="flex items-center justify-between gap-3 border-b border-wash-pill pb-4">
            <span className="truncate font-mono text-caption leading-4 text-fg">{log.url}</span>
            <span className="shrink-0 rounded-pill bg-ring-tint px-3 py-1 font-mono text-caption leading-4 text-fg-brand">{log.status}</span>
          </div>
          <ol aria-label="Request log" className="py-2">
            {log.entries.map((entry, index) => (
              <li key={index} className="flex min-h-10 items-center gap-3 py-1">
                <span className="hidden w-9 shrink-0 font-mono text-caption leading-4 text-fg-faint sm:block">{entry.time}</span>
                <LogMark blocked={entry.blocked} />
                <span className="min-w-0 flex-1 text-body-sm text-fg">{entry.event}</span>
                {entry.detail && <span className={cn("hidden shrink-0 pl-3 text-right font-mono text-caption leading-4 sm:block", entry.blocked ? "text-fg" : "text-fg-subtle")}>{entry.detail}</span>}
              </li>
            ))}
          </ol>
          <div className="flex items-center justify-between gap-3 border-t border-wash-pill pt-4">
            <span className="flex items-center gap-3 text-body-sm whitespace-nowrap text-fg">
              <LogMark />
              {log.result}
            </span>
            {log.meta && <span className="font-mono text-caption leading-4 whitespace-nowrap text-fg-subtle">{log.meta}</span>}
          </div>
        </DotWindow>
      </div>
    </div>
  );
}

const DEFAULT_LOG: ReliabilityLog = {
  url: "shop.example.com/products",
  status: "200 OK",
  entries: [
    { time: "0.0s", event: "Rendered in a real browser", detail: "JS executed" },
    { time: "1.1s", event: "Blocked by bot protection", detail: "403", blocked: true },
    { time: "1.2s", event: "Escalated to a stronger proxy", detail: "automatic" },
    { time: "2.0s", event: "Retried with a new strategy", detail: "200" },
  ],
  result: "Markdown returned",
  meta: "2.4s · 1 credit",
};

const DEFAULT_PILLARS: ReliabilityPillar[] = [
  { title: "JavaScript rendering, always", description: "Every request loads in a real browser. There is no opt-out, because half-rendered HTML from a single-page app is a failure that looks like a success." },
  { title: "Proxies that escalate", description: "When a site blocks a request, it moves to a stronger proxy on its own. You never pick a proxy tier or pay extra for one." },
  { title: "Retries that adapt", description: "Failed attempts retry with a different strategy before anything comes back to you. Retries run on our side, not in your code." },
];

/**
 * The reliability section: heading and line, the rate card beside the request log (stacked below lg), then the
 * pillars three across from md. Every part has the site's copy as its default.
 */
function ScrapeReliability({
  title = "Every page,",
  accent = "fully loaded.",
  description = "Rendering, proxies, and retries run on every request. You send a URL and get the page, not a list of settings to tune.",
  rate = "99.96%",
  rateLabel = "Scrape success rate, with no configuration.",
  log = DEFAULT_LOG,
  pillars = DEFAULT_PILLARS,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  /** The headline figure, e.g. "99.96%". */
  rate?: React.ReactNode;
  rateLabel?: React.ReactNode;
  log?: ReliabilityLog;
  pillars?: ReliabilityPillar[];
}) {
  return (
    <SiteSection lines data-slot="scrape-reliability" className={className} {...props}>
      <SectionHeading title={title} accent={accent} description={description} />
      <SectionHeaderRule />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <div className={RING}>
          <div className={cn(CARD, "items-center justify-center gap-2 text-center")}>
            <span className="text-figure leading-none font-normal tracking-figure text-fg-brand md:text-figure-lg">{rate}</span>
            <span className="text-body leading-snug text-fg-secondary">{rateLabel}</span>
          </div>
        </div>
        <ReliabilityRequestLog log={log} />
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <li key={index} className={RING}>
            <div className={CARD}>
              <h3 className="text-h4 leading-snug font-normal tracking-normal text-fg">{pillar.title}</h3>
              <p className="text-body leading-snug text-fg-secondary">{pillar.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

export { ScrapeReliability, ReliabilityRequestLog };

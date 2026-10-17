"use client";

import * as React from "react";
import { ChevronLeft, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The playground's result: the view tabs sit above the card (Preview, JSON, History; just "Result" and History before
// the first call), the status at the right of them, Back at the left once there's something to clear. The card holds
// nothing but the result: what the call took in a ruled strip, then the response in its own inset panel that scrolls on
// its own. Before a call it holds the ready state, while one runs the running state. Each view fades in as it's picked.

export type PlaygroundResultView = "preview" | "json" | "history";
export type PlaygroundResultStat = { icon: LucideIcon; value: React.ReactNode; label: string };

const STATUS_LABELS: Record<number, string> = { 200: "OK", 201: "Created", 202: "Accepted", 400: "Bad Request", 401: "Unauthorized", 402: "Payment Required", 403: "Forbidden", 404: "Not Found", 408: "Timeout", 422: "Unprocessable", 429: "Too Many Requests", 500: "Server Error", 502: "Bad Gateway", 503: "Unavailable", 504: "Gateway Timeout" };

function statusTone(code: number) {
  if (code >= 500) return { text: "text-danger", dot: "bg-danger" };
  if (code >= 400) return { text: "text-alert-strong", dot: "bg-alert-strong" };
  return { text: "text-success", dot: "bg-success" };
}

export function PlaygroundResultCard({
  view,
  onViewChange,
  hasPreview = true,
  statusCode,
  loading,
  stats,
  footnote,
  ready,
  history,
  onBack,
  className,
  children,
}: {
  view: PlaygroundResultView;
  onViewChange: (view: PlaygroundResultView) => void;
  /** Some responses have nothing to show but their JSON. */
  hasPreview?: boolean;
  /** The response's HTTP status, once a call has come back; null before. */
  statusCode?: number | null;
  /** Replaces the body while a call runs (usually PlaygroundRunningState). */
  loading?: React.ReactNode;
  stats?: PlaygroundResultStat[];
  /** The stats strip's right-hand note. */
  footnote?: React.ReactNode;
  /** Before the first call (usually PlaygroundReadyState). */
  ready?: React.ReactNode;
  /** The calls made so far; adds the History tab. */
  history?: React.ReactNode;
  /** Back clears the shown call, returning the card to ready. Given, the Back button shows once there's a result. */
  onBack?: () => void;
  className?: string;
  /** What came back, or why nothing did. */
  children?: React.ReactNode;
}) {
  const isLoading = loading != null;
  const hasRun = statusCode != null;
  const hasHistory = history != null;
  const contentView: PlaygroundResultView = hasPreview ? "preview" : "json";
  const shown: PlaygroundResultView = view === "history" ? (hasHistory ? "history" : contentView) : !hasRun || (view === "preview" && !hasPreview) ? contentView : view;
  const showsHistory = !isLoading && shown === "history";
  const showsResult = !isLoading && !showsHistory && hasRun;
  const options = [
    ...(hasRun ? [...(hasPreview ? [{ value: "preview" as const, label: "Preview" }] : []), { value: "json" as const, label: "JSON" }] : [{ value: contentView, label: "Result" }]),
    ...(hasHistory ? [{ value: "history" as const, label: "History" }] : []),
  ];

  // A new call turns History back to what came back.
  const wasLoading = React.useRef(isLoading);
  React.useEffect(() => {
    if (wasLoading.current && !isLoading && view === "history") onViewChange(contentView);
    wasLoading.current = isLoading;
  }, [isLoading, view, contentView, onViewChange]);

  return (
    <section data-slot="playground-result-card" aria-label="Result" className={cn("flex min-w-0 shrink-0 flex-col gap-2", className)}>
      <div className="flex h-8 shrink-0 items-center gap-1 px-1">
        {onBack && (hasRun || children != null) && !isLoading && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to ready"
                className="-ml-1 grid size-7 place-items-center rounded-sm text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Back</TooltipContent>
          </Tooltip>
        )}
        <SegmentedControl label="Result view" size="sm" value={shown} onValueChange={onViewChange} options={options} />
        {hasRun && (
          <span className={cn("ml-auto flex shrink-0 items-center gap-1.5 text-caption", statusTone(statusCode).text)}>
            <span className={cn("size-1.5 rounded-pill", statusTone(statusCode).dot)} />
            {statusCode} {STATUS_LABELS[statusCode] ?? ""}
          </span>
        )}
      </div>
      <div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card", showsResult && "h-[clamp(28rem,calc(100dvh-8rem),56rem)]", showsHistory && "h-[clamp(18rem,calc(100dvh-24rem),24rem)]")}>
        <div key={isLoading ? "running" : `${shown}-${hasRun}`} className="flex min-h-0 flex-1 animate-fade-in flex-col">
          {loading ??
            (showsHistory ? (
              history
            ) : showsResult ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
                {(stats || footnote) && (
                  <div className="flex shrink-0 items-center rounded-control border border-line-subtle px-1 py-2.5">
                    {stats && (
                      <dl className="flex min-w-0 items-center">
                        {stats.map(({ icon: Icon, value, label }) => (
                          <div key={label} className="flex flex-col gap-1 border-r border-line-subtle px-4 last-of-type:border-r-0">
                            <dt className="order-last text-caption text-fg-subtle">{label}</dt>
                            <dd className="flex items-center gap-1.5 text-body-sm font-medium text-fg tabular-nums">
                              <Icon className="size-3.5 text-fg-muted" strokeWidth={1.5} aria-hidden />
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {footnote && <span className="ml-auto truncate px-4 text-caption text-fg-subtle">{footnote}</span>}
                  </div>
                )}
                <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-control border border-line-subtle", shown !== "json" && "overflow-y-auto")}>{children}</div>
              </div>
            ) : (
              (children ?? ready)
            ))}
        </div>
      </div>
    </section>
  );
}

/** A run button with its cost in a pill after the action. */
export function PlaygroundRunButton({ creditLabel, className, children, ...props }: React.ComponentProps<"button"> & { creditLabel?: string }) {
  return (
    <Button variant="brand" size="sm" className={cn(creditLabel && "gap-2 pr-1.5", className)} {...props}>
      {children}
      {creditLabel && <span className="flex h-5 items-center rounded-pill bg-ring-on-brand px-2 text-caption whitespace-nowrap text-on-brand tabular-nums shadow-[inset_0_0_0_1px_var(--ds-color-ring-on-brand)]">{creditLabel}</span>}
    </Button>
  );
}

/** Before the first call: what will show up here, a few inputs to try in one click, and the run button again. */
export function PlaygroundReadyState({ action, examples = [], onExample, onRun, runDisabled, creditLabel, note }: { action: string; examples?: string[]; onExample?: (example: string) => void; onRun?: () => void; runDisabled?: boolean; creditLabel?: string; note?: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="text-h5 leading-snug font-normal tracking-normal text-fg">Ready to {action.toLowerCase()}</h3>
      <p className="max-w-sm text-body-sm text-balance text-fg-muted">Hit {action} and what comes back shows up here, as a preview and in full as JSON.</p>
      {examples.length > 0 && (
        <p className="max-w-md text-caption text-balance text-fg-subtle">
          Try{" "}
          {examples.map((example, i) => (
            <React.Fragment key={example}>
              <button type="button" onClick={() => onExample?.(example)} className="text-fg-brand hover:underline">
                {example.replace(/^https?:\/\//, "")}
              </button>
              {i < examples.length - 2 ? ", " : i === examples.length - 2 ? ", or " : ""}
            </React.Fragment>
          ))}
        </p>
      )}
      {note && <p className="max-w-md text-caption text-balance text-fg-subtle">{note}</p>}
      {onRun && (
        <PlaygroundRunButton onClick={onRun} disabled={runDisabled} creditLabel={creditLabel} className="mt-1">
          {action}
        </PlaygroundRunButton>
      )}
    </div>
  );
}

/** Pulsing dots while a call runs, naming what it's calling. */
export function PlaygroundRunningState({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
      <span className="flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="size-2 animate-pulse rounded-pill bg-brand motion-reduce:animate-none" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      <p role="status" className="text-body-sm text-fg-muted">
        {label}
      </p>
    </div>
  );
}

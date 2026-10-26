"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { Collapse } from "@/components/ui/collapse";
import { cn } from "@/lib/utils";

// An agent's or a job's steps as it works (extrapolated from the dashboard: the playground's request steps, the
// sidebar's quiet links and the brand's Collapse). Each line is body-sm in the muted gray with a 16px line glyph 8px
// before it; a line that is a link or button turns ink under the pointer. A running step's glyph is the brand's
// spinner, a pending one is faded, a failed one is the banner's red. A step that can open shows a chevron after its
// title that turns a quarter when open; its detail hangs from a light rule 16px in, in the subtle gray, and opens with
// its height through Collapse (300ms ease-out, at once with reduced motion).
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-sm *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:outline-2 *:has-[>[data-slot=trace-line]]:focus-visible:outline-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:outline-solid *:has-[>[data-slot=trace-line]]:focus-visible:outline-focus-ring",
        className,
      )}
      {...props}
    />
  );
}

function TraceLine({ className, status, ...props }: React.ComponentProps<"span"> & { status?: "running" | "error" | "pending" }) {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 text-body-sm leading-relaxed text-fg-muted transition-colors duration-150 ease-out in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-fg data-[status=error]:text-danger-strong data-[status=pending]:opacity-50 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn("flex size-4 shrink-0 items-center justify-center text-fg-subtle [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 in-data-[status=error]:text-alert-strong [[data-slot=trace-title]~&]:-ml-1", className)}
      {...props}
    />
  );
}

function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-title" className={cn("min-w-0 truncate", className)} {...props} />;
}

/** A step's quiet detail at its end: a duration or a count, in the subtle gray with tabular figures. */
function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-description" className={cn("shrink-0 text-fg-subtle tabular-nums", className)} {...props} />;
}

type CollapsibleState = { open: boolean; setOpen: (open: boolean) => void; contentId: string };
const CollapsibleContext = React.createContext<CollapsibleState | null>(null);

function useTraceCollapsible(part: string) {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error(`${part} must be inside TraceCollapsible.`);
  return context;
}

/** A step whose detail opens below it. Uncontrolled with `defaultOpen`, or controlled with `open` and `onOpenChange`. */
function TraceCollapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: React.ComponentProps<"div"> & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const contentId = React.useId();
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const value = React.useMemo(() => ({ open, setOpen, contentId }), [open, setOpen, contentId]);
  return (
    <CollapsibleContext.Provider value={value}>
      <div data-slot="trace-collapsible" data-state={open ? "open" : "closed"} className={cn("flex w-full min-w-0 flex-col", className)} {...props} />
    </CollapsibleContext.Provider>
  );
}

function TraceCollapsibleTrigger({ className, children, onClick, ...props }: React.ComponentProps<"button">) {
  const { open, setOpen, contentId } = useTraceCollapsible("TraceCollapsibleTrigger");
  return (
    <button
      type="button"
      data-slot="trace-collapsible-trigger"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-sm text-left text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-transform duration-200 ease-out group-aria-expanded/trace-collapsible-trigger:rotate-90 motion-reduce:transition-none">
        <ChevronRight className="size-3.5" strokeWidth={1.75} />
      </TraceIcon>
    </button>
  );
}

function TraceCollapsibleContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, contentId } = useTraceCollapsible("TraceCollapsibleContent");
  return (
    <Collapse open={open} id={contentId}>
      <div data-slot="trace-collapsible-content" className={cn("mt-2 mb-1 ml-2 min-w-0 border-l border-line pr-1 pl-4 text-body-sm leading-relaxed [overflow-wrap:anywhere] text-fg-subtle", className)}>
        {children}
      </div>
    </Collapse>
  );
}

export { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle };

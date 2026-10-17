"use client";

import * as React from "react";
import { ChevronDown, Info, RotateCcw, SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The playground's parameters: a floating panel (title, a count of what changed, Reset and close) whose groups of
// parameters scroll under soft fades, with a "More" pill while there is more below. Each group is one soft gray box
// ruled between rows; each row is the name at the left with its control at the right (a switch, a select, a number),
// the description under it at full width, and free-text fields below that. While a request runs the fields go inert
// and say so on hover, rather than the panel closing and the page shifting. It appears and goes at once; Escape closes
// it unless a menu or dialog is open over the page.

const FIELD = "h-8 rounded-control border-0 bg-wash-pill px-3 text-body-sm text-fg shadow-none outline-none transition-colors duration-150 hover:bg-wash-selected focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-focus-ring";
const ROW_ICON_BUTTON = "flex size-4 shrink-0 items-center justify-center rounded-sm text-fg-subtle outline-none transition-colors duration-150 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring";
// Long option labels wrap inside the narrow panel instead of pushing the control past its edge.
const CONTROL = "min-w-0 [&>*]:max-w-full";

function isOverlayOpen() {
  return Array.from(document.querySelectorAll('[role="dialog"]:not([data-slot="playground-parameters"]), [role="menu"], [role="listbox"]')).some((layer) => !layer.closest('[inert], [aria-hidden="true"]'));
}

/** The count of changed parameters: a small brand dot that rides beside "Parameters". */
function ParametersChangedCount({ count }: { count: number }) {
  return <span className="grid size-4 shrink-0 place-items-center rounded-pill bg-brand text-axis text-on-brand tabular-nums">{count}</span>;
}

/** The composer's toggle: pressed while the panel is open, with the changed count riding along so edits show when it's closed. */
function ParametersButton({ open, onToggle, modifiedCount = 0, className }: { open: boolean; onToggle: () => void; modifiedCount?: number; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      aria-label={modifiedCount > 0 ? `Parameters, ${modifiedCount} changed` : "Parameters"}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-body-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring",
        open ? "bg-wash-pill text-fg" : "text-fg-muted hover:bg-wash-hover hover:text-fg",
        className,
      )}
    >
      <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
      <span className="max-sm:hidden">Parameters</span>
      {modifiedCount > 0 && <ParametersChangedCount count={modifiedCount} />}
    </button>
  );
}

/** Pointer cover over the fields while a request runs, with a label that follows the cursor. Keyboard is cut off by `inert`. */
function FetchingOverlay() {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-20 cursor-not-allowed"
      onMouseMove={(e) => {
        const label = labelRef.current;
        if (!label) return;
        const box = e.currentTarget.getBoundingClientRect();
        const x = Math.min(e.clientX - box.left + 14, box.width - label.offsetWidth - 4);
        const y = Math.min(e.clientY - box.top + 14, box.height - label.offsetHeight - 4);
        label.style.transform = `translate(${Math.max(4, x)}px, ${Math.max(4, y)}px)`;
        label.style.opacity = "1";
      }}
      onMouseLeave={() => {
        if (labelRef.current) labelRef.current.style.opacity = "0";
      }}
    >
      <span ref={labelRef} className="pointer-events-none absolute top-0 left-0 rounded-sm bg-primary px-2 py-1 text-caption whitespace-nowrap text-on-primary opacity-0 transition-opacity duration-150">
        Uneditable while fetching
      </span>
    </div>
  );
}

function ParametersScroller({ fetching, children }: { fetching: boolean; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ above: false, below: false });
  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const above = el.scrollTop > 1;
    const below = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setEdges((c) => (c.above === above && c.below === below ? c : { above, below }));
  }, []);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={ref}
        onScroll={measure}
        inert={fetching || undefined}
        aria-busy={fetching}
        className={cn("flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-1 pb-4 transition-opacity duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", fetching && "opacity-50")}
      >
        {children}
      </div>
      <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-surface to-transparent transition-opacity duration-200", !edges.above && "opacity-0")} />
      <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface to-transparent transition-opacity duration-200", !edges.below && "opacity-0")} />
      {/* Pointer only: keyboard and screen reader users scroll the list itself. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => ref.current?.scrollBy({ top: ref.current.clientHeight * 0.8, behavior: "smooth" })}
        className={cn(
          "absolute bottom-2 left-1/2 flex h-6 -translate-x-1/2 items-center gap-1 rounded-pill bg-surface pr-2 pl-2.5 text-caption text-fg-muted shadow-card transition-[opacity,color,scale] duration-150 ease-out hover:text-fg active:scale-[0.97] motion-reduce:active:scale-100",
          (!edges.below || fetching) && "pointer-events-none opacity-0",
        )}
      >
        More
        <ChevronDown className="size-3.5" strokeWidth={1.5} />
      </button>
      {fetching && <FetchingOverlay />}
    </div>
  );
}

/** The panel. Place it yourself (the playground docks it 28px off the window's right edge, 320px wide, level with the title). */
function PlaygroundParameters({
  title = "Parameters",
  open,
  onOpenChange,
  modifiedCount = 0,
  onReset,
  fetching = false,
  className,
  children,
}: {
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modifiedCount?: number;
  onReset?: () => void;
  /** While true the fields stay in place but can't be edited. */
  fetching?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.shiftKey && !isOverlayOpen()) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <aside data-slot="playground-parameters" aria-label={title} className={cn("flex w-80 flex-col overflow-hidden rounded-card bg-surface shadow-card", className)}>
      <div className="mt-2 flex h-8 shrink-0 items-center gap-1.5 pr-2.5 pl-7">
        <h2 className="text-body text-fg">{title}</h2>
        {modifiedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <ParametersChangedCount count={modifiedCount} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{modifiedCount} changed</TooltipContent>
          </Tooltip>
        )}
        <span className="ml-auto flex items-center gap-1">
          {modifiedCount > 0 && onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={fetching}
              className="flex h-6 items-center gap-1.5 rounded-sm px-2.5 text-caption text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" strokeWidth={1.5} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={`Close ${title.toLowerCase()}`}
            className="grid size-7 place-items-center rounded-sm text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-pill hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X className="size-3.5" strokeWidth={1.5} />
          </button>
        </span>
      </div>
      <ParametersScroller fetching={fetching}>{children}</ParametersScroller>
    </aside>
  );
}

/** A section: a caption header (a step darker than the descriptions), then its rows together in one gray box. */
function ParameterGroup({ title, count, className, children }: { title: React.ReactNode; count?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="parameter-group" className="flex w-full min-w-0 flex-col">
      <h3 className="mb-2 flex flex-wrap items-baseline gap-2 px-3 text-caption font-medium text-fg-muted">
        {title}
        {count !== undefined && <span className="font-normal text-fg-subtle tabular-nums">{count}</span>}
      </h3>
      <div className={cn("divide-y divide-line overflow-hidden rounded-card bg-neutral-5 [&>*]:px-3", className)}>{children}</div>
    </section>
  );
}

/** One parameter. `stacked` puts the control under the description at full width (free text); `onReset` adds a reset icon. */
function ParameterRow({
  label,
  description,
  help,
  stacked = false,
  onReset,
  labelAction,
  children,
}: {
  label: string;
  description?: React.ReactNode;
  /** A longer note behind an info icon. */
  help?: React.ReactNode;
  stacked?: boolean;
  onReset?: () => void;
  labelAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const labelId = React.useId();
  const descriptionId = React.useId();
  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={description ? descriptionId : undefined} className="min-w-0 py-3">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <span className="inline-flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-fg">
          <span id={labelId} className="min-w-0 [overflow-wrap:anywhere]">
            {label}
          </span>
          {help && (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" aria-label={`About ${label}`} className={ROW_ICON_BUTTON}>
                  <Info className="size-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" collisionPadding={12} className="w-auto max-w-[calc(100vw-1.5rem)] [overflow-wrap:anywhere]">
                {help}
              </PopoverContent>
            </Popover>
          )}
          {labelAction}
          {onReset && (
            <button type="button" onClick={onReset} aria-label={`Reset ${label} to default`} title="Reset to default" className={ROW_ICON_BUTTON}>
              <RotateCcw className="size-3" />
            </button>
          )}
        </span>
        {!stacked && <div className={cn(CONTROL, "flex max-w-[55%] shrink-0 justify-end")}>{children}</div>}
      </div>
      {description && (
        <p id={descriptionId} className="mt-0.5 text-body-sm leading-snug text-fg-muted [overflow-wrap:anywhere]">
          {description}
        </p>
      )}
      {stacked && <div className={cn(CONTROL, "mt-2 w-full [&>input]:h-9")}>{children}</div>}
    </div>
  );
}

/** The panel's filled gray field: no border, a darker gray on hover. */
function ParameterInput({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      type={type}
      className={cn(
        FIELD,
        "w-28 max-w-full min-w-0 py-0 placeholder:text-fg-subtle",
        type === "number" && "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className,
      )}
      {...props}
    />
  );
}

/** A number with its unit after it (ms, pages) inside the same gray field. */
function ParameterUnitInput({ unit, className, ...props }: React.ComponentProps<"input"> & { unit: string }) {
  return (
    <div className={cn("flex h-8 w-28 max-w-full min-w-0 items-center rounded-control bg-wash-pill px-3 transition-colors duration-150 hover:bg-wash-selected", className)}>
      <ParameterInput type="number" className="h-auto min-w-0 flex-1 rounded-none bg-transparent p-0 hover:bg-transparent focus-visible:ring-0" {...props} />
      <span className="ml-1 shrink-0 text-caption text-fg-subtle lowercase">{unit}</span>
    </div>
  );
}

/** The panel's filled gray select. */
function ParameterSelect<T extends string>({ value, onValueChange, options, label, className }: { value: T; onValueChange: (value: T) => void; options: readonly { value: T; label: string }[]; label: string; className?: string }) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as T)}>
      <SelectTrigger aria-label={label} className={cn(FIELD, "w-auto max-w-48 min-w-28 justify-between py-1.5 pr-2.5 pl-3 [&>span]:min-w-0 [&>span]:truncate", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="w-auto">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ParameterGroup, ParameterInput, ParameterRow, ParametersButton, ParametersChangedCount, ParameterSelect, ParameterUnitInput, PlaygroundParameters };

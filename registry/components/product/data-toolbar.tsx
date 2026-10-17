"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

// Above a table: the search at the left, the filters (ghost selects, tags) at the right, one line that wraps only
// when it has to. The search is a 32px bordered field 256px wide; `collapsible` keeps it a 36px icon until it's
// opened, then a field ringed in blue that Escape or its close button clears and folds away.
function DataToolbar({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="data-toolbar" className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2", className)} {...props}>
      {children}
    </div>
  );
}

function DataToolbarSearch({
  value,
  onValueChange,
  placeholder = "Search",
  label,
  collapsible = false,
  className,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** The field's accessible name; the placeholder when left out. */
  label?: string;
  collapsible?: boolean;
  className?: string;
  /** Controls inside the open field, before its close button (search parameters). */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(value !== "");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focusOnOpen = React.useRef(false);
  React.useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    inputRef.current?.focus();
  }, [open]);
  const close = () => {
    onValueChange("");
    setOpen(false);
  };
  const name = label ?? placeholder;

  if (collapsible && !open && !value) {
    return (
      <button
        type="button"
        aria-label={name}
        onClick={() => {
          focusOnOpen.current = true;
          setOpen(true);
        }}
        className={cn("grid size-9 shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring", className)}
      >
        <Search className="size-4" strokeWidth={1.5} />
      </button>
    );
  }

  if (collapsible) {
    return (
      <search data-slot="data-toolbar-search" className={cn("flex h-9 w-64 min-w-0 shrink items-center gap-2 rounded-control border border-brand pr-1 pl-3.5 shadow-[0_0_0_4px_var(--ds-color-blue-10)]", className)}>
        <Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && close()}
          placeholder={placeholder}
          aria-label={name}
          className="min-w-0 flex-1 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {children}
        <button type="button" aria-label="Close search" onClick={close} className="grid size-7 shrink-0 place-items-center rounded-sm text-fg-subtle outline-none transition-colors duration-150 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring">
          <X className="size-3.5" strokeWidth={1.5} />
        </button>
      </search>
    );
  }

  return (
    <label
      data-slot="data-toolbar-search"
      className={cn("flex h-8 w-64 min-w-0 items-center gap-2 rounded-control border border-line px-3 transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-brand hover:border-line-strong motion-reduce:transition-none", className)}
    >
      <Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
      <input type="search" value={value} onChange={(e) => onValueChange(e.target.value)} placeholder={placeholder} aria-label={name} className="min-w-0 flex-1 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle" />
      {children}
    </label>
  );
}

/** The filters at the right end of the toolbar, 4px apart. */
function DataToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="data-toolbar-actions" className={cn("ml-auto flex flex-wrap items-center gap-1", className)} {...props} />;
}

export { DataToolbar, DataToolbarActions, DataToolbarSearch };

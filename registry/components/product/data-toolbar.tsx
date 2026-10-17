import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

// Above a table: a 36px search field with a 14px icon, filters beside it, the page's action at the right.
function DataToolbar({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="data-toolbar" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>{children}</div>;
}

function DataToolbarSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label className={cn("relative flex min-w-48 flex-1 items-center", className)}>
      <Search className="pointer-events-none absolute left-3 size-3.5 text-fg-subtle" strokeWidth={1.5} />
      <input
        type="search"
        data-slot="data-toolbar-search"
        className="h-9 w-full rounded-control border border-line bg-surface pr-3 pl-8.5 text-body-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-fg-faint hover:border-line-strong focus-visible:border-brand focus-visible:shadow-ring-hover"
        {...props}
      />
    </label>
  );
}

function DataToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ml-auto flex items-center gap-2", className)} {...props} />;
}

export { DataToolbar, DataToolbarActions, DataToolbarSearch };

import * as React from "react";

import { cn } from "@/lib/utils";

// The product's table: on a card with no outer border and no vertical rules; a faint gray header band in sentence
// case; rows divided by a light line with a faint hover wash; numbers in tabular figures.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-card bg-surface shadow-card">
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-left text-body-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("bg-neutral-10/40", className)} {...props} />;
}

function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t border-line-subtle", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("transition-colors duration-150 hover:bg-neutral-5/60 data-[state=selected]:bg-wash-selected", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th data-slot="table-head" className={cn("px-4 py-2.5 text-caption font-normal whitespace-nowrap text-fg-subtle", className)} {...props} />;
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("border-t border-line-subtle px-4 py-3 text-body-sm text-fg tabular-nums", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-3 text-caption text-fg-subtle", className)} {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

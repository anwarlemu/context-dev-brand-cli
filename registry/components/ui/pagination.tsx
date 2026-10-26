import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

// The dashboard's pagination (context-dashboard monitors, batches and usage lists): a row at the end of a list, 16px
// under the table card, in body-sm. Previous and Next are quiet 32px buttons, muted with a 14px chevron at stroke 1.5,
// washing gray and darkening under the pointer and fading to 40 percent when there is nowhere to go. Page numbers are
// 32px squares in the same style; the current one sits on the gray selected wash, as the sidebar marks the page you
// are on. PaginationSummary is the subtle "Page 2 of 5" in tabular figures before them.
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav role="navigation" aria-label="Pagination" data-slot="pagination" className={cn("flex w-full justify-end", className)} {...props} />;
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-wrap items-center gap-1 text-body-sm", className)} {...props} />;
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

const LINK =
  "flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-control px-2.5 text-body-sm text-fg-muted tabular-nums no-underline outline-none transition-colors duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-disabled:pointer-events-none aria-disabled:opacity-40 data-[active=true]:bg-wash-selected data-[active=true]:text-fg motion-reduce:transition-none [&_svg]:size-3.5 [&_svg]:shrink-0";

type PaginationLinkProps = { isActive?: boolean; disabled?: boolean } & React.ComponentProps<"a">;

function PaginationLink({ className, isActive, disabled, ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(LINK, className)}
      {...props}
    />
  );
}

function PaginationPrevious({ className, children = "Previous", ...props }: PaginationLinkProps) {
  return (
    <PaginationLink aria-label="Go to the previous page" className={cn("pr-3 pl-2.5", className)} {...props}>
      <ChevronLeft strokeWidth={1.5} />
      <span>{children}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, children = "Next", ...props }: PaginationLinkProps) {
  return (
    <PaginationLink aria-label="Go to the next page" className={cn("pr-2.5 pl-3", className)} {...props}>
      <span>{children}</span>
      <ChevronRight strokeWidth={1.5} />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn("flex size-8 items-center justify-center text-fg-subtle", className)} {...props}>
      <MoreHorizontal className="size-3.5" strokeWidth={1.5} />
      <span className="sr-only">More pages</span>
    </span>
  );
}

/** "Page 2 of 5" before the controls, in the subtle gray with tabular figures, 12px from them. */
function PaginationSummary({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="pagination-summary" className={cn("mr-2 text-body-sm text-fg-subtle tabular-nums", className)} {...props} />;
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationSummary };

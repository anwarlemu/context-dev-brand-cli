"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Search, type LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useScrollingScrollbars } from "@/hooks/use-scrolling-scrollbars";
import { cn } from "@/lib/utils";

// The dashboard's sidebar: on the canvas, no border or separate fill, 212px wide, 28px in from its edges. The workspace
// and search at the top (level with the top bar), one list of links centered in the space between, then any billing
// cards, Help, Documentation and the account at the foot. Spacers either side center the list and shrink away first,
// so a list taller than the space still scrolls from its first row; a long list (the playground's APIs) sits higher.
// The page you are on sits in a neutral gray wash (never blue), its name and icon a step short of black, and changes
// at once with no transition. Below 768px it is a white drawer over a scrim, opened from the top bar's menu button;
// it closes on Escape, on the scrim and once the window grows past it.
function AppSidebar({
  header,
  footer,
  open = false,
  onOpenChange,
  listPosition = "center",
  navLabel = "Dashboard",
  navRef,
  className,
  children,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** "high" for a long list: less space above it than below. */
  listPosition?: "center" | "high";
  navLabel?: string;
  navRef?: React.Ref<HTMLElement>;
  className?: string;
  children: React.ReactNode;
}) {
  useScrollingScrollbars();
  React.useEffect(() => {
    if (!open) return;
    const close = () => onOpenChange?.(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onWide = () => desktop.matches && close();
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWide);
    };
  }, [open, onOpenChange]);
  return (
    <>
      {/* Always there below md, fading with the drawer rather than popping in and out ahead of it. */}
      <div
        aria-hidden
        onClick={() => onOpenChange?.(false)}
        className={cn("fixed inset-0 z-40 bg-scrim transition-opacity duration-200 ease-emphasized md:hidden motion-reduce:transition-none", !open && "pointer-events-none opacity-0")}
      />
      <aside
        data-slot="app-sidebar"
        className={cn(
          "flex h-full w-(--ds-layout-sidebar) shrink-0 flex-col bg-canvas px-7",
          "max-md:fixed max-md:inset-y-2 max-md:left-2 max-md:z-50 max-md:h-auto max-md:rounded-shell max-md:bg-surface max-md:shadow-drawer max-md:transition-[translate,visibility] max-md:ease-emphasized motion-reduce:max-md:transition-none",
          open ? "max-md:translate-x-0 max-md:duration-250" : "max-md:invisible max-md:-translate-x-[calc(100%+1rem)] max-md:duration-200",
          className,
        )}
      >
        {header && <div className="flex shrink-0 items-center gap-0.5 pt-6 pb-2">{header}</div>}
        <nav ref={navRef} aria-label={navLabel} className="ds-scrollbar -mx-7 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-7 py-0.5">
          <div aria-hidden className="min-h-0 flex-1" />
          <div className="relative flex shrink-0 flex-col gap-1.5">{children}</div>
          <div aria-hidden className={cn("min-h-0", listPosition === "high" ? "flex-[2.5]" : "flex-1")} />
        </nav>
        {footer && <div className="flex flex-col gap-1.5 pt-2 pb-5.5">{footer}</div>}
      </aside>
    </>
  );
}

/** A group of links, named by a small outlined tag (sentence case, not a control). */
function SidebarGroup({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div data-slot="sidebar-group" className="flex flex-col gap-0.5">
      {label && <p className="mt-3 mb-1 ml-3 w-fit rounded-tag border border-line px-1.5 py-px font-sans text-axis leading-4 text-fg-muted">{label}</p>}
      {children}
    </div>
  );
}

const linkClass = (active: boolean) =>
  cn(
    "group/link relative flex h-8 w-full items-center gap-2.5 rounded-control pr-2 pl-3 text-body-sm no-underline outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring",
    active ? "bg-wash-selected font-medium text-neutral-80" : "text-fg-muted hover:bg-wash-hover hover:text-fg",
  );

/**
 * One link: a 16px icon at stroke 1.75, the page's name, and anything trailing it (Data APIs' chevron). Pass your
 * router's link with asChild (its children become the name), or render it as a button with `as="button"` (Help).
 */
function SidebarLink({
  icon: Icon,
  active = false,
  trailing,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { icon?: LucideIcon; active?: boolean; trailing?: React.ReactNode; asChild?: boolean }) {
  const inner = (label: React.ReactNode) => (
    <>
      {Icon && <Icon className={cn("size-4 shrink-0 transition-colors duration-150", active ? "text-neutral-80" : "text-fg-subtle group-hover/link:text-fg-muted")} strokeWidth={1.75} />}
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {trailing}
    </>
  );
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <Slot data-slot="sidebar-link" aria-current={active ? "page" : undefined} className={cn(linkClass(active), className)} {...(props as React.ComponentProps<typeof Slot>)}>
        {React.cloneElement(children, undefined, inner(children.props.children))}
      </Slot>
    );
  }
  return (
    <a data-slot="sidebar-link" aria-current={active ? "page" : undefined} className={cn(linkClass(active), className)} {...props}>
      {inner(children)}
    </a>
  );
}

/** A row in the sidebar's style that runs an action instead of going somewhere (Help opens its window). */
function SidebarButton({ icon: Icon, className, children, ...props }: React.ComponentProps<"button"> & { icon?: LucideIcon }) {
  return (
    <button type="button" data-slot="sidebar-button" className={cn(linkClass(false), className)} {...props}>
      {Icon && <Icon className="size-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover/link:text-fg-muted" strokeWidth={1.75} />}
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </button>
  );
}

/** The search button beside the workspace: a 32px ghost square with its shortcut in the tooltip. */
function SidebarSearchButton({ shortcut = "⌘K", onClick }: { shortcut?: string; onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label="Search"
          aria-keyshortcuts="Meta+K"
          className="mr-0.5 ml-auto grid size-8 shrink-0 place-items-center rounded-control text-fg-muted outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <Search className="size-3.5" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">Search · {shortcut}</TooltipContent>
    </Tooltip>
  );
}

export { AppSidebar, SidebarButton, SidebarGroup, SidebarLink, SidebarSearchButton };

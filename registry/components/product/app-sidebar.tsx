"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// The dashboard's sidebar: on the canvas, no border or separate fill, 212px wide; the workspace at the top, groups of
// links centered in the space, help and the account at the bottom. The page you are on sits in a neutral gray wash
// (never blue) and changes at once. Below 768px it is a white drawer over a scrim, from the top bar's menu button.
function AppSidebar({
  header,
  footer,
  open = false,
  onOpenChange,
  className,
  children,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange?.(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  return (
    <>
      <div
        aria-hidden
        onClick={() => onOpenChange?.(false)}
        className={cn("fixed inset-0 z-40 bg-scrim transition-opacity duration-200 ease-out md:hidden motion-reduce:transition-none", !open && "pointer-events-none opacity-0")}
      />
      <aside
        data-slot="app-sidebar"
        className={cn(
          "flex h-full w-53 shrink-0 flex-col bg-canvas px-7",
          "max-md:fixed max-md:inset-y-2 max-md:left-2 max-md:z-50 max-md:h-auto max-md:rounded-shell max-md:bg-surface max-md:shadow-floating max-md:transition-[translate,visibility] max-md:ease-out motion-reduce:max-md:transition-none",
          open ? "max-md:translate-x-0 max-md:duration-250" : "max-md:invisible max-md:-translate-x-[calc(100%+1rem)] max-md:duration-200",
          className,
        )}
      >
        {header && <div className="flex shrink-0 items-center gap-0.5 pt-6 pb-2">{header}</div>}
        <nav className="-mx-7 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-7 py-0.5">
          <div aria-hidden className="min-h-0 flex-1" />
          <div className="flex shrink-0 flex-col gap-1.5">{children}</div>
          <div aria-hidden className="min-h-0 flex-1" />
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
      {label && <p className="mt-3 mb-1 ml-3 w-fit rounded-sm border border-line px-1.5 py-px text-axis leading-4 text-fg-muted">{label}</p>}
      {children}
    </div>
  );
}

/** One link: a 16px icon at stroke 1.75 and the page's name. Pass a router link with asChild. */
function SidebarLink({
  icon: Icon,
  active = false,
  trailing,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { icon?: LucideIcon; active?: boolean; trailing?: React.ReactNode; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="sidebar-link"
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/link relative flex h-8 items-center gap-2.5 rounded-control pr-2 pl-3 text-body-sm no-underline outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-wash-selected font-medium text-neutral-80" : "text-fg-muted hover:bg-wash-hover hover:text-fg",
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {Icon && <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-neutral-80" : "text-fg-subtle group-hover/link:text-fg-muted")} strokeWidth={1.75} />}
          <span className="min-w-0 flex-1 truncate text-left">{children}</span>
          {trailing}
        </>
      )}
    </Comp>
  );
}

export { AppSidebar, SidebarGroup, SidebarLink };

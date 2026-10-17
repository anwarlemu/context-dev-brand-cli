"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";

// Level with the sidebar's workspace row (80px, 56px on phones). Every page heads itself, so the bar has no title and
// no fill: only the menu button where the sidebar is a drawer, and the credits (or the account) at the right.
function AppTopBar({ onMenuClick, className, children }: { onMenuClick?: () => void; className?: string; children?: React.ReactNode }) {
  return (
    <header data-slot="app-top-bar" className={cn("flex h-14 shrink-0 items-center justify-end gap-4 px-3 md:h-20 md:pr-4.5 md:pl-5", className)}>
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="mr-auto -ml-0.5 grid size-9 shrink-0 place-items-center rounded-control text-fg-muted outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring md:hidden"
        >
          <Menu className="size-4.5" strokeWidth={1.5} />
        </button>
      )}
      {children}
    </header>
  );
}

export { AppTopBar };

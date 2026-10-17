"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";

// No title and no bar fill: the menu button (on phones) at the left, the account or credits control at the right.
function AppTopBar({ onMenuClick, className, children }: { onMenuClick?: () => void; className?: string; children?: React.ReactNode }) {
  return (
    <div data-slot="app-top-bar" className={cn("flex h-20 shrink-0 items-center justify-end gap-2 px-5", className)}>
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="mr-auto grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring md:hidden [&_svg]:size-4"
        >
          <Menu strokeWidth={1.5} />
        </button>
      )}
      {children}
    </div>
  );
}

export { AppTopBar };

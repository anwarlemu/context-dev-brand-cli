"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Settings, Star } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Workspace = { id: string; name: string; plan?: string; logo?: string };

/** The workspace's logo, or its initial on a black tile. */
export function WorkspaceMark({ workspace, size = "sm" }: { workspace?: Workspace; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "size-4 rounded-icon text-initial" : "size-5 rounded-logo text-counter";
  if (workspace?.logo) return <img src={workspace.logo} alt="" className={cn("shrink-0 object-cover", sizeClass)} />;
  return <span className={cn("grid shrink-0 place-items-center bg-black font-medium text-white", sizeClass)}>{(workspace?.name || "H").trim().charAt(0).toUpperCase()}</span>;
}

// The workspace at the top of the sidebar: its mark and name in medium, up-down chevrons after. The menu lists your
// default workspace, then the others (each with its plan tag; hover one for the star that makes it your default), the
// current one with a settings button, and "Create organization" at the foot.
function WorkspaceSwitcher({
  workspaces,
  value,
  defaultId,
  onValueChange,
  onMakeDefault,
  onOpenSettings,
  onCreate,
  createLabel = "Create organization",
}: {
  workspaces: Workspace[];
  value: string;
  /** The default workspace (listed first, under its own label); the first workspace if not given. */
  defaultId?: string;
  onValueChange: (id: string) => void;
  onMakeDefault?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  onCreate?: () => void;
  createLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = workspaces.find((w) => w.id === value) ?? workspaces[0];
  const fallback = workspaces.find((w) => w.id === defaultId) ?? workspaces[0];
  const others = workspaces.filter((w) => w.id !== fallback?.id);
  const name = current?.name || "Home";
  const row = (w: Workspace, canMakeDefault: boolean) => {
    const isCurrent = w.id === value;
    return (
      <DropdownMenuItem
        key={w.id}
        onSelect={() => onValueChange(w.id)}
        aria-current={isCurrent ? "page" : undefined}
        className={cn("group/org h-9 pr-1.5", isCurrent ? "bg-neutral-5 data-[highlighted]:bg-neutral-5" : "")}
      >
        <WorkspaceMark workspace={w} size="md" />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className={cn("truncate", isCurrent ? "text-fg" : "text-fg-muted group-hover/org:text-fg")}>{w.name || "Home"}</span>
          {w.plan && <span className="shrink-0 rounded-icon bg-blue-10 px-1.5 py-px text-counter leading-badge text-fg-brand">{w.plan}</span>}
        </span>
        {canMakeDefault && onMakeDefault && (
          <button
            type="button"
            aria-label={`Make ${w.name} your default organization`}
            title="Make default"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMakeDefault(w.id);
            }}
            className="grid size-6 place-items-center rounded-tag text-fg-subtle opacity-0 transition-[color,opacity] duration-150 group-hover/org:opacity-100 group-focus-within/org:opacity-100 group-data-[highlighted]/org:opacity-100 hover:text-fg focus-visible:opacity-100 pointer-coarse:opacity-100"
          >
            <Star strokeWidth={1.5} />
          </button>
        )}
        {isCurrent && onOpenSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Organization settings"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                  onOpenSettings(w.id);
                }}
                className="grid size-6 place-items-center rounded-tag border border-line bg-surface text-fg-subtle transition-colors duration-150 hover:border-line-strong hover:text-fg"
              >
                <Settings strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Organization settings</TooltipContent>
          </Tooltip>
        )}
      </DropdownMenuItem>
    );
  };
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${name}, switch organization`}
          className="flex h-8 max-w-full min-w-0 items-center gap-2 rounded-control pr-2 pl-3 text-body-sm text-fg/80 outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover"
        >
          <WorkspaceMark workspace={current} />
          <span className="truncate text-left font-medium" title={name}>
            {name}
          </span>
          <ChevronsUpDown className="-ml-0.5 size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[min(70vh,var(--radix-dropdown-menu-content-available-height))] w-54 max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto">
        <DropdownMenuLabel className="text-body-sm">Default organization</DropdownMenuLabel>
        {fallback && row(fallback, false)}
        {others.length > 0 && (
          <>
            <DropdownMenuLabel className="mt-1 text-body-sm">Other organizations</DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">{others.map((w) => row(w, true))}</div>
          </>
        )}
        {onCreate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCreate}>
              <Plus strokeWidth={1.5} />
              {createLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { WorkspaceSwitcher };

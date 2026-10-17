"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type Workspace = { id: string; name: string; plan?: string; logo?: React.ReactNode };

// The workspace at the top of the sidebar: its mark, name and plan, opening a list of workspaces and "New workspace".
function WorkspaceSwitcher({ workspaces, value, onValueChange, onCreate }: { workspaces: Workspace[]; value: string; onValueChange: (id: string) => void; onCreate?: () => void }) {
  const current = workspaces.find((w) => w.id === value) ?? workspaces[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch workspace"
          className="group flex h-9 min-w-0 items-center gap-2 rounded-control px-2 text-left outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover"
        >
          <WorkspaceMark workspace={current} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-sm text-fg">{current?.name}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-fg-subtle group-hover:text-fg-muted" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onSelect={() => onValueChange(w.id)} className={cn(w.id === value && "text-fg")}>
            <WorkspaceMark workspace={w} />
            <span className="flex-1 truncate">{w.name}</span>
            {w.plan && <span className="text-caption text-fg-subtle">{w.plan}</span>}
            {w.id === value && <Check className="text-brand" strokeWidth={1.75} />}
          </DropdownMenuItem>
        ))}
        {onCreate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCreate}>
              <Plus strokeWidth={1.5} /> New workspace
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WorkspaceMark({ workspace }: { workspace?: Workspace }) {
  if (workspace?.logo) return <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-sm">{workspace.logo}</span>;
  return <span className="grid size-5 shrink-0 place-items-center rounded-sm bg-brand text-axis text-on-brand">{workspace?.name.slice(0, 1).toUpperCase()}</span>;
}

export { WorkspaceSwitcher };

"use client";

import * as React from "react";
import { Copy, ExternalLink, Pause, Pencil, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function Menu() {
  const [alerts, setAlerts] = React.useState(true);
  const [interval, setInterval] = React.useState("hourly");
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuLabel>stripe.com/pricing</ContextMenuLabel>
      <ContextMenuItem>
        <ExternalLink strokeWidth={1.5} />
        Open page
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy strokeWidth={1.5} />
        Copy URL
        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>
        <Pencil strokeWidth={1.5} />
        Rename
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem checked={alerts} onCheckedChange={(on) => setAlerts(on === true)}>
        Email me on change
      </ContextMenuCheckboxItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger>Check every</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuRadioGroup value={interval} onValueChange={setInterval}>
            <ContextMenuRadioItem value="15m">15 minutes</ContextMenuRadioItem>
            <ContextMenuRadioItem value="hourly">Hour</ContextMenuRadioItem>
            <ContextMenuRadioItem value="daily">Day</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuItem disabled>
        <Pause strokeWidth={1.5} />
        Pause (already paused)
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">
        <Trash2 strokeWidth={1.5} />
        Delete monitor
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

export function Site() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-36 w-full max-w-sm place-items-center rounded-card border border-dashed border-line-strong text-body-sm text-fg-muted">Right-click this monitor</ContextMenuTrigger>
      <Menu />
    </ContextMenu>
  );
}

export function Product() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex w-full max-w-sm items-center justify-between rounded-card bg-surface px-4 py-3 shadow-card">
        <span className="grid gap-0.5">
          <span className="text-body-sm text-fg">stripe.com/pricing</span>
          <span className="text-caption text-fg-subtle">Checked 4 minutes ago · right-click for actions</span>
        </span>
        <span className="font-mono text-caption text-success">Live</span>
      </ContextMenuTrigger>
      <Menu />
    </ContextMenu>
  );
}

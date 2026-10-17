"use client";

import { MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHoldItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// A row's overflow menu (open it from the button): a label, actions, a separator and a delete that must be held.
export function Product() {
  return (
    <div className="flex w-full max-w-md flex-col">
      <div className="flex items-center justify-between rounded-card bg-surface py-2 pr-2 pl-4 text-body-sm text-fg shadow-card">
        Production key
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Key actions">
              <MoreVertical strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Production key</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil strokeWidth={1.5} /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy strokeWidth={1.5} /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuHoldItem onConfirm={() => {}}>
              <Trash2 strokeWidth={1.5} /> Delete
            </DropdownMenuHoldItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

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

export function Product() {
  return (
    <DropdownMenu>
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
  );
}

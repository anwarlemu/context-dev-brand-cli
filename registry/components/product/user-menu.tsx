"use client";

import * as React from "react";
import { ChevronsUpDown, type LucideIcon, Monitor, Moon, Sun } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { setTheme, type Theme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

type MenuLink = { label: string; onSelect?: () => void; href?: string };

// The account at the foot of the sidebar: avatar, name and up-down chevrons; the menu shows who you are, your links in
// groups, and the theme switch (light, system, dark).
function UserMenu({ name, email, image, sections = [] }: { name: string; email?: string; image?: string; sections?: MenuLink[][] }) {
  const theme = useTheme();
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group flex h-9 w-full items-center gap-2.5 rounded-control px-3 text-body-sm text-fg outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-wash-hover"
        >
          <Avatar className="size-5">
            {image && <AvatarImage src={image} alt="" />}
            <AvatarFallback className="bg-brand text-axis text-on-brand">{initials}</AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-left">{name}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-fg-subtle transition-colors group-hover:text-fg-muted" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        <div className="flex items-center gap-2.5 rounded-control bg-neutral-5 px-2.5 py-2">
          <Avatar className="size-7">
            {image && <AvatarImage src={image} alt="" />}
            <AvatarFallback className="bg-brand text-on-brand">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-body-sm text-fg">{name}</p>
            {email && <p className="truncate text-caption text-fg-subtle">{email}</p>}
          </div>
        </div>
        {sections.map((section, i) => (
          <React.Fragment key={i}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col gap-0.5">
              {section.map((item) => (
                <DropdownMenuItem key={item.label} onSelect={item.onSelect} asChild={!!item.href}>
                  {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between py-0.5 pr-0.5 pl-2.5">
          <span className="text-body-sm text-fg-muted">Theme</span>
          <div className="flex rounded-control border border-line p-0.5" role="radiogroup" aria-label="Theme">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                aria-label={label}
                title={label}
                onClick={() => setTheme(value)}
                className={cn(
                  "grid size-6 place-items-center rounded-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
                  theme === value ? "bg-blue-10 text-fg-brand" : "text-fg-subtle hover:text-fg",
                )}
              >
                <Icon strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };

"use client";

import * as React from "react";
import { ChevronsUpDown, type LucideIcon, Monitor, Moon, Sun } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { setTheme, type Theme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

export type UserMenuLink = { label: string; href?: string; external?: boolean; onSelect?: () => void };

export function initialsOf(name: string, email = "") {
  const words = (name.trim() || email).split(/[\s@._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** A round photo, or the initials on brand blue. */
export function UserAvatar({ image, initials, size = "sm" }: { image?: string; initials: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "size-5 text-[calc(var(--ds-text-axis)*0.8)]" : "size-8 text-axis";
  if (image) return <img src={image} alt="" referrerPolicy="no-referrer" className={cn("shrink-0 rounded-pill object-cover", sizeClass)} />;
  return <span className={cn("grid shrink-0 place-items-center rounded-pill bg-brand text-on-brand", sizeClass)}>{initials}</span>;
}

// The account at the foot of the sidebar: avatar, name (or the email when there is no name) and the same up-down
// chevrons as the workspace switcher, since it opens a menu and nothing about it moves. The menu opens upward: who you
// are on a gray card, your links in groups, the theme switch (light, system, dark), then Log out in red.
function UserMenu({
  name,
  email = "",
  image,
  sections = [],
  onLogOut,
}: {
  name: string;
  email?: string;
  image?: string;
  sections?: UserMenuLink[][];
  onLogOut?: () => void;
}) {
  const theme = useTheme();
  const displayName = name.trim();
  const hasName = displayName !== "" && displayName !== email;
  const shownName = hasName ? displayName : email || "User";
  const initials = initialsOf(name, email);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group flex h-9 w-full items-center gap-2.5 rounded-control px-3 text-body-sm text-fg outline-none transition-colors duration-150 hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover"
        >
          <UserAvatar image={image} initials={initials} />
          <span className="flex-1 truncate text-left">{shownName}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-fg-muted" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60 gap-0">
        <div className="flex items-center gap-2.5 rounded-control bg-neutral-5 px-2.5 py-2">
          <UserAvatar image={image} initials={initials} size="md" />
          <div className="min-w-0">
            <p className="truncate text-body-sm text-fg">{shownName}</p>
            {hasName && email && <p className="truncate text-caption text-fg-subtle">{email}</p>}
          </div>
        </div>
        {sections.map((section) => (
          <React.Fragment key={section.map((item) => item.href ?? item.label).join("|")}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col gap-0.5">
              {section.map((item) => (
                <DropdownMenuItem key={item.label} onSelect={item.onSelect} asChild={!!item.href}>
                  {item.href ? (
                    <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
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
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    aria-label={label}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "grid size-6 place-items-center rounded-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring",
                      theme === value ? "bg-blue-10 text-fg-brand" : "text-fg-subtle hover:text-fg",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        {onLogOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onLogOut}>
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };

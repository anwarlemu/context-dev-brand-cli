"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AppSidebar, SidebarGroup, SidebarLink, SidebarSearchButton } from "@/components/product/app-sidebar";
import { AppTopBar } from "@/components/product/app-top-bar";
import { CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Surface } from "@/lib/surface";
import { LogoMark } from "@www/components/logo";

type Group = { id: string; label: string; type: string; items: { name: string; title: string }[] };

/** The docs' own pages, above the library in the sidebar. */
export const PAGES = [
  { href: "/", label: "Introduction" },
  { href: "/components", label: "All components" },
  { href: "/theme", label: "Theme" },
  { href: "/agents", label: "Agents" },
  { href: "/cli", label: "CLI" },
];

function LibrarySearch({ groups, open, onOpenChange, onNavigate }: { groups: Group[]; open: boolean; onOpenChange: (open: boolean) => void; onNavigate: (href: string) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search the library" description="Find a component, block, or visual.">
      <CommandInput placeholder="Search the library…" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.id} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem key={item.name} value={`${item.title} ${item.name}`} onSelect={() => onNavigate(`/components/${item.name}`)}>
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <CommandFooter><span><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Open</span><span><Kbd>esc</Kbd> Close</span></CommandFooter>
    </CommandDialog>
  );
}

/**
 * Every docs page lives in the dashboard's own shell: its sidebar (the logo, search and a filter at the top; the docs'
 * pages, then every group of the library A to Z; GitHub and context.dev at the foot), the top bar, and the page
 * scrolling beside them. The shell stays mounted between pages, so the sidebar keeps its scroll and its filter. The
 * command palette (⌘K) and Shift+Escape (back to the library) work everywhere. Nothing animates on navigation.
 */
export function LibraryShell({ groups, name, repo, site, children }: { groups: Group[]; name: string; repo: string; site: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [pending, setPending] = React.useState<string | null>(null);
  const [pendingPath, setPendingPath] = React.useState(pathname);
  const nav = React.useRef<HTMLElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const current = pathname.startsWith("/components/") ? pathname.slice("/components/".length) : undefined;
  const group = groups.find((g) => g.items.some((item) => item.name === current));
  const title = group?.items.find((item) => item.name === current)?.title ?? PAGES.find((p) => p.href === pathname)?.label;
  const active = pending ?? pathname;
  const q = query.trim().toLowerCase();
  const shown = groups.map((g) => ({ ...g, items: q ? g.items.filter((i) => i.title.toLowerCase().includes(q) || i.name.includes(q)) : g.items })).filter((g) => g.items.length);

  if (pendingPath !== pathname) {
    setPendingPath(pathname);
    setPending(null);
  }

  React.useEffect(() => {
    setNavOpen(false);
    content.current?.scrollTo({ top: 0 });
    // Keep the current row in view without moving the list when it already shows.
    const list = nav.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !link) return;
    const row = link.getBoundingClientRect();
    const viewport = list.getBoundingClientRect();
    if (row.top < viewport.top || row.bottom > viewport.bottom) list.scrollTop += row.top - viewport.top - list.clientHeight / 3;
  }, [pathname]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setNavOpen(false);
        setSearchOpen((open) => !open);
      }
      const typing = event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));
      if (event.key === "Escape" && event.shiftKey && group && !typing && !document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) {
        event.preventDefault();
        setNavOpen(false);
        router.push("/components");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [group, router]);

  const navigate = (href: string) => {
    setSearchOpen(false);
    setNavOpen(false);
    setPending(href);
    router.push(href);
  };

  return (
    <Surface kind="product" data-library-shell="" className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <AppSidebar
        navLabel="Library"
        navRef={nav}
        open={navOpen}
        onOpenChange={setNavOpen}
        listPosition="high"
        header={
          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex items-center gap-0.5">
              <Link href="/" aria-label={`${name} home`} className="flex h-8 min-w-0 items-center gap-2 rounded-control pr-2 pl-3 text-body-sm font-medium outline-none hover:bg-wash-hover focus-visible:ring-2 focus-visible:ring-focus-ring">
                <LogoMark className="h-4 shrink-0" />
                <span className="truncate">{name}</span>
              </Link>
              <SidebarSearchButton onClick={() => { setNavOpen(false); setSearchOpen(true); }} />
            </div>
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter components" aria-label="Filter components" className="h-8 rounded-control px-3" />
          </div>
        }
        footer={
          <>
            <SidebarLink href={repo} target="_blank" rel="noreferrer">GitHub</SidebarLink>
            <SidebarLink href={site} target="_blank" rel="noreferrer">context.dev</SidebarLink>
          </>
        }
      >
        {!q && (
          <SidebarGroup>
            {PAGES.map((p) => (
              <SidebarLink key={p.href} asChild active={active === p.href} onClick={() => setPending(p.href)}>
                <Link href={p.href}>{p.label}</Link>
              </SidebarLink>
            ))}
          </SidebarGroup>
        )}
        {shown.map((g) => (
          <SidebarGroup key={g.id} label={g.label}>
            {g.items.map((item) => (
              <SidebarLink key={item.name} asChild active={active === `/components/${item.name}`} onClick={() => setPending(`/components/${item.name}`)}>
                <Link href={`/components/${item.name}`} title={item.title} data-item={item.name}>{item.title}</Link>
              </SidebarLink>
            ))}
          </SidebarGroup>
        ))}
        {q && !shown.length && <p className="px-3 py-2 text-body-sm text-fg-muted">Nothing matches.</p>}
      </AppSidebar>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar onMenuClick={() => setNavOpen(true)}>
          <span className="mr-auto truncate text-body-sm text-fg-muted">{title ?? "Component library"}</span>
          <Link href="/" className="shrink-0 text-body-sm text-fg-muted outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring">Design system</Link>
        </AppTopBar>
        <div ref={content} data-docs-content="" className="ds-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
      <LibrarySearch groups={groups} open={searchOpen} onOpenChange={setSearchOpen} onNavigate={navigate} />
    </Surface>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { AppSidebar, SidebarGroup, SidebarLink, SidebarSearchButton } from "@/components/product/app-sidebar";
import { AppTopBar } from "@/components/product/app-top-bar";
import { CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { Surface } from "@/lib/surface";
import { LogoMark } from "@www/components/logo";

type Group = { id: string; label: string; type: string; items: { name: string; title: string }[] };

function LibrarySearch({ groups, open, onOpenChange, onNavigate }: { groups: Group[]; open: boolean; onOpenChange: (open: boolean) => void; onNavigate: (href: string) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search the library" description="Find a component, block, or visual.">
      <CommandInput placeholder="Search the library…" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        {groups.map((group) => {
          return (
            <CommandGroup key={group.id} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem key={item.name} value={`${item.title} ${item.name}`} onSelect={() => onNavigate(`/components/${item.name}`)}>
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
      <CommandFooter><span><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span><span><Kbd>↵</Kbd> Open</span><span><Kbd>esc</Kbd> Close</span></CommandFooter>
    </CommandDialog>
  );
}

// The docs use the same sidebar, links, group tags, command palette, and mobile drawer as the product library.
export function LibraryShell({ groups, name, repo, children }: { groups: Group[]; name: string; repo: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);
  const [pendingPath, setPendingPath] = React.useState(pathname);
  const nav = React.useRef<HTMLElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const current = pathname.slice("/components/".length);
  const group = groups.find((g) => g.items.some((item) => item.name === current));
  const title = group?.items.find((item) => item.name === current)?.title;
  const active = pending ?? pathname;

  if (pendingPath !== pathname) {
    setPendingPath(pathname);
    setPending(null);
  }

  React.useEffect(() => {
    setNavOpen(false);
    content.current?.scrollTo({ top: 0 });
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
        listPosition={group ? "high" : "center"}
        header={
          <>
            <Link href="/" aria-label={`${name} home`} className="flex h-8 min-w-0 items-center gap-2 rounded-control pr-2 pl-3 text-body-sm font-medium hover:bg-wash-hover">
              <LogoMark className="h-4 shrink-0" />
              <span className="truncate">{name}</span>
            </Link>
            <SidebarSearchButton onClick={() => { setNavOpen(false); setSearchOpen(true); }} />
          </>
        }
        footer={
          <>
            <SidebarLink asChild><Link href="/theme">Tokens</Link></SidebarLink>
            <SidebarLink asChild><Link href="/cli">Use the CLI</Link></SidebarLink>
            <SidebarLink href={repo} target="_blank" rel="noreferrer">GitHub</SidebarLink>
          </>
        }
      >
        <SidebarGroup>
          <SidebarLink asChild active={active === "/components"} onClick={() => setPending("/components")}>
            <Link href="/components">{group ? "Back" : "Library"}</Link>
          </SidebarLink>
        </SidebarGroup>
        {group ? (
          <SidebarGroup label={group.label}>
            {group.items.map((item) => (
              <SidebarLink key={item.name} asChild active={active === `/components/${item.name}`} onClick={() => setPending(`/components/${item.name}`)}>
                <Link href={`/components/${item.name}`} title={item.title}>{item.title}</Link>
              </SidebarLink>
            ))}
          </SidebarGroup>
        ) : (
          <SidebarGroup label="Browse">
            {groups.map((g) => (
              <SidebarLink key={g.id} asChild trailing={<ChevronRight className="size-3.5 text-fg-subtle" strokeWidth={1.75} />}>
                <Link href={`/components/${g.items[0].name}`}>{g.label}</Link>
              </SidebarLink>
            ))}
          </SidebarGroup>
        )}
      </AppSidebar>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar onMenuClick={() => setNavOpen(true)}>
          <span className="mr-auto text-body-sm text-fg-muted">{title ?? "Component library"}</span>
          <Link href="/" className="text-body-sm text-fg-muted hover:text-fg">Design system</Link>
        </AppTopBar>
        <div ref={content} data-docs-content="" className="ds-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
      <LibrarySearch groups={groups} open={searchOpen} onOpenChange={setSearchOpen} onNavigate={navigate} />
    </Surface>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

type Group = { label: string; items: { name: string; title: string }[] };

const LINK =
  "block rounded-control px-2.5 py-1.5 text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring aria-[current=page]:bg-blue-10 aria-[current=page]:text-fg-brand motion-reduce:transition-none";

function useCurrent() {
  const pathname = usePathname();
  return pathname.startsWith("/components/") ? pathname.slice("/components/".length) : undefined;
}

function Filter({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("flex h-9 items-center gap-2 rounded-control bg-surface px-2.5 shadow-[0_0_0_1px_var(--ds-color-border-hairline)] transition-shadow duration-150 ease-out focus-within:shadow-[0_0_0_1px_var(--ds-color-blue-60)] motion-reduce:transition-none", className)}>
      <Search aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter the library"
        aria-label="Filter the library"
        className="min-w-0 flex-1 bg-transparent text-body-sm text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  );
}

function Groups({ groups, current, query }: { groups: Group[]; current?: string; query: string }) {
  const q = query.trim().toLowerCase();
  const shown = groups.map((g) => ({ ...g, items: q ? g.items.filter((i) => i.title.toLowerCase().includes(q) || i.name.includes(q)) : g.items })).filter((g) => g.items.length);
  if (!shown.length) return <p className="px-2.5 py-2 text-body-sm text-fg-subtle">Nothing matches.</p>;
  return (
    <>
      {shown.map((g) => (
        <div key={g.label} className="mb-6 last:mb-0">
          <p className="mb-1.5 px-2.5 text-body-sm font-medium text-fg">{g.label}</p>
          <ul className="grid gap-px">
            {g.items.map((i) => (
              <li key={i.name}>
                <Link href={`/components/${i.name}`} aria-current={i.name === current ? "page" : undefined} data-item={i.name} className={LINK}>
                  {i.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/**
 * The library's sidebar, from 1024px: sticky under the header and as tall as the screen, scrolling on its own. It
 * brings the current item into view only when it is out of sight, so picking an item never moves the list under the
 * pointer.
 */
export function LibraryNav({ groups }: { groups: Group[] }) {
  const current = useCurrent();
  const [query, setQuery] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const list = listRef.current;
    const link = current ? list?.querySelector<HTMLElement>(`[data-item="${current}"]`) : null;
    if (!list || !link) return;
    // The list is the link's offset parent, so offsetTop is the link's place in the list.
    const top = link.offsetTop;
    if (top < list.scrollTop || top + link.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top - list.clientHeight / 3;
  }, [current]);

  return (
    <aside aria-label="Library" className="sticky top-18 hidden h-[calc(100svh-var(--spacing)*18)] w-56 shrink-0 flex-col self-start lg:flex">
      <div className="pt-8 pb-3 pr-4">
        <Filter value={query} onChange={setQuery} />
      </div>
      <div
        ref={listRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain pr-4 pb-10 [mask-image:linear-gradient(to_bottom,transparent,var(--ds-color-black)_var(--ds-space-3),var(--ds-color-black)_calc(100%-var(--ds-space-8)),transparent)] [scrollbar-width:thin] [scrollbar-color:var(--ds-color-neutral-20)_transparent]"
      >
        <div className="pt-3">
          <Groups groups={groups} current={current} query={query} />
        </div>
      </div>
    </aside>
  );
}

/** Below 1024px: a bar that sticks under the header and opens the same list. */
export function LibraryBar({ groups }: { groups: Group[] }) {
  const current = useCurrent();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [current]);
  const title = groups.flatMap((g) => g.items).find((i) => i.name === current)?.title;
  return (
    <div className="sticky top-16 z-30 border-b border-line-subtle bg-surface/90 backdrop-blur-[var(--ds-space-3)] min-[880px]:top-18 lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="mx-auto flex h-11 w-full max-w-(--ds-frame-column) items-center justify-between gap-3 px-6 text-body-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring sm:px-8 md:px-10"
      >
        <span className="truncate">
          <span className="text-fg-muted">Library</span>
          {title && <span className="text-fg"> / {title}</span>}
        </span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-fg-muted transition-transform duration-200 ease-out motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mx-auto max-h-[70svh] max-w-(--ds-frame-column) overflow-y-auto overscroll-contain border-t border-line-subtle px-4 pt-3 pb-6 sm:px-6 md:px-8">
          <Filter value={query} onChange={setQuery} className="mb-4" />
          <Groups groups={groups} current={current} query={query} />
        </div>
      )}
    </div>
  );
}

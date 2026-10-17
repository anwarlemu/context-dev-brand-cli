import Link from "next/link";

import { GROUPS, items } from "@www/lib/registry";

export function Sidebar({ current }: { current?: string }) {
  return (
    <nav className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-56 shrink-0 overflow-y-auto py-8 pr-4 md:block">
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type);
        if (!list.length) return null;
        return (
          <div key={g.type} className="mb-6">
            <p className="mb-2 text-caption tracking-wide text-fg-subtle uppercase">{g.label}</p>
            <ul className="grid gap-0.5">
              {list.map((i) => (
                <li key={i.name}>
                  <Link
                    href={`/components/${i.name}`}
                    aria-current={i.name === current ? "page" : undefined}
                    className="block rounded-control px-2.5 py-1.5 text-body-sm text-fg-muted transition-colors duration-150 hover:bg-wash-hover hover:text-fg aria-[current=page]:bg-wash-pill aria-[current=page]:text-fg"
                  >
                    {i.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

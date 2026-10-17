import Link from "next/link";

import { GROUPS, items } from "@www/lib/registry";

export function Sidebar({ current }: { current?: string }) {
  return (
    <nav aria-label="Library" className="sticky top-18 hidden max-h-[calc(100dvh-var(--spacing)*18)] w-52 shrink-0 overflow-y-auto overscroll-contain py-10 pr-4 [scrollbar-width:none] lg:block">
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type);
        if (!list.length) return null;
        return (
          <div key={g.type} className="mb-7">
            <p className="mb-2 px-2.5 text-body-sm font-medium text-fg">{g.label}</p>
            <ul className="grid gap-px">
              {list.map((i) => (
                <li key={i.name}>
                  <Link
                    href={`/components/${i.name}`}
                    aria-current={i.name === current ? "page" : undefined}
                    className="block rounded-control px-2.5 py-1.5 text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-focus-ring aria-[current=page]:bg-blue-10 aria-[current=page]:text-fg-brand motion-reduce:transition-none"
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

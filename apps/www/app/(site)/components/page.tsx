import Link from "next/link";

import { InstallCommand } from "@/components/site/code-window";
import { DocsHeading, DocsSection, DocsSectionRule } from "@www/components/docs-section";
import { Prose } from "@www/components/prose";
import { GROUPS, items, registryName } from "@www/lib/registry";

export const metadata = { title: "Library" };

const SURFACE = { site: "Site", product: "Product", both: "Site and product" } as const;

export default function Library() {
  return (
    <main>
      <DocsSection lines header="under">
        <DocsHeading
          as="h1"
          title="The library,"
          accent="piece by piece."
          description={`Everything the ${registryName} site and product draw, as React components on Tailwind. Add any item and it brings the theme and what it needs.`}
        >
          <InstallCommand command="npx context-ds add <item>" />
        </DocsHeading>
      </DocsSection>
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type);
        if (!list.length) return null;
        return (
          <DocsSection key={g.type} id={g.id} lines>
            <DocsHeading title={g.label} description={g.blurb} />
            <DocsSectionRule />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {list.map((i) => (
                <li key={i.name} className="flex">
                  <Link
                    href={`/components/${i.name}`}
                    className="group/item flex w-full flex-col gap-3 rounded-card p-6 shadow-[0_0_0_1px_var(--ds-color-border-hairline)] outline-none transition-shadow duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring motion-reduce:transition-none [@media(hover:hover)]:hover:shadow-[0_0_0_1px_var(--ds-color-blue-40),0_0_0_var(--ds-space-1)_var(--ds-color-ring-tint)]"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-body font-medium text-fg">{i.title}</span>
                      <span className="shrink-0 text-caption text-fg-subtle">{SURFACE[i.surface]}</span>
                    </span>
                    <span className="line-clamp-3 text-body-sm text-fg-muted"><Prose text={i.description} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </DocsSection>
        );
      })}
    </main>
  );
}

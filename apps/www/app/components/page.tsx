import Link from "next/link";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { InstallCommand } from "@/components/site/code-window";
import { GROUPS, items, registryName } from "@www/lib/registry";

export const metadata = { title: "Library" };

const SURFACE = { site: "Site", product: "Product", both: "Site and product" } as const;

export default function Library() {
  return (
    <main>
      <SiteSection lines header="under">
        <SectionHeading
          as="h1"
          title="The library,"
          accent="piece by piece."
          description={`Everything the ${registryName} site and product draw, as React components on Tailwind. Add any item and it brings the theme and what it needs.`}
        >
          <InstallCommand command="npx context-ds add <item>" />
        </SectionHeading>
      </SiteSection>
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type);
        if (!list.length) return null;
        return (
          <SiteSection key={g.type} id={g.id} lines>
            <SectionHeading title={g.label} description={g.blurb} />
            <SectionHeaderRule />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((i) => (
                <li key={i.name} className="flex">
                  <Link
                    href={`/components/${i.name}`}
                    className="group/item flex w-full flex-col gap-2 rounded-card p-5 shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_0_0_var(--ds-space-1-5)_var(--ds-color-ring-tint)] outline-none transition-shadow duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring motion-reduce:transition-none [@media(hover:hover)]:hover:shadow-[0_0_0_1px_var(--ds-color-blue-40),0_0_0_var(--ds-space-1-5)_var(--ds-color-blue-10)]"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-body font-medium text-fg">{i.title}</span>
                      <span className="shrink-0 text-caption text-fg-subtle">{SURFACE[i.surface]}</span>
                    </span>
                    <span className="line-clamp-3 text-body-sm text-fg-muted">{i.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </SiteSection>
        );
      })}
    </main>
  );
}

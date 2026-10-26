import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallCommand } from "@/components/site/code-window";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { Prose } from "@www/components/prose";
import { GROUPS, items } from "@www/lib/registry";

export const metadata = { title: "Library" };
const SURFACE = { site: "Site", product: "Product", both: "Site and product" } as const;

export default function Library() {
  return (
    <DocsPage>
      <PageHead title="All components" description="Components, blocks and visuals for Context.dev pages and interfaces. Check the usage notes and examples before adding one.">
        <InstallCommand command="npx context-ds add <item>" />
      </PageHead>
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type).sort((a, b) => a.title.localeCompare(b.title));
        if (!list.length) return null;
        return (
          <DocsSection key={g.type} id={g.id} title={g.label} description={`${g.blurb} ${list.length} items.`}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {list.map((item) => (
                <li key={item.name}>
                  <Link href={`/components/${item.name}`} className="group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Card className="h-full gap-3 transition-shadow duration-150 ease-out group-hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)] motion-reduce:transition-none">
                      <CardHeader className="flex flex-row items-baseline justify-between gap-3">
                        <CardTitle className="text-body-sm font-medium">{item.title}</CardTitle>
                        <span className="shrink-0 text-caption text-fg-subtle">{SURFACE[item.surface]}</span>
                      </CardHeader>
                      <CardContent className="text-fg-muted"><Prose text={item.description} /></CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </DocsSection>
        );
      })}
    </DocsPage>
  );
}

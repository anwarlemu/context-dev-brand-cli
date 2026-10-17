import Link from "next/link";

import { PageColumn, PageHeader, PageSection } from "@/components/product/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallCommand } from "@/components/site/code-window";
import { Prose } from "@www/components/prose";
import { GROUPS, items } from "@www/lib/registry";

export const metadata = { title: "Library" };
const SURFACE = { site: "Site", product: "Product", both: "Site and product" } as const;

export default function Library() {
  return (
    <main>
      <PageColumn className="gap-12 pt-4 pb-20">
        <PageHeader
          title="Component library"
          description="Components for Context.dev pages and interfaces. Check the usage notes and examples before adding one."
          action={<InstallCommand command="npx context-ds add <item>" />}
        />
        {GROUPS.map((g) => {
          const list = items.filter((i) => i.type === g.type);
          if (!list.length) return null;
          return (
            <div key={g.type} id={g.id} className="scroll-mt-8">
              <PageSection title={g.label} action={<span className="text-caption text-fg-subtle">{list.length} items</span>}>
                <p className="text-body-sm text-fg-muted">{g.blurb}</p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {list.map((item) => (
                    <li key={item.name}>
                      <Link href={`/components/${item.name}`} className="group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                        <Card className="h-full gap-3 transition-shadow duration-150 hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)]">
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
              </PageSection>
            </div>
          );
        })}
      </PageColumn>
    </main>
  );
}

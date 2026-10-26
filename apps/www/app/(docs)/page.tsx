import Link from "next/link";

import { InstallCommand } from "@/components/site/code-window";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { Prose } from "@www/components/prose";
import { APPLY_COMMAND, GROUPS, SETUP_COMMAND, items, registryName } from "@www/lib/registry";

export default function Home() {
  return (
    <DocsPage>
      <PageHead
        title={`${registryName} design system`}
        description={`Components, tokens and agent instructions for building ${registryName} pages and dashboards: ${items.length} items, each with live examples, usage notes and source, for the site and the product.`}
        actions={<Link href="/agents" className="text-fg-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">Agent instructions</Link>}
      />
      <DocsSection title="Install the CLI" description="Run once from the project root. Use product for dashboards and site for marketing pages; init installs the theme, fonts and agent instructions without touching existing styles.">
        <InstallCommand command={SETUP_COMMAND} />
      </DocsSection>
      <DocsSection title="Add components" description="Components need React 19.2 or later, Tailwind CSS 4 and the @/* source alias. The CLI copies the source and installs what each item needs.">
        <InstallCommand command={`${APPLY_COMMAND} add button card field input --surface product`} />
      </DocsSection>
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type).sort((a, b) => a.title.localeCompare(b.title));
        if (!list.length) return null;
        return (
          <DocsSection key={g.type} id={g.id} title={g.label} description={`${g.blurb} ${list.length} items.`}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((item) => (
                <li key={item.name}>
                  <Link href={`/components/${item.name}`} className="group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Card className="h-full gap-1.5 transition-shadow duration-150 ease-out group-hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)] motion-reduce:transition-none">
                      <CardHeader>
                        <CardTitle className="text-body-sm font-medium">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="line-clamp-2 text-fg-muted"><Prose text={item.description} /></CardContent>
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

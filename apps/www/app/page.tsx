import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Code } from "@www/components/code";
import { GROUPS, items, registryName, registryUrl } from "@www/lib/registry";

export default function Home() {
  return (
    <main className="mx-auto max-w-(--ds-layout-column-wide) px-6">
      <section className="py-20 text-center">
        <p className="mb-4 text-body-sm text-fg-subtle">Design system</p>
        <h1 className="mx-auto max-w-3xl text-h1 leading-tight">
          Build with {registryName}, <span className="text-fg-brand">in any project.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-fg-muted">
          Components, blocks and visuals from {registryName}&rsquo;s own site and product, for React and Tailwind. Copy them in, or let the CLI apply
          them to an existing app.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="pill">
            <Link href="/components">Browse components</Link>
          </Button>
          <Button asChild variant="pill-outline">
            <Link href="/cli">Use the CLI</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 pb-16 md:grid-cols-2">
        <Code title="Add a component" lang="bash" code={`npx context-ds add button card tabs`} />
        <Code title="Or with shadcn" lang="bash" code={`npx shadcn add ${registryUrl}/r/button.json`} />
      </section>

      {GROUPS.map((g) => {
        const list = items.filter((i) => i.type === g.type);
        if (!list.length) return null;
        return (
          <section key={g.type} className="border-t border-line-subtle py-12">
            <h2 className="mb-6 text-h3">{g.label}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((i) => (
                <Link key={i.name} href={`/components/${i.name}`} className="group rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card variant="flat" className="h-full transition-colors duration-150 group-hover:border-line-strong">
                    <CardTitle>{i.title}</CardTitle>
                    <CardDescription>{i.description}</CardDescription>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

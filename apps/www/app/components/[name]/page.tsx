import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "@www/components/code";
import { Preview } from "@www/components/preview";
import { Sidebar } from "@www/components/sidebar";
import { examples } from "@www/lib/examples.generated";
import { exampleSource, findItem, items, registryUrl, sourceOf } from "@www/lib/registry";

export function generateStaticParams() {
  return items.map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  return item ? { title: `${item.title} | Components`, description: item.description } : {};
}

const SURFACE_LABEL = { site: "Site", product: "Product", both: "Site and product" } as const;

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  const demos = examples[item.name] ?? {};
  return (
    <div className="mx-auto flex max-w-(--ds-layout-column-wide) gap-10 px-6">
      <Sidebar current={item.name} />
      <main className="min-w-0 flex-1 py-10">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">{SURFACE_LABEL[item.surface]}</Badge>
          <Badge variant="outline">{item.type}</Badge>
        </div>
        <h1 className="text-h2 leading-tight">{item.title}</h1>
        <p className="mt-3 max-w-2xl text-body-lg text-fg-muted">{item.description}</p>

        <div className="mt-8 grid gap-6">
          {Object.entries(demos).map(([name, Demo]) => (
            <Preview
              key={name}
              example={Demo}
              block={name === "Block"}
              surface={name === "Site" || (name === "Block" && item.surface === "site") ? "site" : "product"}
              label={name === "Block" ? "Full page" : name === "Site" ? "On the site" : "In the product"}
            />
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-h4">Install</h2>
        <Tabs defaultValue="cli">
          <TabsList>
            <TabsTrigger value="cli">CLI</TabsTrigger>
            <TabsTrigger value="shadcn">shadcn</TabsTrigger>
          </TabsList>
          <TabsContent value="cli">
            <Code lang="bash" code={`npx context-ds add ${item.name}`} />
          </TabsContent>
          <TabsContent value="shadcn">
            <Code lang="bash" code={`npx shadcn add ${registryUrl}/r/${item.name}.json`} />
          </TabsContent>
        </Tabs>

        <h2 className="mt-12 mb-4 text-h4">Usage</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-line p-5">
            <p className="mb-2 text-body-sm text-fg">Use for</p>
            <p className="text-body-sm text-fg-muted">{item.use_for}</p>
          </div>
          {item.never.length > 0 && (
            <div className="rounded-card border border-line p-5">
              <p className="mb-2 text-body-sm text-fg">Never</p>
              <ul className="list-disc pl-4 text-body-sm text-fg-muted">
                {item.never.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {item.examples.length > 0 && (
          <>
            <h2 className="mt-12 mb-4 text-h4">Example</h2>
            <Code title={`examples/${item.name}.tsx`} code={exampleSource(item.name)} />
          </>
        )}

        <h2 className="mt-12 mb-4 text-h4">Source</h2>
        <div className="grid gap-4">
          {item.paths.map((p) => (
            <Code key={p} title={p} code={sourceOf(p)} />
          ))}
        </div>
        {item.source && <p className="mt-6 text-caption text-fg-subtle">Ported from {item.source}.</p>}
      </main>
    </div>
  );
}

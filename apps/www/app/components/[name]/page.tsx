import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { InstallCommand } from "@/components/site/code-window";
import { SectionEdgeLines } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { Code } from "@www/components/code";
import { Preview } from "@www/components/preview";
import { Sidebar } from "@www/components/sidebar";
import { examples } from "@www/lib/examples.generated";
import { type Item, exampleSource, findItem, items, sourceOf } from "@www/lib/registry";

export function generateStaticParams() {
  return items.map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  return item ? { title: item.title, description: item.description } : {};
}

const SURFACE_LABEL = { site: "Site", product: "Product", both: "Site and product" } as const;
const TYPE_LABEL: Record<Item["type"], string> = { ui: "Component", product: "Product", site: "Site", block: "Block", visual: "Visual", hook: "Hook", lib: "Library" };

// Which surface an example renders on, and its label: `Site` and `Product` name theirs; any other example follows the
// item (an item on both surfaces shows the rest in the product).
function exampleSurface(item: Item, name: string): "site" | "product" {
  if (name === "Site") return "site";
  if (name === "Product") return "product";
  return item.surface === "site" ? "site" : "product";
}
function exampleLabel(name: string) {
  if (name === "Block") return "Full page";
  if (name === "Site") return "On the site";
  if (name === "Product") return "In the product";
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-16 mb-5 text-h4 leading-snug tracking-tight">
      {children}
    </h2>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  const demos = examples[item.name] ?? {};
  const requires = item.dependencies.filter((d) => d !== "utils");
  return (
    <div className="relative overflow-x-clip">
      <SectionEdgeLines header="under" />
      <div className="relative mx-auto flex w-full max-w-(--ds-frame-column) gap-10 px-6 sm:px-8 md:px-10 lg:px-12">
        <Sidebar current={item.name} />
        <main className="min-w-0 flex-1 pt-10 pb-24">
          <Link href="/components" className="mb-6 inline-flex items-center gap-1.5 rounded-sm text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none lg:hidden">
            <ArrowLeft aria-hidden className="size-3.5" />
            Library
          </Link>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="tag">{TYPE_LABEL[item.type]}</Badge>
            <Badge variant="tag">{SURFACE_LABEL[item.surface]}</Badge>
          </div>
          <h1 className="text-h2 leading-display tracking-tight">{item.title}</h1>
          <p className="mt-4 max-w-(--ds-layout-text) text-body-lg text-fg-muted">{item.description}</p>
          <InstallCommand command={`npx context-ds add ${item.name}`} className="mt-8" />

          <div className="mt-10 grid gap-6">
            {Object.entries(demos).map(([name, Demo]) => (
              <Preview key={name} example={Demo} block={name === "Block"} surface={exampleSurface(item, name)} label={exampleLabel(name)} />
            ))}
          </div>

          <H2 id="usage">Usage</H2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card p-5 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
              <p className="mb-2 text-body-sm font-medium text-fg">Use it for</p>
              <p className="text-body-sm text-fg-muted">{item.use_for}</p>
            </div>
            {item.never.length > 0 && (
              <div className="rounded-card p-5 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
                <p className="mb-2 text-body-sm font-medium text-fg">Never</p>
                <ul className="grid list-disc gap-1 pl-4 text-body-sm text-fg-muted marker:text-fg-subtle">
                  {item.never.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {(requires.length > 0 || item.npm.length > 0) && (
            <p className="mt-5 text-body-sm text-fg-muted">
              Brings{" "}
              {requires.map((d, i) => (
                <span key={d}>
                  <Link href={`/components/${d}`} className="rounded-sm text-fg-brand outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">
                    {d}
                  </Link>
                  {i < requires.length - 1 || item.npm.length ? ", " : ""}
                </span>
              ))}
              {item.npm.map((p, i) => (
                <code key={p} className="font-mono text-caption text-fg">
                  {p}
                  {i < item.npm.length - 1 ? ", " : ""}
                </code>
              ))}
              {" "}with it.
            </p>
          )}

          {item.examples.length > 0 && (
            <>
              <H2 id="example">Example</H2>
              <Code title={`examples/${item.name}.tsx`} code={exampleSource(item.name)} />
            </>
          )}

          <H2 id="source">Source</H2>
          <div className="grid gap-5">
            {item.paths.map((p) => (
              <Code key={p} title={p} code={sourceOf(p)} tall />
            ))}
          </div>
          {item.source && <p className="mt-6 text-caption text-fg-subtle">Ported from {item.source}.</p>}
        </main>
      </div>
    </div>
  );
}

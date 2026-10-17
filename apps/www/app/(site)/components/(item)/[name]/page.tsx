import Link from "next/link";
import { notFound } from "next/navigation";

import { InstallCommand } from "@/components/site/code-window";
import { Badge } from "@/components/ui/badge";
import { Code } from "@www/components/code";
import { FramePreview } from "@www/components/frame-preview";
import { Preview } from "@www/components/preview";
import { Prose } from "@www/components/prose";
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

// From 1280px, the page's sections down the right, sticky under the header.
function OnThisPage({ sections }: { sections: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="sticky top-18 hidden w-40 shrink-0 self-start pt-12 xl:block">
      <p className="mb-2 text-body-sm font-medium text-fg">On this page</p>
      <ul className="grid gap-px border-l border-line-subtle">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:border-fg-brand hover:text-fg focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-16 mb-6 text-h4 leading-snug tracking-tight">
      {children}
    </h2>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  // The main examples first (Block, then Site and Product), then its states (Loading, Empty...) in their own order.
  const MAIN = ["Block", "Site", "Product"];
  const demos = Object.fromEntries(Object.entries(examples[item.name] ?? {}).sort(([a], [b]) => (MAIN.includes(a) ? MAIN.indexOf(a) : 9) - (MAIN.includes(b) ? MAIN.indexOf(b) : 9)));
  const requires = item.dependencies.filter((d) => d !== "utils");
  const sections = [
    ...(Object.keys(demos).length ? [{ id: "preview", label: "Preview" }] : []),
    { id: "usage", label: "Usage" },
    ...(item.examples.length ? [{ id: "example", label: "Example" }] : []),
    { id: "source", label: "Source" },
  ];
  return (
    <div className="flex gap-10">
        <main className="min-w-0 flex-1 pt-10 pb-24 sm:pt-12">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="tag">{TYPE_LABEL[item.type]}</Badge>
            {SURFACE_LABEL[item.surface] !== TYPE_LABEL[item.type] && <Badge variant="tag">{SURFACE_LABEL[item.surface]}</Badge>}
          </div>
          <h1 className="text-h2 leading-display tracking-tight">{item.title}</h1>
          <p className="mt-4 max-w-(--ds-layout-text) text-body-lg text-fg-muted"><Prose text={item.description} /></p>
          <InstallCommand command={`npx context-ds add ${item.name}`} className="mt-8" />

          <div id="preview" className="mt-10 grid gap-8">
            {Object.entries(demos).map(([name, Demo]) => (
              item.type === "site" || item.type === "block" ? (
                <FramePreview key={name} src={`/preview/${item.name}/${name}`} surface={exampleSurface(item, name)} label={exampleLabel(name)} />
              ) : (
                <Preview key={name} example={Demo} block={name === "Block"} surface={exampleSurface(item, name)} label={exampleLabel(name)} />
              )
            ))}
          </div>

          <H2 id="usage">Usage</H2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-card p-6 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
              <p className="mb-2 text-body-sm font-medium text-fg">Use it for</p>
              <p className="text-body-sm text-fg-muted">
                <Prose text={item.use_for} />
              </p>
            </div>
            {item.never.length > 0 && (
              <div className="rounded-card p-6 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
                <p className="mb-2 text-body-sm font-medium text-fg">Never</p>
                <ul className="grid list-disc gap-1 pl-4 text-body-sm text-fg-muted marker:text-fg-subtle">
                  {item.never.map((n) => (
                    <li key={n}>
                      <Prose text={n} />
                    </li>
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
        <OnThisPage sections={sections} />
    </div>
  );
}

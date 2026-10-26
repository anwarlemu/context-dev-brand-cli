import Link from "next/link";
import { notFound } from "next/navigation";

import { InstallCommand } from "@/components/site/code-window";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { FramePreview } from "@www/components/frame-preview";
import { Prose } from "@www/components/prose";
import { examples } from "@www/lib/examples.generated";
import { type Item, APPLY_COMMAND, GROUPS, itemMetadata, findItem, items, sourceOf } from "@www/lib/registry";

export function generateStaticParams() {
  return items.map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/components/${item.name}`, types: { "text/markdown": `/components/${item.name}.md`, "application/json": `/r/${item.name}.json` } } } : {};
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
    <nav aria-label="On this page" className="sticky top-6 hidden w-40 shrink-0 self-start pt-8 xl:block">
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

// The names a file exports, read from its source.
function exportsOf(source: string) {
  const names = new Set<string>();
  for (const m of source.matchAll(/^export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/gm)) names.add(m[1]);
  for (const m of source.matchAll(/^export\s*\{([^}]+)\}/gm)) for (const part of m[1].split(",")) { const n = part.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, ""); if (n) names.add(n); }
  return [...names];
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  // The main examples first (Block, then Site and Product), then its states (Loading, Empty...) in their own order.
  const MAIN = ["Block", "Site", "Product"];
  const demos = Object.fromEntries(Object.entries(examples[item.name] ?? {}).sort(([a], [b]) => (MAIN.includes(a) ? MAIN.indexOf(a) : 9) - (MAIN.includes(b) ? MAIN.indexOf(b) : 9)));
  const data = itemMetadata(item.name);
  const surfaceFlag = item.surface === "site" || item.surface === "product" ? ` --surface ${item.surface}` : "";
  const requires = item.dependencies.filter((d) => d !== "utils");
  const sections = [
    ...(Object.keys(demos).length ? [{ id: "preview", label: "Preview" }] : []),
    { id: "usage", label: "Usage" },
    { id: "api", label: "API" },
    ...(item.examples.length ? [{ id: "example", label: "Example" }] : []),
    { id: "source", label: "Source" },
  ];
  // The library's order, as the sidebar lists it: by group, then A to Z.
  const order = GROUPS.flatMap((g) => items.filter((i) => i.type === g.type).sort((a, b) => a.title.localeCompare(b.title)));
  const at = order.findIndex((i) => i.name === item.name);
  const prev = at > 0 ? order[at - 1] : undefined;
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : undefined;
  const sources = item.paths.map((p) => sourceOf(p));
  const exported = [...new Set(sources.flatMap(exportsOf))];
  const client = sources.some((text) => /^["']use client["']/m.test(text));
  const groupLabel = GROUPS.find((g) => g.type === item.type)?.label ?? TYPE_LABEL[item.type];
  return (
    <DocsPage>
      <div className="flex gap-10">
        <div className="min-w-0 flex-1">
          <PageHead
            eyebrow={`${groupLabel} · ${SURFACE_LABEL[item.surface]}`}
            title={item.title}
            description={<Prose text={item.description} />}
            actions={
              <>
                <a href={`/components/${item.name}.md`} className="text-fg-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">Text reference</a>
                <a href={`/r/${item.name}.json`} className="text-fg-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">JSON</a>
              </>
            }
          >
            <InstallCommand command={`${APPLY_COMMAND} add ${item.name}${surfaceFlag}`} />
            <p className="mt-2 text-caption text-fg-muted">Run from the target React 19.2+ app root with Tailwind CSS 4 and the <code>@/*</code> source alias.</p>
          </PageHead>

          {Object.keys(demos).length > 0 && (
            <div id="preview" className="grid scroll-mt-6 gap-8 pt-10">
              {Object.keys(demos).map((name) => (
                <FramePreview key={name} src={`/preview/${item.name}/${name}`} surface={exampleSurface(item, name)} label={exampleLabel(name)} fullPage={item.type === "site" || item.type === "block"} />
              ))}
            </div>
          )}

          <DocsSection id="usage" title="Usage">
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="gap-0">
                <p className="mb-2 text-body-sm font-medium text-fg">Use it for</p>
                <p className="text-body-sm text-fg-muted">
                  <Prose text={item.use_for} />
                </p>
              </Card>
              {item.never.length > 0 && (
                <Card className="gap-0">
                  <p className="mb-2 text-body-sm font-medium text-fg">Avoid</p>
                  <ul className="grid list-disc gap-1 pl-4 text-body-sm text-fg-muted marker:text-fg-subtle">
                    {item.never.map((n) => (
                      <li key={n}>
                        <Prose text={n} />
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
            {exported.length > 0 && (
              <p className="mt-5 text-body-sm text-fg-muted">
                Exports: <code className="font-mono text-caption text-fg">{exported.join(", ")}</code>.{" "}
                {client ? "This component includes a client boundary; keep its state and handlers in a client component." : "Read the examples for composition and props."}
              </p>
            )}
            {(requires.length > 0 || item.npm.length > 0) && (
              <p className="mt-3 text-body-sm text-fg-muted">
                Dependencies:{" "}
                {requires.map((d, i) => (
                  <span key={d}>
                    <Link href={findItem(d) ? `/components/${d}` : `/components/${d}.md`} className="rounded-sm text-fg-brand outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">
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
              </p>
            )}
            {item.body && <div className="mt-6 whitespace-pre-line text-body-sm text-fg-muted"><Prose text={item.body} /></div>}
          </DocsSection>

          <DocsSection id="api" title="API" description="Generated from the component source. Read these exports and props before composing the component.">
            {data.api.map((file) => <details key={file.path} className="mb-4 rounded-card border border-line-subtle p-4"><summary className="cursor-pointer text-body-sm text-fg">{file.path}</summary><div className="mt-4"><Code title={file.path} code={file.content} /></div></details>)}
          </DocsSection>

          {item.examples.length > 0 && (
            <DocsSection id="example" title="Example" description="Examples use local demo state. Connect your application data, routes, and callbacks. Relative helper files are included.">
              <div className="grid gap-5">{data.exampleFiles.map((file) => <Code key={file.path} title={file.path} code={file.content} />)}</div>
            </DocsSection>
          )}

          <DocsSection id="source" title="Source">
            <div className="grid gap-5">
              {item.paths.map((p, i) => (
                <Code key={p} title={p} code={sources[i]} tall />
              ))}
            </div>
            {item.source && <p className="mt-6 text-caption text-fg-subtle">Reference: {item.source}.</p>}
          </DocsSection>

          <nav aria-label="More components" className="mt-12 flex items-center justify-between gap-3 border-t border-line-subtle pt-6">
            {prev ? (
              <Link href={`/components/${prev.name}`} className="inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none">
                <ChevronLeft aria-hidden className="size-3.5" strokeWidth={1.75} /> {prev.title}
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/components/${next.name}`} className="inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none">
                {next.title} <ChevronRight aria-hidden className="size-3.5" strokeWidth={1.75} />
              </Link>
            )}
          </nav>
        </div>
        <OnThisPage sections={sections} />
      </div>
    </DocsPage>
  );
}

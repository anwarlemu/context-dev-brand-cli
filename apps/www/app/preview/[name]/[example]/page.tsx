import { notFound } from "next/navigation";

import { Surface } from "@/lib/surface";
import { PreviewSizeReporter } from "@www/components/preview-size-reporter";
import { PreviewRuntime } from "@www/components/preview-runtime";
import { examples } from "@www/lib/examples.generated";
import { findItem, items } from "@www/lib/registry";

// One example alone on a page, at the window's real width: full-page items (site sections, page blocks) switch layout
// on it, so the docs show them in a frame at desktop or phone width instead of squeezed into the column.
export const framed = (type: string) => type === "site" || type === "block";

// Overlays use their own viewport so focus traps, scroll locks, and panels never cover the library navigation.
const OVERLAYS = new Set(["sheet", "dialog", "popover", "dropdown-menu", "select", "label", "workspace-switcher", "user-menu", "credits-menu", "app-top-bar", "command", "usage-summary", "stat-card", "glyph-card", "tag-filter", "data-toolbar", "empty-state", "page", "settings-section", "alert-dialog", "combobox", "context-menu", "date-picker", "drawer", "hover-card", "menubar", "navigation-menu", "sidebar", "toast"]);

export function generateStaticParams() {
  return items.flatMap((i) => Object.keys(examples[i.name] ?? {}).map((example) => ({ name: i.name, example })));
}

export const metadata = { robots: { index: false } };

export default async function ExamplePage({ params }: { params: Promise<{ name: string; example: string }> }) {
  const { name, example } = await params;
  const item = findItem(name);
  const Example = examples[name]?.[example];
  if (!item || !Example) notFound();
  const surface = example === "Site" || (item.surface === "site" && example !== "Product") ? "site" : "product";
  return (
    <Surface kind={surface} data-preview-root="" className={surface === "product" ? "bg-canvas" : "bg-surface"}>
      {framed(item.type) ? <Example /> : <div className={`flex items-center justify-center p-6 sm:p-8 ${OVERLAYS.has(name) ? "min-h-128" : "min-h-56"}`}><Example /></div>}
      <PreviewSizeReporter />
      <PreviewRuntime surface={surface} />
    </Surface>
  );
}

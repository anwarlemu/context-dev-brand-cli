import { readFileSync } from "node:fs";
import path from "node:path";
import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { APPLY_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Designs", description: "Make a graphic, then revise it in plain words or exact edits until it is right, on brand at every step." };

type Picture = { src: string; width: number; height: number };
type Step = { command: string; note: string; ok: boolean; output: string } & Partial<Picture>;
type Designs = { steps: Step[]; variants?: Picture & { command: string }; sizes?: Picture & { command: string } };

// Written by scripts/assets/docs-designs.mjs, which runs `design` itself.
const designs = JSON.parse(readFileSync(path.join(process.cwd(), "public", "designs", "designs.json"), "utf8")) as Designs;

const COMMANDS = [
  ["design new <template>", "Writes a small JSON design file and draws it. Any template: images, slides, merch, illustrations, loops, the reel, or compose."],
  ["design revise <file> \"...\"", "Plain words, read by rules (no model). A part it does not understand changes nothing and lists what it can do."],
  ["design edit <file> --set ... --layer logo.anchor=top-right", "Exact edits, for agents that reason: copy, theme, size, seed, template, and each layer's place, size, alignment and visibility."],
  ["design undo | redo | history", "Step back and forward through every change."],
  ["design variants --by theme|seed|template", "The same design other ways, on one labeled sheet."],
  ["design sizes --to og,story,x-banner", "The same design at other sizes, laid out again, never stretched."],
  ["design compose add|move|remove|order", "Your own layout from the brand's blocks on a grid, for a graphic no template has."],
  ["design page compose outline.json", "A whole page from the library's sections, as React and plain HTML."],
  ["design check | render | compare", "Every rule at once, other formats, and two designs side by side with what differs."],
];

export default function DesignsPage() {
  return (
    <DocsPage>
      <PageHead title="Designs" description="Make a graphic, look at it, change it, and repeat until it is right. Every write is checked: words whole, nothing invented, no overlaps, the logo's space, contrast, the platform's safe areas. An error changes nothing.">
        <Code title="terminal" code={`${APPLY_COMMAND} design new banner --size x-banner --headline "The web data APIs for agents" -o banner.design.json\n${APPLY_COMMAND} design revise banner.design.json "bigger headline, logo top right, darker theme"\n${APPLY_COMMAND} design undo banner.design.json`} />
      </PageHead>

      <DocsSection title="A session" description="One X header, from the first draw to an undo. These are the files the commands wrote.">
        <ol className="grid gap-10">
          {designs.steps.map((s, i) => (
            <li key={s.command} className="grid gap-3">
              <p className="text-body-sm text-fg-muted">
                <span className="mr-2 font-data text-caption text-fg-brand">{String(i + 1).padStart(2, "0")}</span>
                {s.note}
              </p>
              <code className="block overflow-x-auto rounded-control bg-subtle px-3 py-2 font-mono text-caption text-fg">{s.command}</code>
              {s.src ? (
                <img src={s.src} width={s.width} height={s.height} alt={`After: ${s.command}`} loading="lazy" className="h-auto w-full max-w-3xl rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]" />
              ) : (
                <pre className="whitespace-pre-wrap rounded-control bg-subtle px-3 py-2 font-mono text-caption text-fg-muted">{s.output}</pre>
              )}
            </li>
          ))}
        </ol>
      </DocsSection>

      {designs.variants && (
        <DocsSection title="Variants" description="Every theme of the same design on one sheet, to choose from.">
          <code className="mb-3 block font-mono text-caption text-fg-muted">{designs.variants.command}</code>
          <img src={designs.variants.src} width={designs.variants.width} height={designs.variants.height} alt="The design in every theme" loading="lazy" className="h-auto w-full rounded-card" />
        </DocsSection>
      )}

      {designs.sizes && (
        <DocsSection title="Other sizes" description="Laid out again for each shape: the words re-wrap, the picture finds its room.">
          <code className="mb-3 block font-mono text-caption text-fg-muted">{designs.sizes.command}</code>
          <img src={designs.sizes.src} width={designs.sizes.width} height={designs.sizes.height} alt="The design at other sizes" loading="lazy" className="h-auto w-full rounded-card" />
        </DocsSection>
      )}

      <DocsSection title="Commands" description="Every command takes --json; new, revise and edit take --dry-run.">
        <dl className="grid divide-y divide-line-subtle">
          {COMMANDS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-2 py-5 sm:grid-cols-[22rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">{cmd}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>
    </DocsPage>
  );
}

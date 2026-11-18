import { readFileSync } from "node:fs";
import path from "node:path";

import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";

export const metadata = { title: "Illustrations", description: "Draw Context.dev dot illustrations from built-in subjects or any picture, as SVG with real circles and PNG." };

type Source = { $source: string; kind?: string };
const data = JSON.parse(readFileSync(path.join(process.cwd(), "../../brand/illustrate.json"), "utf8")) as {
  subjects: Record<string, Source>;
  palettes: Record<string, Source & { bg: string; fill: string; field: string }>;
  presets: Record<string, Source>;
};

const KINDS: Record<string, string> = { picture: "Picture through the shader", mark: "Logomark on the grid", burst: "Customer burst", kit: "Website kit artwork" };

const RULES = [
  ["Three states", "A picture is a field of dots that are filled, hollow or empty. Hollow is the open web, filled is context.", "principles; shader tool; kit"],
  ["One dot size", "Every dot in a shaded picture has the same size and pitch. Only its state carries the image.", "shader tool header"],
  ["Cut out first", "The subject is lifted off its background, and the picture's own frame is never drawn as an edge.", "shader tool; kit"],
  ["Two colors", "A ground and one dot color from the brand's surfaces: white with blue dots, blue with white, black with white or blue.", "kit surfaces; share editor palettes"],
  ["A quiet backdrop", "None, faint full dots, or faint rings that clear away from the art.", "share editor; kit"],
  ["Never under words", "Dots support content. They gather at edges and thin toward the content, never across a whole section.", "principles; share editor; hero field"],
  ["Figures in Doto", "A number is set in Doto, the face made of dots, not drawn dot by dot.", "principles; film"],
  ["Still by default", "When dots move they fade in once on an ease-out curve and rest. The command writes stills.", "hero field; film"],
];

const FLAGS = [
  ["--image <file>", "Any picture. PNG with a transparent background works best; JPEG, WebP and SVG are read through a browser."],
  ["--palette <name>", "Ground, dot and field colors from the brand tokens."],
  ["--preset <name>", "Settings from the shader tool's presets or the share editor."],
  ["--size 1200x630", "Frame size. --pad, --fit, --offset-x and --offset-y place the subject."],
  ["--dot, --gap, --ring", "The grid: dot diameter, gap and hollow stroke in px."],
  ["--render, --fill, --hollow", "toneEdges, tone, edges or silhouette; the share of the subject's dots that are filled and hollow."],
  ["--dither, --contrast, --edges", "none, diffuse or pattern; local contrast; edge strength."],
  ["--field, --empty", "Backdrop grid (none, faint, rings, dots) and whether empty dots inside the subject show it."],
  ["--shader kit", "The website kit's fixed 80 by 60 grid, to sit beside the brand page's artwork."],
  ["--seed <n>", "Breaks ties between equally lit dots. The same input, settings and seed give the same bytes."],
];

export default function IllustrationsPage() {
  return (
    <DocsPage>
      <PageHead title="Illustrations" description="Turn a built-in subject or any picture into a Context.dev dot illustration. The SVG keeps every dot as a real circle, grouped as field, hollow and filled, so it stays editable.">
        <Code title="terminal" code={`npx context-ds illustrate --list --json\nnpx context-ds illustrate globe --palette paper\nnpx context-ds illustrate --image product.png --preset hero --seed 4`} />
      </PageHead>

      <DocsSection title="Subjects" description="Each subject is drawn from a brand source: the share editor's pictures, the film's dotted logomark, the customer story's burst, and the website's own shader artwork.">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.subjects).map(([name, s]) => (
            <li key={name} className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
                <img src={`/illustrations/${name}.png`} alt={`${name} as a dot illustration`} loading="lazy" className="block aspect-square w-full bg-subtle object-contain" />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-body-sm text-fg">{name}</span>
                <span className="text-caption text-fg-subtle">{KINDS[s.kind ?? "picture"]}</span>
              </div>
              <p className="text-caption text-fg-muted">{s.$source}</p>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection title="Palettes" description="Colors are token names, resolved from the brand tokens when the file is written. Values the playground used outside the tokens map to the nearest token.">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(data.palettes).map(([name, p]) => (
            <li key={name} className="flex flex-col gap-2">
              <img src={`/illustrations/palette-${name}.png`} alt={`The globe in the ${name} palette`} loading="lazy" className="block aspect-square w-full rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]" />
              <span className="font-mono text-body-sm text-fg">{name}</span>
              <span className="text-caption text-fg-muted">{p.bg} ground, {p.fill} dots</span>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection title="The rules" description="What the brand's illustrations are, from its own sources. The full list, with a source for each rule, is brand/illustration.md.">
        <dl className="grid divide-y divide-line-subtle">
          {RULES.map(([title, body, source]) => (
            <div key={title} className="grid gap-2 py-5 sm:grid-cols-[14rem_1fr_14rem] sm:gap-6">
              <dt className="text-body-sm text-fg">{title}</dt>
              <dd className="text-body-sm text-fg-muted">{body}</dd>
              <dd className="text-caption text-fg-subtle">{source}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection title="Settings" description="The shader's own settings, as flags. An unknown subject, palette, preset or mode exits 1 and names the nearest choices.">
        <dl className="grid divide-y divide-line-subtle">
          {FLAGS.map(([flag, what]) => (
            <div key={flag} className="grid gap-2 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">{flag}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-body-sm text-fg-muted">Presets: {Object.keys(data.presets).join(", ")}. The shader is a port of the share-image playground's, run on plain pixels; on the same input and settings it agrees with the playground on more than 99% of dots (error diffusion, which amplifies the smallest difference, on about 96%).</p>
      </DocsSection>
    </DocsPage>
  );
}

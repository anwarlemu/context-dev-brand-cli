import { readFileSync } from "node:fs";
import path from "node:path";
import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { APPLY_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Assets", description: "Share images, social posts, deck slides, the brand reel, dot loops and merch print files from the CLI." };

type Example = { id: string; command: string; src: string; width: number; height: number };
type Examples = { image: Example[]; social: Example[]; deck: Example[]; merch: Example[]; video: Example[]; loopVideo?: string };

// Written by scripts/assets/docs-examples.mjs, which runs the CLI itself.
const examples = JSON.parse(readFileSync(path.join(process.cwd(), "public", "assets-examples", "examples.json"), "utf8")) as Examples;

function Gallery({ items, columns }: { items: Example[]; columns: string }) {
  return (
    <ul className={`grid gap-6 ${columns}`}>
      {items.map((e) => (
        <li key={e.id} className="flex min-w-0 flex-col gap-3">
          <img src={e.src} width={e.width} height={e.height} alt={`${e.id}, as the CLI draws it`} loading="lazy" className="h-auto w-full rounded-card bg-subtle shadow-[0_0_0_1px_var(--ds-color-border-hairline)]" />
          <code className="truncate font-mono text-caption text-fg-muted" title={`npx context-ds ${e.command}`}>{e.command}</code>
        </li>
      ))}
    </ul>
  );
}

const COMMANDS = [
  ["manifest --json", "Every command, flag, template, size, palette, slide, loop and merch item. Start here; unknown names exit 1 with the closest match."],
  ["image <template>", "Share images and social posts: banner, products, social, cards, customer. PNG and SVG; any picture becomes dots."],
  ["deck", "Slides at 1920 by 1080 from a JSON file or flags: a PNG per slide and one PDF."],
  ["video reel | edges | twinkle | ripple | logo", "The 10 second reel with its copy as flags, and seamless dot loops at square, vertical and landscape. MP4 and WebM through ffmpeg, PNG frames without it."],
  ["merch <item>", "Print files only: SVG at physical size and 300 dpi PNG with bleed, safe area and the sticker's die line."],
];

export default function AssetsPage() {
  return (
    <DocsPage>
      <PageHead title="Assets" description="The CLI draws the brand's images, posts, slides, video and merch from the tokens, the logo and the dot shader. The same inputs always write the same files.">
        <Code title="terminal" code={`${APPLY_COMMAND} manifest --json\n${APPLY_COMMAND} image banner --headline "The web data APIs for agents" --image hero.png\n${APPLY_COMMAND} image social --kind social --size 4:5 --headline "NEW!" --body "Browser Profiles"`} />
      </PageHead>

      <DocsSection title="Commands" description="Each takes --list and --json. Text goes in by slot; positions and shader settings are flags, as dragging and sliders are in the share-image editor.">
        <dl className="grid divide-y divide-line-subtle">
          {COMMANDS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-2 py-5 sm:grid-cols-[18rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">{cmd}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection title="Share images" description="Link previews and banners at 1500 by 500, 1200 by 630 and 1080 by 1080, in six palettes. --image takes any picture and turns it into the brand's dots; the customer story shows a customer's logo only when --partner is passed.">
        <Gallery items={examples.image} columns="sm:grid-cols-2 lg:grid-cols-3" />
      </DocsSection>

      <DocsSection title="Social posts" description="--kind social: 16:9, 1.91:1, 1:1, 4:5, 3:4, 9:16, 3:1 or --size custom with --width and --height.">
        <Gallery items={examples.social} columns="grid-cols-2 lg:grid-cols-4" />
      </DocsSection>

      <DocsSection title="Deck" description={'--input deck.json takes { "slides": [ { "type": "cover", "title": "..." } ] }; each type takes its own slots, a palette and an image.'}>
        <Gallery items={examples.deck} columns="sm:grid-cols-2 lg:grid-cols-4" />
        <div className="mt-6"><Code title="deck.json" code={`{\n  "slides": [\n    { "type": "cover", "title": "The web data APIs for agents" },\n    { "type": "bullets", "title": "What your agent can do", "items": ["Scrape any page as Markdown", "Crawl a whole website"] },\n    { "type": "closing" }\n  ]\n}`} /></div>
      </DocsSection>

      <DocsSection title="Video" description="The reel is ten seconds at 1920 by 1080, drawn frame by frame in headless Chromium. Loops are drawn on the canvas and meet their first frame at the end; --still writes one frame for reduced motion or a poster.">
        {examples.loopVideo && (
          <video src={examples.loopVideo} autoPlay loop muted playsInline width={960} height={540} className="mb-6 h-auto w-full max-w-3xl rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]" />
        )}
        <Gallery items={examples.video} columns="grid-cols-2 lg:grid-cols-5" />
      </DocsSection>

      <DocsSection title="Merch" description="Cap, tee front and back, hoodie, tote, mug wrap, sticker, poster and socks. Shown here with --guides (trim and safe lines). Sizes are common vendor print areas; confirm with the vendor's template.">
        <Gallery items={examples.merch} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      </DocsSection>

      <DocsSection title="For scripts" description="The renderer is a module in the package: the dot shader, the dot field, text layout, the logo, and PNG, SVG and PDF output.">
        <Code title="render.mjs" code={`import { surface, toPng, drawDotField, paletteOf, readPicture } from "context-ds/dist/assets/index.js";\n\nconst s = surface(1200, 630);\ndrawDotField(s.ctx, { width: 1200, height: 630, dot: 7.6, gap: 3.8, colors: paletteOf({ palette: "Paper" }), picture: await readPicture(process.cwd(), "hero.png") });\nawait writeFile("hero-dots.png", toPng(s));`} />
      </DocsSection>
    </DocsPage>
  );
}

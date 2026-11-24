import { readFileSync } from "node:fs";
import path from "node:path";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";

export const metadata = { title: "Gallery", description: "One of every kind of graphic the CLI makes, with the command that made it." };

type Item = { label: string; command: string; src: string; width: number; height: number };
type Gallery = { groups: { title: string; description: string; items: Item[] }[]; video?: { src: string; still?: string; command: string } };

// Written by scripts/assets/docs-gallery.mjs, which runs the CLI itself.
const gallery = JSON.parse(readFileSync(path.join(process.cwd(), "public", "gallery", "gallery.json"), "utf8")) as Gallery;

export default function GalleryPage() {
  return (
    <DocsPage>
      <PageHead title="Gallery" description="Every kind of graphic the CLI makes: posts and covers for each platform, cards, ads, documents, slides, merch and motion. Each picture is the file its command wrote; only the words it was given are on it." />
      {gallery.video && (
        <DocsSection title="Motion" description="Any design can play as a reveal through the brand's dot grid; stings, a lower third and walkthroughs come from the same command.">
          {/* With reduced motion, the finished frame instead of the film. */}
          <video src={gallery.video.src} poster={gallery.video.still} autoPlay loop muted playsInline width={540} height={540} className="h-auto w-full max-w-sm rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)] motion-reduce:hidden" />
          {gallery.video.still && <img src={gallery.video.still} width={540} height={540} alt="The finished frame of the reveal" className="hidden h-auto w-full max-w-sm rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)] motion-reduce:block" />}
          <code className="mt-3 block font-mono text-caption text-fg-muted">{gallery.video.command}</code>
        </DocsSection>
      )}
      {gallery.groups.map((g) => (
        <DocsSection key={g.title} title={g.title} description={g.description}>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((e) => (
              <li key={e.src} className="flex min-w-0 flex-col gap-2">
                <img src={e.src} width={e.width} height={e.height} alt={`${e.label}, as the CLI draws it`} loading="lazy" className="h-auto max-h-96 w-full rounded-card bg-subtle object-contain shadow-[0_0_0_1px_var(--ds-color-border-hairline)]" />
                <p className="text-body-sm text-fg">{e.label}</p>
                <code className="truncate font-mono text-caption text-fg-muted" title={e.command}>{e.command}</code>
              </li>
            ))}
          </ul>
        </DocsSection>
      ))}
    </DocsPage>
  );
}

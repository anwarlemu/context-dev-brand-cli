import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CodeBlock, CodeWindow, TerminalWindow, WindowCopyButton } from "@/components/site/code-window";
import { Cta, CtaButton } from "@/components/site/cta";
import { Hero, HeroMedia, HeroMediaCard, HeroPill } from "@/components/site/hero";
import { SectionHeading, SiteSection } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";
import { Thumb } from "@www/components/thumb";
import { examples } from "@www/lib/examples.generated";
import { APPLY_COMMAND, GROUPS, counts, items, registryName } from "@www/lib/registry";

const ADD_OUTPUT = `$ npx context-ds add button stat-card hero
  theme        styles/tokens.css, styles/theme.css
  button       components/ui/button.tsx
  stat-card    components/product/stat-card.tsx
  hero         components/site/hero.tsx
Added 4 items and their packages.`;

const APPLY_OUTPUT = `$ ${APPLY_COMMAND}
Swapped 6 of the app's components for the library's
Restyled 41 files: colors, type, radii and motion
Installed the brand stylesheet, fonts and agent hooks
Next: 2 tasks, then a review against the brand`;

// A card in the soft blue ring whose title link covers the whole card (the live example inside has links of its own,
// and links cannot nest). Hover turns the title blue.
const CARD = "group/card relative flex flex-col rounded-card bg-ring-tint p-2";
const CARD_LINK =
  "rounded-sm outline-none transition-colors duration-150 ease-out after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring group-hover/card:text-fg-brand motion-reduce:transition-none";

// One live example per group, drawn small.
const SHOWCASE: { type: string; item: string; example: string; surface: "site" | "product"; scale: number; align?: "start" }[] = [
  { type: "ui", item: "button", example: "Product", surface: "product", scale: 0.85 },
  { type: "product", item: "stat-card", example: "Product", surface: "product", scale: 0.62 },
  { type: "site", item: "cta", example: "Site", surface: "site", scale: 0.36, align: "start" },
  { type: "block", item: "overview-page", example: "Block", surface: "product", scale: 0.3, align: "start" },
  { type: "visual", item: "story-batches", example: "Product", surface: "product", scale: 0.5 },
];

const STEPS = [
  { title: "Swap where it matches", body: "An app's own buttons, cards and inputs become the library's, with the same names and props. The build is checked before and after." },
  { title: "Restyle the rest", body: "Every other style value in any stack, from CSS to templates to native, is converted by its role to a brand token." },
  { title: "Keep agents on it", body: "Hooks for Claude Code, Codex and Cursor reject values off the brand, and a review scores each screen against the brand's own pages." },
];

export default function Home() {
  const total = items.length;
  return (
    <main>
      <Hero
        size="large"
        staggerIn
        style={{ "--hero-offset": "calc(var(--spacing) * 29.5)" } as CSSProperties}
        background={<HeroDotField fine streams fillFootOnPhones className="text-fg-brand" />}
        eyebrow={<HeroPill>{total} items from the {registryName} site and product</HeroPill>}
        title={`Make any project look like ${registryName}.`}
        accent={[registryName]}
        description="Components, blocks and visuals for React and Tailwind. Add them yourself, or let the CLI apply the brand to an app you already have."
        actions={
          <>
            <Button asChild variant="pill">
              <Link href="/components">Browse components</Link>
            </Button>
            <Button asChild variant="pill-outline">
              <Link href="/cli">Use the CLI</Link>
            </Button>
          </>
        }
        media={
          <HeroMedia size="small">
            <HeroMediaCard cardClassName="bg-code">
              <TerminalWindow label="terminal" actions={<WindowCopyButton value="npx context-ds add button stat-card hero" />} className="rounded-none">
                <CodeBlock code={ADD_OUTPUT} className="overflow-x-auto" />
              </TerminalWindow>
            </HeroMediaCard>
          </HeroMedia>
        }
      />

      <SiteSection lines>
        <SectionHeading title="Every piece of the brand," accent="ready to add." description="Ported from the brand's own code, one component for each thing it draws. Every value is a brand token, and each item comes with a live preview and its source." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => {
            const show = SHOWCASE.find((s) => s.type === g.type);
            const Example = show ? examples[show.item]?.[show.example] : undefined;
            return (
              <div key={g.type} className={CARD}>
                {Example && show && <Thumb example={Example} surface={show.surface} scale={show.scale} align={show.align} />}
                <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
                  <p className="flex items-center justify-between text-h5 leading-snug text-fg">
                    <Link href={`/components#${g.id}`} className={CARD_LINK}>
                      {g.label}
                    </Link>
                    <span className="font-mono text-caption text-fg-subtle">{counts[g.type]}</span>
                  </p>
                  <p className="text-body-sm text-fg-muted">{g.blurb}</p>
                </div>
              </div>
            );
          })}
          <div className={CARD}>
            <div className="grid h-52 grid-cols-4 grid-rows-3 gap-1.5 overflow-hidden rounded-card bg-surface p-3 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
              {["bg-brand", "bg-blue-80", "bg-blue-60", "bg-blue-40", "bg-blue-20", "bg-blue-10", "bg-navy-60", "bg-neutral-90", "bg-neutral-50", "bg-neutral-20", "bg-canvas", "bg-ring-tint"].map((c) => (
                <span key={c} className={`${c} rounded-control`} />
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
              <p className="text-h5 leading-snug text-fg">
                <Link href="/theme" className={CARD_LINK}>
                  Theme
                </Link>
              </p>
              <p className="text-body-sm text-fg-muted">One set of tokens behind every value, for the site and for the product.</p>
            </div>
          </div>
        </div>
      </SiteSection>

      <SiteSection lines>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-10">
            <SectionHeading title="Apply the brand" accent="to any project." description="One command brings an existing app onto the brand, in any stack, and keeps the agents that work on it there." />
            <ol className="grid gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <span className="row-span-2 flex size-7 items-center justify-center rounded-pill bg-blue-10 font-mono text-caption text-fg-brand">{i + 1}</span>
                  <span className="text-body font-medium text-fg">{s.title}</span>
                  <span className="text-body-sm text-fg-muted">{s.body}</span>
                </li>
              ))}
            </ol>
            <Link href="/cli" className="group/link flex w-fit items-center gap-1.5 rounded-sm text-body-sm font-medium text-fg-brand outline-none focus-visible:outline-2 focus-visible:outline-focus-ring">
              How the CLI works
              <ArrowRight aria-hidden className="size-3.5 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          </div>
          <CodeWindow label="terminal" actions={<WindowCopyButton value={APPLY_COMMAND} />}>
            <CodeBlock code={APPLY_OUTPUT} className="overflow-x-auto" />
          </CodeWindow>
        </div>
      </SiteSection>

      <Cta
        title="Start building"
        accent={`as ${registryName}.`}
        description="Copy in one component, or bring a whole app onto the brand in a single command."
        primaryAction={
          <CtaButton asChild>
            <Link href="/components">Browse components</Link>
          </CtaButton>
        }
        secondaryAction={
          <CtaButton asChild tone="glass">
            <Link href="/cli">Use the CLI</Link>
          </CtaButton>
        }
      />
    </main>
  );
}

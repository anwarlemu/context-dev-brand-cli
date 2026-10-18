import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CodeBlock, CodeWindow, TerminalWindow, WindowCopyButton } from "@/components/site/code-window";
import { Cta, CtaButton } from "@/components/site/cta";
import { Hero, HeroMedia, HeroMediaCard } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";
import { ComponentsShowcase } from "@www/components/components-showcase";
import { DocsHeading, DocsSection } from "@www/components/docs-section";
import { Thumb } from "@www/components/thumb";
import { examples } from "@www/lib/examples.generated";
import { SETUP_COMMAND, GROUPS, counts, registryName } from "@www/lib/registry";

const AGENT_COMMANDS = `npx context-ds list --surface product --json
npx context-ds inspect page card button --json
npx context-ds add page card button --surface product --json
npx context-ds check --changed --json
npx context-ds review http://localhost:3000/new-page --any`;

// Keep the blue ring around the example, with a quiet caption below it. The title link covers the whole card.
const CARD = "group/card relative flex min-w-0 flex-col";
const CARD_LINK =
  "rounded-sm outline-none transition-colors duration-150 ease-out after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus-ring group-hover/card:text-fg-brand motion-reduce:transition-none";

// One live example per group, drawn small.
const SHOWCASE: { type: string; item: string; example: string; surface: "site" | "product"; scale: number; align?: "start" }[] = [
  { type: "product", item: "stat-card", example: "Product", surface: "product", scale: 0.62 },
  { type: "site", item: "cta", example: "Site", surface: "site", scale: 0.36, align: "start" },
  { type: "block", item: "overview-page", example: "Block", surface: "product", scale: 0.3, align: "start" },
  { type: "visual", item: "story-batches", example: "Product", surface: "product", scale: 0.5 },
];

const STEPS = [
  { title: "Choose components", body: "Find the components or page block for the task. Read their usage notes and examples before writing the interface." },
  { title: "Use the tokens", body: "Build with the existing components and tokens. Follow the product or site reference for layout, spacing, type, and interaction." },
  { title: "Check the page", body: "Run the token check, test the interactions, and review the page at desktop and phone sizes against the reference." },
];

export default function Home() {
  return (
    <main>
      <Hero
        size="large"
        staggerIn
        contentClassName="min-h-0 gap-8 py-16 sm:pt-20 sm:pb-20 lg:gap-10 lg:py-24"
        background={<HeroDotField fine streams fillFootOnPhones className="text-fg-brand" />}
        title={`${registryName} design system`}
        accent={[registryName]}
        actions={
          <>
            <Button asChild variant="pill">
              <Link href="/components">Browse components</Link>
            </Button>
            <Button asChild variant="pill-outline">
              <Link href="/agents">Agent instructions</Link>
            </Button>
          </>
        }
        media={
          <HeroMedia size="small">
            <HeroMediaCard cardClassName="bg-code">
              <TerminalWindow label="Install" actions={<WindowCopyButton value={SETUP_COMMAND} label="Copy install command" />} className="rounded-none">
                <CodeBlock code={`# From your project root; use site for marketing\n${SETUP_COMMAND}`} className="[overflow-wrap:anywhere] [&>code>span]:whitespace-pre-wrap" />
              </TerminalWindow>
            </HeroMediaCard>
          </HeroMedia>
        }
      />

      <DocsSection lines>
        <DocsHeading title="Component library" description="Use these components for Context.dev pages and interfaces. Each entry includes a preview, usage notes, an example, and source code." />
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {GROUPS.map((g) => {
            const show = SHOWCASE.find((s) => s.type === g.type);
            const Example = g.type === "ui" ? ComponentsShowcase : show ? examples[show.item]?.[show.example] : undefined;
            return (
              <div key={g.type} className={CARD}>
                {Example && (
                  <div className="rounded-card bg-ring-tint p-2">
                    <Thumb example={Example} surface={show?.surface ?? "product"} scale={show?.scale ?? 0.64} align={show?.align} className="h-56" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 px-2 pt-5">
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
            <div className="rounded-card bg-ring-tint p-2">
              <div className="grid h-56 grid-cols-4 grid-rows-3 gap-2 overflow-hidden rounded-card bg-surface p-4 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
                {["bg-brand", "bg-blue-80", "bg-blue-60", "bg-blue-40", "bg-blue-20", "bg-blue-10", "bg-navy-60", "bg-neutral-90", "bg-neutral-50", "bg-neutral-20", "bg-canvas", "bg-ring-tint"].map((c) => (
                  <span key={c} className={`${c} rounded-control`} />
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-2 pt-5">
              <p className="text-h5 leading-snug text-fg">
                <Link href="/theme" className={CARD_LINK}>
                  Tokens
                </Link>
              </p>
              <p className="text-body-sm text-fg-muted">Colors, typography, spacing, radii, shadows, and motion for site and product interfaces.</p>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection lines>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-10">
            <DocsHeading title="Agent workflow" description="When building or changing a Context.dev page, use this library as the design reference." />
            <ol className="grid gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <span className="row-span-2 flex size-7 items-center justify-center rounded-pill bg-blue-10 font-mono text-caption text-fg-brand">{i + 1}</span>
                  <span className="text-body font-medium text-fg">{s.title}</span>
                  <span className="text-body-sm text-fg-muted">{s.body}</span>
                </li>
              ))}
            </ol>
            <Link href="/agents" className="group/link flex w-fit items-center gap-1.5 rounded-sm text-body-sm font-medium text-fg-brand outline-none focus-visible:outline-2 focus-visible:outline-focus-ring">
              Read the agent instructions
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          <CodeWindow label="terminal" actions={<WindowCopyButton value={AGENT_COMMANDS} />}>
            <CodeBlock code={AGENT_COMMANDS} className="overflow-x-auto" />
          </CodeWindow>
        </div>
      </DocsSection>

      <Cta
        title="Build a page"
        description="Choose a component or page block, then follow its usage notes."
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

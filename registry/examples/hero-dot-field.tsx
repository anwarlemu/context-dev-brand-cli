import { Hero, HeroMedia, HeroPill } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";

export function Site() {
  return (
    <Hero
      background={<HeroDotField fine lively streams fillFootOnPhones />}
      eyebrow={<HeroPill>Backed by Y Combinator</HeroPill>}
      title="The web {context} API for agents"
      accent={["{context}", "agents"]}
      description="One API for agents to scrape, search, monitor, and collect data from the web."
      actions={
        <>
          <Button asChild variant="pill">
            <a href="/signup">Start for free</a>
          </Button>
          <Button asChild variant="pill-outline">
            <a href="https://docs.context.dev">Read the docs</a>
          </Button>
        </>
      }
      media={
        <HeroMedia className="max-w-160">
          <div className="flex h-56 w-full items-end justify-center rounded-card bg-surface p-4 font-mono text-caption text-fg-muted">POST /v1/scrape</div>
        </HeroMedia>
      }
    />
  );
}

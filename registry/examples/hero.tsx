import { Button } from "@/components/ui/button";
import { Hero, HeroAction, HeroFrame, HeroMedia, HeroMediaCard, HeroMediaTab, HeroPill } from "@/components/site/hero";

export function Site() {
  return (
    <Hero
      size="large"
      staggerIn
      background={<HeroFrame />}
      eyebrow={<HeroPill>Backed by Y Combinator</HeroPill>}
      title="Turn the web into context your agents can use."
      accent={["context", "agents"]}
      description="One API for agents to scrape, search, monitor, and collect data from the web."
      actions={
        <>
          <HeroAction note="No card required">
            <Button asChild variant="pill">
              <a href="/signup">Start for free</a>
            </Button>
          </HeroAction>
          <Button asChild variant="pill-outline">
            <a href="https://docs.context.dev">Read the docs</a>
          </Button>
        </>
      }
      media={
        <HeroMedia
          size="small"
          footer={
            <HeroMediaTab className="justify-center text-caption text-on-brand">
              <span>Markdown</span>
              <span>HTML</span>
              <span>Screenshots</span>
            </HeroMediaTab>
          }
        >
          <HeroMediaCard>
            <div className="flex h-56 w-full items-end justify-center p-4 font-mono text-caption text-fg-muted">POST /v1/batch/submit</div>
          </HeroMediaCard>
        </HeroMedia>
      }
    />
  );
}

export function Blue() {
  return (
    <Hero
      surface="blue"
      eyebrow={<HeroPill>Backed by Y Combinator</HeroPill>}
      pill={<HeroPill variant="outline">New: monitors</HeroPill>}
      title="Website Crawler {API}"
      description="Map and crawl entire websites into clean Markdown your agents can read."
      actions={
        <>
          <HeroAction note="No card required">
            <Button asChild variant="pill">
              <a href="/signup">Start for free</a>
            </Button>
          </HeroAction>
          <Button asChild variant="pill-on-brand">
            <a href="https://docs.context.dev">Read the docs</a>
          </Button>
        </>
      }
    />
  );
}

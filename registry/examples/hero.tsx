import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hero, HeroAction, HeroFrame, HeroMedia, HeroMediaCard, HeroMediaTab, HeroPill, HeroPillEmphasis } from "@/components/site/hero";
import { ScrapeStory } from "@/components/visuals/stories/scrape-story";

export function Site() {
  return (
    <Hero
      size="large"
      background={<HeroFrame />}
      eyebrow={
        <HeroPill variant="byline" href="https://context.dev/blog/context-dev-raises-9m-seed-led-by-general-catalyst">
          We raised a <HeroPillEmphasis>$9M seed</HeroPillEmphasis> led by
          <img src="https://context.dev/general-catalyst-wordmark.svg" alt="General Catalyst" width={312} height={40} />
          <ArrowRight aria-hidden="true" />
        </HeroPill>
      }
      title="Give your agents the internet"
      accent="agents"
      description="API for agents to scrape, search, monitor, and collect data from the web."
      actions={
        <>
          <HeroAction note="No card required">
            <Button asChild variant="pill">
              <a href="https://context.dev/signup">Start for free</a>
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
            <div className="mx-auto w-full max-w-[22rem] p-4">
              <ScrapeStory />
            </div>
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
      title="Website crawler {API}"
      description="Map and crawl entire websites into clean Markdown your agents can read."
      actions={
        <>
          <HeroAction note="No card required">
            <Button asChild variant="pill">
              <a href="https://context.dev/signup">Start for free</a>
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

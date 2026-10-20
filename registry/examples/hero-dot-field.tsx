import { ArrowRight } from "lucide-react";

import { Hero, HeroMedia, HeroMediaCard, HeroPill, HeroPillEmphasis } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";

export function Site() {
  return (
    <Hero
      background={<HeroDotField fine lively streams fillFootOnPhones />}
      size="large"
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
          <Button asChild variant="pill">
            <a href="https://context.dev/signup">Start for free</a>
          </Button>
          <Button asChild variant="pill-outline">
            <a href="https://docs.context.dev">Read the docs</a>
          </Button>
        </>
      }
      media={
        <HeroMedia className="max-w-160">
          <HeroMediaCard>
            <div className="flex h-56 w-full items-end justify-center p-4 font-mono text-caption text-fg-muted">POST /v1/scrape</div>
          </HeroMediaCard>
        </HeroMedia>
      }
    />
  );
}

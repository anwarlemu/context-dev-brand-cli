import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClosingCta, Cta } from "@/components/site/cta";

export function Site() {
  return (
    <div className="flex flex-col">
      <ClosingCta
        title="Start building with live web context."
        description="Scrape, search, and research the web with one API. Bring the results straight into your product."
        figure={<span className="font-data text-h1 tabular-nums">1,000</span>}
        figureLabel="free credits"
        note="Every month. No credit card required."
        primaryAction={
          <Button asChild variant="pill-outline">
            <a href="/signup">Start for free</a>
          </Button>
        }
        secondaryAction={
          <Button asChild variant="link" className="text-fg-muted hover:text-fg">
            <a href="https://docs.context.dev">
              Read the docs <ArrowRight />
            </a>
          </Button>
        }
      />
      <Cta
        title="Ship an agent that actually"
        accent="knows things."
        description="Free tier, 10-minute integration, and the same API powering agents at Mintlify, daily.dev, and Propane. No credit card to start."
        primaryAction={
          <Button asChild variant="pill" className="border-white bg-white text-fg hover:border-white hover:bg-neutral-10">
            <a href="/signup">Get API Access</a>
          </Button>
        }
        secondaryAction={
          <Button asChild variant="pill-on-brand">
            <a href="https://cal.com/context-dev/30min">Book a call</a>
          </Button>
        }
      />
    </div>
  );
}

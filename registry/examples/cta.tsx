import { SiteSection } from "@/components/site/section";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClosingCta, Cta, CtaButton, CtaTextLink } from "@/components/site/cta";

export function Site() {
  return (<SiteSection>
    <ClosingCta
      title="Start building with live web context."
      description="Scrape, search, and research the web with one API. Bring the results straight into your product."
      figure={<span className="font-data text-h1 tabular-nums">1,000</span>}
      figureLabel="free credits"
      note="Every month. No credit card required."
      primaryAction={
        <Button asChild variant="pill-outline">
          <a href="https://context.dev/signup">Start for free</a>
        </Button>
      }
      secondaryAction={
        <CtaTextLink href="https://docs.context.dev">
          Read the docs <ArrowRight aria-hidden="true" />
        </CtaTextLink>
      }
    />
  </SiteSection>);
}

export function Band() {
  return (
    <Cta
      title="Ship an agent that actually"
      accent="knows things."
      description="Free tier, 10-minute integration, and the same API powering agents at Mintlify, daily.dev, and Propane. No credit card to start."
      primaryAction={<CtaButton href="https://context.dev/signup">Get API Access</CtaButton>}
      secondaryAction={
        <CtaButton tone="glass" href="https://cal.com/context-dev/30min">
          Book a call
        </CtaButton>
      }
    />
  );
}

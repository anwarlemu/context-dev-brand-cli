import { SiteSection } from "@/components/site/section";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClosingCta, CtaTextLink } from "@/components/site/cta";

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

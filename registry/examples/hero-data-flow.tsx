import { Hero, HeroMedia, HeroMediaCard } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDataFlow } from "@/components/visuals/hero-data-flow";
import { HERO_DATA_FLOW_ANCHOR_ATTRIBUTE } from "@/components/visuals/hero-data-flow-anchor";

export function Site() {
  return (
    <Hero
      background={<HeroDataFlow variant="answers" />}
      title="Answers with {sources}"
      accent="{sources}"
      description="Ask a question about any company and get an answer that cites every page it read."
      actions={
        <Button asChild variant="pill">
          <a href="https://context.dev/signup">Start for free</a>
        </Button>
      }
      media={
        // The strands run into and out of the element marked as the anchor; each side needs at least 120px.
        <div {...{ [HERO_DATA_FLOW_ANCHOR_ATTRIBUTE]: "" }} className="mx-auto w-full max-w-80">
          <HeroMedia>
            <HeroMediaCard>
              <div className="flex h-48 w-full flex-col justify-end gap-1 p-4 font-mono text-caption text-fg-muted">
                <span>Reading 3 sources</span>
                <span className="text-fg">Mintlify uses brand context for branded docs sites. [1] [2] [3]</span>
              </div>
            </HeroMediaCard>
          </HeroMedia>
        </div>
      }
    />
  );
}

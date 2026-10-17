import { Hero, HeroMedia } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroDataFlow } from "@/components/visuals/hero-data-flow";

export function Site() {
  return (
    <Hero
      background={<HeroDataFlow variant="answers" />}
      title="Answers with {sources}"
      accent="{sources}"
      description="Ask a question about any company and get an answer that cites every page it read."
      actions={
        <Button asChild variant="pill">
          <a href="/signup">Start for free</a>
        </Button>
      }
      media={
        <HeroMedia className="max-w-120">
          <div className="flex h-64 w-full flex-col justify-end gap-1 rounded-card bg-surface p-4 font-mono text-caption text-fg-muted">
            <span>Reading 3 sources</span>
            <span className="text-fg">Mintlify uses brand context for branded docs sites. [1] [2] [3]</span>
          </div>
        </HeroMedia>
      }
    />
  );
}

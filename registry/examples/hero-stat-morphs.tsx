import { Hero } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroStatMorphs } from "@/components/visuals/hero-stat-morphs";

export function Site() {
  return (
    <Hero
      className="min-h-160"
      background={<HeroStatMorphs />}
      title="The web {context} API for agents"
      accent="{context}"
      description="One API for agents to scrape, search, monitor, and collect data from the web."
      actions={
        <Button asChild variant="pill">
          <a href="/signup">Start for free</a>
        </Button>
      }
    />
  );
}

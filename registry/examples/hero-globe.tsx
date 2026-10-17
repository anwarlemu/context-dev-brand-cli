import { Hero } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroGlobe } from "@/components/visuals/hero-globe";
import { HeroGlobeStats } from "@/components/visuals/hero-globe-stats";

export function Site() {
  return (
    <Hero
      className="min-h-160 pb-60"
      background={
        <>
          <HeroGlobe />
          <HeroGlobeStats />
        </>
      }
      title="Search the whole {web}"
      accent="{web}"
      description="Ranked results with clean page content, from every corner of the web."
      actions={
        <Button asChild variant="pill">
          <a href="/signup">Start for free</a>
        </Button>
      }
    />
  );
}

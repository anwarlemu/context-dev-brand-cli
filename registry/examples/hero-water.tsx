import { Hero } from "@/components/site/hero";
import { Button } from "@/components/ui/button";
import { HeroWater } from "@/components/visuals/hero-water";

export function Site() {
  return (
    <Hero
      className="min-h-160"
      background={<HeroWater />}
      title="Fresh web data, {always}"
      accent="{always}"
      description="Monitor any page and get the change the moment it lands."
      actions={
        <Button asChild variant="pill">
          <a href="https://context.dev/signup">Start for free</a>
        </Button>
      }
    />
  );
}

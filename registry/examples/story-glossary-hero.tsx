import { Card } from "@/components/ui/card";
import { GlossaryHeroStory } from "@/components/visuals/stories/glossary-hero-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <GlossaryHeroStory />
      </div>
    </Card>
  );
}

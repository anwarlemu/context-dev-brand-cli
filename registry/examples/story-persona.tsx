import { Card } from "@/components/ui/card";
import { PersonaStory } from "@/components/visuals/stories/persona-story";
import type { PersonaStoryCaptions } from "@/components/visuals/stories/persona-story-scenes";

// Kept outside the component: new captions reload the story.
const CAPTIONS: PersonaStoryCaptions = {
  challenge: ["generic UI", "users cannot picture their brand"],
  solution: ["logo + colors", "applied across the platform"],
  impact: ["more trials", "customers see themselves in it"],
};

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <PersonaStory name="portal" captions={CAPTIONS} />
      </div>
    </Card>
  );
}

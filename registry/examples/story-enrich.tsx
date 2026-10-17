import { Card } from "@/components/ui/card";
import { EnrichStory } from "@/components/visuals/stories/enrich-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <EnrichStory />
      </div>
    </Card>
  );
}

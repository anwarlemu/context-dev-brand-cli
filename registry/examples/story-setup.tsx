import { Card } from "@/components/ui/card";
import { SetupStory } from "@/components/visuals/stories/setup-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      {/* Its grid is nearly square and coarser than the other stories, so it is drawn smaller. */}
      <div className="relative w-full max-w-60">
        <SetupStory />
      </div>
    </Card>
  );
}

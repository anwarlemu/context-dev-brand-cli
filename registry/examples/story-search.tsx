import { Card } from "@/components/ui/card";
import { SearchStory } from "@/components/visuals/stories/search-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <SearchStory />
      </div>
    </Card>
  );
}

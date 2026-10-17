import { Card } from "@/components/ui/card";
import { UrlListStory } from "@/components/visuals/stories/url-list-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <UrlListStory />
      </div>
    </Card>
  );
}

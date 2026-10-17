import { Card } from "@/components/ui/card";
import { PageMonitorStory, SitemapMonitorStory, ExtractMonitorStory } from "@/components/visuals/stories/monitor-ways-story";

export function Site() {
  return (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
      <Card variant="ring" className="items-center justify-center">
        <div className="relative w-full">
          <PageMonitorStory />
        </div>
      </Card>
      <Card variant="ring" className="items-center justify-center">
        <div className="relative w-full">
          <SitemapMonitorStory />
        </div>
      </Card>
      <Card variant="ring" className="items-center justify-center">
        <div className="relative w-full">
          <ExtractMonitorStory />
        </div>
      </Card>
    </div>
  );
}

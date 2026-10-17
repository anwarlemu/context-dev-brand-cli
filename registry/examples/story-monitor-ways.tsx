import { Card } from "@/components/ui/card";
import { PageMonitorStory, SitemapMonitorStory, ExtractMonitorStory } from "@/components/visuals/stories/monitor-ways-story";

// One card per way to monitor, stacked so each picture is drawn at a size its dots can be read at.
export function Site() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <Card variant="ring" className="items-center justify-center p-4 md:p-5">
        <div className="relative w-full">
          <PageMonitorStory />
        </div>
      </Card>
      <Card variant="ring" className="items-center justify-center p-4 md:p-5">
        <div className="relative w-full">
          <SitemapMonitorStory />
        </div>
      </Card>
      <Card variant="ring" className="items-center justify-center p-4 md:p-5">
        <div className="relative w-full">
          <ExtractMonitorStory />
        </div>
      </Card>
    </div>
  );
}

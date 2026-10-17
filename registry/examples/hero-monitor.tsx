import { HeroMonitor } from "@/components/visuals/hero-monitor";
import { SearchStory } from "@/components/visuals/stories/search-story";

export function Site() {
  return (
    <div className="w-full max-w-xl">
      <HeroMonitor>
        <SearchStory />
      </HeroMonitor>
    </div>
  );
}

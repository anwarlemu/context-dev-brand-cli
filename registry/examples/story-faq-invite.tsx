import { HeroCirclePatternSurface } from "@/components/visuals/hero-circle-pattern";
import { patternHole } from "@/components/visuals/hero-pattern-hole";
import { FaqInviteStory } from "@/components/visuals/stories/faq-invite-story";

export function Site() {
  return (
    <HeroCirclePatternSurface tone="subtle" clusters={false} className="w-full max-w-md select-none">
      <div aria-hidden="true" {...patternHole("cover")} className="relative block">
        <FaqInviteStory />
      </div>
    </HeroCirclePatternSurface>
  );
}

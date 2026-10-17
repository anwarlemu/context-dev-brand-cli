import { HeroCirclePatternSurface, StoryStage } from "@/components/visuals/hero-circle-pattern";
import { patternHole } from "@/components/visuals/hero-pattern-hole";

export function Site() {
  return (
    <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-card shadow-card">
        <StoryStage>
          <div className="flex h-40 items-center justify-center rounded-card bg-surface font-mono text-caption text-fg-muted shadow-card">GET /v1/search?q=pricing</div>
        </StoryStage>
      </div>
      <HeroCirclePatternSurface tone="rings" clusters={false} className="flex min-h-88 flex-col items-center justify-center gap-3 overflow-hidden rounded-card px-6 py-12 text-center shadow-card">
        <h3 {...patternHole("text")} className="text-h3 font-normal text-fg">
          Talk to the team
        </h3>
        <p {...patternHole("text")} className="max-w-xs text-body text-fg-muted">
          See a demo on your own pages, with your own questions.
        </p>
      </HeroCirclePatternSurface>
    </div>
  );
}

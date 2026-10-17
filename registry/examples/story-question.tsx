import { Card } from "@/components/ui/card";
import { QuestionStory } from "@/components/visuals/stories/question-story";

export function Site() {
  return (
    <Card variant="ring" className="min-h-[22rem] w-full max-w-xl items-center justify-center">
      <div className="relative w-full max-w-[26rem]">
        <QuestionStory />
      </div>
    </Card>
  );
}

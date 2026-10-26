import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

export function Site() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Bubble variant="secondary">
        <BubbleContent>Can Context.dev read pages that load with JavaScript?</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Yes. Every page renders in a real browser first, so you get what a person sees.</BubbleContent>
      </Bubble>
    </div>
  );
}

export function Product() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <BubbleGroup>
        <Bubble align="end">
          <BubbleContent>My crawl stopped at 1,240 pages.</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Is there a page limit on Starter?</BubbleContent>
        </Bubble>
      </BubbleGroup>
      <Bubble variant="secondary" className="relative mb-3">
        <BubbleContent>Starter crawls up to 2,000 pages per job. This one hit the site's rate limit; retry with a lower rate.</BubbleContent>
        <BubbleReactions align="start">👍 1</BubbleReactions>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>Typing…</BubbleContent>
      </Bubble>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Bubble variant="muted">
        <BubbleContent>Ana joined the conversation</BubbleContent>
      </Bubble>
      <Bubble variant="tinted">
        <BubbleContent>Tip: set maxPages to stop a crawl early.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Not sent. Check your connection and try again.</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>A plain reply with no bubble, for long answers.</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent asChild>
          <button type="button">Rate limits</button>
        </BubbleContent>
      </Bubble>
    </div>
  );
}

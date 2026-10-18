import { AnnouncementDotStrip, ANNOUNCEMENT_TEXT_ATTRIBUTE } from "@/components/visuals/announcement-dot-strip";

export function Site() {
  return (
    <div className="relative isolate flex h-10 w-full items-center justify-center overflow-hidden bg-announcement text-fg-brand">
      <AnnouncementDotStrip />
      <a href="https://context.dev/blog/answers" {...{ [ANNOUNCEMENT_TEXT_ATTRIBUTE]: "" }} className="text-body-sm text-fg underline-offset-4 hover:underline">
        New: answers with citations, in one call
      </a>
    </div>
  );
}

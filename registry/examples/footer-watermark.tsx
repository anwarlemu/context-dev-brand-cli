import { Button } from "@/components/ui/button";
import { FooterWatermark } from "@/components/visuals/footer-watermark";

export function Site() {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-neutral-90 select-none sm:h-88">
      <FooterWatermark className="max-sm:top-14 max-sm:h-auto" />
      {/* The attribute named by WATERMARK_CURSOR_ORIGIN_ATTRIBUTE, written out: this example renders on the server. */}
      <span data-watermark-cursor-origin="" className="absolute top-[calc(50%+min(1.65vw,2.1rem))] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 max-sm:top-4 max-sm:translate-y-0">
        <Button asChild variant="pill-on-brand" size="sm" className="transition-transform duration-150 ease-out in-data-pressed:scale-95">
          <a href="https://docs.context.dev">Onboard your agent</a>
        </Button>
      </span>
    </div>
  );
}

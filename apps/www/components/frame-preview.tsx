"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/segmented-control";

const WIDTHS = { desktop: 1440, phone: 390 } as const;
const MAX_HEIGHT = 2400;
const phoneQuery = "(max-width: 639px)";
const phoneSnapshot = () => window.matchMedia(phoneQuery).matches;
const serverSnapshot = () => false;
function subscribeViewport(notify: () => void) {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

/**
 * A full-page example in an iframe at a real window width, scaled down to the frame: desktop (1440px) or phone
 * (390px). The frame takes the page's own height (up to a cap) so nothing scrolls inside it.
 */
export function FramePreview({ src, label, surface, fullPage = true }: { src: string; label: string; surface: "site" | "product"; fullPage?: boolean }) {
  const box = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [chosenDevice, setDevice] = React.useState<keyof typeof WIDTHS | null>(null);
  const phone = React.useSyncExternalStore(subscribeViewport, phoneSnapshot, serverSnapshot);
  const device = chosenDevice ?? (phone ? "phone" : "desktop");
  const [boxWidth, setBoxWidth] = React.useState(0);
  const [pageHeight, setPageHeight] = React.useState(900);
  const width = fullPage ? WIDTHS[device] : Math.max(1, boxWidth);
  const scale = boxWidth ? Math.min(1, boxWidth / width) : 0;
  const ready = scale > 0;

  React.useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The sandboxed example reports its size without giving it access to the parent document.
  React.useEffect(() => {
    const measure = (event: MessageEvent) => {
      if (!frame.current || event.source !== frame.current.contentWindow || event.origin !== "null") return;
      const data = event.data;
      if (data?.type === "context-preview-shortcut" && (data.action === "search" || data.action === "back")) {
        window.dispatchEvent(new KeyboardEvent("keydown", data.action === "search" ? { key: "k", metaKey: true } : { key: "Escape", shiftKey: true }));
        return;
      }
      if (data?.type !== "context-preview-size" || typeof data.height !== "number" || !Number.isFinite(data.height)) return;
      setPageHeight(Math.max(120, Math.min(MAX_HEIGHT, Math.ceil(data.height))));
    };
    window.addEventListener("message", measure);
    return () => window.removeEventListener("message", measure);
  }, []);

  return (
    <figure className="min-w-0 overflow-hidden rounded-card border border-line-subtle bg-surface">
      <figcaption className="flex items-center gap-2 border-b border-line-subtle px-4 py-3 text-caption text-fg-muted">
        <span aria-hidden className={cn("size-1.5 rounded-pill", surface === "product" ? "bg-neutral-50" : "bg-brand")} />
        {label}
        <span className="ml-auto flex items-center gap-1">
          {fullPage && <SegmentedControl label={`${label} viewport`} size="sm" value={device} onValueChange={setDevice} options={[{ value: "desktop", label: "Desktop" }, { value: "phone", label: "Phone" }]} />}
          <a href={src} target="_blank" rel="noreferrer" aria-label="Open the example on its own page" className="ml-1 flex size-6 items-center justify-center rounded-control outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </span>
      </figcaption>
      <div ref={box} className="relative overflow-hidden bg-surface" style={{ height: scale ? pageHeight * scale : 400 }}>
        <div className={cn("absolute top-0", device === "phone" ? "left-1/2 -translate-x-1/2" : "left-0")} style={{ width: width * scale || "100%" }}>
          {ready && (
            <iframe
              ref={frame}
              key={device}
              src={src}
              title={label}
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              allow="clipboard-write *"
              className="block origin-top-left border-0"
              style={{ width, height: pageHeight, transform: `scale(${scale})` }}
            />
          )}
        </div>
      </div>
    </figure>
  );
}

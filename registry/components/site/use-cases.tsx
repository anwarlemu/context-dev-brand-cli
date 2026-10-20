"use client";

import * as React from "react";
import { Globe } from "lucide-react";

import { UseCaseCodeTabs, type UseCaseSample } from "@/components/site/use-case-how-it-works";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patternHole } from "@/components/visuals/hero-pattern-hole";
import { cn } from "@/lib/utils";

// The home page's use case explorer: one card in the soft blue ring, the use cases down the left (a row that scrolls on
// phones), each with its glyph or icon, title and a line of description. One pale brand-tint card (the tabs' own pill)
// glides between them on a spring to mark the picked one. The right side shows that use case in the code tabs window:
// a tab per SDK language, the install command as its footer, and one remembered language for the whole page
// (useCodeLanguage), over an optional backdrop (the site uses its ring pattern). The window keeps one height, so
// switching never resizes the card. While on screen it steps through the use cases every six seconds, a small donut on
// the picked one counting down; it holds while the pointer or keyboard focus is inside, and never steps under reduced
// motion. On phones the strip scrolls to the picked tab, and swiping it picks the tab it settles on.

export type UseCaseItem = {
  id: string;
  title: string;
  description: string;
  /** A line icon on a blue tile beside the title, and in the window's label. */
  icon?: React.ReactNode;
  /** A dot glyph (PersonaGlyph) in place of the icon tile, as the site draws the list. */
  glyph?: React.ReactNode;
  /** The code in every SDK language, with each language's install command. */
  samples?: UseCaseSample[];
  /** @deprecated One sample with no language tabs; pass `samples`. */
  code?: string;
  /** Extra buttons in the window's chrome bar before copy (try in an agent, docs); a function gets the sample showing. */
  actions?: React.ReactNode | ((sample: UseCaseSample) => React.ReactNode);
};

const CYCLE_MS = 6000;
// How long the phone strip must sit still before the tab it settled on is picked.
const SETTLE_MS = 120;

function CycleDonut({ restartKey, running }: { restartKey: string; running: boolean }) {
  const ref = React.useRef<SVGCircleElement>(null);
  const animation = React.useRef<Animation | null>(null);
  React.useEffect(() => {
    const circle = ref.current;
    if (!circle?.animate) return;
    animation.current = circle.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: CYCLE_MS, easing: "linear", fill: "forwards" });
    return () => animation.current?.cancel();
  }, [restartKey]);
  React.useEffect(() => {
    if (running) animation.current?.play();
    else animation.current?.pause();
  }, [running, restartKey]);
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute top-3 right-3 size-3.5 -rotate-90">
      <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" className="stroke-neutral-70/15" />
      <circle ref={ref} cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="stroke-neutral-70" />
    </svg>
  );
}

/** The "Try in" group for the window's chrome bar: a label and small agent buttons on one dark chip. */
function UseCaseTryIn({ label = "Try in", children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-0.5 overflow-hidden rounded-card border border-white/10 bg-dark p-0.5 transition-[border-color] duration-150 ease-out hover:border-white/20 motion-reduce:transition-none", className)}>
      <span className="pr-1 pl-2 text-caption font-medium text-white">{label}</span>
      {children}
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

const scrollPaddingLeft = (element: HTMLElement) => Number.parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;

function samplesOf(item: UseCaseItem): UseCaseSample[] {
  if (item.samples?.length) return item.samples;
  return [{ language: "code", label: "Code", filename: item.title, code: item.code ?? "", install: null }];
}

function UseCases({ items, defaultValue, backdrop, className }: { items: UseCaseItem[]; defaultValue?: string; backdrop?: React.ReactNode; className?: string }) {
  const [value, setValue] = React.useState(defaultValue ?? items[0]?.id ?? "");
  const index = Math.max(0, items.findIndex((item) => item.id === value));
  const reduced = useReducedMotion();

  // The cycle runs while 40 percent of the card is on screen and nothing inside holds it. Focus from a click is ignored:
  // it lingers after the pointer leaves (the code is focusable), which would otherwise hold the cycle indefinitely.
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const running = inView && !hovered && !focused && !reduced && items.length > 1;
  // Bumped on every pick, even of the one already showing, so the timer and the donut start over.
  const [pick, setPick] = React.useState(0);
  const shown = React.useRef({ index, pick: 0, ms: 0 });

  const choose = React.useCallback((next: string) => {
    setValue(next);
    setPick((count) => count + 1);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!running) return;
    if (shown.current.index !== index || shown.current.pick !== pick) shown.current = { index, pick, ms: 0 };
    const current = shown.current;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => setValue(items[(index + 1) % items.length].id), CYCLE_MS - current.ms);
    return () => {
      window.clearTimeout(timer);
      current.ms += performance.now() - startedAt;
    };
  }, [index, running, pick, items]);

  // Phones: the strip scrolls the picked tab to its left edge. A scroll the strip makes itself is not a swipe, so its
  // settling never picks a tab (near the end the strip cannot bring a tab to the edge, and would pick the last).
  const stripRef = React.useRef<HTMLDivElement>(null);
  const settleTimer = React.useRef<number | undefined>(undefined);
  const selfScrolling = React.useRef(false);
  React.useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  React.useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.querySelector<HTMLElement>(`[role="tab"][data-tab-id="${CSS.escape(value)}"]`);
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    const left = Math.min(tab.offsetLeft - scrollPaddingLeft(strip), strip.scrollWidth - strip.clientWidth);
    if (Math.abs(left - strip.scrollLeft) < 1) return;
    selfScrolling.current = true;
    strip.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [value, reduced]);

  const pickSnappedTab = () => {
    const strip = stripRef.current;
    if (!strip) return;
    if (selfScrolling.current) {
      selfScrolling.current = false;
      return;
    }
    const tabs = Array.from(strip.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (!tabs.length) return;
    // The last tabs cannot scroll all the way to the start, so reaching the end of the strip means the last one.
    const atEnd = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1;
    const snapLeft = strip.scrollLeft + scrollPaddingLeft(strip);
    const snapped = atEnd ? tabs.length - 1 : tabs.reduce((closest, tab, i) => (Math.abs(tab.offsetLeft - snapLeft) < Math.abs(tabs[closest].offsetLeft - snapLeft) ? i : closest), 0);
    const id = tabs[snapped].dataset.tabId;
    if (id && id !== value) choose(id);
  };

  const onStripScroll = () => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(pickSnappedTab, SETTLE_MS);
  };

  return (
    <div
      ref={rootRef}
      data-slot="use-cases"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      className={cn("rounded-card bg-ring-tint p-2", className)}
    >
      <Tabs value={value} onValueChange={choose} orientation="vertical" className="gap-0 overflow-hidden rounded-card bg-surface ring-1 ring-hairline md:flex-row">
        <div
          ref={stripRef}
          onScroll={onStripScroll}
          className="w-full shrink-0 snap-x snap-mandatory scroll-pl-2.5 overflow-x-auto border-b border-line-subtle bg-surface md:w-auto md:min-w-80 md:scroll-pl-0 md:overflow-visible md:border-r md:border-b-0"
        >
          {/* The list's own pill, restyled as the pale brand-tint card, glides to the picked tab on a spring. */}
          <TabsList aria-label="Code examples" pillClassName="rounded-card bg-tint" className="w-max flex-row items-stretch gap-0.5 p-2.5 md:grid md:w-auto md:auto-rows-fr md:p-2">
            {items.map((item, i) => {
              const active = item.id === value;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={cn(
                    "relative h-auto w-70 shrink-0 snap-start flex-col items-start justify-start gap-1 rounded-card px-4 py-3 text-left whitespace-normal text-fg transition-[background-color,opacity] duration-200 ease-out motion-reduce:transition-none md:w-auto md:max-w-80",
                    active ? "opacity-100" : "bg-transparent opacity-70 hover:bg-tint/60 hover:opacity-100",
                  )}
                >
                  {active && !reduced && items.length > 1 && <CycleDonut restartKey={`${i}-${pick}`} running={running} />}
                  <span className="flex items-center gap-3">
                    {item.glyph ?? (item.icon && <span className="grid size-7 shrink-0 place-items-center rounded-control bg-brand p-1.5 text-white [&_svg]:size-4">{item.icon}</span>)}
                    <span className="text-body leading-snug font-normal whitespace-nowrap text-fg">{item.title}</span>
                  </span>
                  <span className={cn("text-body-sm leading-snug whitespace-normal text-fg-muted", (item.glyph || item.icon) && "pl-10")}>{item.description}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <div className="relative isolate flex min-w-0 flex-1 items-center justify-center overflow-hidden px-4 py-12 md:px-6 md:py-16">
          {backdrop && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              {backdrop}
            </div>
          )}
          <div {...patternHole("snug-box")} className="relative w-full max-w-3xl">
            {items.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                <UseCaseCodeTabs
                  samples={samplesOf(item)}
                  showInstall={Boolean(item.samples?.length)}
                  label={
                    <>
                      <span aria-hidden="true" className="flex shrink-0 text-white/60 [&_svg]:size-3.5">
                        {item.icon ?? <Globe />}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </>
                  }
                  actions={item.actions}
                />
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export { UseCases, UseCaseTryIn };

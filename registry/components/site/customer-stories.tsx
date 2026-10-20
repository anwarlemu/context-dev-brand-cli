"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// The site's customer stories: tall brand-blue cards (the logos, not per-customer colors, tell them apart) in a row that
// runs the full width of the page, so the next card peeks in past the right edge (and the previous ones past the left
// once scrolled), with arrows and one dot per card under it. The row is a native scroll container: touch keeps the
// browser's own swipe, a mouse drag scrubs it and a flick glides on, and the arrows scroll a card at a time. The first
// card starts on the content edge. `tone` sets the controls (and the optional dotted rules) for a white or dark section.

type CustomerStoriesTone = "light" | "dark";

// Mouse drag: movement under this is still a click on a card, not a drag.
const DRAG_THRESHOLD = 4;
// After a drag is let go it keeps gliding, keeping this share of its speed every 16ms, from at most MAX_FLING px/ms, so
// even a hard flick carries on for about two cards rather than off to the end.
const MOMENTUM_FRICTION = 0.93;
const MAX_FLING = 3;
// A click this soon after the row scrolled is the end of a drag, not a click on a card.
const CLICK_AFTER_SCROLL_MS = 350;

type Drag = { pointerId: number; startX: number; startScroll: number; lastX: number; lastTime: number; velocity: number; moved: boolean };

// The dotted rules above and below the row: 4px dashes, black at 12 percent on white, white at 15 percent on black.
const RULE = {
  light: "bg-[repeating-linear-gradient(to_right,color-mix(in_srgb,var(--ds-color-black)_12%,transparent)_0,color-mix(in_srgb,var(--ds-color-black)_12%,transparent)_4px,transparent_4px,transparent_8px)]",
  dark: "bg-[repeating-linear-gradient(to_right,color-mix(in_srgb,var(--ds-color-white)_15%,transparent)_0,color-mix(in_srgb,var(--ds-color-white)_15%,transparent)_4px,transparent_4px,transparent_8px)]",
};

function CustomerStoriesCarousel({
  children,
  tone = "light",
  showRules = false,
  label = "Customer stories",
  className,
}: {
  children: React.ReactNode;
  tone?: CustomerStoriesTone;
  showRules?: boolean;
  label?: string;
  className?: string;
}) {
  const slides = React.Children.toArray(children);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);
  const momentum = React.useRef(0);
  const lastScroll = React.useRef(0);
  const [{ canPrev, canNext, active }, setState] = React.useState({ canPrev: false, canNext: true, active: 0 });

  // The row breaks out to the viewport's width; the rail (the content column) is measured so the first card starts on
  // its edge and two (md) or three (lg) cards fill it exactly.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!root || !scroller) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      scroller.style.setProperty("--carousel-rail", `${rect.width}px`);
      scroller.style.setProperty("--carousel-inset", `${Math.max(0, rect.left)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(momentum.current), []);

  const update = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    lastScroll.current = Date.now();
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    const atStart = scrollLeft <= 5;
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 5;
    const els = Array.from(scroller.querySelectorAll<HTMLElement>("[data-slide]"));
    let next = 0;
    // At either end the row is clamped, so the closest card to the start edge would be wrong: pin to the first or last.
    if (atEnd) next = els.length - 1;
    else if (!atStart) {
      const edge = scroller.getBoundingClientRect().left + (parseFloat(getComputedStyle(scroller).getPropertyValue("--carousel-inset")) || 0);
      let best = Infinity;
      els.forEach((el, i) => {
        const distance = Math.abs(el.getBoundingClientRect().left - edge);
        if (distance < best) {
          best = distance;
          next = i;
        }
      });
    }
    setState((s) => (s.canPrev === !atStart && s.canNext === !atEnd && s.active === next ? s : { canPrev: !atStart, canNext: !atEnd, active: next }));
  }, []);

  React.useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const behavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const scrollBySlide = (direction: 1 | -1) => {
    const scroller = scrollRef.current;
    const slide = scroller?.querySelector<HTMLElement>("[data-slide]");
    if (!scroller || !slide) return;
    const gap = parseFloat(getComputedStyle(slide.parentElement!).columnGap) || 0;
    scroller.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: behavior() });
  };

  const scrollToIndex = (i: number) => {
    const scroller = scrollRef.current;
    const target = scroller?.querySelectorAll<HTMLElement>("[data-slide]")[i];
    if (!scroller || !target) return;
    const inset = parseFloat(getComputedStyle(scroller).getPropertyValue("--carousel-inset")) || 0;
    scroller.scrollTo({ left: target.offsetLeft - inset, behavior: behavior() });
  };

  // Mouse drag scrubs the row; touch keeps the browser's own swipe.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    cancelAnimationFrame(momentum.current);
    event.preventDefault();
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: event.currentTarget.scrollLeft, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, moved: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.currentTarget.scrollLeft = drag.startScroll - dx;
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = drag.velocity * 0.6 + ((event.clientX - drag.lastX) / elapsed) * 0.4;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const scroller = event.currentTarget;
    if (scroller.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A pause before letting go means no fling.
    let velocity = event.timeStamp - drag.lastTime > 80 ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, -drag.velocity));
    let last = performance.now();
    const glide = (now: number) => {
      const elapsed = now - last;
      last = now;
      scroller.scrollLeft += velocity * elapsed;
      velocity *= MOMENTUM_FRICTION ** (elapsed / 16);
      if (Math.abs(velocity) > 0.02) momentum.current = requestAnimationFrame(glide);
    };
    if (Math.abs(velocity) > 0.02) momentum.current = requestAnimationFrame(glide);
  };

  const light = tone === "light";
  const arrowClass = cn(
    "hidden size-10 shrink-0 items-center justify-center rounded-pill backdrop-blur-sm outline-none transition-[background-color,opacity] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none md:flex [&_svg]:size-5",
    light ? "bg-black/5 text-fg enabled:hover:bg-black/10" : "bg-white/10 text-white enabled:hover:bg-white/20",
  );

  return (
    <div ref={rootRef} data-slot="customer-stories-carousel" role="region" aria-roledescription="carousel" aria-label={label} className={cn("relative flex flex-col", className)}>
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
        {showRules && <div aria-hidden="true" className={cn("absolute top-0 left-0 h-px w-full", RULE[tone])} />}
        {/* Extra vertical room so focus rings are not clipped by the scroll container. */}
        <div
          ref={scrollRef}
          onScroll={update}
          onClickCapture={(event) => {
            if (Date.now() - lastScroll.current < CLICK_AFTER_SCROLL_MS && dragRef.current === null && event.detail > 0) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="relative -my-6 w-full overflow-x-auto overflow-y-hidden py-6 [scrollbar-width:none] max-[43.2rem]:snap-x max-[43.2rem]:snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {/* The site's own breakpoints: one card (snapping, tighter gap) on phones, two from 43.2rem, three from 57.6rem. */}
          <div className="flex gap-4 pl-(--carousel-inset) min-[43.2rem]:gap-8">
            {slides.map((child, i) => (
              <div
                key={React.isValidElement(child) && child.key != null ? String(child.key) : i}
                data-slide=""
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
                className="w-(--carousel-rail) shrink-0 snap-center snap-always min-[43.2rem]:w-[calc((var(--carousel-rail)-var(--ds-space-8))/2)] min-[57.6rem]:w-[calc((var(--carousel-rail)-2*var(--ds-space-8))/3)]"
              >
                {child}
              </div>
            ))}
            {/* Room after the last card so it can rest on the content edge too (padding at the end of a scroller is not reliable). */}
            <div aria-hidden="true" className="-ml-4 w-(--carousel-inset) shrink-0 min-[43.2rem]:-ml-8" />
          </div>
        </div>
        {showRules && <div aria-hidden="true" className={cn("absolute bottom-0 left-0 h-px w-full", RULE[tone])} />}
      </div>

      {slides.length > 1 && (
        <div className="relative mx-auto mt-10 flex w-fit items-center gap-3">
          <button type="button" onClick={() => scrollBySlide(-1)} disabled={!canPrev} className={arrowClass} aria-label="Previous stories">
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => scrollToIndex(i)} aria-label={`Go to card ${i + 1}`} aria-current={i === active || undefined} className="group -m-1 flex items-center justify-center rounded-pill p-3 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                <span
                  className={cn(
                    "block size-2.5 rounded-pill transition-[scale,background-color] duration-200 ease-out motion-reduce:transition-none",
                    i === active ? (light ? "bg-fg" : "bg-white") : cn("scale-80", light ? "bg-fg/20 group-hover:bg-fg/40" : "bg-white/30 group-hover:bg-white/50"),
                  )}
                />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => scrollBySlide(1)} disabled={!canNext} className={arrowClass} aria-label="Next stories">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

type CustomerStoryCardProps = {
  /** The customer's name, the card's heading. */
  company: string;
  /** The logo, drawn white on the blue (the site samples it into dots); a check mark when left out. */
  logo?: React.ReactNode;
  /** The story's summary. */
  description: React.ReactNode;
  /** The date as shown, e.g. "September 12" (this year) or "September 12, 2025", and its machine-readable form. */
  date: string;
  dateTime?: string;
  href: string;
  ctaLabel?: string;
  className?: string;
};

function CustomerStoryCard({ company, logo, description, date, dateTime, href, ctaLabel = "Read their story", className }: CustomerStoryCardProps) {
  return (
    <a href={href} data-slot="customer-story-card" draggable={false} className={cn("group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2", className)}>
      <article className="relative flex h-full flex-col overflow-hidden rounded-card bg-brand sm:h-125">
        <div className="relative flex h-60 shrink-0 items-center justify-center text-white sm:h-49 [&_img]:pointer-events-none">{logo ?? <Check aria-hidden="true" className="size-16" />}</div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <time className="mb-1.5 block text-body-sm leading-snug text-white" dateTime={dateTime}>
            {date}
          </time>
          <h3 className="mb-3 text-h4 leading-snug font-normal tracking-normal text-white">{company}</h3>
          <p className="mb-6 line-clamp-3 text-body-lg leading-snug text-white sm:mb-8 sm:line-clamp-4">{description}</p>
          {/* The site's outline pill on blue; it answers the card's hover, since the whole card is the link. */}
          <span className="mt-auto inline-flex w-fit items-center justify-center rounded-pill border border-white px-5 py-3 text-body leading-snug whitespace-nowrap text-white transition-[background-color] duration-200 ease-out group-hover:bg-white/12 motion-reduce:transition-none">
            {ctaLabel}
          </span>
        </div>
      </article>
    </a>
  );
}

export { CustomerStoriesCarousel, CustomerStoryCard, type CustomerStoryCardProps, type CustomerStoriesTone };

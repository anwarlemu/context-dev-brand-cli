"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// The site's customer stories: tall brand-blue cards (the logos, not per-customer colors, tell them apart) in a row
// that slides a card at a time, with arrows and one dot per card under it. The row moves by transform with a short
// ease-out, so a second click retargets mid-slide instead of waiting; a drag follows the pointer and a quick flick is
// enough to move on. Reduced motion jumps straight to the card. `tone` sets the controls for a white or a dark section.

type CustomerStoriesTone = "light" | "dark";

// Movement under this is still a click on a card, not a drag.
const DRAG_THRESHOLD = 4;
// A flick faster than this (px per ms) moves one card even when the drag was short.
const FLICK_VELOCITY = 0.11;

type Drag = { pointerId: number; startX: number; lastX: number; lastTime: number; velocity: number; moved: boolean };

function CustomerStoriesCarousel({ children, tone = "light", label = "Customer stories", className }: { children: React.ReactNode; tone?: CustomerStoriesTone; label?: string; className?: string }) {
  const slides = React.Children.toArray(children);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<Drag | null>(null);
  const suppressClick = React.useRef(false);
  const [index, setIndex] = React.useState(0);
  // The distance from one slide to the next and how many fit, measured so the row follows the breakpoints.
  const [{ step, visible }, setMetrics] = React.useState({ step: 0, visible: 1 });

  const maxIndex = Math.max(0, slides.length - visible);
  const current = Math.min(index, maxIndex);

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const slide = track.querySelector<HTMLElement>("[data-slide]");
      if (!slide) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const nextStep = slide.offsetWidth + gap;
      const nextVisible = Math.max(1, Math.round((viewport.clientWidth + gap) / nextStep));
      setMetrics((m) => (m.step === nextStep && m.visible === nextVisible ? m : { step: nextStep, visible: nextVisible }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [slides.length]);

  const go = React.useCallback((next: number) => setIndex(Math.max(0, Math.min(next, maxIndex))), [maxIndex]);
  const offset = -current * step;

  // Drag: the track follows the pointer with no transition, resisting past either end, then settles on a card.
  const setDragOffset = (dx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const atStart = current === 0 && dx > 0;
    const atEnd = current === maxIndex && dx < 0;
    const damped = atStart || atEnd ? dx / 3 : dx;
    track.style.transition = "none";
    track.style.transform = `translate3d(${offset + damped}px, 0, 0)`;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, moved: false };
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
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = drag.velocity * 0.6 + ((event.clientX - drag.lastX) / elapsed) * 0.4;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    setDragOffset(dx);
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    suppressClick.current = true;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - drag.startX;
    let moveBy = step ? -Math.round(dx / step) : 0;
    // A pause before letting go means no flick.
    const flicked = event.timeStamp - drag.lastTime < 80 && Math.abs(drag.velocity) > FLICK_VELOCITY;
    if (moveBy === 0 && flicked) moveBy = drag.velocity < 0 ? 1 : -1;
    const target = Math.max(0, Math.min(current + moveBy, maxIndex));
    const track = trackRef.current;
    if (track) {
      // Restores the CSS transition and sets the resting place in the same frame, so the row glides on from wherever
      // the drag left it; React then writes the same transform.
      track.style.transition = "";
      track.style.transform = `translate3d(${-target * step}px, 0, 0)`;
    }
    setIndex(target);
  };

  // Tabbing to a card that is off to the side brings it into view. The browser would scroll the clipped viewport to
  // show it, which the transform does not know about, so that scroll is undone first.
  const onFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollLeft = 0;
    const slide = (event.target as HTMLElement).closest("[data-slide]");
    const i = slide ? Array.from(event.currentTarget.children).indexOf(slide) : -1;
    if (i < 0) return;
    if (i < current) go(i);
    else if (i >= current + visible) go(i - visible + 1);
  };

  const light = tone === "light";
  const arrowClass = cn(
    "hidden size-10 shrink-0 items-center justify-center rounded-pill outline-none transition-[background-color,opacity] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none md:flex [&_svg]:size-5",
    light ? "bg-wash-pill text-fg enabled:hover:bg-wash-selected" : "bg-white/10 text-white enabled:hover:bg-white/20",
  );

  return (
    <div data-slot="customer-stories-carousel" role="region" aria-roledescription="carousel" aria-label={label} className={cn("flex flex-col", className)}>
      {/* Extra vertical room so focus rings are not clipped by the viewport. */}
      <div ref={viewportRef} className="-my-2 overflow-hidden py-2">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClickCapture={(event) => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragStart={(event) => event.preventDefault()}
          onFocusCapture={onFocusCapture}
          style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          className="flex touch-pan-y gap-8 transition-transform duration-300 ease-out select-none motion-reduce:transition-none"
        >
          {slides.map((child, i) => (
            <div
              key={React.isValidElement(child) && child.key != null ? String(child.key) : i}
              data-slide
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className="w-full shrink-0 sm:w-[calc((100%-var(--ds-space-8))/2)] lg:w-[calc((100%-2*var(--ds-space-8))/3)]"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {slides.length > visible && (
        <div className="mx-auto mt-10 flex w-fit items-center gap-3">
          <button type="button" onClick={() => go(current - 1)} disabled={current === 0} className={arrowClass} aria-label="Previous stories">
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`Go to story ${i + 1}`} aria-current={i === current || undefined} className="group -m-1 flex items-center justify-center rounded-pill p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span
                  className={cn(
                    "block size-2.5 rounded-pill transition-[scale,background-color] duration-200 ease-out motion-reduce:transition-none",
                    i === current ? (light ? "bg-fg" : "bg-white") : cn("scale-80", light ? "bg-fg/20 group-hover:bg-fg/40" : "bg-white/30 group-hover:bg-white/50"),
                  )}
                />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => go(current + 1)} disabled={current === maxIndex} className={arrowClass} aria-label="Next stories">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

type CustomerStoryStat = { value: React.ReactNode; label: React.ReactNode };

type CustomerStoryCardProps = {
  /** The customer's name, the card's heading. */
  company: string;
  /** The logo, drawn white on the blue; a check mark when left out. */
  logo?: React.ReactNode;
  /** The story's summary. */
  description?: React.ReactNode;
  /** A quote in place of (or beside) the summary, with who said it. */
  quote?: React.ReactNode;
  person?: string;
  role?: string;
  stats?: CustomerStoryStat[];
  /** The date as shown, e.g. "September 12, 2026", and its machine-readable form. */
  date?: string;
  dateTime?: string;
  href: string;
  ctaLabel?: string;
  className?: string;
};

function CustomerStoryCard({ company, logo, description, quote, person, role, stats, date, dateTime, href, ctaLabel = "Read their story", className }: CustomerStoryCardProps) {
  return (
    <a href={href} data-slot="customer-story-card" draggable={false} className={cn("group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      <article className="relative flex h-full flex-col overflow-hidden rounded-card bg-brand text-on-brand sm:h-125">
        <div className="relative flex h-60 items-center justify-center sm:h-auto sm:min-h-0 sm:flex-1 [&_img]:pointer-events-none">{logo ?? <Check aria-hidden="true" className="size-16" />}</div>

        <div className="flex flex-col p-6 sm:p-8">
          {date && (
            <time className="mb-1.5 block text-body-sm" dateTime={dateTime}>
              {date}
            </time>
          )}
          <h3 className="mb-3 text-h4 leading-snug font-normal">{company}</h3>
          {quote && (
            <figure className="mb-6 sm:mb-8">
              <blockquote className="line-clamp-4 text-body-lg">&ldquo;{quote}&rdquo;</blockquote>
              {(person || role) && (
                <figcaption className="mt-3 text-body-sm">
                  {person}
                  {person && role && <span className="text-on-brand/70">, </span>}
                  {role && <span className="text-on-brand/70">{role}</span>}
                </figcaption>
              )}
            </figure>
          )}
          {description && !quote && <p className="mb-6 line-clamp-3 text-body-lg sm:mb-8 sm:line-clamp-4">{description}</p>}
          {stats && stats.length > 0 && (
            <dl className="mb-6 grid grid-cols-2 gap-4 border-t border-ring-on-brand pt-4 sm:mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col-reverse gap-1">
                  <dt className="text-body-sm text-on-brand/70">{stat.label}</dt>
                  <dd className="text-h4 leading-none tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {/* The site's outline pill on blue; it answers the card's hover, since the whole card is the link. */}
          <span className="inline-flex w-fit items-center justify-center rounded-pill border border-white px-5 py-3 text-body leading-snug whitespace-nowrap text-white transition-[background-color] duration-200 ease-out group-hover:bg-ring-on-brand motion-reduce:transition-none">
            {ctaLabel}
          </span>
        </div>
      </article>
    </a>
  );
}

export { CustomerStoriesCarousel, CustomerStoryCard, type CustomerStoryCardProps, type CustomerStoryStat, type CustomerStoriesTone };

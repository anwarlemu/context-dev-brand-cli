"use client";

import * as React from "react";
import { ArrowRight, Quote } from "lucide-react";

import type { Testimonial } from "@/components/site/testimonials";
import { cn } from "@/lib/utils";

type StripLogo = {
  name: string;
  src?: string;
  node?: React.ReactNode;
  /** The case study; the logo itself becomes the link. Falls back to the quote's `href`. */
  href?: string;
  /** A customer quote shown in a card that glides between logos on hover (from md up). */
  quote?: Testimonial;
  /** Logos that must keep their own colors (no gray at rest). */
  keepColor?: boolean;
  /** Marks drawn in white: they stay dark on hover, since their own colors would vanish on the white strip. */
  whiteArtwork?: boolean;
  /** Wide, short marks (Zero on the site) sit smaller so they read at the same weight as the rest. */
  compact?: boolean;
};

// The whole loop takes 48 seconds, read as ambient rather than something to watch. Under the pointer (or while a quote
// is open) the row coasts to a stop over 900ms and eases back up over 600ms when the pointer leaves, on a cubic
// ease-out. These are longer than the 300ms UI ceiling on purpose: the site's values, since this is a change of
// speed in ambient motion rather than a response the pointer waits on.
const LOOP_MS = 48_000;
const SLOW_DOWN_MS = 900;
const SPEED_UP_MS = 600;
const MAX_FRAME_MS = 100;

// The quote card: 340px wide, 12px from its logo and from the viewport's edges. A short grace before closing lets the
// pointer slide between neighboring logos (the card glides) or across to the card (to click its link).
const CARD_GAP_PX = 12;
const VIEWPORT_MARGIN_PX = 12;
const CLOSE_DELAY_MS = 140;

type Anchor = { index: number; tileLeft: number; tileWidth: number; tileTop: number; tileBottom: number };
type Placement = { x: number; y: number; below: boolean };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

// Above the logo by default; below when the viewport (or the sticky site header) leaves no room above.
function placeCard(anchor: Anchor, card: { width: number; height: number }, stage: DOMRect): Placement {
  const headerBottom = Math.max(0, document.querySelector('[data-slot="site-header"]')?.getBoundingClientRect().bottom ?? 0);
  const safeTop = headerBottom + VIEWPORT_MARGIN_PX - stage.top;
  const safeBottom = window.innerHeight - VIEWPORT_MARGIN_PX - stage.top;
  const minX = Math.max(0, VIEWPORT_MARGIN_PX - stage.left);
  const maxX = Math.min(stage.width, window.innerWidth - VIEWPORT_MARGIN_PX - stage.left) - card.width;
  const x = clamp(anchor.tileLeft + anchor.tileWidth / 2 - card.width / 2, minX, Math.max(minX, maxX));
  const aboveTop = anchor.tileTop - CARD_GAP_PX - card.height;
  const belowTop = anchor.tileBottom + CARD_GAP_PX;
  const fitsAbove = aboveTop >= safeTop;
  const fitsBelow = belowTop + card.height <= safeBottom;
  const below = !fitsAbove && fitsBelow;
  return below ? { x, y: belowTop, below } : { x, y: Math.max(aboveTop, Math.min(safeTop, belowTop)), below };
}

// Logos sit in gray (black at 55 percent). Color lands at once on hover, so the logo answers the pointer; only leaving
// fades back. Only the logo itself counts as hovered, not the empty space around it in its tile.
function logoClass(logo: StripLogo) {
  return cn(
    "w-auto rounded-card object-contain opacity-55 transition-[opacity,filter] duration-200 ease-out will-change-[opacity,filter] group-data-hovered/tile:opacity-100 group-data-hovered/tile:duration-0 motion-reduce:transition-none",
    logo.compact ? "max-h-9 md:max-h-8" : "max-h-12 md:max-h-10",
    !logo.keepColor && "brightness-0 grayscale",
    !logo.keepColor && !logo.whiteArtwork && "group-data-hovered/tile:brightness-100 group-data-hovered/tile:grayscale-0",
  );
}

function LogoTile({ logo, duplicate, onShow, onHide }: { logo: StripLogo; duplicate: boolean; onShow: (tile: HTMLElement) => void; onHide: (delay?: number) => void }) {
  const href = logo.href ?? logo.quote?.href;
  const mark = logo.node ? (
    <span className={cn("flex items-center [&_svg]:h-8 [&_svg]:w-auto", logoClass(logo))}>{logo.node}</span>
  ) : (
    <img src={logo.src} alt={`${logo.name} logo`} loading="lazy" draggable={false} className={logoClass(logo)} />
  );
  const tileOf = (target: EventTarget) => (target as HTMLElement).closest<HTMLElement>("[data-logo-tile]");
  const enter = (event: React.PointerEvent | React.FocusEvent) => {
    const tile = tileOf(event.currentTarget);
    if (!tile) return;
    tile.toggleAttribute("data-hovered", true);
    // A logo without a quote closes the open card at once, rather than leaving it pointing at the wrong logo.
    if (logo.quote) onShow(tile);
    else onHide(0);
  };
  const leave = (event: React.PointerEvent | React.FocusEvent) => {
    tileOf(event.currentTarget)?.toggleAttribute("data-hovered", false);
    onHide();
  };
  const handlers = { onPointerEnter: enter, onPointerLeave: leave, onFocus: enter, onBlur: leave };

  return (
    <div data-logo-tile="" className="group/tile relative flex h-16 w-36 shrink-0 items-center justify-center border-r border-rule bg-surface px-3 sm:h-30 sm:w-44 sm:px-6 md:h-25">
      {href ? (
        <a href={href} tabIndex={duplicate ? -1 : undefined} target="_blank" rel="noopener noreferrer" aria-label={logo.quote?.linkLabel ? `${logo.quote.linkLabel}: ${logo.name}` : logo.name} className="rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2" {...handlers}>
          {mark}
        </a>
      ) : (
        <span className="flex" {...handlers}>
          {mark}
        </span>
      )}
      {logo.quote && (
        <span aria-hidden="true" className="pointer-events-none absolute top-3 right-3 hidden size-6 items-center justify-center rounded-pill text-fg-brand transition-[background-color] duration-200 ease-out group-data-hovered/tile:bg-brand/20 motion-reduce:transition-none md:flex">
          <Quote className="size-3" />
        </span>
      )}
    </div>
  );
}

function QuoteCardContent({ quote }: { quote: Testimonial }) {
  return (
    <div className="p-5">
      <div className="mb-4 flex items-center gap-3">
        {quote.avatar && <img src={quote.avatar} alt={quote.name} width={44} height={44} className="size-11 rounded-pill object-cover outline-1 -outline-offset-1 outline-hairline" />}
        <div className="flex min-w-0 flex-col">
          <p className="text-body-sm text-fg">{quote.name}</p>
          <p className="text-caption text-fg-subtle">{quote.role}</p>
        </div>
      </div>
      <p className="text-body-sm leading-relaxed text-fg-nav">&ldquo;{quote.quote}&rdquo;</p>
      {quote.href && (
        <a href={quote.href} target="_blank" rel="noopener noreferrer" className="group/case mt-4 inline-flex items-center gap-1 rounded-sm text-caption font-medium text-fg-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
          <span>{quote.linkLabel ?? "Read the case study"}</span>
          <ArrowRight aria-hidden="true" className="size-3" />
        </a>
      )}
    </div>
  );
}

// Moves the rows from script rather than a CSS animation, so the strip can coast to a stop and ease back up (tweening a
// CSS animation's playbackRate restarts it every frame). It runs only while on screen, and not at all under reduced motion.
function useEasedMarquee(stripRef: React.RefObject<HTMLDivElement | null>, paused: boolean, loopMs: number, onSettled: () => void) {
  const state = React.useRef({ progress: 0, rate: 1, fromRate: 1, targetRate: 1, easeStartedAt: 0 });
  const wake = React.useRef(() => {});
  const settled = React.useRef(onSettled);
  React.useLayoutEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);

  React.useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rows = Array.from(strip.querySelectorAll<HTMLElement>("[data-strip-row]"));
    const motion = state.current;
    let frame: number | null = null;
    let lastAt: number | null = null;
    let visible = false;

    const step = (now: number) => {
      const elapsed = lastAt === null ? 0 : Math.min(now - lastAt, MAX_FRAME_MS);
      lastAt = now;
      const wasEasing = motion.rate !== motion.targetRate;
      const t = Math.min((now - motion.easeStartedAt) / (motion.targetRate === 0 ? SLOW_DOWN_MS : SPEED_UP_MS), 1);
      motion.rate = t === 1 ? motion.targetRate : motion.fromRate + (motion.targetRate - motion.fromRate) * (1 - (1 - t) ** 3);
      motion.progress = (motion.progress + (motion.rate * elapsed) / loopMs) % 1;
      for (const row of rows) row.style.transform = `translateX(${-motion.progress * 100}%)`;
      if (wasEasing && motion.rate === motion.targetRate) settled.current();
      if (motion.rate === 0 || !visible || reduce.matches) {
        frame = null;
        lastAt = null;
        return;
      }
      frame = requestAnimationFrame(step);
    };
    const start = () => {
      if (reduce.matches) {
        for (const row of rows) row.style.transform = "";
        return;
      }
      if (frame === null && visible) frame = requestAnimationFrame(step);
    };
    wake.current = start;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    observer.observe(strip);
    reduce.addEventListener("change", start);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", start);
      if (frame !== null) cancelAnimationFrame(frame);
      wake.current = () => {};
    };
  }, [stripRef, loopMs]);

  React.useEffect(() => {
    const motion = state.current;
    const targetRate = paused ? 0 : 1;
    if (motion.targetRate === targetRate) return;
    motion.fromRate = motion.rate;
    motion.targetRate = targetRate;
    motion.easeStartedAt = performance.now();
    wake.current();
  }, [paused]);
}

/**
 * The logo strip under the hero: a boxed row with a label cell at the left (its key phrase in blue) and the logos in
 * cells divided by rules, looping sideways. The loop coasts to a stop under the pointer, rests while off screen, and does
 * not run under reduced motion (the row scrolls by hand instead). Logos with a `quote` show it in a card that glides
 * from logo to logo. `edgePattern` fills the gutters beside the column (the site uses the hero's dot field).
 */
function LogoStrip({
  label,
  logos,
  edgePattern,
  loopMs = LOOP_MS,
  className,
  ...props
}: React.ComponentProps<"section"> & { label?: React.ReactNode; logos: StripLogo[]; edgePattern?: React.ReactNode; loopMs?: number }) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const stripRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const quotedTile = React.useRef<HTMLElement | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const [placement, setPlacement] = React.useState<(Placement & { glide: boolean }) | null>(null);
  const [stripHovered, setStripHovered] = React.useState(false);

  const quotes = React.useMemo(() => logos.map((logo) => logo.quote), [logos]);

  const cancelHide = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const scheduleHide = React.useCallback(
    (delay = CLOSE_DELAY_MS) => {
      cancelHide();
      closeTimer.current = setTimeout(() => setAnchor(null), delay);
    },
    [cancelHide],
  );
  React.useEffect(() => cancelHide, [cancelHide]);

  const measure = React.useCallback((tile: HTMLElement): Anchor | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const index = Number(tile.closest<HTMLElement>("[data-logo-index]")?.dataset.logoIndex ?? -1);
    if (index < 0) return null;
    const s = stage.getBoundingClientRect();
    const t = tile.getBoundingClientRect();
    return { index, tileLeft: t.left - s.left, tileWidth: t.width, tileTop: t.top - s.top, tileBottom: t.bottom - s.top };
  }, []);

  const show = React.useCallback(
    (tile: HTMLElement) => {
      const next = measure(tile);
      if (!next) return;
      cancelHide();
      quotedTile.current = tile;
      setAnchor(next);
    },
    [cancelHide, measure],
  );

  // The row coasts a few pixels after the pointer lands, so the card follows the logo to where it came to rest.
  const reanchor = React.useCallback(() => {
    const tile = quotedTile.current;
    if (tile) setAnchor((current) => (current ? (measure(tile) ?? current) : current));
  }, [measure]);

  useEasedMarquee(stripRef, stripHovered || anchor !== null, loopMs, reanchor);

  // The card's height is known once the quote it is about to show is in flow, so it is placed before paint. Moving
  // along the row glides it; opening it, or switching it to the other side, places it without a glide.
  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!anchor || !stage || !card) return;
    const place = () => {
      const next = placeCard(anchor, { width: card.offsetWidth, height: card.offsetHeight }, stage.getBoundingClientRect());
      setPlacement((previous) => {
        return { ...next, glide: previous !== null && previous.below === next.below };
      });
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [anchor]);
  React.useEffect(() => {
    if (!anchor) setPlacement(null);
  }, [anchor]);

  const open = anchor !== null && placement !== null;
  const shownQuote = anchor ? quotes[anchor.index] : undefined;

  return (
    <section data-slot="logo-strip" data-quote-open={open || undefined} className={cn("relative w-full border-b border-rule bg-surface py-6 md:py-8", open && "z-20", className)} {...props}>
      {edgePattern && (
        <>
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[max(5rem,calc((100vw-var(--ds-layout-column))/2))] lg:block">
            {edgePattern}
          </div>
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[max(5rem,calc((100vw-var(--ds-layout-column))/2))] lg:block">
            {edgePattern}
          </div>
        </>
      )}
      <div className="relative mx-auto w-full max-w-(--ds-frame-column) px-6 md:px-10 lg:px-12">
        <div ref={stageRef} className="relative">
          <div className="flex flex-col overflow-hidden rounded-card border border-rule bg-surface md:flex-row">
            {label && (
              <div className="flex shrink-0 items-center justify-center border-b border-rule px-6 py-4 md:w-76 md:justify-start md:border-r md:border-b-0 md:py-0">
                <h2 className="text-center text-body leading-snug font-normal tracking-normal text-balance text-fg-secondary md:text-left">{label}</h2>
              </div>
            )}
            {/* Two identical rows each slide their own width, so the loop is seamless. */}
            <div
              ref={stripRef}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setStripHovered(true);
              }}
              onPointerLeave={() => {
                setStripHovered(false);
                scheduleHide(0);
              }}
              className="relative flex min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto"
            >
              {[false, true].map((duplicate) => (
                <div key={String(duplicate)} data-strip-row="" aria-hidden={duplicate || undefined} className={cn("flex shrink-0 will-change-transform", duplicate && "motion-reduce:hidden")}>
                  {logos.map((logo, index) => (
                    <div key={logo.name} data-logo-index={index} className="flex">
                      <LogoTile logo={logo} duplicate={duplicate} onShow={show} onHide={scheduleHide} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* The quote card (md up). Its padding on the logo's side is a bridge the pointer crosses without closing it. */}
          {quotes.some(Boolean) && (
            <div
              ref={cardRef}
              aria-hidden={!open}
              onPointerEnter={cancelHide}
              onPointerLeave={() => scheduleHide(0)}
              style={placement ? { translate: `${placement.x}px ${placement.y}px`, transformOrigin: placement.below ? "50% 0%" : "50% 100%" } : undefined}
              className={cn(
                "absolute top-0 left-0 z-10 hidden w-85 ease-out before:absolute before:inset-x-0 before:h-3 motion-reduce:transition-none md:block",
                placement?.below ? "before:bottom-full" : "before:top-full",
                placement?.glide ? "transition-[translate,opacity,scale] duration-200" : "transition-[opacity,scale] duration-150",
                open ? "visible scale-100 opacity-100" : "pointer-events-none invisible scale-97 opacity-0",
              )}
            >
              <div className="overflow-hidden rounded-card border border-rule bg-surface shadow-raised">
                {/* Every quote stays mounted: the one showing is in flow (the card takes its height), the rest fade out on top. */}
                <div className="relative">
                  {quotes.map((quote, index) =>
                    quote ? (
                      <div
                        key={logos[index].name}
                        aria-hidden={quote !== shownQuote}
                        className={cn("transition-[opacity,visibility] duration-150 ease-out motion-reduce:transition-none", quote === shownQuote ? "visible relative opacity-100" : "invisible absolute inset-x-0 top-0 opacity-0")}
                      >
                        <QuoteCardContent quote={quote} />
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { LogoStrip, type StripLogo };

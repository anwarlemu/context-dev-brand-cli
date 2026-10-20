"use client";

import * as React from "react";

import { RingBackdrop } from "@/components/visuals/ring-backdrop";
import { cn } from "@/lib/utils";

type HeroSurface = "white" | "blue";

// The two hero surfaces: the home page's white hero (its key phrase in blue, a rule along its foot) and the blue hero
// of the other pages (white text, the title's key phrase plain white).
const SURFACES: Record<HeroSurface, { section: string; title: string; accent: string; muted: string; frame: string }> = {
  white: {
    section: "bg-surface shadow-[inset_0_-1px_0_var(--ds-color-border-rule)]",
    title: "text-fg",
    accent: "text-fg-brand",
    muted: "text-fg-muted",
    frame: "text-rule",
  },
  blue: {
    section: "bg-brand",
    title: "text-on-brand",
    accent: "text-on-brand",
    muted: "text-on-brand/80",
    frame: "text-on-brand/25",
  },
};

const HeroContext = React.createContext<HeroSurface>("white");

// Braces are a motif drawn with CSS, so the heading's text (what crawlers index) reads "The web context API" while
// the page shows "{context}".
function Braced({ phrase }: { phrase: string }) {
  const word = /^\{(.+)\}$/.exec(phrase)?.[1];
  if (!word) return <>{phrase}</>;
  return (
    <span data-brace-open="{" data-brace-close="}" className="before:content-[attr(data-brace-open)] after:content-[attr(data-brace-close)]">
      {word}
    </span>
  );
}

// The title's key phrases in the surface's accent, same weight. Longest first, so overlapping phrases match greedily.
function AccentedTitle({ title, accent, className }: { title: string; accent: string[]; className: string }) {
  const phrases = accent.filter((phrase) => title.includes(phrase)).sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return <>{title}</>;
  const pattern = new RegExp(phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of title.matchAll(pattern)) {
    parts.push(title.slice(cursor, match.index));
    parts.push(<span key={`accent:${match.index}`} className={className}><Braced phrase={match[0]} /></span>);
    cursor = match.index + match[0].length;
  }
  parts.push(title.slice(cursor));
  return <>{parts}</>;
}

/**
 * The small line above the hero title. `plain` is a quiet line in muted text (a link underlines on hover and keeps a
 * 44px target); `byline` is the home hero's funding line ("We raised a $9M seed led by" and the investor's wordmark):
 * muted text with its key words in a `HeroPillEmphasis`, a wordmark image 0.65rem tall, and a 44px target that does
 * not push the title down; `outline` is a pill outlined in the title's color, for news ("New ..."). An arrow after a
 * byline stays still on hover.
 */
function HeroPill({ variant = "plain", href, icon, className, children }: { variant?: "plain" | "outline" | "byline"; href?: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  const surface = SURFACES[React.useContext(HeroContext)];
  const Comp = href ? "a" : "span";
  return (
    <Comp
      href={href}
      data-slot="hero-pill"
      className={cn(
        "inline-flex max-w-full shrink-0 items-center justify-center gap-1.5 text-center text-body-sm leading-snug outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        variant !== "byline" && "[&_img]:size-4.5 [&_img]:rounded-sm [&_svg]:size-4",
        variant === "plain" && surface.muted,
        // The vertical padding widens the tap target to 44px; the matching negative margin keeps the title where it was.
        variant === "byline" &&
          cn("-my-3 gap-1 rounded-pill py-3 [&_img]:ml-0.5 [&_img]:h-[calc(var(--spacing)*2.6)] [&_img]:w-auto [&_svg]:ml-0.5 [&_svg]:size-3.5", surface.muted),
        variant === "plain" && href && "min-h-11 gap-2 underline-offset-4 hover:underline",
        variant === "outline" && cn("gap-2 rounded-pill border border-current px-4 py-2", surface.title),
        className,
      )}
    >
      {icon}
      {children}
    </Comp>
  );
}

/** The byline's key words ("$9M seed"): the title's color at the medium weight. */
function HeroPillEmphasis({ className, ...props }: React.ComponentProps<"span">) {
  const surface = SURFACES[React.useContext(HeroContext)];
  return <span className={cn("font-medium", surface.title, className)} {...props} />;
}

/** One hero action with a caption under it (the site's "No card required" under its primary pill). */
function HeroAction({ note, className, children }: { note?: React.ReactNode; className?: string; children: React.ReactNode }) {
  const surface = SURFACES[React.useContext(HeroContext)];
  return (
    <div data-slot="hero-action" className={cn("flex flex-col items-center gap-2", className)}>
      {children}
      {note && <span className={cn("text-center text-caption leading-snug", surface.muted)}>{note}</span>}
    </div>
  );
}

/**
 * The site's hero, centered. An eyebrow line, then a pill and the title close together, the description, the actions
 * and the visual. `large` is the home hero's display title (one line on wide screens unless `wrapTitle`) with a larger
 * description; the default is the inner pages' title. With `media` the hero fills the first screen and centers its
 * content in it, so the next section never peeks in; set `--hero-offset` to the header's height when the hero sits
 * under it. It carries `data-ds-dots`, so the dot streams attach and run in from its edges.
 */
function Hero({
  surface = "white",
  size = "default",
  wrapTitle = false,
  eyebrow,
  pill,
  title,
  accent,
  description,
  actions,
  media,
  caption,
  background,
  staggerIn: _staggerIn,
  className,
  contentClassName,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  /** `white` is the home hero; `blue` the other pages'. */
  surface?: HeroSurface;
  /** `large` is the home hero's display title. */
  size?: "default" | "large";
  /** Lets a large title wrap on wide screens, at its own line breaks or a narrower measure. */
  wrapTitle?: boolean;
  /** Above the title, a quiet line (a HeroPill). */
  eyebrow?: React.ReactNode;
  /** Right above the title, closer to it than anything else, a news pill. */
  pill?: React.ReactNode;
  title: React.ReactNode;
  /** Phrases of a string title to show in the accent; wrap a phrase in braces ("{context}") to draw them. */
  accent?: string | string[];
  description?: React.ReactNode;
  /** Pills, each optionally in a HeroAction with its caption. */
  actions?: React.ReactNode;
  /** The visual under the actions (a HeroMedia frame with a demo). */
  media?: React.ReactNode;
  /** One line under the visual ("or get an API key free."). */
  caption?: React.ReactNode;
  /** Layers behind the content (a dot field, a HeroFrame); it fills the section. */
  background?: React.ReactNode;
  /**
   * @deprecated A no-op: Context.dev dropped the hero's entrance, so the hero shows at once. Kept so existing pages
   * still type-check.
   */
  staggerIn?: boolean;
  /** Adjusts the inner content's spacing and height without changing the background. */
  contentClassName?: string;
}) {
  const tone = SURFACES[surface];
  const large = size === "large";
  const accentList = typeof accent === "string" ? [accent] : (accent ?? (typeof title === "string" ? ["{API}", "{AI}"] : []));
  const titleNeedsMeasure = typeof title === "string" ? !title.includes("\n") : true;
  return (
    <HeroContext.Provider value={surface}>
      <section
        id="hero"
        data-slot="hero"
        data-ds-dots=""
        data-hero-surface={surface}
        className={cn("relative isolate w-full overflow-hidden text-center", tone.section, className)}
        {...props}
      >
        {background && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            {background}
          </div>
        )}
        <div
          className={cn(
            "relative mx-auto flex w-full flex-col items-center overflow-hidden px-4 sm:px-6 lg:px-12",
            media
              ? "min-h-[max(calc(100svh-var(--hero-offset,0px)),calc(var(--spacing)*128))] justify-center gap-7 pt-8 pb-16 sm:pt-0 lg:gap-8"
              : "min-h-[min(calc(100svh-var(--hero-offset,0px)),calc(var(--spacing)*250))] justify-center gap-8 py-10 sm:py-12 lg:py-16",
            contentClassName,
          )}
        >
          <div className={cn("relative z-10 mx-auto flex w-full shrink-0 flex-col items-center", media ? "gap-3" : "gap-6", large ? "max-w-240" : "max-w-200")}>
            {eyebrow && (
              <div className="flex justify-center">
                {eyebrow}
              </div>
            )}
            <div className="flex w-full flex-col items-center gap-3">
              {pill}
              <div className={cn("flex w-full flex-col items-center text-center", large ? "gap-3" : "gap-6")}>
                {/* A large title never wraps on wide screens and can outgrow its column; the flex row keeps that overflow centered. */}
                <div className="flex w-full justify-center">
                  <h1
                    className={cn(
                      "w-full font-normal whitespace-pre-line text-balance",
                      tone.title,
                      large
                        ? cn("text-hero leading-tight tracking-tight antialiased sm:text-hero-tablet lg:text-hero-desktop lg:leading-hero", wrapTitle ? titleNeedsMeasure && "max-w-(--ds-layout-text)" : "xl:w-max xl:shrink-0 xl:whitespace-nowrap")
                        : "text-hero leading-tight tracking-tight antialiased sm:text-hero-tablet lg:text-hero-desktop lg:leading-hero",
                    )}
                  >
                    {typeof title === "string" ? <AccentedTitle title={title} accent={accentList} className={tone.accent} /> : title}
                  </h1>
                </div>
                {description && (
                  <div className="w-full">
                    <p className={cn("text-balance", tone.muted, large ? "text-h5 leading-snug" : "text-body-lg leading-snug")}>{description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {actions && (
            <div className="relative z-10 flex shrink-0 flex-wrap items-start justify-center gap-3">
              {actions}
            </div>
          )}
          {media && (
            // min-h-0 down the chain lets the visual shrink to the space left, rather than pushing the hero past the screen.
            <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-225 flex-col items-center gap-3.5">
              <div className="flex min-h-0 w-full flex-col items-center">
                {media}
              </div>
              {caption && <p className={cn("text-center text-body-sm", tone.title)}>{caption}</p>}
            </div>
          )}
        </div>
      </section>
    </HeroContext.Provider>
  );
}

/**
 * The hero's visual frame: a brand blue panel set in a soft blue ring (the ring wraps the panel, so its outer edge
 * keeps the panel's radius), the one block of color on the page. `size` narrows it (`small` for a lighter first
 * screen, `compact` to the product monitors' width on phones). `backdrop` is the layer inset in the panel, the site's
 * faint white rings unless you pass another (or `null` for none); `footer` hangs a HeroMediaTab off its bottom edge.
 * Put the demo in a HeroMediaCard, so its corners nest inside the panel's.
 */
function HeroMedia({
  size = "default",
  backdrop,
  footer,
  className,
  panelClassName,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "small" | "compact";
  backdrop?: React.ReactNode;
  footer?: React.ReactNode;
  /** Classes for the blue panel; `className` sizes the ring around it. */
  panelClassName?: string;
}) {
  return (
    // A small panel runs taller than the product monitors (23rem wide, 74 by 64 dots), so from sm up its slot is held
    // to the monitor's height and the rest runs into the hero's bottom padding, leaving the titles at the same height.
    <div data-slot="hero-media" className={cn("flex min-h-0 w-full flex-col items-center", size === "small" && "sm:max-h-[calc(var(--spacing)*92*64/74)]")}>
      {/* The panel stacks above the tab, so the tab tucks under its bottom edge. */}
      <div
        className={cn(
          "relative z-10 w-full max-w-232 rounded-[calc(var(--ds-radius-panel)-var(--ds-space-1-5))] bg-ring-tint p-2 sm:rounded-panel",
          size === "small" && "sm:max-w-152",
          size === "compact" && "max-w-76 sm:max-w-184",
          className,
        )}
      >
        <div
          className={cn(
            "relative flex min-h-0 w-full justify-center rounded-[calc(var(--ds-radius-panel)-var(--ds-space-1-5)-var(--ds-space-2))] bg-brand p-3 sm:rounded-[calc(var(--ds-radius-panel)-var(--ds-space-1))] sm:p-6 md:px-12 md:py-10",
            panelClassName,
          )}
          {...props}
        >
          {backdrop !== null && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-2 overflow-hidden rounded-[calc(var(--spacing)*4.5)] text-white sm:rounded-[calc(var(--ds-radius-panel)-var(--ds-space-2))] md:inset-3">
              {backdrop ?? <RingBackdrop className="inset-0 rounded-[inherit]" />}
            </div>
          )}
          <div className="relative flex w-full justify-center">{children}</div>
        </div>
      </div>
      {footer}
    </div>
  );
}

/**
 * The demo inside a HeroMedia panel: a white card in a solid blue-80 ring, each corner a step inside the one around it
 * (panel 36px, ring 28px, card 20px), as the site's quick demo sits in its panel. The ring overhangs by its own width,
 * so the card keeps the full content width.
 */
function HeroMediaCard({ className, cardClassName, children }: { className?: string; cardClassName?: string; children: React.ReactNode }) {
  return (
    <div data-slot="hero-media-card" className={cn("-m-2 w-[calc(100%+var(--ds-space-4))] max-w-212 rounded-[calc(var(--ds-radius-panel)-var(--ds-space-3))] bg-blue-80 p-2", className)}>
      <div className={cn("relative flex w-full flex-col overflow-hidden rounded-[calc(var(--ds-radius-panel)-var(--ds-space-5))] bg-surface", cardClassName)}>{children}</div>
    </div>
  );
}

// The tab's top corners curve out of the panel's bottom edge: each is a glass square with a quarter circle cut away.
const GLASS = "bg-white/16 backdrop-blur-sm";
const cornerMask = (side: "0" | "100%"): React.CSSProperties => ({
  maskImage: `radial-gradient(circle at ${side} 100%, transparent var(--ds-space-3), var(--ds-color-black) var(--ds-space-3))`,
  WebkitMaskImage: `radial-gradient(circle at ${side} 100%, transparent var(--ds-space-3), var(--ds-color-black) var(--ds-space-3))`,
});

/** A glass tab tucked under the HeroMedia panel (a row of proof points or a status line). */
function HeroMediaTab({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-media-tab"
      className={cn(
        "relative -mt-px flex w-[calc(min(100%,calc(var(--spacing)*208))-var(--ds-space-10))] items-center gap-4 rounded-b-card border border-t-0 border-white/7 px-4 py-1",
        GLASS,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn("absolute top-0 -left-3 size-3", GLASS)} style={cornerMask("0")} />
      <span aria-hidden="true" className={cn("absolute top-0 -right-3 size-3", GLASS)} style={cornerMask("100%")} />
      {children}
    </div>
  );
}

/**
 * A hairline construction frame behind the hero: a top and a bottom edge across the content width, no verticals, from
 * the md breakpoint up. Put it in the hero's `background`; it takes the surface's line color.
 */
function HeroFrame({ surface = "white", className }: { surface?: HeroSurface; className?: string }) {
  return (
    <div aria-hidden="true" data-slot="hero-frame" className={cn("pointer-events-none absolute inset-0 hidden overflow-hidden md:block", SURFACES[surface].frame, className)}>
      <div className="absolute inset-y-0 left-1/2 w-[min(var(--ds-layout-column-wide),100%-var(--ds-space-12))] -translate-x-1/2">
        <div className="absolute inset-x-0 top-(--hero-frame-top,var(--ds-space-3)) h-px bg-current" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-current" />
      </div>
    </div>
  );
}

export { Hero, HeroAction, HeroFrame, HeroMedia, HeroMediaCard, HeroMediaTab, HeroPill, HeroPillEmphasis };

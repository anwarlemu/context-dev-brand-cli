import * as React from "react";

import { cn } from "@/lib/utils";

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

// The title's key phrases in brand blue, same weight. Longest first, so overlapping phrases match greedily.
function AccentedTitle({ title, accent }: { title: string; accent: string[] }) {
  const phrases = accent.filter((phrase) => title.includes(phrase)).sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return <>{title}</>;
  const pattern = new RegExp(`(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {title.split(pattern).map((part, index) =>
        phrases.includes(part) ? (
          <span key={index} className="text-fg-brand">
            <Braced phrase={part} />
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

/**
 * The small line above the hero title. `plain` is the site's quiet "Backed by" line in muted text; `outline` is a
 * hairline pill for news ("New ..."). Pass `href` to make it a link.
 */
function HeroPill({ variant = "plain", href, icon, className, children }: { variant?: "plain" | "outline"; href?: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  const Comp = href ? "a" : "span";
  return (
    <Comp
      href={href}
      data-slot="hero-pill"
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1.5 text-center text-body-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&_img]:size-4.5 [&_img]:rounded-sm [&_svg]:size-4",
        variant === "plain" && "text-fg-muted",
        variant === "plain" && href && "underline-offset-4 hover:underline",
        variant === "outline" && "gap-2 rounded-pill px-4 py-2 text-fg ring-1 ring-hairline ring-inset",
        variant === "outline" && href && "transition-colors duration-150 ease-out hover:bg-tint motion-reduce:transition-none",
        className,
      )}
    >
      {icon}
      {children}
    </Comp>
  );
}

/**
 * The site's hero: centered on white, an eyebrow line, the title at hero size with its key phrase in blue, one line of
 * muted description, the actions (one black pill, one outline pill), then its visual below. It carries
 * `data-ds-dots`, so the dot streams attach and run in from its edges while the middle stays bare.
 */
function Hero({
  eyebrow,
  pill,
  title,
  accent,
  description,
  actions,
  media,
  background,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  /** Above the title, a quiet line (a HeroPill). */
  eyebrow?: React.ReactNode;
  /** Right above the title, a news pill. */
  pill?: React.ReactNode;
  title: React.ReactNode;
  /** Phrases of a string title to show in brand blue; wrap a phrase in braces ("{context}") to draw them. */
  accent?: string | string[];
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** The visual under the actions (a HeroMedia frame, a demo). */
  media?: React.ReactNode;
  /** Layers behind the content (a dot field, a frame); it fills the section. */
  background?: React.ReactNode;
}) {
  const accentList = typeof accent === "string" ? [accent] : (accent ?? []);
  return (
    <section data-slot="hero" data-ds-dots="" className={cn("relative isolate w-full overflow-hidden bg-surface text-center", className)} {...props}>
      {background && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {background}
        </div>
      )}
      <div className="relative mx-auto flex w-full max-w-(--ds-frame-column) flex-col items-center gap-8 px-4 pt-20 pb-16 sm:px-6 lg:px-12">
        <div className="mx-auto flex w-full max-w-240 flex-col items-center gap-3">
          {eyebrow}
          {pill}
          <h1 className="w-full text-hero leading-tight font-normal tracking-tight text-balance text-fg">
            {typeof title === "string" ? <AccentedTitle title={title} accent={accentList} /> : title}
          </h1>
          {description && <p className="max-w-(--ds-layout-heading) text-body-lg text-balance text-fg-muted md:text-h5">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-start justify-center gap-3">{actions}</div>}
        {media && <div className="flex w-full justify-center">{media}</div>}
      </div>
    </section>
  );
}

/** The hero's visual frame: a brand blue panel in a soft blue ring, the one block of color on the page. */
function HeroMedia({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-media"
      className={cn(
        "relative flex w-full max-w-232 justify-center rounded-panel bg-brand p-3 shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)] sm:p-6 md:px-12 md:py-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Hero, HeroPill, HeroMedia };

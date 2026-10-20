import * as React from "react";
import { ArrowRight } from "lucide-react";

import { SectionEdgeLines, SectionHeaderRule } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { cn } from "@/lib/utils";

// The home page's "Latest updates": tall cards in the soft blue ring, cover art on top and the date, title and summary
// below. The grid alternates white and brand-blue cards, so three columns read as a checkerboard. The ring is clear
// until hover, when a translucent white ring frames the card on the dark Latest updates band; nothing moves.

type BlogCardSurface = "paper" | "blue";

type BlogPost = {
  title: string;
  excerpt?: string;
  /** The date as shown, e.g. "October 8, 2026". */
  date: string;
  /** Machine-readable date for the time element, e.g. "2026-10-08". */
  dateTime?: string;
  tag?: string;
  href: string;
  /** The cover art; a ring pattern with a dot glyph when left out. */
  cover?: React.ReactNode;
};

/** Where the card sits: on the dark Latest updates band, or on a white page (a post's related articles). */
type BlogCardTone = "dark" | "light";

const TEXT: Record<BlogCardSurface, { date: string; title: string; excerpt: string; tag: string }> = {
  paper: { date: "text-fg-subtle", title: "text-fg", excerpt: "text-fg-nav", tag: "" },
  blue: { date: "text-on-brand/70", title: "text-on-brand", excerpt: "text-on-brand/80", tag: "text-on-brand ring-ring-on-brand" },
};

// The brand's dot language: a small square of dots, solid along a diagonal, rings elsewhere.
const PLACEHOLDER_GLYPH = ["21111", "12111", "11211", "11121", "11112"];

/** A stand-in cover: a faint ring tile with a dot glyph in the middle, in the card's own colors. */
function BlogCoverPlaceholder({ surface = "paper", className }: { surface?: BlogCardSurface; className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="blog-cover-placeholder"
      className={cn(
        "flex size-full items-center justify-center [background-size:var(--ds-space-4)_var(--ds-space-4)] [background-position:center]",
        surface === "blue"
          ? "bg-[radial-gradient(circle,transparent_var(--ds-space-1),var(--ds-color-ring-on-brand)_var(--ds-space-1),transparent_calc(var(--ds-space-1)+var(--ds-space-px)))] text-on-brand"
          : "bg-[radial-gradient(circle,transparent_var(--ds-space-1),var(--ds-color-ring-tint)_var(--ds-space-1),transparent_calc(var(--ds-space-1)+var(--ds-space-px)))] text-fg-brand",
        className,
      )}
    >
      <DotGlyph rows={PLACEHOLDER_GLYPH} className="size-20" />
    </div>
  );
}

/**
 * One post card. `tone="light"` is the card on a white page (a post's related articles): a hairline ring keeps the white
 * card off the page and the paper card's date darkens to the nav gray, as the site draws it.
 */
function BlogCard({ post, surface = "paper", tone = "dark", className }: { post: BlogPost; surface?: BlogCardSurface; tone?: BlogCardTone; className?: string }) {
  const text = TEXT[surface];
  const light = tone === "light";
  return (
    // The ring wraps the card (its outer edge keeps the card's radius); the negative margin keeps it out of the layout.
    <a
      href={post.href}
      data-slot="blog-card"
      className={cn(
        "group -m-2 block rounded-card bg-transparent p-2 outline-none transition-colors duration-300 ease-out hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
        light ? "h-full focus-visible:ring-offset-surface" : "focus-visible:ring-offset-dark",
        className,
      )}
    >
      <article className={cn("relative flex h-104 flex-col overflow-hidden rounded-card sm:h-125", surface === "blue" ? "bg-brand" : "bg-surface", light && "ring-1 ring-hairline")}>
        <div className="relative min-h-0 flex-1 overflow-hidden">{post.cover ?? <BlogCoverPlaceholder surface={surface} />}</div>
        <div className="relative flex flex-col p-8 pt-6">
          <div className="flex items-center gap-2">
            {post.tag && (
              <Badge variant="chip" className={cn("px-2.5 py-0.5 text-caption leading-snug", text.tag)}>
                {post.tag}
              </Badge>
            )}
            <time className={cn("text-body-sm leading-snug", light && surface === "paper" ? "text-fg-nav" : text.date)} dateTime={post.dateTime}>
              {post.date}
            </time>
          </div>
          <h3 className={cn("mt-2 line-clamp-2 text-h4 leading-snug font-normal tracking-normal", text.title)} title={post.title}>
            {post.title}
          </h3>
          {post.excerpt && <p className={cn("mt-3 line-clamp-2 text-body leading-snug", text.excerpt)}>{post.excerpt}</p>}
        </div>
      </article>
    </a>
  );
}

/** The grid: one column, two from md, three from lg, alternating white and blue cards. */
function BlogCards({ posts, tone, className, ...props }: React.ComponentProps<"div"> & { posts: BlogPost[]; tone?: BlogCardTone }) {
  return (
    <div data-slot="blog-cards" className={cn("grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {posts.map((post, i) => (
        <BlogCard key={post.href} post={post} tone={tone} surface={i % 2 === 0 ? "paper" : "blue"} />
      ))}
    </div>
  );
}

// The band's inner rails: dashed hairlines down the content box's edges, beside the column's solid edge lines.
const DASH_Y =
  "bg-[repeating-linear-gradient(to_bottom,color-mix(in_srgb,var(--ds-color-white)_15%,transparent)_0_var(--ds-space-1),transparent_var(--ds-space-1)_var(--ds-space-2))]";

/**
 * The home page's "Latest updates" band: near-black, full bleed, the column's edge lines and header rule in their dark
 * tone, dashed rails down the content edges, a white heading and the cards (six at most) inset from the rails.
 * `allHref` adds the "All posts" pill across from the heading; `hideOnPhones` drops the band below 768px, as the
 * site's home page does.
 */
function BlogSection({
  title = "Latest updates.",
  posts,
  allHref,
  allLabel = "All posts",
  hideOnPhones = false,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title?: React.ReactNode; posts: BlogPost[]; allHref?: string; allLabel?: React.ReactNode; hideOnPhones?: boolean }) {
  return (
    <section id="blog" data-slot="blog-section" className={cn("relative w-full overflow-x-clip bg-dark", hideOnPhones && "hidden min-[768px]:block", className)} {...props}>
      <SectionEdgeLines tone="dark" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="mx-auto h-full w-full max-w-(--ds-frame-column) px-6 sm:px-8 md:px-10 lg:px-12">
          <div className="relative h-full">
            <div className={cn("absolute inset-y-0 left-0 w-px", DASH_Y)} />
            <div className={cn("absolute inset-y-0 right-0 w-px", DASH_Y)} />
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-(--ds-frame-column) px-6 sm:px-8 md:px-10 lg:px-12">
        <div className="relative pt-10 pb-20 md:pt-12">
          <div className="relative z-10 flex items-center justify-between gap-3 px-3 sm:px-4 md:px-5 lg:px-6">
            <h2 className="max-w-(--ds-layout-heading) text-h3 leading-display font-normal tracking-tight text-balance text-white md:text-h2">{title}</h2>
            {allHref && (
              // The arrow stays put on hover; only the pill's fill answers the pointer.
              <a href={allHref} className={cn(buttonVariants({ variant: "pill-on-brand" }), "shrink-0 gap-1.5 focus-visible:outline-white")}>
                {allLabel}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            )}
          </div>
          <SectionHeaderRule tone="dark" />
          <BlogCards posts={posts.slice(0, 6)} className="relative z-10 px-3 sm:px-4 md:px-5 lg:px-6" />
        </div>
      </div>
    </section>
  );
}

export { BlogCards, BlogCard, BlogSection, BlogCoverPlaceholder, type BlogPost, type BlogCardSurface, type BlogCardTone };

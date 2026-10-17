import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { cn } from "@/lib/utils";

// The home page's "Latest updates": tall cards in the soft blue ring, cover art on top and the date, title and summary
// below. The grid alternates white and brand-blue cards, so three columns read as a checkerboard. On hover a translucent
// white layer lifts the ring (the brand's dark Latest updates section); nothing moves.

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

function BlogCard({ post, surface = "paper", className }: { post: BlogPost; surface?: BlogCardSurface; className?: string }) {
  const text = TEXT[surface];
  return (
    <a
      href={post.href}
      data-slot="blog-card"
      className={cn(
        "group block rounded-card shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)] outline-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-on-brand),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 motion-reduce:transition-none",
        className,
      )}
    >
      <article className={cn("relative flex h-104 flex-col overflow-hidden rounded-card sm:h-125", surface === "blue" ? "bg-brand" : "bg-surface")}>
        <div className="relative min-h-0 flex-1 overflow-hidden">{post.cover ?? <BlogCoverPlaceholder surface={surface} />}</div>
        <div className="relative flex flex-col p-8 pt-6">
          <div className="flex items-center gap-2">
            {post.tag && (
              <Badge variant="chip" className={cn("px-2.5 py-0.5 text-caption", text.tag)}>
                {post.tag}
              </Badge>
            )}
            <time className={cn("text-body-sm", text.date)} dateTime={post.dateTime}>
              {post.date}
            </time>
          </div>
          <h3 className={cn("mt-2 line-clamp-2 text-h4 leading-snug font-normal", text.title)} title={post.title}>
            {post.title}
          </h3>
          {post.excerpt && <p className={cn("mt-3 line-clamp-2 text-body", text.excerpt)}>{post.excerpt}</p>}
        </div>
      </article>
    </a>
  );
}

/** The grid: one column, two from md, three from lg, alternating white and blue cards. */
function BlogCards({ posts, className, ...props }: React.ComponentProps<"div"> & { posts: BlogPost[] }) {
  return (
    <div data-slot="blog-cards" className={cn("grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {posts.map((post, i) => (
        <BlogCard key={post.href} post={post} surface={i % 2 === 0 ? "paper" : "blue"} />
      ))}
    </div>
  );
}

export { BlogCards, BlogCard, BlogCoverPlaceholder, type BlogPost, type BlogCardSurface };

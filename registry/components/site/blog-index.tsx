"use client";

import * as React from "react";

import { BlogCard, type BlogPost } from "@/components/site/blog-cards";
import { Hero, HeroFrame } from "@/components/site/hero";
import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { buttonVariants } from "@/components/ui/button";
import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The blog's index page: the white hero, an optional logo strip, then a ruled section with its heading, a row of
// category pills, the posts as the home page's blog cards (white and blue in turn, each in a hairline ring on the white
// page) and a row of outline pills to the rest of the writing. The closing call to action follows.

type BlogCategory = {
  value: string;
  label: React.ReactNode;
  /** Each category's own page. Left out (with `onCategoryChange`), the pills filter in place. */
  href?: string;
};

type BlogIndexPost = BlogPost & {
  /** The category's `value`, for filtering in place. */
  category?: string;
};

// The selected pill is a black surface that glides between options (useTabGlide); until it is placed, the selected
// option draws its own, so the first paint matches the server render.
const SELECTED_SURFACE = "bg-black shadow-xs";
const PILL =
  "rounded-pill border px-5 py-2 text-pill-sm leading-snug font-medium tracking-[calc(var(--ds-space-0-5)/10)] whitespace-nowrap outline-none transition-[color,background-color,border-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 motion-reduce:transition-none";

/**
 * The category pills over a post list: outlined white pills, the selected one white on black. Links when each option
 * has an `href` (a page per category, as the site does); buttons that call `onValueChange` otherwise.
 */
function BlogCategoryPills({
  options,
  value,
  onValueChange,
  label = "Filter posts by category",
  className,
}: {
  options: readonly BlogCategory[];
  value: string;
  onValueChange?: (value: string) => void;
  label?: string;
  className?: string;
}) {
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const isPlaced = useTabGlide(pillRef, value);
  const links = !onValueChange;
  const Root = links ? "nav" : "div";
  return (
    <Root
      aria-label={label}
      role={links ? undefined : "group"}
      data-slot="blog-category-pills"
      className={cn("relative isolate flex flex-wrap justify-start gap-2", className)}
    >
      <span ref={pillRef} aria-hidden className={cn("pointer-events-none absolute top-0 left-0 -z-10 rounded-pill", SELECTED_SURFACE, !isPlaced && "invisible")} />
      {options.map((option) => {
        const selected = option.value === value;
        const classes = cn(PILL, selected ? cn("border-transparent text-white", !isPlaced && SELECTED_SURFACE) : "border-fg/12 bg-surface text-fg hover:bg-neutral-5");
        if (links)
          return (
            <a key={option.value} data-tab-id={option.value} href={option.href} aria-current={selected ? "page" : undefined} className={classes}>
              {option.label}
            </a>
          );
        return (
          <button key={option.value} type="button" data-tab-id={option.value} aria-pressed={selected} onClick={() => onValueChange(option.value)} className={cn(classes, "cursor-pointer")}>
            {option.label}
          </button>
        );
      })}
    </Root>
  );
}

/**
 * The whole blog index. The hero takes the site Hero's props (`size="large"` and a `HeroFrame` by default; pass the dot
 * field as `heroBackground` and the monitor as `media`). `logos` goes right under the hero, `cta` (a ClosingCta) last.
 * With `onCategoryChange`, posts whose `category` differs from the selected one are left out; `allValue` shows them all.
 */
function BlogIndex({
  title,
  accent,
  description,
  actions,
  media,
  heroBackground,
  logos,
  heading,
  headingAccent,
  headingDescription,
  categories,
  category,
  allValue = "all",
  onCategoryChange,
  categoriesLabel,
  posts,
  emptyMessage = "No posts in this category yet.",
  links,
  linksLabel = "More from the blog",
  cta,
  className,
}: {
  title: string;
  accent?: string | string[];
  description?: React.ReactNode;
  actions?: React.ReactNode;
  media?: React.ReactNode;
  heroBackground?: React.ReactNode;
  logos?: React.ReactNode;
  heading: React.ReactNode;
  headingAccent?: React.ReactNode;
  headingDescription?: React.ReactNode;
  categories?: readonly BlogCategory[];
  category?: string;
  allValue?: string;
  onCategoryChange?: (value: string) => void;
  categoriesLabel?: string;
  posts: readonly BlogIndexPost[];
  emptyMessage?: React.ReactNode;
  /** Outline pills under the posts (guides, the archive, customer stories). */
  links?: readonly { label: React.ReactNode; href: string }[];
  linksLabel?: string;
  cta?: React.ReactNode;
  className?: string;
}) {
  const headingId = React.useId();
  const selected = category ?? allValue;
  const shown = selected === allValue ? posts : posts.filter((post) => !post.category || post.category === selected);
  return (
    <div data-slot="blog-index" className={cn("w-full", className)}>
      <Hero size="large" title={title} accent={accent} description={description} actions={actions} media={media} background={heroBackground ?? <HeroFrame />} />
      {logos}
      <SiteSection lines aria-labelledby={headingId}>
        <SectionHeading
          title={
            <span id={headingId}>
              {heading}
              {headingAccent && (
                <>
                  {" "}
                  <span className="text-fg-brand">{headingAccent}</span>
                </>
              )}
            </span>
          }
          description={headingDescription}
        />
        <SectionHeaderRule />
        {categories && categories.length > 1 && (
          <BlogCategoryPills options={categories} value={selected} onValueChange={onCategoryChange} label={categoriesLabel} className="mb-8" />
        )}
        {shown.length > 0 ? (
          <ul aria-label="Blog posts" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post, index) => (
              <li key={post.href}>
                <BlogCard post={post} tone="light" surface={index % 2 === 0 ? "paper" : "blue"} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-center text-body-lg leading-relaxed text-fg-muted">{emptyMessage}</p>
        )}
        {links && links.length > 0 && (
          <nav aria-label={linksLabel} className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={buttonVariants({ variant: "pill-outline" })}>
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </SiteSection>
      {cta}
    </div>
  );
}

export { BlogIndex, BlogCategoryPills, type BlogCategory, type BlogIndexPost };

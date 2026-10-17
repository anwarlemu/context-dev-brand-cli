import * as React from "react";

import { SectionHeaderRule, SiteSection } from "@/components/site/section";
import { cn } from "@/lib/utils";

// A blog post (and the long comparison articles on the compare pages): the post opens in the ruled column under the
// header, with the title (its closing words in blue), a subtitle, and the author and dates over a field of dots that
// runs from grid line to grid line; a header rule; then the article in a reading column, styled by BlogProse. Related
// posts and the closing call to action follow.

/** The author: a round photo, the name and handle, linked to their page. `updatedAt` switches to "Written by". */
function BlogAuthor({ name, image, handle, href, updatedAt, className }: { name: string; image: string; handle?: string; href?: string; updatedAt?: React.ReactNode; className?: string }) {
  const photo = <img src={image} alt={updatedAt || !href ? name : ""} width={36} height={36} className="size-9 shrink-0 rounded-pill transition-[filter] duration-150 ease-out group-hover:brightness-90 motion-reduce:transition-none" />;
  if (updatedAt) {
    return (
      <div data-slot="blog-author" className={cn("flex items-center gap-3", className)}>
        {photo}
        <div className="flex flex-col">
          <p className="text-body-sm text-fg-muted">Written by {name}</p>
          <p className="text-body-sm text-fg-subtle">Last updated {updatedAt}</p>
        </div>
      </div>
    );
  }
  const body = (
    <>
      {photo}
      <div className="flex flex-col">
        <p className="text-body-sm text-fg">{name}</p>
        {handle && <p className="text-caption text-fg-nav">@{handle}</p>}
      </div>
    </>
  );
  if (!href) return <div className={cn("flex items-center gap-3", className)}>{body}</div>;
  return (
    <a data-slot="blog-author" href={href} rel="author" className={cn("group flex items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2", className)}>
      {body}
    </a>
  );
}

/**
 * The post's header section: the title (its `accent` in blue), the subtitle, and the meta line (author, published and
 * updated dates) on a dot field (`background`) that fills the section to its grid lines; then the header rule and the
 * article. Put the article in `children`, usually a BlogProse.
 */
function BlogPost({
  title,
  accent,
  subtitle,
  author,
  published,
  updated,
  background,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  /** The title's closing words, in brand blue. */
  accent?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** A BlogAuthor. */
  author?: React.ReactNode;
  /** The published date: its ISO value for the time element and its label. */
  published?: { iso: string; label: React.ReactNode };
  updated?: { iso: string; label: React.ReactNode };
  /** The dot field behind the header (HeroDotField fine, lively, with streams). */
  background?: React.ReactNode;
}) {
  const titleId = React.useId();
  const meta = [
    author,
    published && (
      <time key="published" dateTime={published.iso} className="text-body-sm text-fg-nav">
        {published.label}
      </time>
    ),
    updated && (
      <time key="updated" dateTime={updated.iso} className="text-body-sm text-fg-nav">
        Updated {updated.label}
      </time>
    ),
  ].filter(Boolean);
  return (
    <SiteSection lines header="below" aria-labelledby={titleId} className={className} {...props}>
      {/* The section's padding is taken back so the dot field runs from grid line to grid line and down to the rule. */}
      <div className="relative -mx-6 -mt-10 -mb-10 px-6 pt-10 pb-10 md:-mx-10 md:-mt-12 md:-mb-12 md:px-10 md:pt-12 md:pb-12 lg:-mx-12 lg:px-12">
        {background && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-blue-60">
            {background}
          </div>
        )}
        <header className="relative mx-auto flex max-w-3xl flex-col gap-6">
          <h1 id={titleId} className="text-h3 font-normal text-balance text-fg md:text-h2">
            {title}
            {accent && (
              <>
                {" "}
                <span className="text-fg-brand">{accent}</span>
              </>
            )}
          </h1>
          {subtitle && <p className="-mt-2 text-body-lg text-balance text-fg-nav">{subtitle}</p>}
          {meta.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 self-start">
              {meta.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span aria-hidden="true" className="text-fg-nav">
                      ·
                    </span>
                  )}
                  {item}
                </React.Fragment>
              ))}
            </div>
          )}
        </header>
      </div>
      <SectionHeaderRule />
      <div className="mx-auto max-w-3xl">{children}</div>
    </SiteSection>
  );
}

// The article's type and blocks, written as descendant rules so it styles HTML from Markdown as well as JSX. Headings
// regular weight in black, body copy muted at a loose 1.7, bullets as small blue checks, links blue, quotes beside a
// soft blue bar, inline code on the blue tint, and images and tables as white cards in the soft blue ring. A code
// sample is best a CodeWindow (its pre carries data-slot, so these rules leave it alone).
const PROSE = cn(
  "text-fg-muted [&>*:first-child]:mt-0",
  "[&_:is(h1,h2,h3,h4,h5,h6)]:font-normal [&_:is(h1,h2,h3,h4,h5,h6)]:tracking-normal [&_:is(h1,h2,h3,h4,h5,h6)]:text-fg",
  "[&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:text-h2 [&_h1]:leading-heading [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:text-h3 [&_h2]:leading-heading",
  "[&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-h4 [&_h3]:leading-snug [&_:is(h4,h5,h6)]:mt-8 [&_:is(h4,h5,h6)]:mb-3 [&_:is(h4,h5,h6)]:text-h5 [&_:is(h4,h5,h6)]:leading-snug",
  "[&_:is(p,li,td,em)]:text-body-lg [&_:is(p,li,td,em)]:leading-code [&_p]:my-6",
  "[&_ul]:my-6 [&_ul]:list-none [&_ul]:pl-0 [&_ul>li]:relative [&_ul>li]:my-3 [&_ul>li]:pl-8",
  "[&_ul>li]:before:absolute [&_ul>li]:before:top-1.5 [&_ul>li]:before:left-0 [&_ul>li]:before:size-5 [&_ul>li]:before:rounded-sm [&_ul>li]:before:bg-brand [&_ul>li]:before:content-['']",
  "[&_ul>li]:after:absolute [&_ul>li]:after:top-2.5 [&_ul>li]:after:left-1.75 [&_ul>li]:after:h-2.5 [&_ul>li]:after:w-1.5 [&_ul>li]:after:rotate-45 [&_ul>li]:after:border-r-2 [&_ul>li]:after:border-b-2 [&_ul>li]:after:border-white [&_ul>li]:after:content-['']",
  "[&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:my-3 [&_ol>li]:pl-1.5 [&_ol>li]:marker:text-fg-faint",
  "[&_:is(strong,dt,th)]:font-normal [&_:is(strong,dt,th)]:text-fg",
  "[&_a]:font-normal [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:no-underline",
  "[&_blockquote]:relative [&_blockquote]:my-8 [&_blockquote]:pl-8 [&_blockquote]:before:absolute [&_blockquote]:before:inset-y-0 [&_blockquote]:before:left-0 [&_blockquote]:before:w-2 [&_blockquote]:before:rounded-card [&_blockquote]:before:bg-ring-tint [&_blockquote]:before:ring-1 [&_blockquote]:before:ring-brand/10 [&_blockquote]:before:ring-inset [&_blockquote]:before:content-['']",
  "[&_blockquote_p]:text-h5 [&_blockquote_p]:leading-relaxed [&_blockquote_p]:text-fg",
  "[&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-tint [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-body [&_:not(pre)>code]:text-fg-brand",
  "[&_pre:not([data-slot])]:my-8 [&_pre:not([data-slot])]:overflow-x-auto [&_pre:not([data-slot])]:rounded-card [&_pre:not([data-slot])]:border [&_pre:not([data-slot])]:border-line [&_pre:not([data-slot])]:bg-subtle [&_pre:not([data-slot])]:p-5 [&_pre:not([data-slot])]:font-mono [&_pre:not([data-slot])]:text-body-sm [&_pre:not([data-slot])]:leading-code [&_pre:not([data-slot])]:text-fg",
  "[&_:is(p>img:only-child,figure>img)]:mx-auto [&_:is(p>img:only-child,figure>img)]:my-8 [&_:is(p>img:only-child,figure>img)]:block [&_:is(p>img:only-child,figure>img)]:h-auto [&_:is(p>img:only-child,figure>img)]:w-[calc(100%-var(--ds-space-4))] [&_:is(p>img:only-child,figure>img)]:rounded-card [&_:is(p>img:only-child,figure>img)]:border [&_:is(p>img:only-child,figure>img)]:border-hairline [&_:is(p>img:only-child,figure>img)]:bg-surface [&_:is(p>img:only-child,figure>img)]:p-4 [&_:is(p>img:only-child,figure>img)]:shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]",
  "[&_p:has(>img:only-child)]:my-0 [&_figure]:my-8 [&_figure>img]:mb-5 [&_figcaption]:text-body-sm [&_figcaption]:leading-relaxed [&_figcaption]:text-fg-muted",
  "[&_table]:mx-auto [&_table]:my-8 [&_table]:w-[calc(100%-var(--ds-space-4))] [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-card [&_table]:border [&_table]:border-hairline [&_table]:bg-surface [&_table]:text-left [&_table]:shadow-[0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]",
  "[&_:is(th,td)]:border-b [&_:is(th,td)]:border-line [&_:is(th,td)]:px-5 [&_:is(th,td)]:py-3.5 [&_:is(th,td)]:align-top [&_tbody_tr:last-child_td]:border-b-0",
  "[&_th]:text-body-sm [&_th]:leading-relaxed [&_td]:text-body [&_td]:leading-relaxed [&_td:first-child]:text-fg",
  "[&_hr]:my-12 [&_hr]:border-line",
);

/** The article body: wraps HTML from Markdown (pass `html`) or JSX children in the site's article styles. */
function BlogProse({ html, className, children, ...props }: React.ComponentProps<"article"> & { html?: string }) {
  if (html !== undefined) return <article data-slot="blog-prose" className={cn(PROSE, className)} dangerouslySetInnerHTML={{ __html: html }} {...props} />;
  return (
    <article data-slot="blog-prose" className={cn(PROSE, className)} {...props}>
      {children}
    </article>
  );
}

export type RelatedPost = { title: React.ReactNode; summary?: React.ReactNode; href: string; date?: { iso: string; label: React.ReactNode }; cover?: React.ReactNode };

/** A related post: a blue card, its texture (`cover`) behind a dark wash, the title, summary and date in white at its foot. */
function RelatedPostCard({ post, className }: { post: RelatedPost; className?: string }) {
  return (
    <a
      data-slot="related-post-card"
      href={post.href}
      className={cn(
        "group block h-full overflow-hidden rounded-shell shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
        "transition-transform duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)]:hover:-translate-y-1",
        className,
      )}
    >
      <article className="relative flex h-full min-h-46 flex-col justify-end overflow-hidden bg-linear-to-br from-brand to-navy-60 p-6 md:p-7">
        {post.cover && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay grayscale">
            {post.cover}
          </div>
        )}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/30 via-black/5 to-transparent" />
        <div className="relative">
          <h3 className="line-clamp-2 text-body-lg leading-snug font-medium tracking-tight text-white md:text-h5">{post.title}</h3>
          {post.summary && <p className="mt-2 line-clamp-2 text-body-sm leading-snug text-white/80">{post.summary}</p>}
          {post.date && (
            <time dateTime={post.date.iso} className="mt-3 block text-caption text-white/65">
              {post.date.label}
            </time>
          )}
        </div>
      </article>
    </a>
  );
}

/** Up to four related posts, two across, under a heading, after the article. */
function RelatedPosts({ posts, title = "Related articles", className }: { posts: RelatedPost[]; title?: React.ReactNode; className?: string }) {
  const titleId = React.useId();
  if (posts.length === 0) return null;
  return (
    <section data-slot="related-posts" aria-labelledby={titleId} className={cn("mx-auto max-w-4xl px-4 pb-16", className)}>
      <h2 id={titleId} className="mb-6 text-h4 leading-heading font-normal tracking-tight text-fg md:text-h3">
        {title}
      </h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.href} className="h-full">
            <RelatedPostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { BlogPost, BlogAuthor, BlogProse, RelatedPosts, RelatedPostCard };

"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

// The home page's "Success stories": quote cards on a hairline, every card the same anatomy (quote on top, who said it
// along the bottom) and every row as tall as its tallest card, so the set reads as one. Hovering or focusing a card only
// brings its color in (the highlighted phrases turn brand blue, the photo leaves grayscale); nothing moves or resizes.

type Testimonial = {
  id?: string | number;
  quote: string;
  /** Phrases inside the quote to emphasize; they turn brand blue on the active card. */
  highlights?: string[];
  name: string;
  /** The line under the name, e.g. "Engineering Manager @ Mintlify". */
  role: string;
  /** Photo URL, shown in grayscale until the card is active. */
  avatar?: string;
  /** The case study; the whole card becomes the link. */
  href?: string;
  linkLabel?: string;
};

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedQuote({ text, highlights }: { text: string; highlights?: string[] }) {
  if (!highlights?.length) return <>{text}</>;
  const set = new Set(highlights);
  const parts = text.split(new RegExp(`(${highlights.map(escapeRegExp).join("|")})`, "g"));
  return <>{parts.map((part, i) => (set.has(part) ? <strong key={i}>{part}</strong> : part))}</>;
}

function TestimonialCard({ testimonial, active = false, className, ...props }: React.ComponentProps<"figure"> & { testimonial: Testimonial; active?: boolean }) {
  const { quote, highlights, name, role, avatar, href, linkLabel = "Read the case study" } = testimonial;
  return (
    <figure
      data-slot="testimonial-card"
      data-active={active || undefined}
      className={cn("group relative flex flex-col rounded-card p-6 shadow-card transition-[background-color] duration-300 ease-out hover:bg-subtle/60 motion-reduce:transition-none", className)}
      {...props}
    >
      {href && (
        <a href={href} aria-label={`${linkLabel}: ${name}`} title={linkLabel} className="absolute inset-0 z-10 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">
          <span className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-pill text-fg-faint transition-[background-color,color] duration-200 ease-out group-hover:bg-tint group-hover:text-fg-brand motion-reduce:transition-none">
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none" />
          </span>
        </a>
      )}
      <blockquote
        className={cn(
          "pr-8 text-body leading-relaxed text-fg-nav [&_strong]:font-medium [&_strong]:transition-[color] [&_strong]:duration-300 [&_strong]:ease-out motion-reduce:[&_strong]:transition-none",
          active ? "[&_strong]:text-fg-brand" : "[&_strong]:text-fg",
        )}
      >
        &ldquo;
        <HighlightedQuote text={quote} highlights={highlights} />
        &rdquo;
      </blockquote>
      <figcaption className="mt-auto flex min-w-0 items-center gap-3 pt-6">
        {avatar && (
          <span className="size-10 shrink-0 overflow-hidden rounded-card bg-subtle">
            <img src={avatar} alt={name} width={40} height={40} className={cn("size-full object-cover transition-[filter] duration-300 ease-out motion-reduce:transition-none", !active && "grayscale")} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-body-sm font-medium text-fg">{name}</span>
          <span className="block truncate text-body-sm text-fg-subtle" title={role}>
            {role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** The grid: one column, two from md, three from lg. The first card is active until another is hovered or focused. */
function Testimonials({ items, className, ...props }: React.ComponentProps<"div"> & { items: Testimonial[] }) {
  const key = (t: Testimonial, i: number) => String(t.id ?? i);
  const first = items[0] ? key(items[0], 0) : "";
  const [active, setActive] = React.useState(first);

  return (
    <div
      data-slot="testimonials"
      className={cn("grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
      onMouseLeave={() => setActive(first)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(first);
      }}
      {...props}
    >
      {items.map((t, i) => (
        <TestimonialCard key={key(t, i)} testimonial={t} active={active === key(t, i)} onMouseEnter={() => setActive(key(t, i))} onFocus={() => setActive(key(t, i))} />
      ))}
    </div>
  );
}

export { Testimonials, TestimonialCard, type Testimonial };

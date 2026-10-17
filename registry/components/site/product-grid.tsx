"use client";

import * as React from "react";
import { ArrowUpRight, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The home page's product cards: a white card in the soft blue ring, the product's name at h3 beside an outline
// "Explore" pill, one line of description, outlined chips for what people build with it, and a demo window (the
// product's dot story) filling the rest of the card. Two columns from tablet up; a row of smaller pills for the rest
// of the API underneath, which runs as a marquee on phones.

export type ProductGridItem = { name: string; description: string; tags?: string[]; href: string; linkLabel?: string; media?: React.ReactNode };

/** The demo window at the bottom of a card: a white panel in the ring, its radius repeated so the corners match. */
function ProductMedia({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="product-media" className={cn("relative mt-auto flex flex-1 flex-col rounded-card bg-ring-tint p-2", className)}>
      <div className="relative flex min-h-88 flex-1 flex-col items-center justify-center overflow-hidden rounded-card bg-surface px-4 py-8 select-none sm:px-9">{children}</div>
    </div>
  );
}

function ProductCard({ name, description, tags = [], href, linkLabel = "Explore", media, className }: ProductGridItem & { className?: string }) {
  return (
    <div data-slot="product-card" className={cn("flex rounded-card bg-ring-tint p-2", className)}>
      <article className="relative flex flex-1 flex-col gap-10 overflow-hidden rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
        <div className="flex flex-col gap-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h3 className="text-h3 leading-heading font-normal tracking-normal text-fg">{name}</h3>
            <Button asChild variant="pill-outline" className="group/explore">
              <a href={href}>
                {linkLabel}
                <span className="sr-only"> {name}</span>
                <ArrowUpRight aria-hidden="true" className="transition-transform duration-200 ease-out group-hover/explore:translate-x-0.5 group-hover/explore:-translate-y-0.5 motion-reduce:transition-none" />
              </a>
            </Button>
          </div>
          <p className="text-body-lg leading-snug text-fg-secondary">{description}</p>
          {tags.length > 0 && (
            <ul aria-label={`What you can build with ${name}`} className="flex flex-wrap gap-1.5 leading-snug">
              {tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="chip">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ProductMedia>{media}</ProductMedia>
      </article>
    </div>
  );
}

const MARQUEE_MS = 24000;

function MoreApiList({ items, duplicate = false, className }: { items: { label: string; href: string }[]; duplicate?: boolean; className?: string }) {
  return (
    <ul aria-hidden={duplicate || undefined} className={cn("flex shrink-0 gap-2 pr-2 md:pr-0", className)}>
      {items.map((api) => (
        <li key={api.href}>
          <a
            href={api.href}
            tabIndex={duplicate ? -1 : undefined}
            className="inline-flex w-fit items-center justify-center rounded-pill border border-black/15 px-3 py-1.5 text-body-sm leading-snug whitespace-nowrap text-fg-nav outline-none transition-colors duration-200 ease-out hover:bg-black/3 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
          >
            {api.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The rest of the API as small outline pills beside a label. From tablet up it is one row that scrolls sideways
 * without a scrollbar; on phones it runs as a marquee fading in from just past the label, pausing while it is hovered,
 * pressed or focused. Reduced motion keeps the swipeable row instead.
 */
function MoreApis({ items, label = "Also in the API", icon, className }: { items: { label: string; href: string }[]; label?: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  const track = React.useRef<HTMLDivElement>(null);
  const [marquee, setMarquee] = React.useState(false);

  React.useEffect(() => {
    const phone = window.matchMedia("(max-width: 47.99rem)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMarquee(phone.matches && !reduce.matches);
    update();
    phone.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      phone.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  // A constant slide by half the track (one copy of the list), so the loop closes on the duplicate without a jump.
  React.useEffect(() => {
    const node = track.current;
    if (!marquee || !node) return;
    const animation = node.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: MARQUEE_MS, iterations: Infinity, easing: "linear" });
    const pause = () => animation.pause();
    const play = () => {
      if (!node.matches(":hover, :focus-within")) animation.play();
    };
    const events: [string, () => void][] = [["pointerenter", pause], ["pointerdown", pause], ["focusin", pause], ["pointerleave", play], ["pointerup", play], ["focusout", play]];
    events.forEach(([name, handler]) => node.addEventListener(name, handler));
    return () => {
      animation.cancel();
      events.forEach(([name, handler]) => node.removeEventListener(name, handler));
    };
  }, [marquee]);

  return (
    <div data-slot="more-apis" className={cn("flex items-center gap-4 md:overflow-x-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden", className)}>
      <div className="inline-flex shrink-0 items-center gap-2 text-body-sm leading-snug whitespace-nowrap text-fg-secondary">
        {icon ?? <Globe aria-hidden="true" className="size-4" />}
        {label}
      </div>
      <div
        className={cn(
          "relative min-w-0 flex-1 md:overflow-visible md:[mask-image:none]",
          marquee ? "overflow-hidden [mask-image:linear-gradient(to_right,transparent,var(--ds-color-black)_var(--ds-space-10))]" : "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        <div ref={track} className="flex w-max">
          <MoreApiList items={items} />
          {/* The second copy only closes the loop, so it is hidden from assistive tech and the tab order. */}
          {marquee && <MoreApiList items={items} duplicate />}
        </div>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  more,
  moreLabel = "Also in the API",
  className,
}: {
  products: ProductGridItem[];
  /** The rest of the API, as small pills under the grid. */
  more?: { label: string; href: string }[];
  moreLabel?: string;
  className?: string;
}) {
  return (
    <div data-slot="product-grid" className={cn("flex flex-col gap-8", className)}>
      {/* The ring sits outside each card's footprint: the grid's gap is measured between the cards, not their rings. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.name} className="-m-2" {...product} />
        ))}
      </div>
      {more && more.length > 0 && <MoreApis items={more} label={moreLabel} />}
    </div>
  );
}

export { ProductGrid, ProductCard, ProductMedia, MoreApis };

import * as React from "react";
import { ArrowUpRight, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The home page's product cards: a white card in the soft blue ring, the product's name at h3 beside an outline
// "Explore" pill, one line of description, outlined chips for what people build with it, and a demo window (the
// product's dot story) filling the rest of the card. Two columns from tablet up; a row of smaller pills for the rest
// of the API underneath.

export type ProductGridItem = { name: string; description: string; tags?: string[]; href: string; linkLabel?: string; media?: React.ReactNode };

/** The demo window at the bottom of a card: a white panel in the ring, its radius repeated so the corners match. */
function ProductMedia({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="product-media" className={cn("relative mt-auto flex flex-1 flex-col rounded-card bg-ring-tint p-2", className)}>
      <div className="relative flex min-h-88 flex-1 flex-col items-center justify-center overflow-hidden rounded-card bg-surface select-none">{children}</div>
    </div>
  );
}

function ProductCard({ name, description, tags = [], href, linkLabel = "Explore", media, className }: ProductGridItem & { className?: string }) {
  return (
    <div data-slot="product-card" className={cn("flex rounded-card bg-ring-tint p-2", className)}>
      <article className="relative flex flex-1 flex-col gap-10 overflow-hidden rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
        <div className="flex flex-col gap-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h3 className="text-h3 leading-heading font-normal text-fg">{name}</h3>
            <Button asChild variant="pill-outline" className="group/explore">
              <a href={href}>
                {linkLabel}
                <span className="sr-only"> {name}</span>
                <ArrowUpRight aria-hidden="true" className="transition-transform duration-200 ease-out group-hover/explore:translate-x-0.5 group-hover/explore:-translate-y-0.5 motion-reduce:transition-none" />
              </a>
            </Button>
          </div>
          <p className="text-body-lg text-fg-secondary">{description}</p>
          {tags.length > 0 && (
            <ul aria-label={`What you can build with ${name}`} className="flex flex-wrap gap-1.5">
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
      {more && more.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="inline-flex shrink-0 items-center gap-2 text-body-sm text-fg-secondary">
            <Globe aria-hidden="true" className="size-4" />
            {moreLabel}
          </span>
          <ul className="flex flex-wrap gap-2">
            {more.map((api) => (
              <li key={api.href}>
                <a
                  href={api.href}
                  className="inline-flex items-center rounded-pill px-3 py-1.5 text-body-sm whitespace-nowrap text-fg-nav ring-1 ring-hairline ring-inset outline-none transition-[background-color,color] duration-200 ease-out hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  {api.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { ProductGrid, ProductCard, ProductMedia };

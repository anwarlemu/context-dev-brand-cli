import * as React from "react";

import { cn } from "@/lib/utils";

// The brand's type as components. Rethink Sans throughout, headings at regular weight with the brand's tight tracking
// (the site's h1 to h3), never bold. The scale names follow the surface: on the site H1 is the 56px section title and
// text-body 16px; inside a product area the same names are the dashboard's compact scale (h3 28px, body 15px). Lead is
// the larger muted line under a title; Muted is body-sm in the muted gray; Small is the 12px caption; inline code is the
// mono face on the subtle gray with mark corners.
function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="typography-h1" className={cn("text-h1 leading-heading font-normal tracking-tight text-balance text-fg", className)} {...props} />;
}

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="typography-h2" className={cn("text-h2 leading-heading font-normal tracking-tight text-balance text-fg", className)} {...props} />;
}

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="typography-h3" className={cn("text-h3 leading-heading font-normal tracking-tight text-balance text-fg", className)} {...props} />;
}

function TypographyH4({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 data-slot="typography-h4" className={cn("text-h4 leading-snug font-normal tracking-normal text-fg", className)} {...props} />;
}

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-p" className={cn("text-body leading-relaxed text-pretty text-fg [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-lead" className={cn("text-body-lg leading-relaxed text-pretty text-fg-muted", className)} {...props} />;
}

function TypographyLarge({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="typography-large" className={cn("text-h5 leading-snug font-normal text-fg", className)} {...props} />;
}

function TypographySmall({ className, ...props }: React.ComponentProps<"small">) {
  return <small data-slot="typography-small" className={cn("text-caption leading-snug text-fg", className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-muted" className={cn("text-body-sm leading-relaxed text-fg-muted", className)} {...props} />;
}

/** A quote: indented behind a 2px brand-blue rule, in the muted gray. */
function TypographyBlockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return <blockquote data-slot="typography-blockquote" className={cn("mt-4 border-l-2 border-brand pl-4 text-body leading-relaxed text-fg-muted", className)} {...props} />;
}

function TypographyList({ className, ordered = false, ...props }: Omit<React.ComponentProps<"ul">, "ref"> & { ordered?: boolean }) {
  const classes = cn("my-4 ml-5 grid gap-1.5 text-body leading-relaxed text-fg marker:text-fg-subtle", ordered ? "list-decimal" : "list-disc", className);
  return ordered ? <ol data-slot="typography-list" className={classes} {...props} /> : <ul data-slot="typography-list" className={classes} {...props} />;
}

/** An endpoint, key or flag inside text: the mono face on the subtle gray. */
function TypographyInlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return <code data-slot="typography-inline-code" className={cn("rounded-mark bg-subtle px-1 py-px font-mono text-body-sm text-fg [box-decoration-break:clone]", className)} {...props} />;
}

/** A plain table in running text, as the product's table: a faint header band, light rules, tabular figures. */
function TypographyTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="typography-table" className="my-4 w-full overflow-x-auto rounded-card bg-surface shadow-card">
      <table
        className={cn(
          "w-full border-collapse text-left text-body-sm text-fg tabular-nums [&_td]:border-t [&_td]:border-line-subtle [&_td]:px-4 [&_td]:py-3 [&_th]:bg-neutral-10/40 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-normal [&_th]:text-fg-muted",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable };

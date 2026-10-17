import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowUpRight } from "lucide-react";

import { StillGlyph } from "@/components/visuals/glyph/glyph-tile";
import type { GlyphPairName } from "@/components/visuals/glyph/glyph-art";
import { cn } from "@/lib/utils";

// The redesigned dashboard's cards. GlyphCard heads a card with its page's dot glyph in a small bordered tile, the
// title in body text and anything at the right (a link out, a switch, a status). CenteredCard holds one centered
// visual (a big number) over its label, with a small pill in the corner. CardLink is the quiet way out of a card.

/** The up-right arrow every "go somewhere" link carries; it takes its group's hover color and never moves. */
function LinkArrow({ className }: { className?: string }) {
  return (
    <ArrowUpRight
      aria-hidden
      className={cn("size-3.5 shrink-0 transition-colors duration-150 ease-out motion-reduce:transition-none", className)}
      strokeWidth={1.5}
    />
  );
}

/** Gray caption text with the arrow, darkening and underlining on hover. Pass your router's link with asChild. */
function CardLink({ asChild = false, className, children, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const classes = cn(
    "group flex h-6 shrink-0 items-center gap-1 text-caption whitespace-nowrap text-fg-muted decoration-fg/25 underline-offset-4 outline-none transition-colors duration-150 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring",
    className,
  );
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return (
      <Slot data-slot="card-link" className={classes} {...(props as React.ComponentProps<typeof Slot>)}>
        {React.cloneElement(
          children,
          undefined,
          <>
            {children.props.children}
            <LinkArrow />
          </>,
        )}
      </Slot>
    );
  }
  return (
    <a data-slot="card-link" className={classes} {...props}>
      {children}
      <LinkArrow />
    </a>
  );
}

function GlyphCard({ glyph, title, aside, className, children }: { glyph: GlyphPairName; title: React.ReactNode; aside?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="glyph-card" className={cn("flex min-w-0 flex-col rounded-card bg-surface p-3 shadow-card", className)}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-line">
          <StillGlyph name={glyph} dense className="size-4 text-brand" />
        </span>
        <h3 className="flex-1 text-body-sm font-normal tracking-normal">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A small outlined pill for a card's corner or header: a state, with its colored dot. */
function StatusPill({ dotClassName, className, children }: { dotClassName?: string; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("flex h-5 shrink-0 items-center gap-1.5 rounded-sm border border-line px-2 text-caption text-fg-muted", className)}>
      {dotClassName && <span className={cn("size-1.5 rounded-pill", dotClassName)} aria-hidden />}
      {children}
    </span>
  );
}

/**
 * One visual centered over its label, a pill in the top right. Given onClick (or a link through asChild) the whole card
 * is the action: the label turns brand blue and the card gains the translucent ring on hover.
 */
function CenteredCard({ label, badge, visual, onClick, asChild = false, className, children }: { label: React.ReactNode; badge?: React.ReactNode; visual: React.ReactNode; onClick?: () => void; asChild?: boolean; className?: string; children?: React.ReactNode }) {
  const interactive = asChild || Boolean(onClick);
  // On a phone-width card the corner pill reaches over the visual, so the visual starts below it there.
  const classes = cn(
    "@container group relative isolate flex flex-col items-center overflow-hidden rounded-card bg-surface px-3 pt-9 pb-3 no-underline shadow-card outline-none transition-shadow duration-150 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring @lg:pt-4",
    interactive && "hover:shadow-[var(--ds-shadow-card),var(--ds-shadow-ring-hover)]",
    className,
  );
  const body = (
    <>
      <span className="relative flex flex-1 items-center">{visual}</span>
      <span className={cn("relative mt-2 text-body-sm text-fg", interactive && "transition-colors duration-150 group-hover:text-fg-brand")}>{label}</span>
      {badge && <span className="absolute top-2.5 right-2.5 flex h-5 items-center rounded-sm border border-line bg-surface px-2 text-caption text-fg-muted">{badge}</span>}
    </>
  );
  if (asChild && React.isValidElement(children)) {
    return (
      <Slot data-slot="centered-card" className={classes}>
        {React.cloneElement(children, undefined, body)}
      </Slot>
    );
  }
  if (onClick)
    return (
      <button type="button" data-slot="centered-card" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  return (
    <div data-slot="centered-card" className={classes}>
      {body}
    </div>
  );
}

/** A centered card's big number: 26px medium in brand blue, a unit after it, nudged toward its label. */
function CenteredNumber({ value, suffix }: { value: React.ReactNode; suffix?: React.ReactNode }) {
  return (
    <span className="flex translate-y-1.5 items-baseline text-caption leading-none font-medium tracking-tight tabular-nums">
      <span className="text-[calc(var(--ds-text-h5)+var(--ds-space-2))] text-fg-brand">{value}</span>
      {suffix && <span className="text-body font-normal tracking-normal text-fg-subtle">{suffix}</span>}
    </span>
  );
}

export { CardLink, CenteredCard, CenteredNumber, GlyphCard, LinkArrow, StatusPill };

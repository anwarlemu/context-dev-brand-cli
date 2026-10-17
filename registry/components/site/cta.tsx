import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { SectionEdgeLines } from "@/components/site/section";
import { cn } from "@/lib/utils";

// The soft blue ring around a white card. It wraps the card rather than being a shadow on it, so its outer edge keeps
// the card's radius; the negative margin keeps it from adding layout size.
const GLASS_RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "rounded-card bg-surface ring-1 ring-hairline";

/**
 * The home page's closing call to action: a white card in the soft blue ring, the heading and a line of muted text on
 * the left, and a smaller ringed card on the right with the offer (a figure, its label, a note) and the actions.
 * `background` sits behind the card's content (the site draws its dot field there).
 */
function ClosingCta({
  title,
  description,
  figure,
  figureLabel,
  note,
  primaryAction,
  secondaryAction,
  background,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The offer's large figure (the site sets it in dots, as wide as the card up to 20rem). */
  figure?: React.ReactNode;
  figureLabel?: React.ReactNode;
  note?: React.ReactNode;
  /** A full-width `pill-outline` button. */
  primaryAction?: React.ReactNode;
  /** A quiet text link under it (a CtaTextLink). */
  secondaryAction?: React.ReactNode;
  background?: React.ReactNode;
}) {
  const titleId = React.useId();
  const hasOffer = figure || figureLabel || note || primaryAction || secondaryAction;
  return (
    <section id="cta" data-slot="closing-cta" aria-labelledby={titleId} className={cn("relative w-full bg-surface py-16 md:py-20", className)} {...props}>
      <SectionEdgeLines />
      <div className="relative mx-auto w-full max-w-(--ds-frame-column) px-6 sm:px-8 md:px-10 lg:px-12">
        <div className={GLASS_RING}>
          <div className={cn("relative isolate grid items-center gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1fr_calc(var(--spacing)*84)] lg:gap-12 lg:p-12", CARD)}>
            {background && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 text-fg-brand">
                {background}
              </div>
            )}
            <div className="relative flex flex-col items-start gap-5">
              <h2 id={titleId} className="max-w-136 text-h3 leading-tight font-normal tracking-tight text-balance text-fg sm:text-h2">
                {title}
              </h2>
              {description && <p className="max-w-md text-body leading-relaxed text-fg-muted sm:text-body-lg">{description}</p>}
            </div>
            {hasOffer && (
              <div className={GLASS_RING}>
                <div className={cn("relative flex flex-col p-6 sm:p-7", CARD)}>
                  {(figure || figureLabel) && (
                    <p className="flex flex-col items-center text-center text-fg">
                      {figure && <span className="flex w-full max-w-80 justify-center">{figure}</span>}
                      {figureLabel && <span className="mt-2 text-h5">{figureLabel}</span>}
                    </p>
                  )}
                  {note && <p className="mt-3 text-center text-body-sm leading-relaxed text-fg-muted">{note}</p>}
                  {primaryAction && <div className="mt-6 flex flex-col [&>*]:w-full">{primaryAction}</div>}
                  {secondaryAction && <div className="mt-2 flex flex-col">{secondaryAction}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** The closing card's quiet link: muted, darkening and underlining on hover, with an arrow and a 44px target. */
function CtaTextLink({ asChild = false, className, children, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="cta-text-link"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-card text-body-sm font-medium text-fg/70 underline-offset-4 transition-colors duration-150 ease-out outline-none hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// The band's frame: dashed half-pixel hairlines in translucent white, 4px dashes with 4px gaps.
const DASH_X = "bg-[repeating-linear-gradient(to_right,var(--ds-color-ring-on-brand)_0_var(--ds-space-1),transparent_var(--ds-space-1)_var(--ds-space-2))]";
const DASH_Y = "bg-[repeating-linear-gradient(to_bottom,var(--ds-color-ring-on-brand)_0_var(--ds-space-1),transparent_var(--ds-space-1)_var(--ds-space-2))]";
const NODE =
  "absolute bottom-16 size-1.5 translate-y-1/2 rounded-pill bg-white shadow-[0_0_0_var(--ds-space-0-5)_color-mix(in_srgb,var(--ds-color-white)_20%,transparent)]";

/**
 * The call to action band: the dimmed brand-blue water band (pass the water texture as `background`; without one it
 * is the plain dimmed blue), a dashed frame down the column's edges with a white node where a dashed rule crosses them
 * near the foot, a centered heading with its closing words in light blue, a line of text and two actions (a CtaButton
 * `light` and a CtaButton `glass`).
 */
function Cta({
  title,
  accent,
  description,
  primaryAction,
  secondaryAction,
  background,
  className,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  /** The heading's closing words, in light blue. */
  accent?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  /** The water texture; it is dimmed so white copy stays legible. */
  background?: React.ReactNode;
}) {
  return (
    <section id="cta" data-slot="cta" className={cn("relative isolate flex w-full items-center justify-center overflow-hidden bg-dark text-white", className)} {...props}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-blue-80 brightness-80">
        {background}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <div className={cn("absolute inset-x-0 bottom-16 h-px scale-y-50", DASH_X)} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden justify-center md:flex">
        <div className="relative h-full w-full max-w-(--ds-frame-column)">
          <div className={cn("absolute inset-y-0 left-0 w-px scale-x-50", DASH_Y)} />
          <div className={cn("absolute inset-y-0 right-0 w-px scale-x-50", DASH_Y)} />
          <span className={cn(NODE, "left-0 -translate-x-1/2")} />
          <span className={cn(NODE, "right-0 translate-x-1/2")} />
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-(--ds-frame-column) px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex w-full flex-col items-center gap-4">
            <h2 className="text-h3 leading-tight font-normal tracking-tight text-balance text-white md:text-h2">
              {title}
              {accent && (
                <>
                  {" "}
                  <span className="text-blue-40">{accent}</span>
                </>
              )}
            </h2>
          </div>
          {description && <p className="max-w-130 text-body-lg leading-relaxed text-white/90">{description}</p>}
          {(primaryAction || secondaryAction) && (
            <div className="relative flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The band's two buttons, one shape (the brand's button radius, 48px tall): `light` is the white key with a soft white
 * glow (it dims a step on hover); `glass` is the frosted key beside it.
 */
function CtaButton({ tone = "light", asChild = false, className, ...props }: React.ComponentProps<"a"> & { tone?: "light" | "glass"; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="cta-button"
      className={cn(
        "relative isolate inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap text-body font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
        tone === "light" &&
          "h-12 rounded-control border border-black/10 bg-white px-6.5 leading-snug text-fg shadow-[0_0_0_1px_color-mix(in_srgb,var(--ds-color-white)_35%,transparent),0_var(--ds-space-3)_var(--ds-space-10)_color-mix(in_srgb,var(--ds-color-white)_12%,transparent)] transition-[filter,scale] duration-150 ease-out hover:brightness-97",
        tone === "glass" &&
          "h-12 rounded-control bg-white/16 px-6 leading-snug text-white shadow-key outline-1 -outline-offset-1 outline-white/12 backdrop-blur-xs transition-[background-color,scale] duration-200 ease-out hover:bg-white/24",
        className,
      )}
      {...props}
    />
  );
}

export { ClosingCta, Cta, CtaButton, CtaTextLink };

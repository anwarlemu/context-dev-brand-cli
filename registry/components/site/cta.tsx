import * as React from "react";

import { SectionEdgeLines } from "@/components/site/section";
import { cn } from "@/lib/utils";

const RING = "shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]";

/**
 * The home page's closing call to action: a large white card in the soft blue ring, the heading and a line of muted
 * text on the left, and a smaller ringed card on the right with the offer (a figure, its label, a note) and the
 * actions. `background` sits behind the card's content (the site draws its dot field there).
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
  /** The offer's large figure (the site sets it in dots). */
  figure?: React.ReactNode;
  figureLabel?: React.ReactNode;
  note?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  background?: React.ReactNode;
}) {
  const titleId = React.useId();
  const hasOffer = figure || figureLabel || note || primaryAction || secondaryAction;
  return (
    <section data-slot="closing-cta" aria-labelledby={titleId} className={cn("relative w-full bg-surface py-16 md:py-20", className)} {...props}>
      <SectionEdgeLines />
      <div className="relative mx-auto w-full max-w-(--ds-frame-column) px-6 md:px-10 lg:px-12">
        <div className={cn("relative isolate grid items-center gap-8 overflow-hidden rounded-shell bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_21rem] lg:gap-12 lg:p-12", RING)}>
          {background && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
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
            <div className={cn("relative flex flex-col rounded-shell bg-surface p-6 sm:p-7", RING)}>
              {(figure || figureLabel) && (
                <p className="flex flex-col items-center text-center text-fg">
                  {figure}
                  {figureLabel && <span className="mt-2 text-h5">{figureLabel}</span>}
                </p>
              )}
              {note && <p className="mt-3 text-center text-body-sm leading-relaxed text-fg-muted">{note}</p>}
              {primaryAction && <div className="mt-6 flex flex-col [&>*]:w-full">{primaryAction}</div>}
              {secondaryAction && <div className="mt-2 flex justify-center">{secondaryAction}</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The dark call to action band: black, a dashed frame down the column's edges with a white node where a dashed rule
 * crosses them near the foot, a centered heading with its closing words in light blue, a line of text and two actions.
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
  background?: React.ReactNode;
}) {
  const NODE = "absolute bottom-16 size-1.5 translate-y-1/2 rounded-pill bg-white shadow-[0_0_0_var(--ds-space-0-5)_var(--ds-color-ring-on-brand)]";
  return (
    <section data-slot="cta" className={cn("relative isolate flex w-full items-center justify-center overflow-hidden bg-dark text-white", className)} {...props}>
      {background && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {background}
        </div>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute inset-x-0 bottom-16 border-t border-dashed border-white/30" />
        <div className="relative mx-auto h-full w-full max-w-(--ds-frame-column) border-x border-dashed border-white/30">
          <span className={cn(NODE, "left-0 -translate-x-1/2")} />
          <span className={cn(NODE, "right-0 translate-x-1/2")} />
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-(--ds-frame-column) px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-h3 leading-tight font-normal tracking-tight text-balance text-white md:text-h2">
            {title}
            {accent && (
              <>
                {" "}
                <span className="text-blue-60">{accent}</span>
              </>
            )}
          </h2>
          {description && <p className="max-w-130 text-body-lg leading-relaxed text-white/80">{description}</p>}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { ClosingCta, Cta };

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

// The blue water product pages (the ChatGPT plugin page and the API catalog): a full-bleed blue hero whose water fades
// up into white behind a centered title, a quiet row of customer logos, then plain sections in a narrow column and a
// blue closing band. The water itself (HeroWater, from the visuals) and the band's texture are slots; without them the
// hero shows the same white to blue fade in brand tokens.

/** The narrow column these pages set their sections in. */
function ProductContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="product-container" className={cn("mx-auto w-full max-w-247.5 px-6 sm:px-8 lg:px-10.5", className)} {...props} />;
}

/** The two-line heading: the first line black, a line break, the second brand blue. `split` is the smaller size. */
function ProductHeading({ title, size = "section", className, ...props }: Omit<React.ComponentProps<"h2">, "title"> & { title: readonly [React.ReactNode, React.ReactNode]; size?: "section" | "split" }) {
  return (
    <h2 data-slot="product-heading" className={cn("font-normal tracking-tight text-balance text-fg", size === "split" ? "text-h3 leading-tight sm:text-h2" : "text-h2 leading-tight", className)} {...props}>
      {title[0]} <br />
      <span className="text-fg-brand">{title[1]}</span>
    </h2>
  );
}

const ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-body font-medium shadow-key outline-none transition-[background-color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0";

const ACTION_TONES = {
  /** Black, for the hero. */
  dark: "border border-black bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-focus-ring",
  /** Frosted white, for the hero's second action. */
  frost: "bg-white/70 text-fg ring-1 ring-white/90 ring-inset hover:bg-white focus-visible:ring-focus-ring",
  /** White, for the blue band. */
  light: "border border-hairline bg-white text-fg hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-brand",
  /** Clear, for the blue band's second action. */
  clear: "border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white focus-visible:ring-offset-brand",
} as const;

/** The pages' keyed pills: `dark` and `frost` on the hero, `light` and `clear` on the blue band. */
function ProductAction({ tone = "dark", className, ...props }: React.ComponentProps<"a"> & { tone?: keyof typeof ACTION_TONES }) {
  return <a data-slot="product-action" className={cn(ACTION, ACTION_TONES[tone], className)} {...props} />;
}

// The water's own fade, in brand tokens: white at the top, through the pale blues, to the hero's blue at the foot.
const FADE = "bg-[linear-gradient(180deg,var(--ds-color-white)_0%,var(--ds-color-blue-10)_22%,var(--ds-color-blue-20)_55%,var(--ds-color-blue-50)_72%,var(--ds-color-blue-80)_100%)]";

/**
 * The blue water hero: centered, an eyebrow line, the two-line title (the second line blue), a muted line and the
 * actions, with the page's picture under them when there is one (the hero then grows to a screen tall).
 */
function ProductHero({
  title,
  description,
  eyebrow,
  actions,
  background,
  contentHeight = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  /** Above the title, a quiet line ("Backed by Y Combinator"). */
  eyebrow?: React.ReactNode;
  /** ProductAction pills. */
  actions?: React.ReactNode;
  /** The water (HeroWater) and its texture; replaces the token fade. */
  background?: React.ReactNode;
  /** With a picture, size to the content instead of a full screen. */
  contentHeight?: boolean;
}) {
  const titleId = React.useId();
  return (
    <section
      data-slot="product-hero"
      aria-labelledby={titleId}
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden bg-blue-90 px-6 py-14 sm:px-8",
        children ? (contentHeight ? "sm:py-18" : "sm:min-h-200 sm:py-14") : "sm:min-h-108",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", !background && FADE)}>
        {background}
      </div>
      <div className="relative flex w-full max-w-225 flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-4 text-center">
          {eyebrow && <div className="flex items-center gap-1.5 text-body-sm font-medium text-fg-nav [&_img]:size-4.5 [&_img]:shrink-0 [&_img]:rounded-sm">{eyebrow}</div>}
          <h1 id={titleId} className="text-h2 leading-tight font-normal tracking-tight text-balance text-fg sm:text-h1">
            {title[0]} <br />
            <span className="text-fg-brand">{title[1]}</span>
          </h1>
          {description && <p className="max-w-170 text-body leading-relaxed text-pretty text-fg-nav sm:text-body-lg">{description}</p>}
          {actions && <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** A centered line and a row of customer logos in gray, under the hero. */
function ProductCustomerProof({ label = "Teams build with us", logos, className }: { label?: React.ReactNode; logos: { name: string; src: string }[]; className?: string }) {
  return (
    <section data-slot="product-customer-proof" aria-label="Customers" className={cn("pt-9 pb-10.5", className)}>
      <ProductContainer className="flex flex-col items-center gap-5">
        <p className="text-center text-body-sm text-fg-subtle sm:text-body">{label}</p>
        <ul role="list" className="grid w-full grid-cols-2 items-center justify-center gap-x-4 gap-y-6 sm:flex sm:gap-8.5">
          {logos.map((logo) => (
            <li key={logo.name} className="flex h-10.5 min-w-0 items-center justify-center sm:w-45">
              <img src={logo.src} alt={logo.name} className="h-8.5 w-29.5 object-contain opacity-50 brightness-0 grayscale" />
            </li>
          ))}
        </ul>
      </ProductContainer>
    </section>
  );
}

/** Three steps in columns under a two-line heading, optionally numbered in blue mono. `children` follows the steps. */
function ProductSteps({
  steps,
  title = ["From your first request", "to a working feature."],
  numbered = false,
  className,
  children,
}: {
  steps: { title: React.ReactNode; description: React.ReactNode }[];
  title?: readonly [React.ReactNode, React.ReactNode];
  numbered?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const titleId = React.useId();
  return (
    <section data-slot="product-steps" aria-labelledby={titleId} className={cn("py-16 sm:py-18", className)}>
      <ProductContainer className="flex flex-col gap-10">
        <h2 id={titleId} className="flex flex-col gap-2 text-h3 leading-tight font-normal tracking-tight text-fg sm:text-h2">
          <span>{title[0]}</span> <span className="text-fg-brand">{title[1]}</span>
        </h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={index} className="flex flex-col gap-3">
              {numbered && (
                <span aria-hidden="true" className="font-mono text-body-sm text-fg-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <h3 className="text-h5 leading-relaxed font-normal text-fg">{step.title}</h3>
              <p className="text-body leading-relaxed text-fg-subtle">{step.description}</p>
            </li>
          ))}
        </ol>
        {children}
      </ProductContainer>
    </section>
  );
}

/** The narrow FAQ: the split heading and a line on the left, hairline questions on the right, the first open. */
function ProductCompactFaq({
  id,
  faqs,
  title = ["A few things", "to know."],
  description = "More details in the API documentation.",
  className,
}: {
  id: string;
  faqs: { question: React.ReactNode; answer: React.ReactNode }[];
  title?: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <section data-slot="product-compact-faq" aria-labelledby={titleId} className={cn("pt-8 pb-20", className)}>
      <ProductContainer className="grid gap-10 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <div className="flex flex-col items-start gap-4.5">
          <ProductHeading id={titleId} title={title} size="split" />
          {description && <p className="text-body leading-relaxed text-fg-subtle">{description}</p>}
        </div>
        <div className="min-w-0">
          {faqs.map((faq, index) => (
            <details key={index} name={`${id}-questions`} open={index === 0} className="group border-t border-line py-5 first:border-0 first:pt-0 first:pb-5.5">
              <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-5 rounded-sm text-body text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-4 sm:text-body-lg [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus aria-hidden="true" className="size-4 shrink-0 text-fg-faint group-open:hidden" />
                <Minus aria-hidden="true" className="size-4 shrink-0 text-fg-faint group-not-open:hidden" />
              </summary>
              <div className="mt-3 text-body leading-relaxed text-fg-subtle">{faq.answer}</div>
            </details>
          ))}
        </div>
      </ProductContainer>
    </section>
  );
}

/** The blue closing band: a centered white heading, a line of text and the light actions over the water texture. */
function ProductCallToAction({
  title = "Start with your next request.",
  description,
  actions,
  background,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** ProductAction pills, `light` and `clear`. */
  actions?: React.ReactNode;
  /** The water texture, dimmed so the white copy reads. */
  background?: React.ReactNode;
  className?: string;
}) {
  const titleId = React.useId();
  return (
    <section data-slot="product-call-to-action" aria-labelledby={titleId} className={cn("relative isolate flex w-full items-center overflow-hidden bg-navy-60 py-16 text-center text-white sm:min-h-75", className)}>
      {background && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {background}
        </div>
      )}
      <ProductContainer className="relative flex flex-col items-center gap-5.5">
        <h2 id={titleId} className="text-h3 leading-tight font-normal tracking-tight text-balance sm:text-h2">
          {title}
        </h2>
        {description && <p className="max-w-160 text-body leading-relaxed text-pretty text-white/85 sm:text-body-lg">{description}</p>}
        {actions && <div className="flex flex-wrap justify-center gap-3 pt-1.5">{actions}</div>}
      </ProductContainer>
    </section>
  );
}

export { ProductHero, ProductAction, ProductContainer, ProductHeading, ProductCustomerProof, ProductSteps, ProductCompactFaq, ProductCallToAction };

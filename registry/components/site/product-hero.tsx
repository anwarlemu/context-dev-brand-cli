import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { HeroDotField } from "@/components/visuals/hero-dot-field";
import { patternHole } from "@/components/visuals/hero-pattern-hole";
import { cn } from "@/lib/utils";

// The product pages' hero (context.dev's Parse, Brand search, People enrichment, News and ChatGPT pages): a white,
// full-width band with an inset rule along its foot, the brand's dot streams running in from its edges, and a centered
// two-line title (the second line blue), a lead line, the black and outline pills and an optional note, all marked as
// holes so no dot lands on them. The demo (children) sits under the band's headline in the same column, so it shares
// its edges with every section below. The rest of the page is the product-landing sections.
//
// The blue water design these pages used before is retired: ProductCustomerProof, ProductSteps, ProductCompactFaq,
// ProductCallToAction and ProductContainer remain for existing pages only.

/** The ruled column the hero shares with the sections under it. */
const COLUMN = "relative mx-auto w-full max-w-(--ds-frame-column) px-6 sm:px-8 md:px-10 lg:px-12";

/** @deprecated The water pages' narrow column. Product pages now use the site's ruled column (SiteSection). */
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-body leading-5.5 font-medium shadow-key outline-none transition-[background-color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0";

const ACTION_TONES = {
  /** Black. */
  dark: "border border-black bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-focus-ring",
  /** Frosted white, for the retired water hero's second action. */
  frost: "bg-white/70 text-fg ring-1 ring-white/90 ring-inset hover:bg-white focus-visible:ring-focus-ring",
  /** White, for the retired blue band. */
  light: "border border-hairline bg-white text-fg hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-brand",
  /** Clear, for the retired blue band's second action. */
  clear: "border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white focus-visible:ring-offset-brand",
} as const;

/**
 * The water pages' keyed pills. The white ProductHero uses the site's pills (Button `pill` and `pill-outline`); these
 * remain for pages still on the retired water design.
 */
function ProductAction({ tone = "dark", className, ...props }: React.ComponentProps<"a"> & { tone?: keyof typeof ACTION_TONES }) {
  return <a data-slot="product-action" className={cn(ACTION, ACTION_TONES[tone], className)} {...props} />;
}

/** The default actions: the black "Get API key" pill and the outline "View documentation" pill, no arrows. */
function ProductHeroActions({ signupHref, docsHref }: { signupHref: string; docsHref: string }) {
  return (
    <>
      <a href={signupHref} className={cn(buttonVariants({ variant: "pill" }))}>
        Get API key
      </a>
      <a href={docsHref} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "pill-outline" }))}>
        View documentation
      </a>
    </>
  );
}

/**
 * The white product hero. `title` is two lines, the second blue; `actions` replaces the default pills (which use
 * `signupHref` and `docsHref`); `note` is a quiet line under them; `children` is the demo under the headline band.
 * `background` replaces the dot streams (pass null for none). When the hero sits under a see-through fixed header, set
 * `--hero-header` on it to the header's height: the band then grows by that much and keeps the content below it.
 */
function ProductHero({
  title,
  description,
  actions,
  note,
  signupHref = "/signup",
  docsHref = "https://docs.context.dev",
  background,
  eyebrow: _eyebrow,
  contentHeight: _contentHeight,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: readonly [React.ReactNode, React.ReactNode];
  description?: React.ReactNode;
  /** Pills; defaults to "Get API key" and "View documentation". */
  actions?: React.ReactNode;
  /** A quiet line under the actions. */
  note?: React.ReactNode;
  signupHref?: string;
  docsHref?: string;
  /** Behind the headline band; the dot streams by default, null for none. */
  background?: React.ReactNode;
  /** @deprecated The water hero's eyebrow; the white hero has none, so it is ignored. */
  eyebrow?: React.ReactNode;
  /** @deprecated The water hero's height switch; the white hero sizes itself, so it is ignored. */
  contentHeight?: boolean;
}) {
  const titleId = React.useId();
  const field = background === undefined ? <HeroDotField fine lively streams className="text-brand/60" /> : background;
  return (
    <section data-slot="product-hero" aria-labelledby={titleId} className={cn("relative w-full bg-surface shadow-rule-bottom", className)} {...props}>
      {/* The streams are laid out in shares of their box, so the field covers only the headline band: spanning the demo
          too would stretch them past it. */}
      <div className="relative">
        {field && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {field}
          </div>
        )}
        <div
          className={cn(
            COLUMN,
            "z-10 flex min-h-[calc(var(--hero-header,0px)+var(--spacing)*104)] flex-col items-center justify-center gap-(--ds-layout-product-hero-gap) pt-[calc(var(--hero-header,0px)+var(--spacing)*14)] pb-14 text-center md:min-h-[calc(var(--hero-header,0px)+var(--ds-layout-product-hero))] md:pt-[var(--hero-header,0px)] md:pb-0",
          )}
        >
          <h1 id={titleId} className="text-hero leading-tight font-normal tracking-tight text-balance text-fg antialiased sm:text-h1 lg:text-hero-product lg:leading-hero-product">
            <span {...patternHole("text")} className="block">
              {title[0]}
            </span>{" "}
            <span {...patternHole("text")} className="block text-fg-brand">
              {title[1]}
            </span>
          </h1>
          {description && (
            <p className="max-w-(--ds-layout-product-hero-lead) text-lead leading-lead text-fg-nav md:text-lead-lg md:leading-lead-lg">
              <span {...patternHole("text")}>{description}</span>
            </p>
          )}
          <div {...patternHole("box")} className="flex flex-wrap items-center justify-center gap-3 pt-1.5">
            {actions ?? <ProductHeroActions signupHref={signupHref} docsHref={docsHref} />}
          </div>
          {note && (
            <p className="text-note leading-note text-pretty text-fg/50">
              <span {...patternHole("text")}>{note}</span>
            </p>
          )}
        </div>
      </div>
      {children && <div className={cn(COLUMN, "z-10 pb-16 md:pb-(--ds-layout-product-hero-foot)")}>{children}</div>}
    </section>
  );
}

/** @deprecated The water pages' customer logos; context.dev's product pages use the LogoStrip under the hero. */
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

/** @deprecated The water pages' steps; use ProductLandingSteps (product-landing), the numbered step cards. */
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
                <span aria-hidden="true" className="font-mono text-body-sm leading-5 text-fg-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <h3 className="text-h4 leading-normal font-normal tracking-normal text-fg">{step.title}</h3>
              <p className="text-body-lg leading-normal text-fg-subtle">{step.description}</p>
            </li>
          ))}
        </ol>
        {children}
      </ProductContainer>
    </section>
  );
}

/** @deprecated The water pages' narrow FAQ; use ProductFaq (product-landing). */
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

/** @deprecated The water pages' blue closing band; product pages close with the site's ClosingCta. */
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
        <h2 id={titleId} className="text-h3 leading-tight font-normal tracking-tight text-balance text-white sm:text-h2">
          {title}
        </h2>
        {description && <p className="max-w-160 text-body leading-7 text-pretty text-white/85 sm:text-body-lg">{description}</p>}
        {actions && <div className="flex flex-wrap justify-center gap-3 pt-1.5">{actions}</div>}
      </ProductContainer>
    </section>
  );
}

export { ProductHero, ProductAction, ProductContainer, ProductHeading, ProductCustomerProof, ProductSteps, ProductCompactFaq, ProductCallToAction };

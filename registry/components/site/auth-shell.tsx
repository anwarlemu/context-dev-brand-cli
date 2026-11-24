"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RingBackdrop } from "@/components/visuals/ring-backdrop";
import { cn } from "@/lib/utils";

// The site's sign in and sign up frame. On the left, centered on ruler hairlines that meet at grey nodes, a blue panel
// of faint rings in the soft blue ring holds the white form card; the legal line sits just under the panel. From lg, a
// rotating customer quote fills the right column. Under sm the rulers drop and the panel hugs the card.

/** The form's controls, shared by every page in the frame. */
const AUTH_INPUT =
  "h-11 rounded-card border-0 bg-surface px-4 text-body text-fg shadow-none ring-1 ring-hairline transition-[box-shadow] placeholder:text-fg/40 hover:border-0 focus:border-0 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:ring-danger/55 aria-invalid:focus-visible:ring-danger/40 sm:h-12";
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";
const AUTH_SUBMIT = "min-h-11 w-full gap-2 py-2.5 text-center leading-snug whitespace-normal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black sm:min-h-12";
const AUTH_LINK = cn("rounded-sm text-fg-brand underline-offset-2 transition-[text-decoration-color] duration-150 ease-out hover:underline motion-reduce:transition-none", FOCUS);
const AUTH_MUTED_LINK = cn("cursor-pointer rounded-sm text-fg-nav transition-[color] duration-150 ease-out hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none", FOCUS);
const AUTH_NOTICE = "rounded-card bg-blue-10 px-4 py-3 text-body-sm leading-snug text-fg-brand";
const GLASS_RING = "rounded-card bg-ring-tint p-2";
const HAIRLINE = "absolute bg-rule";
const NODE = "absolute z-50 size-2 rounded-pill bg-node";

/** A field's label: the dashboard label, a step larger and medium from sm, as on the sign in card. */
function AuthLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-medium sm:text-body">{children}</span>;
}

/**
 * The whole frame. `imageHeight` (px) sets the panel's height from sm, so it fits the card it holds; `imageMinHeight`
 * lets it shrink on short windows down to that height, keeping the legal line on screen. `aside` is the right column
 * from lg (an AuthProofPanel); `legal` the line under the panel.
 */
function AuthPageShell({
  children,
  legal,
  aside,
  imageHeight,
  imageMinHeight,
  className,
  style,
}: {
  children: React.ReactNode;
  legal?: React.ReactNode;
  aside?: React.ReactNode;
  imageHeight?: number;
  imageMinHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const height = imageHeight ? (imageMinHeight ? `clamp(${imageMinHeight}px, calc(100svh - 136px), ${imageHeight}px)` : `${imageHeight}px`) : undefined;
  const vars = height ? ({ "--auth-image-height": height, "--auth-image-half-height": `calc(${height} / 2)` } as React.CSSProperties) : undefined;
  return (
    <main
      data-slot="auth-page"
      style={{ ...vars, ...style }}
      className={cn(
        "relative min-h-svh w-full overflow-x-clip bg-surface text-fg [--auth-frame-width:calc(var(--auth-image-width)+var(--auth-side-strip-width)*2)] [--auth-image-half-height:calc(var(--auth-image-height)/2)] [--auth-image-height:41.125rem] [--auth-image-width:38rem] [--auth-side-strip-width:5rem]",
        className,
      )}
    >
      <div className={cn("relative z-10 grid min-h-svh grid-cols-1", aside && "lg:grid-cols-[minmax(0,3fr)_minmax(26.25rem,2fr)]")}>
        {/* The extra bottom padding on phones keeps room for the legal line when the card outgrows the window. */}
        <section className="relative flex min-h-svh items-center justify-center px-4 pt-8 pb-24 sm:px-8 sm:py-10 lg:px-12">
          <AuthBackdrop />
          <div className="relative z-10 flex w-full justify-center">{children}</div>
          {legal && (
            <p className="absolute bottom-7 left-1/2 z-20 w-[min(92vw,33.75rem)] -translate-x-1/2 text-center text-caption text-[var(--ds-color-neutral-50)] sm:top-[calc(50%+var(--auth-image-half-height)+var(--ds-space-4))] sm:bottom-auto sm:text-body-sm [&_a]:rounded-sm [&_a]:text-fg-nav [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-[color] [&_a]:duration-150 [&_a]:ease-out [&_a:hover]:text-fg motion-reduce:[&_a]:transition-none">
              {legal}
            </p>
          )}
        </section>
        {aside}
      </div>
    </main>
  );
}

/** The blue panel behind the card, on its rulers. */
function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
      <div className="absolute inset-y-0 left-1/2 z-10 hidden w-(--auth-frame-width) -translate-x-1/2 sm:block">
        <div className={cn(HAIRLINE, "inset-y-0 left-(--auth-side-strip-width) w-px -translate-x-1/2")} />
        <div className={cn(HAIRLINE, "inset-y-0 right-(--auth-side-strip-width) w-px translate-x-1/2")} />
      </div>
      <div className="relative flex h-[min(42rem,calc(100svh-7rem))] w-[min(26.25rem,calc(100vw-2rem))] items-center justify-center sm:h-(--auth-image-height) sm:w-(--auth-frame-width)">
        <div className="relative h-full w-full sm:w-(--auth-image-width)">
          <div className={cn(GLASS_RING, "size-full")}>
            <div className="relative size-full overflow-hidden rounded-card bg-brand">
              <RingBackdrop className="inset-2 rounded-card text-white md:inset-3" />
            </div>
          </div>
          <div className="absolute inset-0 hidden sm:block">
            <div className={cn(HAIRLINE, "top-0 left-1/2 h-px w-[200vw] -translate-x-1/2 -translate-y-1/2")} />
            <div className={cn(HAIRLINE, "bottom-0 left-1/2 h-px w-[200vw] -translate-x-1/2 translate-y-1/2")} />
            <span className={cn(NODE, "top-0 left-0 -translate-x-1/2 -translate-y-1/2")} />
            <span className={cn(NODE, "top-0 right-0 translate-x-1/2 -translate-y-1/2")} />
            <span className={cn(NODE, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2")} />
            <span className={cn(NODE, "right-0 bottom-0 translate-x-1/2 translate-y-1/2")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The white card on the panel. */
function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div data-slot="auth-card" className={cn("w-[calc(100%-var(--ds-space-5))] max-w-128 rounded-card bg-surface px-5 py-6 ring-1 ring-hairline sm:w-full sm:px-8 sm:py-8", className)}>{children}</div>;
}

/** The logo mark in brand blue beside the product's name: the card's title on the sign in and sign up pages. */
function AuthBrandMark({ logo, children, as: Tag = "div", className }: { logo?: React.ReactNode; children: React.ReactNode; as?: "div" | "h1"; className?: string }) {
  return (
    <Tag className={cn("inline-flex items-center justify-center gap-2.5 text-[calc(var(--ds-text-h4)-var(--ds-space-0-5))] leading-normal font-normal tracking-title text-fg sm:text-h4 sm:leading-normal", className)}>
      {logo && <span className="inline-flex text-fg-brand [&>img]:h-6 [&>img]:w-auto [&>svg]:h-6 [&>svg]:w-auto sm:[&>img]:h-7 sm:[&>svg]:h-7">{logo}</span>}
      {children}
    </Tag>
  );
}

/** The card's heading: the brand mark when a `logo` is given (the plain sign in), otherwise a title (an invitation). */
function AuthHeader({ title, subtitle, logo, className }: { title: React.ReactNode; subtitle?: React.ReactNode; logo?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 text-center sm:mb-8", className)}>
      {logo ? (
        <AuthBrandMark as="h1" logo={logo}>
          {title}
        </AuthBrandMark>
      ) : (
        <h1 className="text-h4 font-normal tracking-tight text-balance text-fg sm:text-h3">{title}</h1>
      )}
      {subtitle && <p className="mt-2 text-body-sm text-fg-nav sm:mt-3 sm:text-body">{subtitle}</p>}
    </div>
  );
}

type AuthProvider = {
  id: string;
  /** The provider's name, read as "Continue with {label}". */
  label: string;
  /** The provider's mark, about 18px. */
  icon: React.ReactNode;
  onClick: () => void;
  /** Tags the button "Last used". */
  lastUsed?: boolean;
};

/** One round provider button, with the "Last used" tag above it (its space is kept when hidden, so rows line up). */
function AuthSocialButton({ provider, disabled }: { provider: AuthProvider; disabled?: boolean }) {
  const label = `Continue with ${provider.label}${provider.lastUsed ? " (last used)" : ""}`;
  return (
    <div className="relative flex flex-col items-center pt-2.5">
      <span className={cn("absolute top-0 left-1/2 z-10 h-5 -translate-x-1/2 rounded-pill bg-blue-10 px-2 text-caption leading-5 font-medium whitespace-nowrap text-fg-brand", !provider.lastUsed && "invisible")}>Last used</span>
      <button
        type="button"
        onClick={provider.onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={cn(
          "flex size-11 cursor-pointer items-center justify-center rounded-pill bg-surface text-fg ring-1 ring-hairline transition-[background-color] duration-150 ease-out hover:bg-neutral-5 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:size-12 [&_img]:size-4.5 [&_svg]:size-4.5",
          FOCUS,
        )}
      >
        {provider.icon}
      </button>
    </div>
  );
}

/** "or continue with" over the provider buttons. */
function AuthSocialButtons({ providers, disabled, label = "or continue with", className }: { providers: readonly AuthProvider[]; disabled?: boolean; label?: React.ReactNode; className?: string }) {
  if (!providers.length) return null;
  return (
    <div className={className}>
      <p className="text-center text-body-sm text-fg-nav">{label}</p>
      <div className="mt-3 flex justify-center gap-2 sm:mt-4">
        {providers.map((provider) => (
          <AuthSocialButton key={provider.id} provider={provider} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

/** A password input with a show and hide button at its end; the eye icons cross-fade in place. */
function PasswordInput({ className, disabled, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);
  const icon = "absolute size-4 transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-[opacity]";
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={disabled} className={cn(className, "pr-12")} />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-card text-fg/55 outline-none transition-[color] duration-150 ease-out hover:text-fg focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
      >
        <Eye aria-hidden="true" className={cn(icon, visible ? "scale-90 opacity-0" : "scale-100 opacity-100")} />
        <EyeOff aria-hidden="true" className={cn(icon, visible ? "scale-100 opacity-100" : "scale-90 opacity-0")} />
      </button>
    </div>
  );
}

type AuthTestimonial = { name: string; company: React.ReactNode; quote: string; avatar?: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** The ring that fills while a quote is showing; it starts over with each quote and stays empty under reduced motion. */
function ProofTimer({ duration }: { duration: number }) {
  const ref = React.useRef<SVGCircleElement>(null);
  React.useEffect(() => {
    const circle = ref.current;
    if (!circle || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = circle.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration, easing: "linear", fill: "forwards" });
    return () => animation.cancel();
  }, [duration]);
  return (
    <svg aria-hidden="true" viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 size-11">
      <circle cx="22" cy="22" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rule" />
      <circle ref={ref} cx="22" cy="22" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset="100" className="origin-center -rotate-90 text-fg-brand" />
    </svg>
  );
}

/**
 * The right column from lg: a customer quote in a white card, with a row of avatars to pick another. The quote moves on
 * every `interval` ms while the active avatar's ring fills.
 */
function AuthProofPanel({ testimonials, interval = 10000, label = "Customer testimonial", className }: { testimonials: readonly AuthTestimonial[]; interval?: number; label?: string; className?: string }) {
  const [active, setActive] = React.useState(0);
  const count = testimonials.length;
  React.useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [count, interval, active]);
  const current = testimonials[active] ?? testimonials[0];
  if (!current) return null;
  return (
    <aside aria-label={label} className={cn("relative hidden min-h-svh items-center justify-center overflow-hidden px-12 lg:ml-[calc(24rem-30vw)] lg:flex", className)}>
      <div className={cn(GLASS_RING, "relative -m-2 w-full max-w-120")}>
        <div className="min-h-62.5 rounded-card bg-surface p-8 ring-1 ring-hairline">
          {count > 1 && (
            <div className="mb-7 flex items-center gap-3">
              {testimonials.map((testimonial, index) => (
                <button
                  key={`${testimonial.name}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show testimonial from ${testimonial.name}`}
                  aria-current={index === active ? "true" : undefined}
                  className={cn("relative flex size-11 cursor-pointer items-center justify-center rounded-pill transition-[opacity] duration-150 ease-out hover:opacity-80 motion-reduce:transition-none", FOCUS, index === active ? "opacity-100" : "opacity-55")}
                >
                  <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-pill bg-blue-10 text-caption font-medium text-fg-brand ring-1 ring-hairline">
                    {testimonial.avatar ? <img src={testimonial.avatar} alt="" width={36} height={36} className="size-full object-cover" /> : initials(testimonial.name)}
                  </span>
                  {index === active && <ProofTimer key={active} duration={interval} />}
                </button>
              ))}
            </div>
          )}
          <blockquote className="text-body-lg text-fg">&ldquo;{current.quote}&rdquo;</blockquote>
          <div className="mt-6">
            <p className="text-body font-medium text-fg">{current.name}</p>
            <p className="mt-1 text-body-sm text-fg-nav">{current.company}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export {
  AuthPageShell,
  AuthCard,
  AuthHeader,
  AuthBrandMark,
  AuthLabel,
  AuthSocialButtons,
  AuthSocialButton,
  AuthProofPanel,
  PasswordInput,
  AUTH_INPUT,
  AUTH_SUBMIT,
  AUTH_LINK,
  AUTH_MUTED_LINK,
  AUTH_NOTICE,
  type AuthProvider,
  type AuthTestimonial,
};

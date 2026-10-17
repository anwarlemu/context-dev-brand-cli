"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type StripLogo = { name: string; src?: string; node?: React.ReactNode; href?: string };

// A slow constant loop reads as ambient, not as something to watch: linear, about four seconds a logo.
const SECONDS_PER_LOGO = 4;

// Logos sit in gray (black at 55 percent) and take their own color only on hover.
const LOGO = "opacity-55 grayscale brightness-0 transition-[opacity,filter] duration-200 ease-out group-hover/tile:opacity-100 group-hover/tile:grayscale-0 group-hover/tile:brightness-100 motion-reduce:transition-none";

function LogoTile({ logo }: { logo: StripLogo }) {
  const mark = logo.node ? (
    <span className={cn("flex max-h-12 items-center md:max-h-10 [&_svg]:h-8 [&_svg]:w-auto", LOGO)}>{logo.node}</span>
  ) : (
    <img src={logo.src} alt={`${logo.name} logo`} loading="lazy" className={cn("max-h-12 w-auto object-contain md:max-h-10", LOGO)} />
  );
  return (
    <div className="group/tile flex h-16 w-36 shrink-0 items-center justify-center border-r border-rule bg-surface px-3 sm:h-30 sm:w-44 sm:px-6 md:h-25">
      {logo.href ? (
        <a href={logo.href} aria-label={logo.name} className="rounded-control outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          {mark}
        </a>
      ) : (
        mark
      )}
    </div>
  );
}

/**
 * The logo strip under the hero: a boxed row with a label cell at the left (its key phrase in blue) and the logos in
 * cells divided by rules, looping sideways. The loop is clipped to the box, holds still under the pointer and while
 * off screen, and does not run at all under reduced motion (the row scrolls by hand instead).
 */
function LogoStrip({ label, logos, className, ...props }: React.ComponentProps<"section"> & { label?: React.ReactNode; logos: StripLogo[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const animations = React.useRef<Animation[]>([]);
  const hovered = React.useRef(false);
  const visible = React.useRef(true);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => animations.current.forEach((animation) => (hovered.current || !visible.current ? animation.pause() : animation.play()));
    const start = () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
      if (reduce.matches) return;
      // Two identical rows each slide their own width, so the loop is seamless.
      for (const row of track.querySelectorAll<HTMLElement>("[data-strip-row]")) {
        animations.current.push(row.animate([{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }], { duration: logos.length * SECONDS_PER_LOGO * 1000, iterations: Infinity, easing: "linear" }));
      }
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      sync();
    });
    observer.observe(track);
    start();
    reduce.addEventListener("change", start);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", start);
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
    };
  }, [logos.length]);

  const setHovered = (value: boolean) => {
    hovered.current = value;
    animations.current.forEach((animation) => (value || !visible.current ? animation.pause() : animation.play()));
  };

  return (
    <section data-slot="logo-strip" className={cn("relative w-full border-b border-rule bg-surface py-6 md:py-8", className)} {...props}>
      <div className="relative mx-auto w-full max-w-(--ds-frame-column) px-6 md:px-10 lg:px-12">
        <div className="flex flex-col overflow-hidden rounded-card border border-rule bg-surface md:flex-row">
          {label && (
            <div className="flex shrink-0 items-center justify-center border-b border-rule px-6 py-4 md:w-76 md:justify-start md:border-r md:border-b-0 md:py-0">
              <h2 className="text-center text-body font-normal text-balance text-fg-secondary md:text-left">{label}</h2>
            </div>
          )}
          <div
            ref={trackRef}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            className="relative flex min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto"
          >
            {[false, true].map((duplicate) => (
              <div key={String(duplicate)} data-strip-row="" aria-hidden={duplicate || undefined} className={cn("flex shrink-0", duplicate && "motion-reduce:hidden")}>
                {logos.map((logo) => (
                  <LogoTile key={logo.name} logo={duplicate ? { ...logo, href: undefined } : logo} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { LogoStrip, type StripLogo };

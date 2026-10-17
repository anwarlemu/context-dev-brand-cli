import * as React from "react";

import { SectionEdgeLines } from "@/components/site/section";
import { cn } from "@/lib/utils";

type FooterLink = { label: React.ReactNode; href: string; external?: boolean };
type FooterLinkGroup = { title: React.ReactNode; links: FooterLink[] };

const COLUMN = "relative mx-auto w-full max-w-(--ds-frame-column) px-6 md:px-10 lg:px-12";
// Where the copyright row's rules cross the column lines, as on the dark section grid.
const NODE = "pointer-events-none absolute z-20 size-2 rounded-pill bg-neutral-60";
const LINK = "text-body-sm font-medium text-white/60 outline-none transition-colors duration-150 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none";

function FooterAnchor({ link, className }: { link: FooterLink; className?: string }) {
  const external = link.external ?? link.href.startsWith("http");
  return (
    <a href={link.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cn(LINK, className)}>
      {link.label}
    </a>
  );
}

/**
 * The site's footer: near black, the column's lines continuing down it in the dark tone. The brand block and an aside
 * (badges, status) sit over a white rule at 15 percent, the link groups in four columns under it, then the copyright
 * row between two rules with a node on each crossing, and a watermark band at the foot.
 */
function SiteFooter({
  logo,
  eyebrow,
  description,
  socials,
  aside,
  groups = [],
  copyright,
  note,
  legal = [],
  watermark,
  className,
}: {
  logo?: React.ReactNode;
  /** A small line above the logo (the site's "Backed by" line). */
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  socials?: React.ReactNode;
  /** The right side of the top block (compliance badges, a status link). */
  aside?: React.ReactNode;
  groups?: FooterLinkGroup[];
  copyright?: React.ReactNode;
  /** The middle of the copyright row. */
  note?: React.ReactNode;
  legal?: FooterLink[];
  /** A full-width band at the very bottom (the site's dot wordmark). */
  watermark?: React.ReactNode;
  className?: string;
}) {
  return (
    <footer data-slot="site-footer" className={cn("relative isolate overflow-x-clip bg-dark text-white", className)}>
      <div className="relative">
        <SectionEdgeLines tone="dark" />
        <div className={cn(COLUMN, "z-10 py-14 md:py-20")}>
          {(logo || eyebrow || description || socials || aside) && (
            <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-8 md:grid-cols-[1fr_auto] md:gap-x-10">
              <div className="flex min-w-0 flex-col items-start gap-5">
                {(eyebrow || logo) && (
                  <div className="flex flex-col items-start gap-3">
                    {eyebrow && <span className="inline-flex items-center gap-1.5 text-caption font-medium text-white/70">{eyebrow}</span>}
                    {logo}
                  </div>
                )}
                {description && <p className="max-w-md text-body leading-relaxed font-medium text-white/70">{description}</p>}
                {socials && <div className="flex items-center gap-3 text-white/60 [&_a]:transition-colors [&_a]:duration-150 [&_a]:ease-out [&_a:hover]:text-white [&_svg]:size-4">{socials}</div>}
              </div>
              {aside && <div className="flex shrink-0 flex-col items-start gap-4 md:items-end md:justify-between">{aside}</div>}
            </div>
          )}

          {groups.length > 0 && (
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 pt-8 md:grid-cols-4">
              {groups.map((group, index) => (
                <div key={index} className="flex min-w-0 flex-col gap-3">
                  <p className="text-body-sm font-medium text-white">{group.title}</p>
                  <ul className="flex flex-col gap-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <FooterAnchor link={link} className="block py-0.5" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>

        {(copyright || note || legal.length > 0) && (
          <div className="relative w-full border-y border-white/15 bg-white/2">
            <div className={cn(COLUMN, "grid grid-cols-1 items-center justify-items-center gap-x-6 gap-y-4 py-5 text-center md:grid-cols-3 md:justify-items-start md:text-left")}>
              <span aria-hidden="true" className={cn(NODE, "-top-px left-0 -translate-x-1/2 -translate-y-1/2")} />
              <span aria-hidden="true" className={cn(NODE, "-top-px right-0 translate-x-1/2 -translate-y-1/2")} />
              <span aria-hidden="true" className={cn(NODE, "-bottom-px left-0 -translate-x-1/2 translate-y-1/2")} />
              <span aria-hidden="true" className={cn(NODE, "-bottom-px right-0 translate-x-1/2 translate-y-1/2")} />
              <span className="text-body-sm font-medium text-white/60">{copyright}</span>
              <span className="flex items-center justify-center gap-1 text-body-sm font-medium text-white/60 md:justify-self-center">{note}</span>
              {legal.length > 0 && (
                <nav aria-label="Legal" className="flex items-center gap-4 md:justify-self-end">
                  {legal.map((link) => (
                    <FooterAnchor key={link.href} link={link} className="py-0.5" />
                  ))}
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
      {watermark && <div className="relative z-20 w-full overflow-hidden">{watermark}</div>}
    </footer>
  );
}

export { SiteFooter, type FooterLink, type FooterLinkGroup };

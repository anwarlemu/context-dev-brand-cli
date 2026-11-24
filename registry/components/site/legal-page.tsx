"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

// The site's legal pages (privacy, terms, the DPA): a back link, the title at h1 size and the date it was last updated,
// over a hairline; then the text, with an "On this page" list of its sections beside it from lg. The list is built from
// the text's h2s, follows the reading position and scrolls to a section when clicked. Set `--header-offset` to the
// sticky header's height so the list and the jumped-to headings clear it.

type LegalHeading = { id: string; title: string; element: HTMLHeadingElement };

const OFFSET = "var(--header-offset,calc(var(--spacing)*26))";

// The text's own styles, as the site sets them: regular-weight headings, muted body copy at body-lg on a 1.6 line,
// bold words in full black at the regular weight, and links in brand blue.
const PROSE = cn(
  "min-w-0 flex-1 text-fg",
  "[&_h2]:mb-4 [&_h2]:scroll-mt-[calc(var(--header-offset,calc(var(--spacing)*26))+var(--ds-space-6))] [&_h2]:pt-3 [&_h2]:text-[calc(var(--ds-text-h4)+var(--ds-space-1))] [&_h2]:leading-heading [&_h2]:font-normal [&_h2]:tracking-snug [&_h2]:text-fg",
  "[&_h3]:mb-3 [&_h3]:text-h5 [&_h3]:leading-snug [&_h3]:font-normal [&_h3]:text-fg",
  "[&_h4]:mb-2 [&_h4]:text-body-lg [&_h4]:leading-snug [&_h4]:font-normal [&_h4]:text-fg",
  "[&_p]:mb-4 [&_p]:text-body-lg [&_p]:leading-snippet [&_p]:text-fg-nav",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
  "[&_li]:text-body-lg [&_li]:leading-snippet [&_li]:text-fg-nav",
  "[&_strong]:font-normal [&_strong]:text-fg",
  "[&_a]:text-fg-brand [&_a]:underline-offset-4 [&_a:hover]:underline",
  "[&_section]:mb-8",
);

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectHeadings(content: HTMLElement): LegalHeading[] {
  const taken = new Set<string>();
  return Array.from(content.querySelectorAll("h2"), (element) => {
    const title = element.textContent?.trim() ?? "";
    let id = element.id || slugify(title) || "section";
    for (let suffix = 2; taken.has(id); suffix += 1) id = `${slugify(title) || "section"}-${suffix}`;
    taken.add(id);
    element.id = id;
    return { id, title, element };
  });
}

/** The text and its "On this page" list. LegalPage uses it; use it alone under another header. */
function LegalPageBody({ tocLabel = "On this page", className, children }: { tocLabel?: string; className?: string; children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = React.useState<LegalHeading[]>([]);
  const [activeId, setActiveId] = React.useState<string>();

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const found = collectHeadings(content);
    setHeadings(found);
    let frame = 0;
    // The section whose heading has passed a line a quarter of the way down the window is the one being read.
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.25;
      let current = found[0]?.id;
      for (const heading of found) {
        if (heading.element.getBoundingClientRect().top > line) break;
        current = heading.id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [children]);

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, heading: LegalHeading) => {
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.element.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${heading.id}`);
    setActiveId(heading.id);
  };

  return (
    <div data-slot="legal-page-body" className={cn("flex gap-16 pt-10", className)}>
      <nav
        aria-label={tocLabel}
        style={{ top: `calc(${OFFSET} + var(--ds-space-8))`, maxHeight: `calc(100vh - ${OFFSET} - var(--ds-space-16))` }}
        className="ds-scrollbar fade-y sticky hidden w-60 shrink-0 self-start overflow-y-auto lg:block"
      >
        {headings.length > 0 && (
          <>
            <p className="text-body-sm leading-snug text-fg">{tocLabel}</p>
            <ul className="mt-3 flex flex-col gap-3">
              {headings.map((heading) => {
                const active = heading.id === activeId;
                return (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(event) => jump(event, heading)}
                      aria-current={active ? "location" : undefined}
                      className={cn(
                        "block rounded-sm text-body-sm leading-snug outline-none transition-[color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none",
                        active ? "text-fg-brand" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {heading.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>
      <div ref={contentRef} className={PROSE}>
        {children}
      </div>
    </div>
  );
}

/**
 * A legal page. The text goes in as children: plain `section`s, `h2` for each section (the list is built from them),
 * `h3` and `h4` inside, paragraphs, lists, `strong` for a lead-in and links; the page styles them all.
 */
function LegalPage({
  title,
  lastUpdated,
  lastUpdatedLabel = "Last updated",
  backHref = "/",
  backLabel = "Back to home",
  tocLabel,
  className,
  children,
}: {
  title: React.ReactNode;
  /** The date as shown, e.g. "October 1, 2026". */
  lastUpdated?: React.ReactNode;
  lastUpdatedLabel?: React.ReactNode;
  backHref?: string;
  backLabel?: React.ReactNode;
  tocLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-slot="legal-page" className={cn("relative w-full bg-surface text-fg", className)}>
      <div className="relative mx-auto max-w-[100vw] px-4 pb-12 md:max-w-[90vw] md:pb-16 lg:max-w-[85vw] xl:max-w-(--ds-layout-column)">
        <header className="flex flex-col items-start gap-5 border-b border-line pt-12 pb-10 md:pt-16">
          {/* The arrow stays put on hover; only the link's color answers the pointer. */}
          <a
            href={backHref}
            className="inline-flex items-center gap-2 rounded-sm text-body-md leading-snug text-fg-muted outline-none transition-[color] duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {backLabel}
          </a>
          <h1 className="text-hero leading-tight font-normal tracking-tight text-balance text-fg sm:text-h1 sm:leading-tight">{title}</h1>
          {lastUpdated && (
            <p className="text-body leading-snug text-fg/50">
              {lastUpdatedLabel} {lastUpdated}
            </p>
          )}
        </header>
        <LegalPageBody tocLabel={tocLabel}>{children}</LegalPageBody>
      </div>
    </section>
  );
}

export { LegalPage, LegalPageBody };

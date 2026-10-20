import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { cn } from "@/lib/utils";

// The home page's security row: three white cards in the soft blue ring, each with a blue dot mark, a title, a sentence
// and an outline pill. The whole card is the link (the pill's hit area stretches over it), so hovering the card tints
// the pill the way hovering the pill does. On phones the mark sits beside the text, scaled down; from tablet up, above.

// The brand's trust marks on its 15 by 15 dot grid, as the site draws them: `#` a solid dot, `o` a ring, a space an
// empty cell. The site shows compliance, policies and zero data retention (`zdr`).
const TRUST_MARKS = {
  compliance: ["     #####     ", "   ##ooooo##   ", "  ##ooooooo##  ", " ##ooooooooo## ", " #ooooooooooo# ", "#o###o###o###o#", "#o#ooo#o#o#ooo#", "#o###o#o#o#ooo#", "#ooo#o#o#o#ooo#", "#o###o###o###o#", " #ooooooooooo# ", " ##ooooooooo## ", "  ##ooooooo##  ", "   ##ooooo##   ", "     #####     "],
  policies: ["   #########   ", "  #ooooooooo#  ", "  #ooooooooo#  ", "  #oo#####oo#  ", "  #ooooooooo#  ", "  #oo#####oo#  ", "  #ooooooooo#  ", "  #oo#####oo#  ", "  #ooooooooo#  ", "  #oo#####oo#  ", "  #ooooooooo#  ", "  #oo###oooo#  ", "  #ooooooooo#  ", "  #ooooooooo#  ", "   #########   "],
  zdr: ["     #####     ", "    #ooooo#  # ", "   #o     o##  ", "   #o     o#   ", "   #o     ##   ", "   #o    #o#   ", "   #o   # o#   ", "   #o  #  o#   ", "   #o #   o#   ", "   #o#    o#   ", "   ##     o#   ", "   #o     o#   ", "  ##o     o#   ", " #  #ooooo#    ", "     #####     "],
  /** @deprecated The site's third card is now zero data retention (`zdr`); kept so pages that drew it still render. */
  controls: [" ############# ", "#ooooooooooooo#", "#ooooooooooooo#", "#ooooo#ooooooo#", "#ooooo#ooooooo#", "#oooo#o#oooooo#", "#oooo#o#oooooo#", "#####oo#oo#####", "#oooooo#oo#ooo#", "#ooooooo##oooo#", "#ooooooo##oooo#", "#ooooooo#ooooo#", "#ooooooooooooo#", "#ooooooooooooo#", " ############# "],
} as const;

// The library's DotGlyph reads 2 as a solid dot and 1 as a ring.
const toGlyphRows = (rows: readonly string[]) => rows.map((row) => row.replace(/#/g, "2").replace(/o/g, "1"));

type TrustMarkId = keyof typeof TRUST_MARKS;

/** A trust card's dot mark in brand blue. The hover morph is a visual of its own; this is its resting picture. */
function TrustMark({ mark, rows, className }: { mark?: TrustMarkId; rows?: readonly string[]; className?: string }) {
  return <DotGlyph rows={toGlyphRows(rows ?? TRUST_MARKS[mark ?? "compliance"])} className={cn("size-18.75 text-fg-brand", className)} />;
}

export type TrustItem = { mark?: React.ReactNode; label: string; description: string; linkLabel: string; href: string };

/** `external` defaults to whether `href` leaves the site (`https://`): the site opens only those in a new tab. */
function TrustCard({ mark, label, description, linkLabel, href, external = href.startsWith("https://"), className }: TrustItem & { external?: boolean; className?: string }) {
  return (
    <div data-slot="trust-card" data-hover-morph="" className={cn("rounded-card bg-ring-tint p-2", className)}>
      <div className="group/trust relative grid h-full grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-5 rounded-card bg-surface p-6 ring-1 ring-hairline md:flex md:flex-col md:p-8">
        <div aria-hidden="true" className="row-span-3 size-16 md:mb-6 md:h-22 md:w-auto">
          <div className="origin-top-left scale-72 md:scale-100">{mark}</div>
        </div>
        <h3 className="col-start-2 text-body-lg leading-snug font-medium text-fg">{label}</h3>
        <p className="col-start-2 mt-3 mb-6 max-w-sm text-body leading-relaxed text-fg-muted">{description}</p>
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(buttonVariants({ variant: "pill-outline" }), "col-start-2 w-fit group-hover/trust:bg-tint after:absolute after:inset-0 after:rounded-card md:mt-auto")}
        >
          {linkLabel}
        </a>
      </div>
    </div>
  );
}

function TrustStrip({ items, className }: { items: TrustItem[]; className?: string }) {
  return (
    <ul data-slot="trust-strip" className={cn("grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-16", className)}>
      {items.map((item) => (
        <li key={item.label} className="-m-2 flex">
          <TrustCard className="flex-1" {...item} />
        </li>
      ))}
    </ul>
  );
}

export { TrustStrip, TrustCard, TrustMark, TRUST_MARKS, type TrustMarkId };

import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The home page's security row: three white cards in the soft blue ring, each with a gray line mark, a title, a
// sentence and an outline pill. The whole card is the link (the pill's hit area stretches over it), so hovering the
// card tints the pill the way hovering the pill does. On phones the mark sits beside the text; from tablet up, above.

export type TrustItem = { mark?: React.ReactNode; label: string; description: string; linkLabel: string; href: string };

function TrustCard({ mark, label, description, linkLabel, href, external = true, className }: TrustItem & { external?: boolean; className?: string }) {
  return (
    <div data-slot="trust-card" className={cn("rounded-card bg-ring-tint p-2", className)}>
      <div className="group/trust relative grid h-full grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-5 rounded-card bg-surface p-6 ring-1 ring-hairline md:flex md:flex-col md:p-8">
        <div aria-hidden="true" className="row-span-3 flex size-16 items-start text-fg-subtle md:mb-6 md:h-22 md:w-auto [&_svg]:h-full [&_svg]:w-auto">
          {mark}
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

export { TrustStrip, TrustCard };

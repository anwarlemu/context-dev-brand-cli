"use client";

import { CardLink, CenteredCard, CenteredNumber, GlyphCard, StatusPill } from "@/components/product/glyph-card";

export function Product() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      <GlyphCard glyph="monitors" title="Monitors" aside={<CardLink href="#">View all</CardLink>}>
        <p className="text-caption text-fg-muted">12 pages watched, 3 changed this week.</p>
      </GlyphCard>
      <GlyphCard glyph="batches" title="Nightly crawl" aside={<StatusPill dotClassName="bg-success">Running</StatusPill>}>
        <p className="text-caption text-fg-muted">1,204 of 2,000 pages done.</p>
      </GlyphCard>
      <div className="@container grid">
        <CenteredCard label="API calls" badge="Last 30 days" visual={<CenteredNumber value="41,880" />} />
      </div>
      <div className="@container grid">
        <CenteredCard label="Successful calls" badge="1,256 errors" visual={<CenteredNumber value="97.00" suffix="%" />} onClick={() => {}} />
      </div>
    </div>
  );
}

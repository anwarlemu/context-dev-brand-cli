"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";

export function Site() {
  return (
    <Empty variant="outline" className="w-full max-w-xl">
      <EmptyHeader>
        <EmptyMedia>
          <GlyphTile name="search" className="size-16 p-2" />
        </EmptyMedia>
        <EmptyTitle>No articles match "rate limits"</EmptyTitle>
        <EmptyDescription>Try a shorter search, or browse the guides by API.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="pill-outline" size="sm" asChild>
          <a href="https://docs.context.dev" target="_blank" rel="noreferrer">Browse the docs</a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function Product() {
  const [created, setCreated] = useState(false);
  if (created) return <p role="status" className="text-body-sm text-fg-muted">A monitor would be created here.</p>;
  return (
    <Empty className="w-full max-w-xl">
      <EmptyHeader>
        <EmptyMedia>
          <GlyphTile name="monitors" ringed className="size-28" />
        </EmptyMedia>
        <EmptyTitle>Watch a page or sitemap</EmptyTitle>
        <EmptyDescription>Create your first monitor to watch a page or sitemap for exact changes, or a whole site for changes that matter.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="brand" size="sm" onClick={() => setCreated(true)}>
            <Plus strokeWidth={1.75} /> Create monitor
          </Button>
          <Button size="sm" asChild>
            <a href="https://docs.context.dev/monitors" target="_blank" rel="noreferrer">Read docs</a>
          </Button>
        </div>
        <span className="text-caption text-fg-subtle">0 of 5 monitors used</span>
      </EmptyContent>
    </Empty>
  );
}

export function Icon() {
  return (
    <Empty variant="outline" className="w-full max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle>No batches match this filter</EmptyTitle>
        <EmptyDescription>Clear the status filter to see every batch.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

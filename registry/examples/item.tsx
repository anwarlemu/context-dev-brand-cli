"use client";

import { useState } from "react";
import { ChevronRight, Globe, KeyRound, MoreVertical, ScanText } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";

export function Site() {
  return (
    <ItemGroup className="w-full max-w-lg gap-2">
      {[
        { glyph: "scrape" as const, title: "Scrape", text: "Any page as clean markdown, HTML or JSON." },
        { glyph: "crawl" as const, title: "Crawl", text: "A whole site, page by page, with a sitemap or without." },
      ].map((p) => (
        <Item key={p.title} variant="outline" asChild>
          <a href={`https://context.dev/${p.title.toLowerCase()}`} target="_blank" rel="noreferrer">
            <ItemMedia variant="image">
              <GlyphTile name={p.glyph} className="size-10 p-1.5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{p.title}</ItemTitle>
              <ItemDescription>{p.text}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="size-4 text-fg-subtle" strokeWidth={1.5} />
            </ItemActions>
          </a>
        </Item>
      ))}
    </ItemGroup>
  );
}

const KEYS = [
  { name: "Production", used: "Used 2 minutes ago", status: "Active" },
  { name: "Staging", used: "Used yesterday", status: "Active" },
  { name: "Old CI key", used: "Never used", status: "Revoked" },
];

export function Product() {
  const [selected, setSelected] = useState("Production");
  return (
    <ItemGroup className="w-full max-w-xl rounded-card bg-surface shadow-card">
      {KEYS.map((k, i) => (
        <div key={k.name}>
          {i > 0 && <ItemSeparator />}
          <Item asChild aria-current={selected === k.name}>
            <button type="button" className="w-full text-left" onClick={() => setSelected(k.name)}>
              <ItemMedia variant="icon">
                <KeyRound strokeWidth={1.75} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{k.name}</ItemTitle>
                <ItemDescription>{k.used}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant={k.status === "Active" ? "success" : "default"}>{k.status}</Badge>
              </ItemActions>
            </button>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Sizes() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Globe strokeWidth={1.75} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>docs.example.com</ItemTitle>
          <ItemDescription>Monitored every hour</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Monitor actions">
            <MoreVertical strokeWidth={1.5} />
          </Button>
        </ItemActions>
      </Item>
      <Item size="sm" variant="outline">
        <ItemMedia variant="icon">
          <ScanText strokeWidth={1.75} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Parse</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <Avatar className="size-5">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <ItemContent>
          <ItemTitle>Ana Lopez invited you to Acme</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}

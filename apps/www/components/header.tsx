"use client";

import { Blocks, Box, LayoutDashboard, Monitor, Palette, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { NavFeaturedCard, NavFooterLink, SiteHeader } from "@/components/site/site-header";
import { LogoMark, Wordmark } from "@www/components/logo";

export function Header({ name, repo, counts }: { name: string; repo: string; counts: Record<string, number> }) {
  const pathname = usePathname();
  const n = (type: string) => counts[type] ?? 0;
  return (
    <SiteHeader
      logo={<LogoMark />}
      wordmark={<Wordmark name={name} />}
      logoLabel={`${name} UI home`}
      announcement={{ text: <>Every component, block and visual from the {name} site and product, ready to add.</>, href: "/components" }}
      currentPath={pathname}
      items={[
        {
          label: "Library",
          current: pathname.startsWith("/components"),
          width: "min(57.5rem, calc(100vw - 8rem))",
          featured: (
            <NavFeaturedCard
              href="/components"
              title="Browse the library"
              description={`${Object.values(counts).reduce((a, b) => a + b, 0)} items, each with a live preview and its source.`}
              cta="See everything"
            />
          ),
          items: [
            { title: "Components", description: `${n("ui")} primitives for both surfaces`, href: "/components#components", icon: <Box /> },
            { title: "Product", description: `${n("product")} dashboard pieces`, href: "/components#product", icon: <LayoutDashboard /> },
            { title: "Site", description: `${n("site")} marketing sections`, href: "/components#site", icon: <Monitor /> },
            { title: "Blocks", description: `${n("block")} full pages to start from`, href: "/components#blocks", icon: <Blocks /> },
            { title: "Visuals", description: `${n("visual")} dot fields and stories`, href: "/components#visuals", icon: <Sparkles /> },
            { title: "Theme", description: "The tokens behind every value", href: "/theme", icon: <Palette /> },
          ],
          footer: (
            <>
              <span className="text-fg-muted">Start with</span>
              <NavFooterLink href="/components/button">Button</NavFooterLink>
              <NavFooterLink href="/components/app-shell">App shell</NavFooterLink>
              <NavFooterLink href="/components/hero">Hero</NavFooterLink>
            </>
          ),
          mobile: [
            {
              links: [
                { label: "Everything", href: "/components" },
                { label: "Components", href: "/components#components" },
                { label: "Product", href: "/components#product" },
                { label: "Site", href: "/components#site" },
                { label: "Blocks", href: "/components#blocks" },
                { label: "Visuals", href: "/components#visuals" },
              ],
            },
          ],
        },
        { label: "Theme", href: "/theme" },
        { label: "CLI", href: "/cli" },
        { label: "GitHub", href: repo, external: true },
      ]}
      secondaryAction={{ label: "Use the CLI", href: "/cli" }}
      primaryAction={{ label: "Browse components", href: "/components" }}
    />
  );
}


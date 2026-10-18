"use client";

import { usePathname } from "next/navigation";

import { NavFeaturedCard, NavFooterLink, SiteHeader } from "@/components/site/site-header";
import { MenuGlyph } from "@/components/visuals/persona-glyph";
import { LogoMark, Wordmark } from "@www/components/logo";

export function Header({ name, repo, counts }: { name: string; repo: string; counts: Record<string, number> }) {
  const pathname = usePathname();
  const n = (type: string) => counts[type] ?? 0;
  return (
    <SiteHeader
      logo={<LogoMark />}
      wordmark={<Wordmark name={name} />}
      logoLabel={`${name} design system home`}
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
              description={`${Object.values(counts).reduce((a, b) => a + b, 0)} entries with previews, usage notes, and source code.`}
              cta="View components"
            />
          ),
          items: [
            { title: "Components", description: `${n("ui")} controls for site and product interfaces`, href: "/components#components", glyph: <MenuGlyph name="design" /> },
            { title: "Product", description: `${n("product")} dashboard components`, href: "/components#product", glyph: <MenuGlyph name="theme" /> },
            { title: "Site", description: `${n("site")} marketing sections`, href: "/components#site", glyph: <MenuGlyph name="portal" /> },
            { title: "Blocks", description: `${n("block")} page layouts`, href: "/components#blocks", glyph: <MenuGlyph name="batches" /> },
            { title: "Visuals", description: `${n("visual")} glyphs, dot fields, and animations`, href: "/components#visuals", glyph: <MenuGlyph name="generate" /> },
            { title: "Tokens", description: "Color, type, spacing, and motion", href: "/theme", glyph: <MenuGlyph name="styleguide" /> },
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
                { label: "All components", href: "/components" },
                { label: "Components", href: "/components#components" },
                { label: "Product", href: "/components#product" },
                { label: "Site", href: "/components#site" },
                { label: "Blocks", href: "/components#blocks" },
                { label: "Visuals", href: "/components#visuals" },
              ],
            },
          ],
        },
        { label: "Tokens", href: "/theme" },
        { label: "CLI", href: "/cli" },
        { label: "Agents", href: "/agents" },
        { label: "GitHub", href: repo, external: true },
      ]}
      secondaryAction={{ label: "Use the CLI", href: "/cli" }}
      primaryAction={{ label: "Browse components", href: "/components" }}
    />
  );
}


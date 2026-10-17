import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { FooterWatermark } from "@/components/visuals/footer-watermark";
import { LogoMark } from "@www/components/logo";

export function Footer({ name, repo, site }: { name: string; repo: string; site: string }) {
  return (
    <SiteFooter
      logo={
        <Link href="/" aria-label={`${name} design system home`} className="flex items-center gap-2 rounded-card">
          <LogoMark className="h-6" />
          <span className="text-h5 leading-none font-medium text-white">{name}</span>
        </Link>
      }
      description={
        <>
          <span className="block">{name} design system.</span>
          <span className="block">Reference for the team and agents building pages and interfaces.</span>
        </>
      }
      groups={[
        {
          title: "Library",
          links: [
            { label: "Components", href: "/components#components" },
            { label: "Product", href: "/components#product" },
            { label: "Site", href: "/components#site" },
            { label: "Blocks", href: "/components#blocks" },
            { label: "Visuals", href: "/components#visuals" },
          ],
        },
        {
          title: "Reference",
          links: [
            { label: "Tokens", href: "/theme" },
            { label: "CLI", href: "/cli" },
            { label: "Registry index", href: "/r/index.json" },
          ],
        },
        {
          title: name,
          links: [
            { label: "Website", href: site },
            { label: "GitHub", href: repo },
          ],
        },
      ]}
      copyright={`© 2026 ${name}`}
      watermark={<FooterWatermark className="max-sm:top-14 max-sm:h-auto" />}
    />
  );
}

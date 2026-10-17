import { Heart, Mail } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";

export function Site() {
  return (
    <SiteFooter
      eyebrow="Backed by Y Combinator"
      logo={
        <a href="/" className="flex items-center gap-2 text-h5 font-medium text-white">
          <svg viewBox="0 0 772.32 531.2" aria-hidden="true" className="h-6 w-auto text-fg-brand">
            <path fill="currentColor" fillRule="evenodd" d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z" />
            <circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
          </svg>
          Context.dev
        </a>
      }
      description={
        <>
          <span className="block">Web data infrastructure for AI agents.</span>
          <span className="block">Scrape anything. Get answers. Keep your data fresh.</span>
        </>
      }
      socials={
        <a href="mailto:hello@context.dev" aria-label="Email us" className="-m-1.5 p-1.5">
          <Mail />
        </a>
      }
      aside={
        <a href="https://status.context.dev" className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3 py-1.5 text-caption font-medium text-white/80 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white motion-reduce:transition-none">
          View service status
        </a>
      }
      groups={[
        { title: "Product", links: [{ label: "Scrape anything", href: "/web-scraping-api" }, { label: "Web search", href: "/search-api" }, { label: "Run batches", href: "/batches-api" }, { label: "Create monitors", href: "/monitors-api" }, { label: "Pricing", href: "/pricing" }] },
        { title: "Developers", links: [{ label: "Documentation", href: "https://docs.context.dev" }, { label: "Integrations & SDKs", href: "/integrations" }, { label: "MCP Server", href: "/mcp" }, { label: "CLI", href: "/cli" }] },
        { title: "Resources", links: [{ label: "Blog", href: "/blog" }, { label: "Guides", href: "/guides" }, { label: "Customers", href: "/customers" }, { label: "Glossary", href: "/glossary" }] },
        { title: "Company", links: [{ label: "Contact", href: "/contact" }, { label: "Request Brand Update", href: "/update" }] },
      ]}
      copyright="© 2026 Context.dev"
      note={
        <>
          Built with <Heart aria-label="love" className="size-3.5 fill-brand text-fg-brand" /> in San Francisco
        </>
      }
      legal={[
        { label: "Terms", href: "/term" },
        { label: "DPA", href: "/dpa" },
        { label: "Privacy", href: "/privacy" },
      ]}
    />
  );
}

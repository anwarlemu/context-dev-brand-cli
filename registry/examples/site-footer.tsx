import { Mail } from "lucide-react";

import { FooterCopyButton, FooterInlineLink, FooterStatusLink, SiteFooter } from "@/components/site/site-footer";
import { FooterWatermark } from "@/components/visuals/footer-watermark";

export function Site() {
  return (
    <SiteFooter
      logo={
        <a href="https://context.dev/" aria-label="Context.dev home" className="flex items-center gap-2 rounded-card">
          <svg viewBox="0 0 772.32 531.2" aria-hidden="true" className="h-6 w-auto text-fg-brand">
            <path fill="currentColor" fillRule="evenodd" d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z" />
            <circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
          </svg>
          <span className="text-h5 leading-none font-medium text-white">Context.dev</span>
        </a>
      }
      description={
        <>
          <span className="block">Web data infrastructure for AI agents.</span>
          <span className="block">Scrape anything. Get answers. Keep your data fresh.</span>
        </>
      }
      socials={
        <a href="mailto:hello@context.dev" aria-label="Email us">
          <Mail />
        </a>
      }
      backedBy={<a href="https://www.ycombinator.com/companies/contextdev">Backed by Y Combinator</a>}
      asideLinks={[
        <FooterInlineLink key="soc" href="https://trust.context.dev/" target="_blank" rel="noopener noreferrer">
          SOC 2 Type 1 &amp; Type 2 compliant
        </FooterInlineLink>,
        <FooterStatusLink key="status" href="https://status.context.dev" state="operational" />,
      ]}
      groups={[
        { title: "Product", links: [{ label: "Scrape anything", href: "https://context.dev/web-scraping-api" }, { label: "Web search", href: "https://context.dev/search-api" }, { label: "Run batches", href: "https://context.dev/batches-api" }, { label: "Create monitors", href: "https://context.dev/monitors-api" }, { label: "Pricing", href: "https://context.dev/pricing" }] },
        { title: "Developers", links: [{ label: "Documentation", href: "https://docs.context.dev" }, { label: "Playground", href: "https://context.dev/playground/scrape" }, { label: "Integrations & SDKs", href: "https://context.dev/integrations" }, { label: "MCP Server", href: "https://context.dev/mcp" }, { label: "CLI", href: "https://context.dev/cli" }] },
        { title: "Resources", links: [{ label: "Blog", href: "https://context.dev/blog" }, { label: "Guides", href: "https://context.dev/guides" }, { label: "Customers", href: "https://context.dev/customers" }, { label: "Compare Alternatives", href: "https://context.dev/compare" }, { label: "Glossary", href: "https://context.dev/glossary" }] },
        { title: "Company", links: [{ label: "Contact", href: "https://context.dev/contact" }, { label: "Request Brand Update", href: "https://context.dev/update" }] },
      ]}
      copyright="© 2026 Context.dev"
      note={
        <>
          Built with
          <svg viewBox="0 0 24 24" aria-hidden="true" className="inline-block size-3.5 fill-brand">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          in San Francisco
        </>
      }
      legal={[
        { label: "Terms", href: "https://context.dev/term" },
        { label: "DPA", href: "https://context.dev/dpa" },
        { label: "Privacy", href: "https://context.dev/privacy" },
      ]}
      watermark={<FooterWatermark className="max-sm:top-14 max-sm:h-auto" />}
      watermarkAction={<FooterCopyButton text="Signup for an account & get API key with context.dev/auth.md, then follow docs.context.dev/agent-quickstart to integrate into the codebase" label="Onboard your agent" aria-label="Onboard your agent: copy the setup prompt" />}
    />
  );
}

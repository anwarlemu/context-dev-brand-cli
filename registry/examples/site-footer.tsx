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
          <span className="text-h5 leading-none text-white">Context.dev</span>
        </a>
      }
      description={
        <>
          <span className="block">Web data infrastructure for AI agents.</span>
          <span className="block">Scrape anything. Get answers. Keep your data fresh.</span>
        </>
      }
      socials={
        <>
          <a key="x" href="https://x.com/getcontextdev" aria-label="Follow us on X">
            <svg aria-hidden="true" className="size-3!" viewBox="0 0 24 24" fill="none"><path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
          </a>
          <a key="linkedin" href="https://www.linkedin.com/company/contextdev" aria-label="Follow us on LinkedIn">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4.5 9.5H4C3.05719 9.5 2.58579 9.5 2.29289 9.79289C2 10.0858 2 10.5572 2 11.5V20C2 20.9428 2 21.4142 2.29289 21.7071C2.58579 22 3.05719 22 4 22H4.5C5.44281 22 5.91421 22 6.20711 21.7071C6.5 21.4142 6.5 20.9428 6.5 20V11.5C6.5 10.5572 6.5 10.0858 6.20711 9.79289C5.91421 9.5 5.44281 9.5 4.5 9.5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 4.25C6.5 5.49264 5.49264 6.5 4.25 6.5C3.00736 6.5 2 5.49264 2 4.25C2 3.00736 3.00736 2 4.25 2C5.49264 2 6.5 3.00736 6.5 4.25Z" stroke="currentColor" strokeWidth="1.5"/><path d="M12.326 9.5H11.5C10.5572 9.5 10.0858 9.5 9.79289 9.79289C9.5 10.0858 9.5 10.5572 9.5 11.5V20C9.5 20.9428 9.5 21.4142 9.79289 21.7071C10.0858 22 10.5572 22 11.5 22H12C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20L14.0001 16.5001C14.0001 14.8433 14.5281 13.5001 16.0879 13.5001C16.8677 13.5001 17.5 14.1717 17.5 15.0001V19.5001C17.5 20.4429 17.5 20.9143 17.7929 21.2072C18.0857 21.5001 18.5572 21.5001 19.5 21.5001H19.9987C20.9413 21.5001 21.4126 21.5001 21.7055 21.2073C21.9984 20.9145 21.9985 20.4432 21.9987 19.5006L22.0001 14.0002C22.0001 11.515 19.6364 9.50024 17.2968 9.50024C15.9649 9.50024 14.7767 10.1531 14.0001 11.174C14 10.5439 14 10.2289 13.8632 9.995C13.7765 9.84686 13.6531 9.72353 13.505 9.63687C13.2711 9.5 12.9561 9.5 12.326 9.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"/></svg>
          </a>
          <a key="github" href="https://github.com/context-dot-dev" aria-label="Follow us on GitHub">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M10 20.5675C6.57143 21.7248 3.71429 20.5675 2 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/><path d="M10 22V18.7579C10 18.1596 10.1839 17.6396 10.4804 17.1699C10.6838 16.8476 10.5445 16.3904 10.1771 16.2894C7.13394 15.4528 5 14.1077 5 9.64606C5 8.48611 5.38005 7.39556 6.04811 6.4464C6.21437 6.21018 6.29749 6.09208 6.31748 5.9851C6.33746 5.87813 6.30272 5.73852 6.23322 5.45932C5.95038 4.32292 5.96871 3.11619 6.39322 2.02823C6.39322 2.02823 7.27042 1.74242 9.26698 2.98969C9.72282 3.27447 9.95075 3.41686 10.1515 3.44871C10.3522 3.48056 10.6206 3.41384 11.1573 3.28041C11.8913 3.09795 12.6476 3 13.5 3C14.3524 3 15.1087 3.09795 15.8427 3.28041C16.3794 3.41384 16.6478 3.48056 16.8485 3.44871C17.0493 3.41686 17.2772 3.27447 17.733 2.98969C19.7296 1.74242 20.6068 2.02823 20.6068 2.02823C21.0313 3.11619 21.0496 4.32292 20.7668 5.45932C20.6973 5.73852 20.6625 5.87813 20.6825 5.9851C20.7025 6.09207 20.7856 6.21019 20.9519 6.4464C21.6199 7.39556 22 8.48611 22 9.64606C22 14.1077 19.8661 15.4528 16.8229 16.2894C16.4555 16.3904 16.3162 16.8476 16.5196 17.1699C16.8161 17.6396 17 18.1596 17 18.7579V22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
          </a>
          <a key="instagram" href="https://www.instagram.com/contextdotdev" aria-label="Follow us on Instagram">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/><path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/><path d="M17.3748 6.75024H17.2498M17.4998 6.75024C17.4998 6.88832 17.3878 7.00024 17.2498 7.00024C17.1117 7.00024 16.9998 6.88832 16.9998 6.75024C16.9998 6.61217 17.1117 6.50024 17.2498 6.50024C17.3878 6.50024 17.4998 6.61217 17.4998 6.75024Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
          </a>
          <a key="email" href="mailto:hello@context.dev" aria-label="Email us">
            <Mail />
          </a>
        </>
      }
      backedBy={
        <a href="https://www.ycombinator.com/companies/contextdev" className="inline-flex items-center gap-1.5">
          Backed by
          <img src="https://context.dev/yc-logo.svg" alt="Y Combinator" width={16} height={16} />
          Combinator
        </a>
      }
      asideLinks={[
        <FooterInlineLink key="soc" href="https://trust.context.dev/" target="_blank" rel="noopener noreferrer">
          SOC 2 Type 2 compliant
        </FooterInlineLink>,
        <FooterStatusLink key="status" href="https://status.context.dev" state="operational" />,
      ]}
      groups={[
        { title: "Product", links: [{ label: "Scrape anything", href: "https://context.dev/web-scraping-api" }, { label: "Web search", href: "https://context.dev/search-api" }, { label: "Map domains", href: "https://context.dev/map-api" }, { label: "Run batches", href: "https://context.dev/batches-api" }, { label: "Answers from the web", href: "https://context.dev/answers-api" }, { label: "Create monitors", href: "https://context.dev/monitors-api" }, { label: "Retrieve brand data", href: "https://context.dev/brand-api" }, { label: "Pricing", href: "https://context.dev/pricing" }] },
        { title: "Developers", links: [{ label: "Documentation", href: "https://docs.context.dev" }, { label: "Playground", href: "https://context.dev/playground/scrape" }, { label: "Integrations & SDKs", href: "https://context.dev/integrations" }, { label: "MCP Server", href: "https://context.dev/mcp" }, { label: "CLI", href: "https://context.dev/cli" }, { label: "Changelog", href: "https://docs.context.dev/changelog" }] },
        { title: "Resources", links: [{ label: "Blog", href: "https://context.dev/blog" }, { label: "Guides", href: "https://context.dev/guides" }, { label: "Customers", href: "https://context.dev/customers" }, { label: "Use Cases", href: "https://context.dev/#examples" }, { label: "Compare Alternatives", href: "https://context.dev/compare" }, { label: "Free Tools", href: "https://context.dev/free-tools" }, { label: "Glossary", href: "https://context.dev/glossary" }, { label: "HTTP Error Codes", href: "https://context.dev/glossary/http-errors" }, { label: "Startups & nonprofits", href: "https://context.dev/startups" }, { label: "RL Research Grants", href: "https://context.dev/research" }, { label: "Datasets", href: "https://context.dev/datasets" }] },
        { title: "Company", links: [{ label: "Contact", href: "https://context.dev/contact" }, { label: "Affiliates", href: "https://partners.dub.co/context-dev" }, { label: "Brand & Press Kit", href: "https://context.dev/brand" }, { label: "Trust Center", href: "https://trust.context.dev/" }, { label: "Request Brand Update", href: "https://context.dev/update" }] },
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

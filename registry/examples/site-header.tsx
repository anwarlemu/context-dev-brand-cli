import { Building2, Clock, Globe, Layers, MessageSquare, Network, Search } from "lucide-react";

import { SiteHeader, type NavItem } from "@/components/site/site-header";

function ContextLogo() {
  return (
    <span className="flex items-center gap-2 text-h5 font-medium text-fg">
      <svg viewBox="0 0 772.32 531.2" aria-hidden="true" className="h-5 w-auto text-fg-brand">
        <path fill="currentColor" fillRule="evenodd" d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z" />
        <circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
      </svg>
      Context.dev
    </span>
  );
}

const items: NavItem[] = [
  {
    label: "Products",
    columns: 2,
    items: [
      { title: "Scrape anything", description: "Markdown, HTML, images, screenshots, and structured fields.", href: "/web-scraping-api", icon: <Globe /> },
      { title: "Web search", description: "Search the live web for AI agents and LLM apps.", href: "/search-api", icon: <Search /> },
      { title: "Map domains", description: "Discover URLs across a website before you scrape.", href: "/map-api", icon: <Network /> },
      { title: "Run batches", description: "Scrape thousands of URLs or crawl entire websites.", href: "/batches-api", icon: <Layers /> },
      { title: "Answers from the web", description: "Research questions, structured answers, and sources.", href: "/answers-api", icon: <MessageSquare /> },
      { title: "Create monitors", description: "Watch the web for changes and receive updates.", href: "/monitors-api", icon: <Clock /> },
      { title: "Retrieve brand data", description: "Company profile and the website's design system.", href: "/brand-api", icon: <Building2 /> },
    ],
    footer: (
      <>
        <span className="text-fg-muted">Build with</span>
        <a href="https://docs.context.dev" className="font-medium text-fg hover:text-fg-brand">API docs</a>
        <a href="/integrations" className="font-medium text-fg hover:text-fg-brand">SDKs</a>
        <a href="/cli" className="font-medium text-fg hover:text-fg-brand">CLI</a>
        <a href="/mcp" className="font-medium text-fg hover:text-fg-brand">MCP</a>
      </>
    ),
  },
  {
    label: "Use Cases",
    items: [
      { title: "Crawl the web", description: "Every page of a site as clean Markdown.", href: "/use-cases/web-crawling" },
      { title: "Monitor everything", description: "Competitors, prices, subreddits, and regulations.", href: "/use-cases/web-monitoring" },
      { title: "Feed RAG pipelines", description: "Fresh web data, ready to chunk and embed.", href: "/use-cases/rag-pipeline" },
      { title: "Ground AI agents", description: "Live web search and fetch, with sources.", href: "/use-cases/ai-grounding" },
      { title: "Research agents", description: "Cited answers, from one company to a million.", href: "/use-cases/research-agents" },
    ],
  },
  { label: "Customers", href: "/customers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "https://docs.context.dev", external: true },
];

export function Site() {
  return (
    <SiteHeader
      logo={<ContextLogo />}
      logoLabel="Context.dev home"
      announcement={{ text: "Introducing Highlights: the context that matters", href: "/blog/introducing-context-highlights" }}
      items={items}
      secondaryAction={{ label: "Book demo", href: "https://cal.com/context-dev/30min" }}
      primaryAction={{ label: "Start for free", href: "/signup" }}
    />
  );
}

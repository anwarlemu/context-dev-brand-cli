import { Clock, Globe, Layers, MessageSquare } from "lucide-react";

import {
  NavFeaturedCard,
  NavFooterLink,
  NavLinksPanel,
  NavPreviewPanel,
  NavStoriesPanel,
  SiteHeader,
  type NavItem,
  type NavPreviewItem,
} from "@/components/site/site-header";
import { MenuGlyph, type PersonaGlyphName } from "@/components/visuals/persona-glyph";

function ContextMark() {
  return (
    <svg viewBox="0 0 772.32 531.2" aria-hidden="true" className="h-6 w-auto text-fg-brand">
      <path fill="currentColor" fillRule="evenodd" d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z" />
      <circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
    </svg>
  );
}

const products = [
  { title: "Web search", description: "Search the live web for AI agents and LLM apps.", href: "https://context.dev/search-api", glyph: <MenuGlyph name="search" /> },
  { title: "Map domains", description: "Discover URLs across a website before you scrape.", href: "https://context.dev/map-api", glyph: <MenuGlyph name="map" /> },
  { title: "Run batches", description: "Scrape thousands of URLs or crawl entire websites.", href: "https://context.dev/batches-api", glyph: <MenuGlyph name="batches" /> },
  { title: "Answers from the web", description: "Research questions, structured answers, and sources.", href: "https://context.dev/answers-api", glyph: <MenuGlyph name="chat" /> },
  { title: "Create monitors", description: "Watch the web for changes and receive updates.", href: "https://context.dev/monitors-api", glyph: <MenuGlyph name="monitor" /> },
  { title: "Retrieve brand data", description: "Company profile and the website's design system.", href: "https://context.dev/brand-api", glyph: <MenuGlyph name="company" /> },
];

// The preview's white card would play a short story; a few lines stand in for it here.
function PreviewLines({ lines }: { lines: string[] }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-6 font-mono text-caption text-fg-muted">
      {lines.map((line) => (
        <span key={line} className="truncate">
          {line}
        </span>
      ))}
    </div>
  );
}

const useCases: NavPreviewItem[] = [
  {
    id: "web-crawling",
    title: "Crawl the web",
    href: "https://context.dev/use-cases/web-crawling",
    icon: <Layers className="size-4 text-fg-brand" />,
    summary: "Every page of a site as clean Markdown.",
    proof: "SiteGPT moved its crawling off Firecrawl in under a day.",
    preview: <PreviewLines lines={["crawl docs.stripe.com", "1,204 pages found", "# Payments overview"]} />,
  },
  {
    id: "web-monitoring",
    title: "Monitor everything",
    href: "https://context.dev/use-cases/web-monitoring",
    icon: <Clock className="size-4 text-fg-brand" />,
    summary: "Competitors, prices, subreddits, and regulations.",
    proof: "Dench CRM opened $3M+ in pipeline from Reddit leads.",
    preview: <PreviewLines lines={["watch r/saas every hour", "3 new matches", "webhook sent"]} />,
  },
  {
    id: "rag-pipeline",
    title: "Feed RAG pipelines",
    href: "https://context.dev/use-cases/rag-pipeline",
    icon: <Globe className="size-4 text-fg-brand" />,
    summary: "Fresh web data, ready to chunk and embed.",
    proof: "Agently swapped the scraper behind its company brain the same day.",
    preview: <PreviewLines lines={["help.notion.com", "312 chunks", "index refreshed"]} />,
  },
  {
    id: "research-agents",
    title: "Research agents",
    href: "https://context.dev/use-cases/research-agents",
    icon: <MessageSquare className="size-4 text-fg-brand" />,
    summary: "Cited answers, from one company to a million.",
    proof: "Bystreet has run 1M+ scrapes for its research agent.",
    preview: <PreviewLines lines={["Who are Linear's competitors?", "5 sources", "answer ready"]} />,
  },
];

// The phone menu draws each use case with its persona glyph, as the site does.
const useCaseGlyphs: Record<string, PersonaGlyphName> = { "web-crawling": "batches", "web-monitoring": "history", "rag-pipeline": "database", "research-agents": "search" };

function StoryMark({ name }: { name: string }) {
  return <div className="flex size-full items-center justify-center text-h4 text-on-brand">{name}</div>;
}

const items: NavItem[] = [
  {
    label: "Products",
    width: "min(920px, calc(100vw - 8rem))",
    panel: (
      <NavLinksPanel
        featured={
          <NavFeaturedCard
            href="https://context.dev/web-scraping-api"
            title="Scrape anything"
            description="Scrape any URL with a 99.96% success rate."
            cta="Explore Scrape anything"
          />
        }
        items={products}
        footer={
          <>
            <span className="text-fg-nav">Build with</span>
            <NavFooterLink href="https://docs.context.dev" external>
              API docs
            </NavFooterLink>
            <NavFooterLink href="https://context.dev/integrations">SDKs</NavFooterLink>
            <NavFooterLink href="https://context.dev/cli">CLI</NavFooterLink>
            <NavFooterLink href="https://context.dev/mcp">MCP</NavFooterLink>
          </>
        }
      />
    ),
    items: [{ title: "Scrape anything", href: "https://context.dev/web-scraping-api", glyph: <MenuGlyph name="scrape" /> }, ...products],
  },
  {
    label: "Use Cases",
    width: "min(920px, calc(100vw - 12rem))",
    panel: <NavPreviewPanel items={useCases} footerLink={{ label: "All customer stories", href: "https://context.dev/customers" }} />,
    mobile: [
      { label: "Scraping & AI agents", links: useCases.map((useCase) => ({ label: useCase.title, href: useCase.href, icon: <MenuGlyph name={useCaseGlyphs[useCase.id]} /> })) },
      {
        label: "Product & brand experiences",
        links: [
          { label: "Enrich Any Entity", href: "https://context.dev/use-cases/enrich-company-profiles", icon: <MenuGlyph name="company" /> },
          { label: "Programmatic Theming", href: "https://context.dev/use-cases/programmatic-theming", icon: <MenuGlyph name="whitelabel" /> },
        ],
      },
    ],
  },
  {
    label: "Customers",
    width: "610px",
    panel: (
      <NavStoriesPanel
        viewAll={{ label: "View all stories", href: "https://context.dev/customers" }}
        stories={[
          { name: "SiteGPT", summary: "Moved its crawling off Firecrawl in under a day.", href: "https://context.dev/customers/sitegpt", visual: <StoryMark name="SiteGPT" /> },
          { name: "Bystreet", summary: "Has run over a million scrapes for its research agent.", href: "https://context.dev/customers/bystreet", visual: <StoryMark name="Bystreet" /> },
        ]}
      />
    ),
    mobile: [{ links: [{ label: "All customer stories", href: "https://context.dev/customers" }] }],
  },
  { label: "Pricing", href: "https://context.dev/pricing" },
  { label: "Docs", href: "https://docs.context.dev", external: true },
];

export function Site() {
  return (
    <SiteHeader
      logo={<ContextMark />}
      wordmark="Context.dev"
      logoLabel="Context.dev"
      announcement={{ text: "Introducing Highlights: the context that matters", href: "https://context.dev/blog/introducing-context-highlights", external: true }}
      items={items}
      secondaryAction={{ label: "Book demo", href: "https://cal.com/context-dev/30min" }}
      mobileSecondaryAction={{ label: "Log in", href: "https://context.dev/login" }}
      primaryAction={{ label: "Start for free", href: "https://context.dev/signup" }}
    />
  );
}

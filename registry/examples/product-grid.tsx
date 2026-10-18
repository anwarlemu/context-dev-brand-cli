import { SiteSection } from "@/components/site/section";
import { DotGlyph } from "@/components/ui/dot-glyph";
import { ProductGrid } from "@/components/site/product-grid";

// Stand-ins for the products' dot stories, which come later.
const SEARCH = ["22222..", "2...2..", "2...2..", "22222..", "....22.", ".....22", "......2"];
const PAGE = ["22222", "2...2", "2.2.2", "2...2", "22222"];
const ANSWER = ["..2..", ".222.", "22222", ".222.", "..2.."];
const WATCH = ["1.1.1", ".2.2.", "1.2.1", ".2.2.", "1.1.1"];

export function Site() {
  return (<SiteSection>
    <ProductGrid
      className="w-full"
      products={[
        { name: "Search", description: "Search the web or the news and get ranked results with clean page content, not just links.", tags: ["Fresh sources for RAG", "Company news", "Agent web search"], href: "https://context.dev/search", media: <DotGlyph rows={SEARCH} className="size-24 text-brand" /> },
        { name: "Scrape", description: "Turn any page or PDF into Markdown, HTML, structured fields, images, or screenshots in one request.", tags: ["Scrape to Markdown", "Onboarding autofill", "PDF parsing"], href: "https://context.dev/web-scraping-api", media: <DotGlyph rows={PAGE} className="size-24 text-brand" /> },
        { name: "Research", description: "Ask a research question and get a structured answer in your JSON shape, with the sources behind it.", tags: ["Company research", "Entity enrichment", "Cited answers"], href: "https://context.dev/research", media: <DotGlyph rows={ANSWER} className="size-24 text-brand" /> },
        { name: "Monitor", description: "Watch pages on a schedule and get notified when pricing, content, or pages change.", tags: ["Pricing changes", "New pages", "Webhook updates"], href: "https://context.dev/monitors", media: <DotGlyph rows={WATCH} className="size-24 text-brand" /> },
      ]}
      more={[
        { label: "Crawl", href: "https://context.dev/data/crawl-website-api" },
        { label: "Map URLs", href: "https://context.dev/map" },
        { label: "Batches", href: "https://context.dev/batches" },
        { label: "HTML scraping", href: "https://context.dev/data/web-scrape-html-api" },
        { label: "Screenshots", href: "https://context.dev/data/screenshot-api" },
        { label: "Brand data", href: "https://context.dev/data/brand-data" },
        { label: "Logos", href: "https://context.dev/data/logo-api" },
        { label: "Fonts", href: "https://context.dev/data/font-api" },
      ]}
    />
  </SiteSection>);
}

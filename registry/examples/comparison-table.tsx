import { ComparisonTable } from "@/components/site/comparison-table";

export function Site() {
  return (
    <ComparisonTable
      className="w-full"
      caption="Context.dev compared with Firecrawl"
      columns={[
        { key: "firecrawl", header: "Firecrawl", caption: "scraping API" },
        { key: "context", header: "Context.dev", caption: "one API key", highlight: true },
      ]}
      rows={[
        { category: "Scraping and crawling", feature: "Scrape to Markdown or HTML", context: true, firecrawl: true },
        { category: "Scraping and crawling", feature: "JSON extraction against your schema", context: "5 credits", firecrawl: "5 credits" },
        { category: "Scraping and crawling", feature: "Async batch scraping", context: "Up to 25,000 URLs", firecrawl: true },
        { category: "Scraping and crawling", feature: "JSON extraction inside batches", context: false, firecrawl: true },
        { category: "Interaction and search", feature: "Search 10 results with page Markdown", context: "2 credits", firecrawl: "12 credits" },
        { category: "Interaction and search", feature: "Live multi-step browser sessions", context: false, firecrawl: { partial: "Billed per minute" } },
        { category: "Pricing and billing", feature: "Highlights (relevant passages)", context: "+1 credit", firecrawl: "+4 credits" },
        { category: "Pricing and billing", feature: "Zero data retention", context: "No extra credits", firecrawl: "+1 credit/page" },
        { category: "Brand and company data", feature: "Brand profile by domain, name, email, or ticker", context: true, firecrawl: false },
        { category: "Brand and company data", feature: "Logo CDN for direct embedding (Logo Link)", context: true, firecrawl: false },
      ]}
      footnote="Prices and features checked May 2026."
    />
  );
}

import { ComparisonTable } from "@/components/site/comparison-table";

// A use-case page's comparison: answers in words, the alternative first and the brand's column last.
export function Site() {
  return (
    <ComparisonTable
      className="w-full"
      caption="Context.dev compared with your own crawler"
      columns={[
        { key: "alternative", header: "Your own crawler", caption: "build and maintain" },
        { key: "context", header: "Context.dev", caption: "one API key", highlight: true },
      ]}
      rows={[
        { feature: "JavaScript-heavy pages", alternative: "Run and scale a fleet of headless browsers", context: "Every page rendered in a real browser" },
        { feature: "Bot protection", alternative: "Buy proxies, rotate them, and write retry logic", context: "Automatic proxy escalation and retries" },
        { feature: "Clean output", alternative: "Write HTML-to-Markdown cleanup for every site", context: "Markdown with the main content only" },
        { feature: "Large sites", alternative: "Build queues and workers to fan out", context: "Up to 100,000 pages per batch crawl" },
        { feature: "Cost", alternative: "Servers, proxies, and engineering time", context: "1 credit per page, failed pages are free" },
      ]}
    />
  );
}

// An alternatives page's full comparison: checks, dashes and short figures under category headings.
export function Marks() {
  return (
    <ComparisonTable
      className="w-full"
      variant="marks"
      caption="Context.dev compared with Firecrawl"
      columns={[
        { key: "context", header: "Context.dev", highlight: true },
        { key: "firecrawl", header: "Firecrawl" },
      ]}
      rows={[
        { category: "Scraping & Crawling", feature: "Scrape to Markdown or HTML", context: true, firecrawl: true },
        { category: "Scraping & Crawling", feature: "JSON extraction against your schema", context: "5 credits", firecrawl: "5 credits" },
        { category: "Scraping & Crawling", feature: "Async batch scraping", context: "Up to 100,000 URLs", firecrawl: true },
        { category: "Scraping & Crawling", feature: "JSON extraction inside batches", context: false, firecrawl: true },
        { category: "Interaction & Search", feature: "Search 10 results with page Markdown", context: "2 credits", firecrawl: "12 credits" },
        { category: "Interaction & Search", feature: "Live multi-step browser sessions", context: false, firecrawl: "Billed per minute" },
        { category: "Pricing & Billing", feature: "Highlights (relevant passages)", context: "+1 credit", firecrawl: "+4 credits" },
        { category: "Pricing & Billing", feature: "Zero data retention", context: "No extra credits", firecrawl: "+1 credit/page" },
        { category: "Also Included: Brand & Company Data", feature: "Brand profile by domain, name, email, or ticker", context: true, firecrawl: false },
        { category: "Also Included: Brand & Company Data", feature: "Logo CDN for direct embedding (Logo Link)", context: true, firecrawl: false },
      ]}
      footnote="Prices and features checked May 2026."
    />
  );
}

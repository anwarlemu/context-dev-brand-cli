import { Button } from "@/components/ui/button";
import { Hero, HeroMedia } from "@/components/site/hero";
import {
  AlternativeComparisonTable,
  AlternativeCostCard,
  AlternativeFitGuide,
  AlternativePricingTable,
  AlternativeReasons,
  AlternativeRelated,
  AlternativeRequestCosts,
} from "@/components/site/alternative-sections";

// The site's Firecrawl comparison, in the order the compare pages run.
export function Site() {
  return (
    <div className="w-full">
      <Hero
        title="The top Firecrawl alternative"
        accent="Firecrawl alternative"
        description="Scrape, crawl, map, and search the web with more concurrency and a lower price per page."
        actions={
          <>
            <Button variant="pill" asChild><a href="https://context.dev/signup">Get API access free</a></Button>
            <Button variant="pill-outline" asChild><a href="https://docs.context.dev">View documentation</a></Button>
          </>
        }
        media={
          <HeroMedia>
            <AlternativeCostCard
              ours="Context.dev"
              competitor="Firecrawl"
              title="What $99 a month buys"
              note="Pro vs Standard, October 2026 list prices"
              metrics={[
                { label: "Price per 1,000 pages, JavaScript rendering and proxies included", ours: { amount: 0.79, display: "$0.79", detail: "Pro, 125,000 credits" }, theirs: { amount: 0.99, display: "$0.99", detail: "Standard, 100,000 credits" } },
                { label: "Requests running at the same time", ours: { amount: 100, display: "100", detail: "concurrent requests" }, theirs: { amount: 25, display: "25", detail: "concurrent browsers", flag: "4x fewer" } },
              ]}
              footnote="Both bill 1 credit for a standard scrape with JavaScript rendering and proxy escalation included."
            />
          </HeroMedia>
        }
      />
      <AlternativeReasons
        description="Firecrawl and Context.dev both scrape, crawl, map, and search the web at 1 credit per page. Context.dev gives you more credits and more concurrent requests on every paid plan."
        reasons={[
          { tag: "Key difference", title: "25% more credits and 4x the concurrency for the same $99", body: "Context.dev Pro is $99 a month for 125,000 credits and 100 concurrent requests. Firecrawl Standard is $99 for 100,000 credits and 25 concurrent browsers." },
          { tag: "Billing", title: "Blocked pages are not billed", body: "On Context.dev, a scrape where every output fails costs nothing. Failed pages in a batch are refunded when the batch settles." },
          { tag: "Add-ons", title: "Fewer paid add-ons per page", body: "Highlights on a scrape add 1 credit instead of 4, and zero data retention adds nothing." },
        ]}
      />
      <AlternativeRequestCosts
        ours="Context.dev"
        competitor="Firecrawl"
        description="What 1,000 requests cost on each $99 plan. Both APIs bill 1 credit for a standard scrape, so the gap comes from how many credits $99 buys and from what each one bills on top."
        rows={[
          { request: "Scrape a page to Markdown or HTML", detail: "JavaScript rendering and proxy escalation included on both", ours: "$0.79 (1 credit)", theirs: "$0.99 (1 credit)", difference: "25% more", tone: "more" },
          { request: "A page that comes back 403", detail: "Blocked after the proxy retry", ours: "$0", theirs: "$0.99 (1 credit)", difference: "Billed", tone: "extra" },
          { request: "Map site URLs", detail: "Up to 5,000 links from one request", ours: "$0.79 (1 credit)", theirs: "$0.99 (1 credit)", difference: "Same", tone: "same" },
        ]}
        footnote="Derived from Context.dev Pro ($99 for 125,000 credits) and Firecrawl Standard ($99 for 100,000 credits) at monthly billing, per 1,000 requests."
      />
      <AlternativeComparisonTable
        ours="Context.dev"
        competitor="Firecrawl"
        rows={[
          { category: "Scraping & Crawling", feature: "Scrape to Markdown or HTML", ours: true, theirs: true },
          { category: "Scraping & Crawling", feature: "Screenshots and image extraction", ours: true, theirs: "URLs expire in 24h" },
          { category: "Scraping & Crawling", feature: "JSON extraction against your schema", ours: "5 credits", theirs: "5 credits" },
          { category: "Deployment", feature: "Self-hosted open source", ours: false, theirs: "AGPL-3.0" },
        ]}
      />
      <AlternativePricingTable
        ours="Context.dev"
        competitor="Firecrawl"
        description="Public list prices on both sites, broken down to the cost of scraping 1,000 pages at each tier."
        tiers={[
          { tier: "Free", ours: { plan: "Free", price: "$0/mo", credits: "1,000 credits", concurrency: "5 concurrent", costLines: [{ amount: "$0", label: "per 1,000 pages" }] }, theirs: { plan: "Free", price: "$0/mo", credits: "500 credits, one time", concurrency: "2 concurrent", costLines: [{ amount: "$0", label: "per 1,000 pages", emphasis: true }] } },
          { tier: "Mid", ours: { plan: "Pro", price: "$99/mo", credits: "125,000 credits", concurrency: "100 concurrent", costLines: [{ amount: "$0.79", label: "per 1,000 pages" }] }, theirs: { plan: "Standard", price: "$99/mo", credits: "100,000 credits", concurrency: "25 concurrent browsers", costLines: [{ amount: "$0.99", label: "per 1,000 pages", emphasis: true }, { amount: "$2.50", label: "per 1,000 overage credits" }] } },
          { tier: "Enterprise", ours: { plan: "Scale", price: "$499/mo", credits: "1,000,000 credits", concurrency: "500 concurrent", costLines: [{ amount: "$0.50", label: "per 1,000 pages" }] }, theirs: { missing: "Custom pricing on request" } },
        ]}
        footnotes={[{ content: "Cost per 1,000 pages assumes 1 credit per page, the base scrape price on both APIs.", strong: true }, { content: "Prices are from each provider's public pricing page." }]}
        checkedOn={{ iso: "2026-10-18", label: "October 18, 2026" }}
      />
      <AlternativeFitGuide
        description={
          <>
            Both are capable web data APIs. These are the cases where the choice is clear. For formats, pricing, and code, see the <a href="https://context.dev/scrape">Context.dev web scraping API</a>.
          </>
        }
        columns={[
          { title: "Choose Context.dev if", points: ["You scrape at volume and want a lower price per page.", "You also need brand or company data on the same key."] },
          { title: "Choose Firecrawl if", points: ["You need to self-host.", "You need long, live browser sessions."] },
        ]}
        storiesTitle="Teams that switched from Firecrawl"
        stories={[{ quote: "Pricing was what triggered it, and responsive support sealed the deal.", person: "Bhanu, founder of SiteGPT", href: "https://context.dev/customers", linkLabel: "Read the SiteGPT story" }]}
      />
      <AlternativeRelated
        description={
          <>
            Other web scraping APIs that teams compare with Context.dev, or <a href="https://context.dev/compare">see every comparison</a>.
          </>
        }
        items={[
          { href: "https://context.dev/compare/the-top-scraperapi-alternative", glyph: "shield", title: "Context.dev vs ScraperAPI", description: "No credit multipliers for JavaScript rendering or protected domains." },
          { href: "https://context.dev/compare/the-top-scrapingbee-alternative", glyph: "report", title: "Context.dev vs ScrapingBee", description: "JavaScript rendering, premium proxies, and stealth mode stack credits on ScrapingBee." },
          { href: "https://context.dev/compare/the-top-zenrows-alternative", glyph: "bolt", title: "Context.dev vs ZenRows", description: "A rendered page on premium proxies costs 25 credits on ZenRows. Pro covers 125,000 protected pages for $99." },
        ]}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Hero, HeroMedia } from "@/components/site/hero";
import {
  AlternativeComparisonTable,
  AlternativeFitGuide,
  AlternativePricingTable,
  AlternativeQuickCompare,
  AlternativeReasons,
} from "@/components/site/alternative-sections";

const QUICK = [
  { feature: "Scrape to Markdown or HTML", ours: true, theirs: true },
  { feature: "Search with page Markdown", ours: "2 credits", theirs: "12 credits" },
  { feature: "Zero data retention", ours: "Included", theirs: "+1 credit/page" },
  { feature: "Brand data on the same key", ours: true, theirs: false },
];

export function Site() {
  return (
    <div className="w-full">
      <Hero
        title="The top Firecrawl alternative"
        accent="Firecrawl alternative"
        description="Scrape, crawl, map, and search the web with more concurrency and a lower price per page."
        actions={
          <>
            <Button variant="pill">Get API access free</Button>
            <Button variant="pill-outline">View documentation</Button>
          </>
        }
        media={
          <HeroMedia>
            <AlternativeQuickCompare ours="Context.dev" competitor="Firecrawl" rows={QUICK} />
          </HeroMedia>
        }
      />
      <AlternativeReasons
        description="Both scrape, crawl, map, and search the web. Context.dev gives you more concurrent requests and a lower price per page on every paid plan."
        reasons={[
          { tag: "Key difference", title: "The same scraping toolkit, with more headroom per dollar", body: "Scrape pages to Markdown, HTML, screenshots, images, or JSON against your schema, with more credits and concurrency on every paid plan." },
          { tag: "Search", title: "Search that reads the results for 2 credits, not 12", body: "Ten results with Markdown cost 2 credits." },
          { tag: "Billing", title: "Fewer paid add-ons", body: "Highlights add 1 credit instead of 4, and zero data retention adds nothing." },
        ]}
      />
      <AlternativeComparisonTable
        ours="Context.dev"
        competitor="Firecrawl"
        rows={[
          { category: "Scraping and crawling", feature: "Scrape to Markdown or HTML", ours: true, theirs: true },
          { category: "Scraping and crawling", feature: "Async batch scraping", ours: "Up to 100,000 URLs", theirs: true },
          { category: "Deployment", feature: "Self-hosted open source", ours: false, theirs: "AGPL-3.0" },
        ]}
      />
      <AlternativePricingTable
        ours="Context.dev"
        competitor="Firecrawl"
        description="Public list prices on both sites, broken down to the cost of scraping 1,000 pages at each tier."
        tiers={[
          { tier: "Entry", ours: { plan: "Developer", price: "$19/mo", credits: "20,000 credits", concurrency: "10 concurrent", costPerThousand: "$0.95" }, theirs: { plan: "Hobby", price: "$19/mo", credits: "3,000 credits", concurrency: "5 concurrent", costPerThousand: "$6.33" } },
          { tier: "Mid", ours: { plan: "Pro", price: "$99/mo", credits: "150,000 credits", concurrency: "50 concurrent", costPerThousand: "$0.66" }, theirs: { plan: "Standard", price: "$99/mo", credits: "100,000 credits", concurrency: "50 concurrent", costPerThousand: "$0.99" } },
        ]}
        footnotes={[{ content: "Cost per 1,000 pages assumes 1 credit per page, the base scrape price on both APIs.", strong: true }, { content: "Prices are from each provider's public pricing page." }]}
      />
      <AlternativeFitGuide
        description="Both are capable web data APIs. These are the cases where the choice is clear."
        columns={[
          { title: "Choose Context.dev if", points: ["You scrape at volume and want a lower price per page.", "You also need brand or company data."] },
          { title: "Choose Firecrawl if", points: ["You need to self-host.", "You need long, live browser sessions."] },
        ]}
        storiesTitle="Teams that switched"
        stories={[{ quote: "Pricing was what triggered it, and responsive support sealed the deal.", person: "A founder", href: "/customers", linkLabel: "Read the story" }]}
      />
    </div>
  );
}

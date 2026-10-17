import {
  ProductCapabilityList,
  ProductCodeExplorer,
  ProductComparison,
  ProductCtaPanel,
  ProductCustomerRow,
  ProductPageFaq,
  ProductPillLink,
  ProductRelatedCards,
  ProductStageHero,
  ProductStats,
  ProductStepsTimeline,
} from "@/components/site/product-page";
import { SearchStory } from "@/components/visuals/stories/search-story";

const TS = `import ContextDev from 'context.dev';

const client = new ContextDev();

const results = await client.web.search({
  query: 'latest AI agent frameworks',
  include: { markdown: true },
});`;

const PY = `from context_dev import ContextDev

client = ContextDev()

results = client.web.search(
    query="latest AI agent frameworks",
    include={"markdown": True},
)`;

const CURL = `curl https://api.context.dev/v1/web/search \\
  -H "Authorization: Bearer $CONTEXT_DEV_API_KEY" \\
  -d '{"query": "latest AI agent frameworks"}'`;

const LOGO = (label: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="112" height="30"><text x="0" y="22" font-family="sans-serif" font-size="20">${label}</text></svg>`)}`;

export function Site() {
  return (
    <div className="w-full">
      <ProductStageHero
        title={["Search the web.", "Read every result."]}
        description="Ranked results with clean page content, so your agent reads the sources instead of guessing from links."
        actions={
          <>
            <ProductPillLink href="/signup">Get API key</ProductPillLink>
            <ProductPillLink variant="secondary" href="https://docs.context.dev" target="_blank" rel="noopener noreferrer">
              View documentation
            </ProductPillLink>
          </>
        }
        caption="POST /web/search · 10 results with Markdown · 2 credits"
      >
        <div className="flex min-h-80 w-full max-w-170 items-center justify-center rounded-shell bg-surface p-8">
          <div className="relative w-full max-w-[26rem]">
            <SearchStory />
          </div>
        </div>
      </ProductStageHero>
      <ProductCustomerRow lead="Backed by Y Combinator. Teams build with Context.dev." logos={["Mintlify", "daily.dev", "Daydream", "Super.com"].map((name) => ({ name, src: LOGO(name) }))} />
      <ProductStats
        stats={[
          { value: "2", label: "Credits for 10 results with Markdown" },
          { value: "<1s", label: "Median response" },
          { value: "100", label: "Results per query" },
          { value: "99.9%", label: "Uptime" },
        ]}
      />
      <ProductCapabilityList
        label="Search capabilities"
        capabilities={[
          { title: "Pages, not links", description: "Each result can carry its page as Markdown, or just the passages that answer your query." },
          { title: "Web and news", description: "Search the open web or recent news with the same call and the same result shape." },
          { title: "Filters that hold", description: "Limit by domain, date, and country so the results match the question." },
        ]}
      />
      <ProductCodeExplorer
        title={["One call.", "Every result, readable."]}
        description="Install the SDK for your language and send your first query in a few lines."
        samples={[
          { language: "typescript", label: "TypeScript", code: TS, filename: "search.ts", install: "npm install context.dev" },
          { language: "python", label: "Python", code: PY, filename: "search.py", install: "pip install context-dev" },
          { language: "curl", label: "cURL", code: CURL, filename: "search.sh", install: null },
        ]}
        links={[
          { label: "Read the API reference", href: "https://docs.context.dev", external: true },
          { label: "Try in the playground", href: "/playground" },
        ]}
      />
      <ProductComparison
        title={["Search that reads", "the results for you."]}
        description="What it takes to get readable sources for an agent, by approach."
        columns={[
          { name: "Context.dev", caption: "search + markdown", highlighted: true },
          { name: "Search API", caption: "links only" },
          { name: "Search + scraper", caption: "two vendors" },
        ]}
        rows={[
          { label: "Page content", values: ["Included", "Not included", "Extra request per page"] },
          { label: "Cost for 10 pages", values: ["2 credits", "1 query", "1 query + 10 scrapes"] },
        ]}
        note={
          <>
            Prices from each provider&apos;s public pricing. <a href="/pricing">See our pricing</a>
          </>
        }
      />
      <ProductStepsTimeline
        steps={[
          { title: "Get a key", description: "Sign up and copy your API key from the dashboard.", snippet: "CONTEXT_DEV_API_KEY" },
          { title: "Send a query", description: "Call /web/search with your query and the content you want back.", snippet: "POST /web/search" },
          { title: "Ship it", description: "Feed the results into your agent or your index." },
        ]}
      />
      <ProductPageFaq
        id="search"
        description={
          <>
            More details in the <a href="https://docs.context.dev">API documentation</a>.
          </>
        }
        faqs={[
          { question: "How fresh are the results?", answer: "Results come from a live search at request time." },
          { question: "Can I search news only?", answer: "Yes. Set the source to news to get recent articles with their dates." },
        ]}
      />
      <ProductRelatedCards
        products={[
          { name: "Answers", href: "/answers-api", description: "Ask a question and get a structured answer with its sources." },
          { name: "Scrape", href: "/web-scraping-api", description: "Turn any page into Markdown, HTML, JSON, or a screenshot." },
        ]}
      />
      <ProductCtaPanel
        description="One API key for scraping, research, brand data, batches, and monitoring."
        actions={
          <>
            <ProductPillLink tone="light" href="/signup">
              Get API key
            </ProductPillLink>
            <ProductPillLink tone="light" variant="secondary" href="https://docs.context.dev">
              View documentation
            </ProductPillLink>
          </>
        }
      />
    </div>
  );
}

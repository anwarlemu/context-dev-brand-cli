import { CustomerStoriesCarousel, CustomerStoryCard } from "@/components/site/customer-stories";
import { Button } from "@/components/ui/button";
import { DotGlyph } from "@/components/ui/dot-glyph";

// The brand draws each logo in white dots on the blue; a dot glyph stands in for the real artwork here.
const MARK = ["0022200", "0211120", "2110112", "2101012", "2110112", "0211120", "0022200"];

function Mark() {
  return <DotGlyph rows={MARK} className="size-28" />;
}

export function Site() {
  return (
    <div className="flex w-full flex-col gap-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="mb-6 text-h2 leading-tight tracking-tight text-balance text-fg">
          <span className="text-fg-brand">How customers shipped</span> with Context.dev
        </h2>
        <p className="mx-auto max-w-md text-body leading-relaxed text-fg-muted">From scrappy startups to Fortune 500s, teams ship brand-powered features in days instead of quarters.</p>
        <Button asChild variant="pill-outline" className="mt-8">
          <a href="https://context.dev/customers">See all customers</a>
        </Button>
      </div>

      <CustomerStoriesCarousel tone="light" showRules>
        <CustomerStoryCard
          key="mastra"
          company="Mastra"
          logo={<Mark />}
          date="September 12, 2026"
          dateTime="2026-09-12"
          description="Mastra built an onboarding MVP in an hour with Context.dev, pre-filling names and company details and tailoring the experience to each user's goals."
          href="https://context.dev/blog/mastra-personalizes-onboarding-with-context-dev"
        />
        <CustomerStoryCard
          key="tinfoil"
          company="Tinfoil"
          logo={<Mark />}
          date="September 11, 2026"
          dateTime="2026-09-11"
          description="Tinfoil added Context.dev scraping and metadata to its web search agent in under five minutes."
          href="https://context.dev/blog/tinfoil-switches-to-context-dev-for-zero-data-retention-web-scraping"
        />
        <CustomerStoryCard
          key="instant"
          company="Instant"
          logo={<Mark />}
          date="August 24, 2026"
          dateTime="2026-08-24"
          description="Instant uses Context.dev to give its AI Shopify builder brand kits, URL-based inspiration, and reliable page context."
          href="https://context.dev/blog/instant-switches-from-firecrawl-to-context-dev-in-under-a-day"
        />
        <CustomerStoryCard
          key="similarweb"
          company="Similarweb"
          logo={<Mark />}
          date="July 1, 2026"
          dateTime="2026-07-01"
          description="Raz uses Context.dev to give Similarweb AI agents the datapoints they need, combining scrape and brand APIs instead of building the web context layer in house."
          href="https://context.dev/blog/similarweb-10x-ai-agents-with-context-dev"
        />
        <CustomerStoryCard
          key="mintlify"
          company="Mintlify"
          logo={<Mark />}
          date="March 4, 2026"
          dateTime="2026-03-04"
          description="Mintlify turns GitHub repos into branded docs sites, pulling each company's logo and colors from Context.dev at sign-up."
          href="https://context.dev/blog/mintlify-turns-github-repos-into-branded-docs-sites-with-brand-dev"
        />
      </CustomerStoriesCarousel>
    </div>
  );
}

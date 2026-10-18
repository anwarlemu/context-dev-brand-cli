import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { UseCaseHowItWorks, UseCaseStepCards } from "@/components/site/use-case-how-it-works";

const TS = `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY });

const crawl = await client.web.crawl({
  url: 'https://docs.stripe.com',
  maxPages: 500,
  formats: { markdown: true },
});

for (const page of crawl.pages) {
  console.log(page.url, page.markdown.length);
}`;

const PY = `from context_dev import ContextDev

client = ContextDev(api_key=os.environ["CONTEXT_DEV_API_KEY"])

crawl = client.web.crawl(
    url="https://docs.stripe.com",
    max_pages=500,
    formats={"markdown": True},
)

for page in crawl.pages:
    print(page.url, len(page.markdown))`;

const CURL = `curl https://api.context.dev/v1/web/crawl \\
  -H "Authorization: Bearer $CONTEXT_DEV_API_KEY" \\
  -d '{ "url": "https://docs.stripe.com", "maxPages": 500 }'`;

export function Site() {
  return (
    <div className="flex w-full flex-col">
      <SiteSection lines>
        <SectionHeading title="Crawl a site in" accent="three steps." description="Point it at a domain, choose the formats, and read every page back as clean Markdown." />
        <SectionHeaderRule />
        <UseCaseHowItWorks
          steps={[
            { title: "Get an API key", description: "Sign up and copy your key from the dashboard." },
            { title: "Start a crawl", description: "Send the start URL and how many pages to follow." },
            { title: "Read the pages", description: "Each page comes back as Markdown, HTML or JSON." },
          ]}
          samples={[
            { language: "typescript", label: "TypeScript", filename: "crawl.ts", code: TS, install: "npm install context.dev" },
            { language: "python", label: "Python", filename: "crawl.py", code: PY, install: "pip install context-dev" },
            { language: "curl", label: "cURL", filename: "crawl.sh", code: CURL, install: null },
          ]}
          docs={{ label: "Read the crawl docs", href: "https://docs.context.dev" }}
          note="Free to start: 1,000 credits a month, no card needed."
        />
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="From URL to" accent="answer." />
        <SectionHeaderRule />
        <UseCaseStepCards
          steps={[
            { title: "Search", description: "Find the pages that answer the question.", code: `const results = await client.web.search({\n  query: 'stripe usage based billing',\n});` },
            { title: "Scrape", description: "Read each result as Markdown.", code: `const page = await client.web.scrape({\n  url: results[0].url,\n  formats: { markdown: true },\n});` },
            { title: "Answer", description: "Hand the pages to your model with their sources.", code: `const answer = await model.generate({\n  context: page.markdown.data,\n});` },
          ]}
          links={[
            { label: "Search API", href: "https://context.dev/products/search" },
            { label: "Scrape API", href: "https://context.dev/products/scrape" },
          ]}
        />
      </SiteSection>
    </div>
  );
}

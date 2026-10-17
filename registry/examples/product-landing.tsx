import { DotGlyph } from "@/components/ui/dot-glyph";
import { CodeBlock, CodeWindow, WindowCopyButton } from "@/components/site/code-window";
import { ProductFaq, ProductIntegration, ProductStorySection } from "@/components/site/product-landing";

// Stand-ins for the products' dot stories.
const PAGE = ["22222", "2...2", "2.2.2", "2...2", "22222"];
const CLICK = ["2....", "22...", "222..", "2222.", "22..."];
const CLOCK = [".222.", "2.2.2", "2.22.", "2...2", ".222."];
const story = (rows: string[]) => <DotGlyph rows={rows} className="size-24 text-brand" />;

const CODE = `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY });

const page = await client.web.scrape({
  url: 'https://linear.app',
  formats: { markdown: true, screenshot: true },
});`;

export function Site() {
  return (
    <div className="w-full">
      <ProductStorySection
        title="Any page, any format."
        accent="One request."
        description="Choose the outputs your product needs and get them back together, from clean Markdown to a full-page screenshot."
        items={[
          { title: "Every output format", description: "Markdown, HTML, links, images, JSON, and screenshots from the same request.", story: story(PAGE) },
          { title: "Browser actions", description: "Click, scroll, or wait for a selector before the page is captured.", story: story(CLICK) },
          { title: "Fresh or cached", description: "Read the live page, or reuse a recent copy when speed matters more.", story: story(CLOCK) },
        ]}
      />
      <ProductIntegration
        title="Scrape your first page"
        accent="in a few lines."
        description="Install the SDK, pass a URL and the formats you want, and get everything back in one response."
        install="npm install context.dev"
        docsHref="https://docs.context.dev"
        code={
          <CodeWindow label="TypeScript" actions={<WindowCopyButton value={CODE} />}>
            <div className="overflow-x-auto">
              <CodeBlock code={CODE} />
            </div>
          </CodeWindow>
        }
      />
      <ProductStorySection
        columns={2}
        title="From a single page"
        accent="to your next feature."
        description="Feed your knowledge pipeline, or collect pages across a much larger job with the same API key."
        items={[
          { title: "Ground RAG in fresh content", description: "Crawl a sitemap, convert every page to clean Markdown, and send it straight into your embeddings.", story: story(PAGE) },
          { title: "Run batches at scale", description: "Scrape thousands of URLs in one job, then collect the results when the batch completes.", story: story(CLOCK) },
        ]}
      />
      <ProductFaq
        id="scrape"
        docsHref="https://docs.context.dev"
        faqs={[
          { question: "Does it render JavaScript?", answer: "Yes. Every request loads in a real browser, so single-page apps come back fully rendered." },
          { question: "What does a scrape cost?", answer: "One credit per page for the base formats. Screenshots and JSON extraction add a few credits." },
          { question: "Can I scrape PDFs?", answer: "Yes. Pass a PDF's URL and get its text back as Markdown." },
        ]}
      />
    </div>
  );
}

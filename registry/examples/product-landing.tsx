import { CodeBlock, CodeWindow, WindowCopyButton } from "@/components/site/code-window";
import { ProductFaq, ProductIntegration, ProductLandingSteps, ProductRelatedCards, ProductStorySection } from "@/components/site/product-landing";
import { ActionsStory } from "@/components/visuals/stories/actions-story";
import { BatchStory } from "@/components/visuals/stories/batch-story";
import { FreshnessStory } from "@/components/visuals/stories/freshness-story";
import { OutputStory } from "@/components/visuals/stories/output-story";
import { RagStory } from "@/components/visuals/stories/rag-story";

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
          { title: "Every output format", description: "Markdown, HTML, links, images, JSON, and screenshots from the same request.", story: <OutputStory className="w-full" /> },
          { title: "Browser actions", description: "Click, scroll, or wait for a selector before the page is captured.", story: <ActionsStory className="w-full" /> },
          { title: "Fresh or cached", description: "Read the live page, or reuse a recent copy when speed matters more.", story: <FreshnessStory className="w-full" /> },
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
          { title: "Ground RAG in fresh content", description: "Crawl a sitemap, convert every page to clean Markdown, and send it straight into your embeddings.", story: <RagStory className="w-full" /> },
          { title: "Run batches at scale", description: "Scrape thousands of URLs in one job, then collect the results when the batch completes.", story: <BatchStory className="w-full" /> },
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

const PARSE_CODE = `import { createReadStream } from 'node:fs';
import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const document = await client.parse.handle(
  createReadStream('report.pdf'),
  { extension: 'pdf', ocr: true },
);

console.log(document.markdown);
console.log(document.type);`;

// The Parse page's lower half (context.dev/parse): the code section with the playground pill, the numbered steps and
// the related products. Its white hero is ProductHero.
export function Parse() {
  return (
    <div className="w-full">
      <ProductIntegration
        title="A file goes in."
        accent="Markdown comes out."
        description="Send a file stream with an optional extension hint. Read the Markdown and detected file type from the response, then combine it with your web content."
        install="npm install context.dev"
        docsHref="https://docs.context.dev"
        playgroundHref="https://context.dev/playground/parse"
        code={
          <CodeWindow label="TypeScript" actions={<WindowCopyButton value={PARSE_CODE} />}>
            <div className="overflow-x-auto">
              <CodeBlock code={PARSE_CODE} />
            </div>
          </CodeWindow>
        }
      />
      <ProductLandingSteps
        steps={[
          { title: "Send the file", description: "Upload the file bytes with the SDK or a POST request. Add an extension hint when needed." },
          { title: "Choose what to read", description: "Limit PDF pages or enable OCR for scans. Keep the links and image references your application needs." },
          { title: "Use the content", description: "Chunk and index the Markdown for retrieval, or give it directly to an agent as document context." },
        ]}
      />
      <ProductRelatedCards
        products={[
          { name: "Scrape anything", href: "https://context.dev/web-scraping-api", description: "Markdown, HTML, images, screenshots, and structured fields." },
          { name: "Run batches", href: "https://context.dev/batches-api", description: "Scrape thousands of URLs or crawl entire websites." },
        ]}
      />
    </div>
  );
}

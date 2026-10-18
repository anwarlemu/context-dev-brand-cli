import { ArrowRight } from "lucide-react";

import { ProductAction, ProductCallToAction, ProductCompactFaq, ProductCustomerProof, ProductHero, ProductSteps } from "@/components/site/product-hero";

const LOGO = (label: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="118" height="34"><text x="0" y="24" font-family="sans-serif" font-size="20">${label}</text></svg>`)}`;

export function Site() {
  return (
    <div className="w-full">
      <ProductHero
        eyebrow={<span>Backed by Y Combinator</span>}
        title={["Every way to work", "with the web."]}
        description="Scrape anything, crawl entire sites, run batches, and monitor changes, plus answers and brand data. Choose the APIs your product needs, with one API key."
        actions={
          <>
            <ProductAction href="https://context.dev/signup">Get API key</ProductAction>
            <ProductAction tone="frost" href="https://docs.context.dev" target="_blank" rel="noopener noreferrer" className="pr-4">
              View documentation
              <ArrowRight aria-hidden="true" />
            </ProductAction>
          </>
        }
      />
      <ProductCustomerProof label="Teams build with Context.dev" logos={["Mintlify", "daily.dev", "Daydream", "Super.com"].map((name) => ({ name, src: LOGO(name) }))} />
      <ProductSteps
        numbered
        title={["Install it once.", "Then just ask."]}
        steps={[
          { title: "Add the plugin", description: "Find Context.dev in the plugin directory and add it to your workspace." },
          { title: "Connect your key", description: "Paste your API key once; every chat can use it after that." },
          { title: "Ask for the web", description: "Ask it to look something up, read a page, or bring current sources into the chat." },
        ]}
      />
      <ProductCompactFaq
        id="plugin"
        faqs={[
          { question: "Does it cost extra?", answer: "Calls use credits from your Context.dev plan, the same as the API." },
          { question: "Which pages can it read?", answer: "Any public page, rendered in a real browser." },
        ]}
      />
      <ProductCallToAction
        title="Ask it to look it up."
        description="Search the web. Read a page. Get the sources in the chat."
        actions={
          <>
            <ProductAction tone="light" href="https://context.dev/signup">
              Get API key
            </ProductAction>
            <ProductAction tone="clear" href="https://docs.context.dev">
              View documentation
            </ProductAction>
          </>
        }
      />
    </div>
  );
}

import { Braces } from "lucide-react";

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";

const SCRAPE = `import { Context } from "@context-dev/sdk";

const context = new Context({ apiKey: process.env.CONTEXT_API_KEY });
// Any page as clean markdown, ready for a model.
const page = await context.scrape({ url: "https://example.com/pricing", format: "markdown" });
console.log(page.markdown);`;

const RESPONSE = `{
  "url": "https://example.com/pricing",
  "status": 200,
  "title": "Pricing",
  "markdown": "# Pricing\\n\\nStart free, then pay for what you use. Every plan includes every API, and you can change plans at any time without a call.",
  "credits": 1,
  "cached": false,
  "links": null
}`;

const CURL = `curl https://api.context.dev/v1/scrape \\
  -H "Authorization: Bearer $CONTEXT_API_KEY" \\
  -d '{"url": "https://example.com", "format": "markdown"}'`;

export function Site() {
  return (
    <CodeBlock variant="terminal" className="w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>scrape.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={SCRAPE} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={SCRAPE} language="ts" />
    </CodeBlock>
  );
}

export function Product() {
  return (
    <CodeBlock className="w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <Braces strokeWidth={1.5} /> response.json
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={RESPONSE} label="Copy JSON" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={RESPONSE} language="json" />
    </CodeBlock>
  );
}

export function Shell() {
  return (
    <CodeBlock className="w-full max-w-2xl">
      <CodeBlockHeader>
        <CodeBlockTitle>cURL</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={CURL} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={CURL} language="curl" lineNumbers={false} />
    </CodeBlock>
  );
}

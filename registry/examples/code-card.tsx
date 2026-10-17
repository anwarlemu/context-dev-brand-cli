import { Bot, Sparkles } from "lucide-react";

import { CodeCard, CodeCardAction } from "@/components/product/code-card";

export function Product() {
  return (
    <CodeCard
      className="w-full max-w-xl"
      samples={[
        {
          language: "cURL",
          code: `curl https://api.context.dev/v1/scrape \\\n  -H "Authorization: Bearer ctx_live_9f2c41b7e0a84d6c" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://acme.com",\n    "format": "markdown",\n    "onlyMainContent": true\n  }'`,
          display: `curl https://api.context.dev/v1/scrape \\\n  -H "Authorization: Bearer ctx_live_••••••••" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://acme.com",\n    "format": "markdown",\n    "onlyMainContent": true\n  }'`,
        },
        { language: "TypeScript (SDK)", code: `import ContextDev from 'context.dev';\n\nconst client = new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY });\nconst page = await client.scrape({ url: 'https://acme.com', format: 'markdown' });\nconsole.log(page.markdown);` },
      ]}
      footer={
        <>
          <span className="hidden @md:inline">Open in</span>
          <CodeCardAction label="Open in Claude">
            <Sparkles strokeWidth={1.5} />
          </CodeCardAction>
          <CodeCardAction label="Copy for your agent">
            <Bot strokeWidth={1.5} />
          </CodeCardAction>
        </>
      }
    />
  );
}

export function SingleLanguage() {
  return <CodeCard className="w-full max-w-xl" defaultExpanded samples={[{ language: "cURL", code: `curl https://api.context.dev/v1/scrape \\\n  -H "Authorization: Bearer $CONTEXT_DEV_API_KEY" \\\n  -d '{"url": "https://acme.com"}'` }]} />;
}

import { CodeCard } from "@/components/product/code-card";

export function Product() {
  return (
    <CodeCard
      className="w-full max-w-xl"
      samples={[
        { language: "TypeScript", code: `import ContextDev from 'context.dev';\n\nconst client = new ContextDev({ apiKey: process.env.CONTEXT_API_KEY });\nconst page = await client.scrape({ url: 'https://acme.com', format: 'markdown' });\nconsole.log(page.markdown);\nconsole.log(page.links.length);` },
        { language: "cURL", code: `curl https://api.context.dev/v1/scrape \\\n  -H "Authorization: Bearer $CONTEXT_API_KEY" \\\n  -d '{"url": "https://acme.com"}'` },
      ]}
    />
  );
}

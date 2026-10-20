"use client";

import * as React from "react";

import { CodeTabs, CodeWindow, CodeBlock, InstallCommand, WindowCopyButton } from "@/components/site/code-window";

const SCRAPE = `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });

const page = await client.web.scrape({
  url: 'https://linear.app',
  formats: { markdown: true, screenshot: true },
});

console.log(page.markdown.data);`;

const PYTHON = `from context_dev import ContextDev

client = ContextDev(api_key="YOUR_API_KEY")

page = client.web.scrape(
    url="https://linear.app",
    formats={"markdown": True, "screenshot": True},
)

print(page.markdown.data)`;

const CURL = `# Scrape a page to Markdown
curl https://api.context.dev/v1/web/scrape \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "https://linear.app", "formats": {"markdown": true}}'`;

const SAMPLES = [
  { language: "typescript", label: "TypeScript", filename: "scrape.ts", code: SCRAPE, install: "npm install context.dev" },
  { language: "python", label: "Python", filename: "scrape.py", code: PYTHON, install: "pip install context.dev" },
  { language: "curl", label: "cURL", filename: "terminal", code: CURL, install: null },
];

export function Site() {
  const [language, setLanguage] = React.useState("typescript");
  const install = SAMPLES.find((sample) => sample.language === language)?.install;
  return (
    <div className="grid w-full max-w-3xl gap-10">
      <CodeWindow label="scrape.ts" actions={<WindowCopyButton value={SCRAPE} />}>
        <div className="overflow-x-auto">
          <CodeBlock code={SCRAPE} language="typescript" />
        </div>
      </CodeWindow>
      <div className="flex flex-col gap-4">
        <InstallCommand command={install} />
        <CodeTabs samples={SAMPLES} language={language} onLanguageChange={setLanguage} />
      </div>
    </div>
  );
}

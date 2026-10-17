import { BookOpen, Bot, Clock, Globe, Layers, Map as MapIcon, Terminal } from "lucide-react";

import { windowButtonClass } from "@/components/site/code-window";
import { UseCases, UseCaseTryIn } from "@/components/site/use-cases";

const CLIENT = `import ContextDev from 'context.dev';

const client = new ContextDev({ apiKey: 'YOUR_API_KEY' });`;

// The agents' own logos go in the "Try in" chip; these icons stand in for them.
const docs = (href: string) => (
  <>
    <UseCaseTryIn>
      <button type="button" aria-label="Try in Claude" className={windowButtonClass}>
        <Bot />
      </button>
      <button type="button" aria-label="Try in Codex" className={windowButtonClass}>
        <Terminal />
      </button>
    </UseCaseTryIn>
    <a href={href} aria-label="View documentation" className={windowButtonClass}>
      <BookOpen />
    </a>
  </>
);

export function Site() {
  return (
    <UseCases
      className="w-full"
      items={[
        {
          id: "scrape",
          title: "Scrape anything",
          description: "Get Markdown, HTML, screenshots, images, or structured fields from any URL.",
          icon: <Globe />,
          actions: docs("https://docs.context.dev"),
          code: `${CLIENT}

const page = await client.web.scrape({
  url: 'https://linear.app',
  formats: {
    markdown: true,
    html: true,
    screenshot: true,
  },
  sharedParams: { mainContentOnly: true },
});

console.log(page.markdown.data);
console.log(page.screenshot.data);`,
        },
        {
          id: "map",
          title: "Map domains",
          description: "Discover page URLs across a domain, with titles and descriptions when available.",
          icon: <MapIcon />,
          code: `${CLIENT}

const { urls } = await client.web.mapUrls({
  domain: 'stripe.com',
  includeSubdomains: true,
  maxLinks: 100,
});

for (const page of urls) {
  console.log(page.url, page.title, page.description);
}`,
        },
        {
          id: "batches",
          title: "Run batches",
          description: "Scrape thousands of URLs or crawl a site in the background with one batch job.",
          icon: <Layers />,
          code: `${CLIENT}

const batch = await client.batch.submit({
  input: {
    mode: 'scrape',
    data: {
      format: 'markdown',
      urls: urls.map((url) => ({ url })),
    },
  },
});

console.log(batch.id, batch.status);`,
        },
        {
          id: "monitors",
          title: "Create monitors",
          description: "Watch pages for changes on a schedule and send updates to your webhook.",
          icon: <Clock />,
          code: `${CLIENT}

const monitor = await client.monitors.create({
  name: 'Linear pricing changes',
  target: { type: 'page', url: 'https://linear.app/pricing' },
  change_detection: { type: 'exact' },
  schedule: { type: 'interval', frequency: 6, unit: 'hours' },
  webhook: { url: 'https://example.com/webhooks/context' },
});

console.log(monitor.id);`,
        },
      ]}
    />
  );
}

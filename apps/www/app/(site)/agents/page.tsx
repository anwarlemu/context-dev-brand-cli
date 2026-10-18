import Link from "next/link";
import { Code } from "@www/components/code";
import { DocsHeading, DocsSection, DocsSectionRule } from "@www/components/docs-section";
import { APPLY_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Agent instructions", description: "Set up, inspect, compose, and verify Context.dev interfaces with any coding agent.", alternates: { canonical: "/agents", types: { "text/markdown": "/agents.md" } } };
const resources = [
  ["Agent instructions", "/agents.md", "The complete workflow as Markdown. Read this first."],
  ["Discovery index", "/llms.txt", "Links to every component's Markdown documentation."],
  ["Registry", "/r/index.json", "Searchable names, usage, surfaces, dependencies, and references."],
  ["Complete catalog", "/llms-full.txt", "All component APIs and examples in one text file."],
  ["Tokens", "/r/theme.json", "Site, product, and dark theme values."],
  ["Reference coverage", "/reference-audit.json", "The source and public website coverage for each item."],
];
export default function AgentsPage() {
  return <main>
    <DocsSection lines header="under">
      <DocsHeading as="h1" title="Agent instructions" description="Read the guide, inspect the components, then build the requested interface. These files and commands work with any agent that can read text or use a shell." />
      <div className="mt-8"><Code title="Read without installing" code={`${APPLY_COMMAND} guide\n${APPLY_COMMAND} list "form" --surface product --json\n${APPLY_COMMAND} inspect field input button --json`} /></div>
    </DocsSection>
    <DocsSection lines>
      <DocsHeading title="Set up and build" description="Run from the application root. Use product for dashboards and site for marketing pages. Init installs the theme, fonts, and project instructions; it does not convert existing component styles." />
      <DocsSectionRule />
      <Code title="terminal" code={`${APPLY_COMMAND} init --surface product\nnpx context-ds add field input button --surface product --dry-run --json\nnpx context-ds add field input button --surface product --json\nnpx context-ds check --changed --json`} />
      <p className="mt-6 text-body-sm text-fg-muted">React components require React 19.2+, Tailwind CSS 4, and an @/* alias in TypeScript and the bundler. Inspect the actual API and source before using a component. Keep the provided variants and tokens; connect real data, routes, validation, and callbacks.</p>
      <p className="mt-4 text-body-sm text-fg-muted">Product documents use a 15px root font size and the product Surface. Marketing documents use 16px on phones and 90% (14.4px) from 43.2rem up. A product wrapper alone does not change rem-based spacing. Examples use local demo state, not backend integrations.</p>
    </DocsSection>
    <DocsSection lines>
      <DocsHeading title="Verify the interface" description="Run the app's type check, tests, and production build. Test desktop and phone layouts in a browser, including keyboard focus, open overlays, scrolling, validation, and every visible action. The token check alone cannot verify these." />
      <DocsSectionRule />
      <Code title="Visual review" code="npx context-ds review http://localhost:3000/your-page --any --json" />
      <p className="mt-6 text-body-sm text-fg-muted">Follow the returned review instructions. If no separate reviewer is available, complete the review packet and disclose self-scoring. Compare marketing components with context.dev and product components with context-dashboard; the public website does not expose every product component.</p>
    </DocsSection>
    <DocsSection lines>
      <DocsHeading title="Files for agents" description="No browser rendering, account, or API key is required to read these resources. This is the design-system CLI, separate from Context.dev's web-data API CLI." />
      <DocsSectionRule />
      <dl className="grid divide-y divide-line-subtle">{resources.map(([label, href, description]) => <div key={href} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-6"><dt><a href={href} className="text-body-sm text-fg-brand underline underline-offset-4">{label}</a></dt><dd className="text-body-sm text-fg-muted">{description}</dd></div>)}</dl>
      <p className="mt-6 text-body-sm text-fg-muted">Each component also has /components/&#123;name&#125;.md and /r/&#123;name&#125;.json. JSON includes usage, avoid rules, TypeScript declarations, complete source, dependencies, and example helper files. The CLI bundles the same registry for offline inspection.</p>
      <p className="mt-4 text-body-sm text-fg-muted">To restyle an existing application, use the <Link href="/cli" className="text-fg-brand underline underline-offset-4">CLI restyling workflow</Link>. The default command changes styles on its first run.</p>
    </DocsSection>
  </main>;
}

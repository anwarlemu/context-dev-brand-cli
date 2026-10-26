import { InstallCommand } from "@/components/site/code-window";
import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";
import { APPLY_COMMAND, SETUP_COMMAND } from "@www/lib/registry";

export const metadata = { title: "CLI" };

const COMMANDS = [
  ["guide", "Read the complete agent instructions. This command does not change files."],
  ["init --surface site|product", "Install theme, fonts, and agent instructions without converting component styles."],
  ["inspect <items...>", "Read actual APIs, usage, examples, and source. Use --json for structured output."],
  ["add <items...>", "Add component source files, tokens, and required packages to a React and Tailwind project."],
  ["list [query]", "Search all items. Filter with --surface and --type; use --json for structured output."],
  ["look <file>", "Find component and styling guidance for the elements in a file."],
  ["check [files...]", "Find styles that do not use design tokens. Use --changed to check the current changes."],
  ["review [url]", "Capture desktop and phone screenshots and compare them with the reference pages. Use --any for a page outside the current task list."],
  ["tokens [term]", "Find a token by name or value."],
];

const FLOW = [
  { title: "Read the reference", body: "Choose the product or site surface. Find the components for the task and read their usage notes and source." },
  { title: "Add components", body: "Use add to copy the required components into the project. Reuse existing components before creating a new one." },
  { title: "Build the interface", body: "Compose the page with the components and tokens. Follow the reference layout, spacing, typography, states, and interactions." },
  { title: "Verify the result", body: "Run check, test keyboard and pointer interactions, and review desktop and phone layouts against the reference." },
];

export default function CliPage() {
  return (
    <DocsPage>
      <PageHead title="CLI" description="Use the CLI to add Context.dev components, find tokens, and check new pages and interfaces."><InstallCommand command={`${APPLY_COMMAND} guide`} /></PageHead>

      <DocsSection title="Agent workflow">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-4 rounded-card p-6 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
              <span className="flex size-7 items-center justify-center rounded-pill bg-blue-10 font-mono text-caption text-fg-brand">{i + 1}</span>
              <span className="text-body font-medium text-fg">{s.title}</span>
              <span className="text-body-sm text-fg-muted">{s.body}</span>
            </li>
          ))}
        </ol>
      </DocsSection>

      <DocsSection title="Set up the project" description="Run this from the project root. Use product for dashboards or site for marketing pages. Init installs design tokens, fonts, and agent instructions, preserving existing component styles. Read .ds/guide.md before implementing.">
        <InstallCommand command={SETUP_COMMAND} />
      </DocsSection>

      <DocsSection title="Commands" description="After setup, run these commands from the project root.">
        <dl className="grid divide-y divide-line-subtle">
          {COMMANDS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">npx context-ds {cmd}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection title="Add components" description="Requires React 19.2+ and Tailwind 4. Configure @/* in TypeScript and the bundler. Use --dry-run --json to preview changes; existing files are kept unless --overwrite is passed.">
        <Code title="terminal" code={`npx context-ds inspect button card tabs tooltip --json\nnpx context-ds add button card tabs tooltip --surface product --json\nnpx context-ds add app-shell overview-page`} />
      </DocsSection>

      <DocsSection title="Restyle an existing interface" description="The default command converts existing styles and adapts matching components. Use this only for a restyling task. Preview changes first, then run without --dry-run and follow the returned tasks.">
        <Code title="terminal" code={`${APPLY_COMMAND} --surface site --dry-run --json`} />
      </DocsSection>

      <DocsSection title="Agent instructions" description="Include this in the task when asking an agent to build or change a page.">
        <Code title="task instructions" code={`Use the Context.dev design system at https://context-ds.vercel.app.
Read https://context-ds.vercel.app/agents.md first.\nUse guide, list --json, and inspect --json before installing components.
Use product components for dashboard interfaces and site components for marketing pages.
Reuse existing components and design tokens. Do not invent new visual styles.
Run npx context-ds check --changed.
Test the page at desktop and phone sizes, including keyboard interactions.
Review the result against the reference before marking the task complete.`} />
      </DocsSection>
    </DocsPage>
  );
}

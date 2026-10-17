import { InstallCommand } from "@/components/site/code-window";
import { Code } from "@www/components/code";
import { DocsHeading, DocsSection, DocsSectionRule } from "@www/components/docs-section";
import { APPLY_COMMAND } from "@www/lib/registry";

export const metadata = { title: "CLI" };

const COMMANDS = [
  ["add <items...>", "Add component source files, tokens, and required packages to a React and Tailwind project."],
  ["list", "List the available components, blocks, and visuals."],
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
    <main>
      <DocsSection lines header="under">
        <DocsHeading
          as="h1"
          title="CLI"
          description="Use the CLI to add Context.dev components, find tokens, and check new pages and interfaces."
        >
          <InstallCommand command="npx context-ds list" />
        </DocsHeading>
      </DocsSection>

      <DocsSection lines>
        <DocsHeading title="Agent workflow" />
        <DocsSectionRule />
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

      <DocsSection lines>
        <DocsHeading title="Set up the project" description="Run this from the project root. It installs the design tokens, fonts, agent instructions, and checks for Claude Code, Codex, and Cursor. It also adapts matching components and existing styles to the design system." />
        <DocsSectionRule />
        <InstallCommand command={APPLY_COMMAND} />
      </DocsSection>

      <DocsSection lines>
        <DocsHeading title="Commands" description="After setup, run these commands from the project root." />
        <DocsSectionRule />
        <dl className="grid divide-y divide-line-subtle">
          {COMMANDS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-2 py-5 sm:grid-cols-[16rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">npx context-ds {cmd}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection lines>
        <DocsHeading title="Add components" description="For React and Tailwind 4 projects. The CLI uses the project's src directory and @ alias when present." />
        <DocsSectionRule />
        <Code title="terminal" code={`npx context-ds add button card tabs tooltip\nnpx context-ds add app-shell overview-page`} />
      </DocsSection>

      <DocsSection lines>
        <DocsHeading title="Agent instructions" description="Include this in the task when asking an agent to build or change a page." />
        <DocsSectionRule />
        <Code title="task instructions" code={`Use the Context.dev design system at https://context-ds.vercel.app.
Read the relevant component usage notes and source before implementing.
Use product components for dashboard interfaces and site components for marketing pages.
Reuse existing components and design tokens. Do not invent new visual styles.
Run npx context-ds check --changed.
Test the page at desktop and phone sizes, including keyboard interactions.
Review the result against the reference before marking the task complete.`} />
      </DocsSection>
    </main>
  );
}

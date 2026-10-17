import { InstallCommand } from "@/components/site/code-window";
import { Code } from "@www/components/code";
import { DocsHeading, DocsSection, DocsSectionRule } from "@www/components/docs-section";
import { APPLY_COMMAND, registryName } from "@www/lib/registry";

export const metadata = { title: "CLI" };

const COMMANDS = [
  ["add <items...>", "Copies library items into a React and Tailwind project, with the theme and what each needs."],
  ["list", "Every library item, by group."],
  ["look <file>", "The brand styling for each element in a file, and the library component that covers it."],
  ["check [files]", "Every style value must be a brand token. Hooks and the pre-commit run it for you."],
  ["review", "Screenshots each main screen and scores it against the brand's own pages."],
  ["tokens", "The brand tokens, by role."],
];

const FLOW = [
  { title: "Swap", body: "Components the app has that match the library (same name, same props) are swapped for the library's. The app is type-checked before and after; any swap that breaks it goes back." },
  { title: "Restyle", body: "Every other value, in CSS, templates, scripts, Tailwind or native code, is converted by its role: a text color to a text token, a card radius to the card radius." },
  { title: "Finish", body: "A short task list for the coding agent covers what conversion cannot: the main screens and the shared shell, then a review against the brand." },
  { title: "Stay", body: "Hooks for Claude Code, Codex and Cursor, and a pre-commit check, keep every later change on the brand." },
];

export default function CliPage() {
  return (
    <main>
      <DocsSection lines header="under">
        <DocsHeading
          as="h1"
          title="One command"
          accent="applies the brand."
          description={`Run it in any project: it swaps in library components where the app's own match, restyles everything else, and keeps coding agents on ${registryName}.`}
        >
          <InstallCommand command={APPLY_COMMAND} />
        </DocsHeading>
      </DocsSection>

      <DocsSection lines>
        <DocsHeading title="What it does" />
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
        <DocsHeading title="Commands" description="Once installed, the CLI is context-ds in the project." />
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
        <DocsHeading title="Add components" description="In a React project on Tailwind 4, add items by name. Files land in components/ui, product, site, blocks or visuals, honoring a src folder and the @ alias." />
        <DocsSectionRule />
        <Code title="terminal" code={`npx context-ds add button card tabs tooltip\nnpx context-ds add app-shell overview-page`} />
      </DocsSection>
    </main>
  );
}

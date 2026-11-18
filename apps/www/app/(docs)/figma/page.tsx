import { Code } from "@www/components/code";
import { DocsPage, DocsSection, PageHead } from "@www/components/docs-section";

export const metadata = { title: "Figma", description: "Put Context.dev tokens, illustrations, assets and components into Figma through its MCP tools, and check Figma designs against the tokens." };

const STEPS = [
  ["Open a session", "With no target file: whoami for the plan key, then create_new_file. Then create_session with the file key before any other file tool, and pass its sessionId on every later call."],
  ["Load the skills", "figma-use before the first use_figma, with figma-generate-library for variables or figma-generate-design for frames. figma-design-to-code before get_design_context."],
  ["Apply the tokens", "Run each figma/tokens-<n>.js with use_figma. It makes one collection with the modes Site, Product light and Product dark, or one collection per mode on a plan that allows a single mode, and effect styles for the shadows. Rerunning updates in place."],
  ["Push", "Run the push scripts with use_figma, or POST the written file to upload_assets or html_to_figma, as the printed steps say."],
  ["Look once", "One get_screenshot of the new frame. Stop when it matches."],
];

const ACTIONS = [
  ["figma tokens", "Writes tokens.json and the use_figma scripts for the variables and effect styles."],
  ["figma push illustration <subject>", "A use_figma script that draws real ellipses with paints bound to the color variables, plus the SVG and PNG. --image takes any picture."],
  ["figma push asset <file>", "SVG or picture for upload_assets (an SVG arrives as editable vectors); small SVGs also as a createNodeFromSvg script. slide works the same for a deck slide."],
  ["figma push component <name>", "The component's preview as self-contained HTML for html_to_figma. --example picks the example, --url a local docs site."],
  ["figma push page <url|file>", "A page as self-contained HTML for html_to_figma."],
  ["figma pull <url>", "The read calls for a node (get_variable_defs, get_design_context) and where to save each response."],
  ["figma check <files...>", "Flags every color, font, size, radius or spacing in the saved responses that is not a brand token, with the nearest token. Exits 1 when any are off brand."],
];

export default function FigmaPage() {
  return (
    <DocsPage>
      <PageHead title="Figma" description="The CLI does not call Figma. It writes what the Figma MCP tools need and prints the exact calls, in order, for the agent to make. Keep the calls few: no exploratory reads.">
        <Code title="terminal" code={`npx context-ds figma tokens --json\nnpx context-ds figma push illustration globe --json\nnpx context-ds figma pull "https://figma.com/design/<fileKey>/<name>?node-id=1-2" --json`} />
      </PageHead>

      <DocsSection title="Agent workflow" description="The order every Figma task follows.">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex flex-col gap-4 rounded-card p-6 shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
              <span className="flex size-7 items-center justify-center rounded-pill bg-blue-10 font-mono text-caption text-fg-brand">{i + 1}</span>
              <span className="text-body font-medium text-fg">{title}</span>
              <span className="text-body-sm text-fg-muted">{body}</span>
            </li>
          ))}
        </ol>
      </DocsSection>

      <DocsSection title="Actions" description="Each writes into ./figma (or --out) and prints the steps. An unknown action, kind, subject or component exits 1 and names the nearest choices.">
        <dl className="grid divide-y divide-line-subtle">
          {ACTIONS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-2 py-5 sm:grid-cols-[18rem_1fr] sm:gap-6">
              <dt className="font-mono text-body-sm text-fg">{cmd}</dt>
              <dd className="text-body-sm text-fg-muted">{what}</dd>
            </div>
          ))}
        </dl>
      </DocsSection>

      <DocsSection title="Check a design" description="Read the node, save both responses, then check them. Build from the library's components and tokens, never from the raw values.">
        <Code title="terminal" code={`npx context-ds figma pull "https://figma.com/design/<fileKey>/<name>?node-id=1-2"\n# get_variable_defs  -> figma/variables-1-2.json\n# get_design_context -> figma/design-1-2.txt\nnpx context-ds figma check figma/variables-1-2.json figma/design-1-2.txt --json`} />
      </DocsSection>

      <DocsSection title="When Figma refuses" description="A view-only seat, a plan limit or a rate limit refuses writes. Stop after one clear attempt and report the exact error; everything the CLI wrote stays ready to run once access allows it." />
    </DocsPage>
  );
}

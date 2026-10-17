import { Code } from "@www/components/code";
import { registryName } from "@www/lib/registry";

export default function CliPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-h2">CLI</h1>
      <p className="mt-3 text-body-lg text-fg-muted">
        One command applies {registryName} to any project: it swaps in library components where an app&rsquo;s own match, restyles everything else, and keeps
        coding agents on the brand.
      </p>
      <h2 className="mt-10 mb-4 text-h4">Apply to an existing project</h2>
      <Code lang="bash" code={`npx -y github:anwarlemu/context-dev-brand-cli#release`} />
      <h2 className="mt-10 mb-4 text-h4">Add components</h2>
      <Code lang="bash" code={`npx context-ds add button card tabs tooltip`} />
      <h2 className="mt-10 mb-4 text-h4">Other commands</h2>
      <Code
        lang="bash"
        code={`npx context-ds list          # every library item
npx context-ds look <file>    # the brand styling for each element in a file
npx context-ds check          # every style value must be a brand token
npx context-ds review <url>   # screenshots scored against the brand`}
      />
    </main>
  );
}

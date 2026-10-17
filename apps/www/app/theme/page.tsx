import { readFileSync } from "node:fs";
import path from "node:path";

import { Code } from "@www/components/code";

type Tokens = { site: Record<string, string>; product: Record<string, string> };
const tokens = JSON.parse(readFileSync(path.join(process.cwd(), "../../build/tokens.json"), "utf8")) as Tokens;
const colors = Object.entries(tokens.site).filter(([k, v]) => k.startsWith("--ds-color-") && /^#|^rgb/.test(v));

export default function ThemePage() {
  return (
    <main className="mx-auto max-w-(--ds-layout-column-wide) px-6 py-12">
      <h1 className="text-h2">Theme</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-fg-muted">
        Every value comes from one set of tokens. Product screens opt in to the compact scale with the <code className="font-mono text-body-sm">ds-product</code> class.
      </p>
      <div className="mt-8">
        <Code lang="bash" code={`npx context-ds add theme`} />
      </div>
      <h2 className="mt-12 mb-4 text-h4">Colors</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {colors.map(([name, value]) => (
          <div key={name} className="overflow-hidden rounded-card border border-line">
            <div className="h-14" style={{ background: `var(${name})` }} />
            <div className="px-3 py-2">
              <p className="truncate font-mono text-caption text-fg">{name.replace("--ds-color-", "")}</p>
              <p className="font-mono text-caption text-fg-subtle">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

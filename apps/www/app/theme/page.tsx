import { readFileSync } from "node:fs";
import path from "node:path";

import { InstallCommand } from "@/components/site/code-window";
import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { Code } from "@www/components/code";

export const metadata = { title: "Theme" };

type Tokens = { site: Record<string, string>; product: Record<string, string>; dark: Record<string, string> };
const tokens = JSON.parse(readFileSync(path.join(process.cwd(), "../../build/tokens.json"), "utf8")) as Tokens;
const isColor = (v: string) => /^#|^rgb|^hsl|^oklch/.test(v);
const colors = Object.entries(tokens.site).filter(([k, v]) => k.startsWith("--ds-color-") && isColor(v));

// Ramps first (blue, navy, neutral), then the named roles.
const RAMPS = ["blue", "navy", "neutral"];
const ramp = (name: string) => RAMPS.find((r) => name.startsWith(`--ds-color-${r}-`));
const roles = colors.filter(([k]) => !ramp(k));

const SCALE = Object.entries(tokens.site).filter(([k]) => /^--ds-text-(hero|h[1-5]|body-lg|body|body-sm|caption)$/.test(k));
const RADII = Object.entries(tokens.site).filter(([k]) => k.startsWith("--ds-radius-"));

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
      <div className="h-14 border-b border-line-subtle" style={{ background: `var(${name})` }} />
      <div className="px-3 py-2">
        <p className="truncate font-mono text-caption text-fg">{name.replace("--ds-color-", "")}</p>
        <p className="font-mono text-caption text-fg-subtle">{value}</p>
      </div>
    </div>
  );
}

export default function ThemePage() {
  return (
    <main>
      <SiteSection lines header="under">
        <SectionHeading
          as="h1"
          title="One set of tokens,"
          accent="every value."
          description="Colors, type, space, radii, shadows and motion come from one file. Product screens opt in to the compact scale with the ds-product class, and dark mode follows .dark or data-theme."
        >
          <InstallCommand command="npx context-ds add theme" />
        </SectionHeading>
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="Color" description="The ramps the brand draws from, then the roles every component reads." />
        <SectionHeaderRule />
        <div className="grid gap-8">
          {RAMPS.map((r) => {
            const list = colors.filter(([k]) => ramp(k) === r);
            if (!list.length) return null;
            return (
              <div key={r} className="flex overflow-hidden rounded-card shadow-[0_0_0_1px_var(--ds-color-border-hairline)]">
                {list.map(([name, value]) => (
                  <div key={name} className="min-w-0 flex-1">
                    <div className="h-16" style={{ background: `var(${name})` }} />
                    <p className="truncate px-2 pt-2 font-mono text-caption text-fg">{name.replace("--ds-color-", "")}</p>
                    <p className="truncate px-2 pb-2 font-mono text-caption text-fg-subtle">{value}</p>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {roles.map(([name, value]) => (
              <Swatch key={name} name={name} value={value} />
            ))}
          </div>
        </div>
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="Type" description="Rethink Sans at regular weight, tight at display sizes; IBM Plex Mono for code; Doto for figures." />
        <SectionHeaderRule />
        <div className="grid divide-y divide-line-subtle">
          {SCALE.map(([name, value]) => (
            <div key={name} className="grid items-baseline gap-2 py-4 sm:grid-cols-[10rem_1fr]">
              <p className="font-mono text-caption text-fg-subtle">
                {name.replace("--ds-text-", "text-")} <span className="text-fg-faint">{value}</span>
              </p>
              <p className="truncate leading-tight tracking-tight text-fg" style={{ fontSize: `var(${name})` }}>
                Turn the web into context
              </p>
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="Radii" description="Site values at the page root; the product's under ds-product." />
        <SectionHeaderRule />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {RADII.map(([name, value]) => (
            <div key={name} className="flex flex-col gap-3">
              <div className="h-20 bg-blue-10 shadow-[inset_0_0_0_1px_var(--ds-color-blue-40)]" style={{ borderRadius: `var(${name})` }} />
              <p className="font-mono text-caption text-fg">
                {name.replace("--ds-radius-", "rounded-")} <span className="text-fg-subtle">{value}</span>
              </p>
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection lines>
        <SectionHeading title="Use it" description="The theme item writes the tokens and the Tailwind names that read them. Import both after Tailwind." />
        <SectionHeaderRule />
        <Code
          title="app/globals.css"
          code={`@import "tailwindcss";
@import "./styles/tokens.css";
@import "./styles/theme.css";`}
        />
      </SiteSection>
    </main>
  );
}

import { readFileSync } from "node:fs";
import path from "node:path";

import index from "./registry-index.json";

export type Item = {
  name: string;
  title: string;
  type: "ui" | "site" | "product" | "visual" | "block" | "hook" | "lib";
  surface: "site" | "product" | "both";
  description: string;
  kinds: string[];
  use_for: string;
  never: string[];
  source?: string;
  paths: string[];
  dependencies: string[];
  npm: string[];
  examples: string[];
  body: string;
};

export const registryName = index.name;
export const registryUrl = index.url;
export const REPO = "https://github.com/anwarlemu/context-dev-brand-cli";
export const BRAND_SITE = "https://context.dev";
export const APPLY_COMMAND = "npx -y github:anwarlemu/context-dev-brand-cli#release";
export const items = (index.items as Item[]).filter((i) => i.type !== "lib" && i.type !== "hook");

export const GROUPS: { type: Item["type"]; id: string; label: string; blurb: string }[] = [
  { type: "ui", id: "components", label: "Components", blurb: "Buttons, forms, menus, and other controls, with site and product variants." },
  { type: "product", id: "product", label: "Product", blurb: "Dashboard navigation, page layouts, cards, charts, and panels." },
  { type: "site", id: "site", label: "Site", blurb: "Headers, heroes, sections, and footers for Context.dev marketing pages." },
  { type: "block", id: "blocks", label: "Blocks", blurb: "Page layouts composed from the library components." },
  { type: "visual", id: "visuals", label: "Visuals", blurb: "Dot fields, glyphs, diagrams, and animations." },
];

export const counts = Object.fromEntries(GROUPS.map((g) => [g.type, items.filter((i) => i.type === g.type).length]));
export const findItem = (name: string) => items.find((i) => i.name === name);

const root = path.join(process.cwd(), "../../registry");
export const sourceOf = (rel: string) => readFileSync(path.join(root, rel), "utf8");
export const exampleSource = (name: string) => sourceOf(`examples/${name}.tsx`);

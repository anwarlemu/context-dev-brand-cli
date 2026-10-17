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
export const items = (index.items as Item[]).filter((i) => i.type !== "lib" && i.type !== "hook");

export const GROUPS: { type: Item["type"]; label: string }[] = [
  { type: "ui", label: "Components" },
  { type: "product", label: "Product" },
  { type: "site", label: "Site" },
  { type: "block", label: "Blocks" },
  { type: "visual", label: "Visuals" },
];

export const findItem = (name: string) => items.find((i) => i.name === name);

const root = path.join(process.cwd(), "../../registry");
export const sourceOf = (rel: string) => readFileSync(path.join(root, rel), "utf8");
export const exampleSource = (name: string) => sourceOf(`examples/${name}.tsx`);

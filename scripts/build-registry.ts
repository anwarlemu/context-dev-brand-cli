// Builds the component library's registry from registry/: validates every item's docs, works out its files and
// dependencies from its imports, adds the theme (from brand/tokens.css via build/), writes registry.json, runs shadcn's
// builder into apps/www/public/r, type-checks every item and runs the value check over them.
// usage: tsx scripts/build-registry.ts
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const ROOT = new URL('..', import.meta.url).pathname;
const REG = join(ROOT, 'registry');
const brand = JSON.parse(readFileSync(join(ROOT, 'brand', 'brand.json'), 'utf8')) as { name: string; registryUrl: string };
const problems: string[] = [];

const TYPES = ['ui', 'site', 'product', 'visual', 'block', 'hook', 'lib'] as const;
const docsSchema = z.object({
	name: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string(),
	type: z.enum(TYPES),
	surface: z.enum(['site', 'product', 'both']),
	description: z.string(),
	kinds: z.array(z.string()).default([]),
	use_for: z.string(),
	never: z.array(z.string()).default([]),
	source: z.string().optional(),
	files: z.array(z.string()).optional(),
	dependencies: z.array(z.string()).default([]),
});
type Docs = z.infer<typeof docsSchema>;

const DIR: Record<Docs['type'], string> = { ui: 'components/ui', site: 'components/site', product: 'components/product', visual: 'components/visuals', block: 'components/blocks', hook: 'hooks', lib: 'lib' };
const REGISTRY_TYPE: Record<Docs['type'], string> = { ui: 'registry:ui', site: 'registry:component', product: 'registry:component', visual: 'registry:component', block: 'registry:block', hook: 'registry:hook', lib: 'registry:lib' };
const elementKinds = new Set(Object.values(JSON.parse(readFileSync(join(ROOT, 'brand', 'elements.json'), 'utf8')) as Record<string, Record<string, unknown>>).flatMap((g) => Object.keys(g)));

const docs: (Docs & { body: string; paths: string[] })[] = [];
for (const file of readdirSync(join(REG, 'docs')).filter((f) => f.endsWith('.md')).sort()) {
	const text = readFileSync(join(REG, 'docs', file), 'utf8');
	const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) {
		problems.push(`docs/${file}: no frontmatter`);
		continue;
	}
	let raw: unknown;
	try {
		raw = parse(m[1]);
	} catch (error) {
		problems.push(`docs/${file}: ${(error as Error).message.split('\n')[0]} (quote values that contain ": ")`);
		continue;
	}
	const parsed = docsSchema.safeParse(raw);
	if (!parsed.success) {
		problems.push(`docs/${file}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
		continue;
	}
	const d = parsed.data;
	if (`${d.name}.md` !== file) problems.push(`docs/${file}: name is ${d.name}`);
	for (const k of d.kinds) if (!elementKinds.has(k)) problems.push(`${d.name}: kind ${k} is not in brand/elements.json`);
	const ext = d.type === 'hook' || d.type === 'lib' ? 'ts' : 'tsx';
	const paths = d.files ?? [`${DIR[d.type]}/${d.name === 'utils' ? 'utils' : d.name}.${ext}`];
	for (const p of paths) if (!existsSync(join(REG, p))) problems.push(`${d.name}: missing registry/${p}`);
	docs.push({ ...d, body: m[2].trim(), paths });
}

const byPath = new Map(docs.flatMap((d) => d.paths.map((p) => [p.replace(/\.(tsx?|css)$/, ''), d.name] as const)));
const IGNORED = new Set(['react', 'react-dom']);
function importsOf(name: string, paths: string[]) {
	const internal = new Set<string>();
	const npm = new Set<string>();
	for (const p of paths) {
		const text = readFileSync(join(REG, p), 'utf8');
		for (const m of text.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
			const spec = m[1];
			if (spec.startsWith('@/')) {
				const dep = byPath.get(spec.slice(2));
				if (!dep) problems.push(`${name}: imports ${spec}, which is not a registry item`);
				else if (dep !== name) internal.add(dep);
			} else if (!spec.startsWith('.')) {
				const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
				if (!IGNORED.has(pkg)) npm.add(pkg);
			}
		}
	}
	return { internal: [...internal], npm: [...npm] };
}

// The theme: the brand tokens and the Tailwind names that read them, so every item renders as the brand.
const tokensJson = JSON.parse(readFileSync(join(ROOT, 'build', 'tokens.json'), 'utf8')) as { site: Record<string, string>; product: Record<string, string>; dark: Record<string, string> };
const themeCss = readFileSync(join(ROOT, 'build', 'theme.css'), 'utf8');
const strip = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/^--/, ''), v]));
const themeVars = Object.fromEntries([...themeCss.matchAll(/^\t--([\w-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2]]));
const productOnly = Object.fromEntries(Object.entries(tokensJson.product).filter(([k, v]) => tokensJson.site[k] !== v));
const themeItem = {
	name: 'theme',
	type: 'registry:theme',
	title: `${brand.name} theme`,
	description: `The ${brand.name} tokens and the Tailwind names that read them. Product screens opt in with the ds-product class.`,
	cssVars: { theme: themeVars, light: strip(tokensJson.site) },
	css: {
		'.ds-product': strip(productOnly),
		':is(.dark, [data-theme="dark"]) .ds-product, .ds-product:is(.dark, [data-theme="dark"])': strip(tokensJson.dark),
		'@keyframes ds-pop-in': { from: { opacity: '0', transform: 'scale(0.97)' } },
		'@keyframes ds-fade-in': { from: { opacity: '0' } },
		'@keyframes ds-content-in': { from: { opacity: '0', transform: 'translateY(4px)' } },
		'@keyframes ds-sheet-right': { from: { opacity: '0', transform: 'translateX(12px)' } },
		'@keyframes ds-sheet-left': { from: { opacity: '0', transform: 'translateX(-12px)' } },
		'@keyframes ds-chart-line': { from: { 'stroke-dashoffset': '1' } },
		'@keyframes ds-chart-tip': { from: { opacity: '0', transform: 'scale(0.4)' } },
		'@keyframes ds-chart-bar': { from: { transform: 'scaleY(0.04)' } },
		'@keyframes ds-shimmer': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },
	},
};

const url = (n: string) => `${brand.registryUrl}/r/${n}.json`;
const index: Record<string, unknown>[] = [];
const items = [
	themeItem,
	...docs.map((d) => {
		const { internal, npm } = importsOf(d.name, d.paths);
		for (const dep of d.dependencies) if (!docs.some((x) => x.name === dep)) problems.push(`${d.name}: unknown dependency ${dep}`);
		const deps = [...new Set([...internal, ...d.dependencies])];
		const example = join(REG, 'examples', `${d.name}.tsx`);
		const exampleText = existsSync(example) ? readFileSync(example, 'utf8') : '';
		if (d.type !== 'lib' && d.type !== 'hook' && !exampleText) problems.push(`${d.name}: no registry/examples/${d.name}.tsx`);
		index.push({ ...d, dependencies: deps, npm, examples: [...exampleText.matchAll(/export function (\w+)/g)].map((m) => m[1]) });
		return {
			name: d.name,
			type: REGISTRY_TYPE[d.type],
			title: d.title,
			description: d.description,
			...(npm.length ? { dependencies: npm } : {}),
			registryDependencies: [...(d.type === 'lib' ? [] : [url('theme')]), ...deps.map(url)],
			files: d.paths.map((p) => ({ path: `registry/${p}`, type: REGISTRY_TYPE[d.type], target: p })),
			meta: { surface: d.surface, kinds: d.kinds },
		};
	}),
];

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
const registry = { $schema: 'https://ui.shadcn.com/schema/registry.json', name: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), homepage: brand.registryUrl, items };
writeFileSync(join(ROOT, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
mkdirSync(join(ROOT, 'apps', 'www', 'lib'), { recursive: true });
writeFileSync(join(ROOT, 'apps', 'www', 'lib', 'registry-index.json'), `${JSON.stringify({ name: brand.name, url: brand.registryUrl, items: index }, null, 2)}\n`);
// The docs render every example from source: one static import per item that has one.
const withExamples = docs.filter((d) => existsSync(join(REG, 'examples', `${d.name}.tsx`)));
const ident = (n: string) => `ex_${n.replace(/-/g, '_')}`;
writeFileSync(
	join(ROOT, 'apps', 'www', 'lib', 'examples.generated.ts'),
	`// Written by scripts/build-registry.ts. Do not edit.\nimport type { ComponentType } from "react";\n\n${withExamples.map((d) => `import * as ${ident(d.name)} from "@/examples/${d.name}";`).join('\n')}\n\nexport const examples: Record<string, Record<string, ComponentType>> = {\n${withExamples.map((d) => `  "${d.name}": ${ident(d.name)},`).join('\n')}\n};\n`,
);

const run = (cmd: string, args: string[]) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
const built = run('npx', ['shadcn', 'build', 'registry.json', '--output', 'apps/www/public/r']);
if (built.status !== 0) problems.push(`shadcn build failed:\n${built.stdout}${built.stderr}`);
const types = run('npx', ['tsc', '-p', 'tsconfig.registry.json']);
if (types.status !== 0) problems.push(`type errors in registry:\n${types.stdout}${types.stderr}`);
const check = run(process.execPath, ['bin.js', 'check', ...docs.flatMap((d) => d.paths.map((p) => `registry/${p}`)), ...readdirSync(join(REG, 'examples')).map((f) => `registry/examples/${f}`)]);
if (check.status !== 0) problems.push(`values that are not brand tokens:\n${check.stdout}${check.stderr}`);

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`registry: ${items.length} items (theme + ${docs.length}), types clean, every value a brand token. Wrote registry.json and apps/www/public/r`);

// Builds the component library from registry/: validates every item's docs, works out its files and dependencies from
// its imports, adds the theme (from brand/tokens.css via build/), writes one JSON file per item (with its files'
// content) and an index into apps/www/public/r, type-checks every item and runs the value check over them.
// usage: tsx scripts/build-registry.ts
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { declarations, exampleFiles, markdown } from './registry-docs.js';

const ROOT = new URL('..', import.meta.url).pathname;
const REG = join(ROOT, 'registry');
const brand = JSON.parse(readFileSync(join(ROOT, 'brand', 'brand.json'), 'utf8')) as { name: string; bin: string; source: string; registryUrl: string };
const problems: string[] = [];
const audit = JSON.parse(readFileSync(join(ROOT, 'brand/reference-audit.json'), 'utf8')) as { items: { name: string; sources: unknown[]; scope: string; library: { path: string; sha256: string }[] }[] };


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
const productOnly = Object.fromEntries(Object.entries(tokensJson.product).filter(([k, v]) => tokensJson.site[k] !== v));
const themeItem = {
	schemaVersion: 1,
	usage: 'Use init --surface site or init --surface product to install the correct stylesheet and fonts. React components need Tailwind 4. Product pages use a 15px root; site pages use 16px on phones and 90% from 43.2rem up.',
	documentation: `${brand.registryUrl}/theme`,
	name: 'theme',
	type: 'theme',
	title: `${brand.name} theme`,
	description: `${brand.name} design tokens and Tailwind utilities. Use ds-product for product interfaces.`,
	surface: 'both',
	kinds: [] as string[],
	requires: [] as string[],
	packages: [] as string[],
	files: [
		{ path: 'styles/tokens.css', content: readFileSync(join(ROOT, 'build', 'tokens.css'), 'utf8') },
		{ path: 'styles/theme.css', content: themeCss },
	],
	tokens: { site: tokensJson.site, product: productOnly, dark: tokensJson.dark },
};

const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout?.trim() || 'unknown';
const api = declarations(ROOT);
const index: Record<string, unknown>[] = [];
const items = [
	themeItem,
	...docs.map((d) => {
		const { internal, npm } = importsOf(d.name, d.paths);
		const coverage = audit.items.find(item => item.name === d.name);
		if (!coverage) problems.push(`${d.name}: missing reference coverage`);
		for (const path of d.paths) {
			const hash = createHash('sha256').update(readFileSync(join(REG, path), 'utf8')).digest('hex');
			if (coverage?.library.find(file => file.path === path)?.sha256 !== hash) problems.push(`${d.name}: source changed since reference audit; run npm run audit:references`);
		}

		for (const dep of d.dependencies) if (!docs.some((x) => x.name === dep)) problems.push(`${d.name}: unknown dependency ${dep}`);
		const deps = [...new Set([...internal, ...d.dependencies])];
		const example = join(REG, 'examples', `${d.name}.tsx`);
		const exampleText = existsSync(example) ? readFileSync(example, 'utf8') : '';
		const helperFiles = exampleFiles(REG, d.name);
		const exampleDeps = importsOf(d.name, helperFiles.map(file => file.path));
		const surfaceFlag = d.surface === 'site' || d.surface === 'product' ? ` --surface ${d.surface}` : '';
		if (d.type !== 'lib' && d.type !== 'hook' && !exampleText) problems.push(`${d.name}: no registry/examples/${d.name}.tsx`);
		index.push({ ...d, dependencies: deps, npm, examples: [...exampleText.matchAll(/export function (\w+)/g)].map((m) => m[1]) });
		return {
			schemaVersion: 1,
			revision,
			name: d.name,
			type: d.type,
			title: d.title,
			description: d.description,
			surface: d.surface,
			kinds: d.kinds,
			usage: d.use_for,
			avoid: d.never,
			notes: d.body,
			documentation: `${brand.registryUrl}/components/${d.name}.md`,
			install: `npx -y ${brand.source} add ${d.name}${surfaceFlag}`,
			requirements: { react: '>=19.2', tailwindcss: '>=4', alias: '@/* resolves to the source directory' },
			reference: { source: d.source, audit: `${brand.registryUrl}/reference-audit.json`, scope: coverage?.scope, sources: coverage?.sources },
			api: d.paths.filter(p => api.has(p)).map(p => ({ path: p.replace(/\.tsx?$/, '.d.ts'), content: api.get(p)! })),
			examples: [...exampleText.matchAll(/export function (\w+)/g)].map(m => ({ name: m[1], url: `${brand.registryUrl}/preview/${d.name}/${m[1]}` })),
			exampleFiles: helperFiles,
			exampleRequires: exampleDeps.internal,
			examplePackages: exampleDeps.npm,
			requires: [...(d.type === 'lib' ? [] : ['theme']), ...deps],
			packages: npm,
			files: d.paths.map((p) => ({ path: p, content: readFileSync(join(REG, p), 'utf8') })),
		};
	}),
];

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
// One file per item with its content, and an index of them all, served by the docs site at /r.
const out = join(ROOT, 'apps', 'www', 'public', 'r');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const item of items) writeFileSync(join(out, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
writeFileSync(
	join(out, 'index.json'),
	`${JSON.stringify({ schemaVersion: 1, revision, name: brand.name, homepage: brand.registryUrl, guide: `${brand.registryUrl}/agents.md`, items: items.map(item => { const { files, ...entry } = item; const { api: _api, exampleFiles: _examples, tokens: _tokens, ...compact } = entry as typeof entry & { api?: unknown; exampleFiles?: unknown; tokens?: unknown }; return compact; }) }, null, 2)}\n`,
);
const publicDir = join(ROOT, 'apps', 'www', 'public');
const guide = readFileSync(join(ROOT, 'brand', 'agent-guide.md'), 'utf8').replaceAll('{{brand}}', brand.name).replaceAll('{{bin}}', brand.bin).replaceAll('{{cli}}', `npx ${brand.bin}`).replaceAll('{{source}}', brand.source).replaceAll('{{url}}', brand.registryUrl);
writeFileSync(join(publicDir, 'agents.md'), guide);
writeFileSync(join(publicDir, 'reference-audit.json'), JSON.stringify(audit, null, 2) + '\n');
const componentDocs = join(publicDir, 'components');
rmSync(componentDocs, { recursive: true, force: true });
mkdirSync(componentDocs, { recursive: true });
const pages = items.filter(item => item.type !== 'theme').map(item => ({ name: item.name, text: markdown(item, brand.registryUrl) }));
for (const page of pages) writeFileSync(join(componentDocs, `${page.name}.md`), page.text);
writeFileSync(join(publicDir, 'llms.txt'), `# ${brand.name} design system\n\nComponents and instructions for agents building ${brand.name} pages. The design-system CLI is ${brand.bin}; it is separate from the web-data API CLI.\n\n- [Start here](${brand.registryUrl}/agents.md): setup, surfaces, composition, and validation.\n- [Catalog JSON](${brand.registryUrl}/r/index.json): search by description, usage, type, and surface.\n- [Complete catalog](${brand.registryUrl}/llms-full.txt): component API and examples in Markdown.\n- [Tokens](${brand.registryUrl}/r/theme.json)\n- [Reference coverage](${brand.registryUrl}/reference-audit.json)\n\n## Components\n\n${items.filter(item => item.type !== 'theme').map(item => `- [${item.name}](${brand.registryUrl}/components/${item.name}.md): ${item.description}`).join('\n')}\n`);
writeFileSync(join(publicDir, 'llms-full.txt'), `${guide}\n\n${pages.map(p => p.text).join('\n\n')}\n`);
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
const types = run('npx', ['tsc', '-p', 'tsconfig.registry.json']);
if (types.status !== 0) problems.push(`type errors in registry:\n${types.stdout}${types.stderr}`);
const check = run(process.execPath, ['bin.js', 'check', ...docs.flatMap((d) => d.paths.map((p) => `registry/${p}`)), ...readdirSync(join(REG, 'examples')).map((f) => `registry/examples/${f}`)]);
if (check.status !== 0) problems.push(`values that are not brand tokens:\n${check.stdout}${check.stderr}`);

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`registry: ${items.length} items (theme + ${docs.length}), types clean, every value a brand token. Wrote apps/www/public/r`);

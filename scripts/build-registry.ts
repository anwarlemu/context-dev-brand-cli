import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadConfig } from '../src/lib/config.js';
import { dependencyClosure, targetFor } from '../src/lib/install.js';
import { docsLineCount, findItem, loadRegistry } from '../src/lib/registry.js';
import { usageSnippet } from '../src/commands/scaffold.js';

const config = loadConfig();
const items = loadRegistry();
const problems: string[] = [];
const seen = new Map<string, string>();

for (const item of items) {
	if (item.type === 'flow') continue;
	if (seen.has(item.name)) problems.push(`duplicate item name "${item.name}" (${seen.get(item.name)} and ${item.id})`);
	seen.set(item.name, item.id);
	const lines = docsLineCount(item);
	if (lines > config.docsMaxLines) problems.push(`${item.id}: docs plus example is ${lines} lines, cap ${config.docsMaxLines}. Split the item.`);
	for (const dep of item.docs.dependencies) if (!findItem(dep)) problems.push(`${item.id}: unknown dependency ${dep}`);
	if (!item.sourceFiles.length) problems.push(`${item.id}: no source file`);
	for (const f of item.sourceFiles) if (/\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf)$/i.test(f)) problems.push(`${item.id}: ${f.slice(process.cwd().length + 1)} is binary; shadcn registry files are text. Wrap images in an SVG data URI or ship SVG.`);
	if (item.type === 'block') {
		const src = item.sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
		if (!src.includes(`block="${item.name}"`)) problems.push(`${item.id}: root Section must set block="${item.name}"`);
		try {
			usageSnippet(item);
		} catch (error) {
			problems.push(`${item.id}: ${(error as Error).message}`);
		}
	}
	if (item.type === 'template') {
		for (const [slot, def] of Object.entries(item.docs.structure!.slots)) for (const b of def.allowed) if (!findItem(`blocks/${b}`)) problems.push(`${item.id}: slot ${slot} allows missing block ${b}`);
	}
}

const REG_TYPE = { ui: 'registry:ui', block: 'registry:block', template: 'registry:block', 'flow-step': 'registry:block', flow: 'registry:block' } as const;
const registry = {
	$schema: 'https://ui.shadcn.com/schema/registry.json',
	name: config.presetId,
	homepage: config.registryUrl,
	items: items
		.filter((i) => i.type !== 'flow')
		.map((i) => ({
			name: i.name,
			type: REG_TYPE[i.type],
			title: i.exportName,
			description: i.docs.use_for,
			...(i.docs.npm.length ? { dependencies: i.docs.npm } : {}),
			registryDependencies: i.docs.dependencies.map((d) => `${config.registryUrl}/r/${findItem(d)!.name}.json`),
			files: i.sourceFiles.map((f) => ({ path: f.slice(process.cwd().length + 1), type: 'registry:file', target: targetFor(i, f) })),
			meta: { version: i.version, dsType: i.type, id: i.id },
		})),
};
writeFileSync('registry.json', `${JSON.stringify(registry, null, 2)}\n`);

rmSync('.stage', { recursive: true, force: true });
for (const item of items) for (const f of [...item.sourceFiles, ...(item.exampleFile ? [join(item.dir, item.exampleFile)] : [])].filter((file) => /\.tsx?$/.test(file))) {
	const target = join('.stage', targetFor(item, f));
	mkdirSync(join(target, '..'), { recursive: true });
	copyFileSync(f, target);
}
writeFileSync('.stage/tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2023', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, baseUrl: '.', paths: { '@/*': ['./*'] }, typeRoots: ['../node_modules/@types'], types: ['react', 'node'] }, include: ['components/**/*.tsx', 'components/**/*.ts'] }));
const tsc = spawnSync('npx', ['tsc', '-p', '.stage/tsconfig.json'], { encoding: 'utf8' });
if (tsc.status !== 0) problems.push(`type errors in registry:\n${tsc.stdout}${tsc.stderr}`);

if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`registry: ${registry.items.length} items valid, docs under ${config.docsMaxLines} lines, types clean. Wrote registry.json`);
export { dependencyClosure, existsSync, readdirSync, basename };

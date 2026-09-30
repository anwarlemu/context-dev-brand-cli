import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { type DocsFrontmatter, type ItemType, docsFrontmatterSchema, flowFrontmatterSchema } from '../schema/index.js';
import { loadConfig } from './config.js';
import { lineCount, readMarkdown } from './docs.js';
import { pkgPath } from './paths.js';

export type RegistryItem = {
	name: string;
	id: string;
	type: ItemType;
	version: string;
	dir: string;
	docs: DocsFrontmatter;
	body: string;
	docsRaw: string;
	example?: string;
	exampleFile?: string;
	sourceFiles: string[];
	exportName: string;
	importPath?: string;
};

const TYPE_DIRS: Record<string, ItemType> = { ui: 'ui', blocks: 'block', templates: 'template' };

export const pascal = (name: string) => name.split(/[-/]/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');

export function importPathFor(type: ItemType, name: string) {
	const config = loadConfig();
	if (type === 'ui') return `${config.uiImportPrefix}${name}`;
	if (type === 'block') return `${config.blocksImportPrefix}${name}`;
	if (type === 'template') return `${config.templatesImportPrefix}${name}`;
	return undefined;
}

function loadItem(dir: string, type: ItemType, idPrefix: string): RegistryItem {
	const docsPath = join(dir, 'docs.md');
	const parsed = readMarkdown(docsPath);
	const result = docsFrontmatterSchema.safeParse(parsed.frontmatter);
	if (!result.success) throw new Error(`${relative(pkgPath(), docsPath)}: ${result.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
	const docs = result.data;
	const files = readdirSync(dir).filter((f) => /\.(tsx?|css)$/.test(f));
	const publicFiles: string[] = [];
	const walkPublic = (d: string) => {
		for (const entry of readdirSync(d, { withFileTypes: true })) {
			if (entry.isDirectory()) walkPublic(join(d, entry.name));
			else publicFiles.push(join(d, entry.name));
		}
	};
	if (existsSync(join(dir, 'public'))) walkPublic(join(dir, 'public'));
	const exampleFile = docs.example && files.includes(docs.example) ? docs.example : undefined;
	const exportName = docs.export ?? (type === 'template' ? `${pascal(docs.name)}Template` : pascal(docs.name));
	return {
		name: docs.name,
		id: `${idPrefix}${docs.name}`,
		type,
		version: docs.version,
		dir,
		docs,
		body: parsed.body,
		docsRaw: parsed.raw,
		example: exampleFile ? readFileSync(join(dir, exampleFile), 'utf8') : undefined,
		exampleFile,
		sourceFiles: [...files.filter((f) => f !== exampleFile).map((f) => join(dir, f)), ...publicFiles],
		exportName,
		importPath: importPathFor(type, docs.name),
	};
}

let cache: RegistryItem[] | undefined;
export function loadRegistry(): RegistryItem[] {
	if (cache) return cache;
	const items: RegistryItem[] = [];
	for (const [folder, type] of Object.entries(TYPE_DIRS)) {
		const base = pkgPath('registry', folder);
		if (!existsSync(base)) continue;
		for (const name of readdirSync(base).sort()) {
			const dir = join(base, name);
			if (statSync(dir).isDirectory() && existsSync(join(dir, 'docs.md'))) items.push(loadItem(dir, type, `${folder}/`));
		}
	}
	const flowsBase = pkgPath('registry', 'flows');
	if (existsSync(flowsBase)) {
		for (const flow of readdirSync(flowsBase).sort()) {
			const flowDir = join(flowsBase, flow);
			if (!existsSync(join(flowDir, 'flow.md'))) continue;
			const parsed = readMarkdown(join(flowDir, 'flow.md'));
			const fm = flowFrontmatterSchema.parse(parsed.frontmatter);
			items.push({
				name: fm.name,
				id: `flows/${fm.name}`,
				type: 'flow',
				version: fm.version,
				dir: flowDir,
				docs: { name: fm.name, type: 'flow', version: fm.version, use_for: fm.use_for, never: [], dependencies: [], npm: [] },
				body: parsed.body,
				docsRaw: parsed.raw,
				sourceFiles: [],
				exportName: pascal(fm.name),
			});
			const stepsDir = join(flowDir, 'steps');
			if (!existsSync(stepsDir)) continue;
			for (const step of readdirSync(stepsDir).sort()) {
				const stepDir = join(stepsDir, step);
				if (existsSync(join(stepDir, 'docs.md'))) items.push(loadItem(stepDir, 'flow-step', `flows/${fm.name}/`));
			}
		}
	}
	cache = items;
	return items;
}

export function findItem(query: string): RegistryItem | undefined {
	const items = loadRegistry();
	const q = query.replace(/^\/+|\/+$/g, '').toLowerCase();
	return items.find((i) => i.id === q) ?? items.find((i) => i.name === q && i.type !== 'flow-step') ?? items.find((i) => i.id.endsWith(`/${q}`));
}

let importIndex: Map<string, RegistryItem> | undefined;
export function itemByImport(source: string): RegistryItem | undefined {
	if (!importIndex) {
		importIndex = new Map();
		for (const item of loadRegistry()) {
			if (!item.importPath) continue;
			const prefix = item.importPath.slice(0, item.importPath.lastIndexOf('/') + 1);
			for (const file of item.sourceFiles) if (/\.(tsx?)$/.test(file) && !file.includes('/public/')) importIndex.set(`${prefix}${basename(file).replace(/\.tsx?$/, '')}`, item);
			importIndex.set(item.importPath, item);
		}
	}
	const direct = importIndex.get(source);
	if (direct) return direct;
	for (const [path, item] of importIndex) if (source.endsWith(path.replace(/^@\//, '/'))) return item;
	return undefined;
}

export function renderDocs(item: RegistryItem, installedVersion?: string): string {
	const lines = [item.docsRaw.trim()];
	if (item.example) lines.push('', `Example (${item.exampleFile}):`, '```tsx', item.example.trim(), '```');
	if (installedVersion && installedVersion !== item.version) {
		lines.unshift(`Note: installed ${item.id}@${installedVersion}, these docs are ${item.version}. Run \`${loadConfig().cli} diff\`.`);
	}
	return lines.join('\n');
}

export const docsLineCount = (item: RegistryItem) => lineCount(renderDocs(item));

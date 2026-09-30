import type { Command } from 'commander';
import { parse } from '@babel/parser';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { addItems } from '../lib/install.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { findItem, type RegistryItem, renderDocs } from '../lib/registry.js';

export function usageSnippet(block: RegistryItem, source = block.example, sourceName = block.exampleFile): string {
	if (!source) throw new Error(`${block.id} has no example to scaffold from`);
	const ast = parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] }) as any;
	let found: any;
	const visit = (node: any) => {
		if (found || !node || typeof node.type !== 'string') return;
		if (node.type === 'JSXElement' && node.openingElement.name.name === block.exportName) {
			found = node;
			return;
		}
		for (const key of Object.keys(node)) {
			if (key === 'loc') continue;
			const child = node[key];
			if (Array.isArray(child)) child.forEach(visit);
			else if (child && typeof child === 'object') visit(child);
		}
	};
	visit(ast.program);
	if (!found) throw new Error(`${sourceName} does not render <${block.exportName}>`);
	const raw = source.slice(found.start, found.end);
	const lines = raw.split('\n');
	const indent = Math.min(...lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^\t*/)![0].length), Infinity);
	return [lines[0], ...lines.slice(1).map((l) => l.slice(Number.isFinite(indent) ? indent : 0))].join('\n');
}

export type ScaffoldPlan = { template: RegistryItem; slots: { slot: string; blocks: RegistryItem[] }[]; code: string; out: string };

export function planScaffold(templateName: string, overrides: Record<string, string>, root: string, out?: string): ScaffoldPlan {
	const template = findItem(templateName);
	if (!template || template.type !== 'template') throw new Error(`No template "${templateName}". Run \`${loadConfig().cli} docs\` for the index.`);
	const structure = template.docs.structure!;
	for (const key of Object.keys(overrides)) if (!structure.slots[key]) throw new Error(`Unknown slot "${key}". Slots: ${Object.keys(structure.slots).join(', ')}`);
	const slots: ScaffoldPlan['slots'] = [];
	for (const [slot, def] of Object.entries(structure.slots)) {
		const requested = overrides[slot] ?? def.default;
		if (requested === 'none') {
			if (def.required) throw new Error(`Slot "${slot}" is required and cannot be none`);
			continue;
		}
		const names = requested.split('+');
		if (names.length > def.max) throw new Error(`Slot "${slot}" takes at most ${def.max} blocks`);
		const blocks = names.map((n) => {
			if (!def.allowed.includes(n)) throw new Error(`"${n}" is not allowed in slot "${slot}". Allowed: ${def.allowed.join(', ')}`);
			const block = findItem(`blocks/${n}`);
			if (!block) throw new Error(`Block "${n}" is missing from the registry`);
			return block;
		});
		slots.push({ slot, blocks });
	}
	const imports = new Map<string, string>([[template.importPath!, template.exportName]]);
	for (const s of slots) for (const b of s.blocks) imports.set(b.importPath!, b.exportName);
	const indentBlock = (text: string, tabs: number) => text.split('\n').map((l, i) => (i === 0 ? l : `${'\t'.repeat(tabs)}${l}`)).join('\n');
	const snippet = (slot: string, block: RegistryItem) => {
		const override = join(template.dir, 'slots', `${slot}.${block.name}.example.tsx`);
		return existsSync(override) ? usageSnippet(block, readFileSync(override, 'utf8'), override) : usageSnippet(block);
	};
	const props = slots.map(({ slot, blocks }) => {
		if (blocks.length === 1) return `\t\t\t${slot}={\n\t\t\t\t${indentBlock(snippet(slot, blocks[0]), 4)}\n\t\t\t}`;
		return `\t\t\t${slot}={\n\t\t\t\t<>\n${blocks.map((b) => `\t\t\t\t\t${indentBlock(snippet(slot, b), 5)}`).join('\n')}\n\t\t\t\t</>\n\t\t\t}`;
	});
	const code = [
		...[...imports].map(([source, name]) => `import { ${name} } from '${source}';`),
		'',
		'export default function Page() {',
		'\treturn (',
		`\t\t<${template.exportName}`,
		...props,
		'\t\t/>',
		'\t);',
		'}',
		'',
	].join('\n');
	const project = detectProject(root);
	const appDir = project.appDir ?? (project.srcDir ? 'src/app' : 'app');
	const route = (template.docs.route ?? `/${template.name}`).replace(/^\//, '');
	return { template, slots, code, out: out ?? join(appDir, route, 'page.tsx') };
}

export function registerScaffold(program: Command) {
	program
		.command('scaffold <template>')
		.description('Write a page from a locked template with default blocks in every slot')
		.option('--slot <slot=block...>', 'override a slot: proof=testimonials, pricing=none, features=product-grid+use-case-grid')
		.option('--out <path>', 'output file (default: the template route under the app dir)')
		.option('--force', 'overwrite an existing file')
		.option('--no-add', 'do not install the template and blocks')
		.option('--local', 'install from this package instead of the hosted registry')
		.option('--dry-run', 'print the page without writing')
		.option('--json', 'JSON output')
		.action((templateName: string, opts) => {
			const root = findProjectRoot();
			const overrides: Record<string, string> = {};
			for (const pair of opts.slot ?? []) {
				const [k, v] = String(pair).split('=');
				if (!k || !v) throw new Error(`--slot expects slot=block, got "${pair}"`);
				overrides[k] = v;
			}
			const plan = planScaffold(templateName, overrides, root, opts.out);
			if (opts.dryRun) {
				emit(opts, { out: plan.out, code: plan.code }, () => plan.code);
				return;
			}
			const abs = join(root, plan.out);
			if (existsSync(abs) && !opts.force) throw new Error(`${plan.out} exists. Re-run with --force to replace it, or --out <path>.`);
			if (opts.add) addItems(root, [plan.template, ...plan.slots.flatMap((s) => s.blocks)], { local: opts.local, overwrite: true, quiet: true });
			mkdirSync(dirname(abs), { recursive: true });
			writeFileSync(abs, plan.code);
			emit(opts, { out: plan.out, template: plan.template.id, slots: plan.slots.map((s) => ({ slot: s.slot, blocks: s.blocks.map((b) => b.name) })) }, () =>
				[`Wrote ${plan.out} from ${plan.template.id}@${plan.template.version}`, ...plan.slots.map((s) => `  ${s.slot}: ${s.blocks.map((b) => b.name).join(' + ')}`), '', 'Change copy and choose blocks for optional slots only. Structure is locked.', '', renderDocs(plan.template)].join('\n'),
			);
		});
}

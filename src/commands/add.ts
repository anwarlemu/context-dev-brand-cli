import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cli } from '../lib/brand.js';
import { color } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { Writer } from '../install/files.js';
import { installStyles } from '../install/styles.js';
import { closure, loadIndex } from '../library/registry.js';
import { MARKUP, STYLES, detectProject, styledFiles } from '../project/detect.js';
import { profile } from '../project/surface.js';

// `add <items...>`: copies library components into a React + Tailwind project, with the items they need, the theme,
// and their npm packages, the way shadcn does (the same files, so `npx shadcn add <url>` gives the same result).

type AddOptions = { overwrite?: boolean; dryRun?: boolean };

export function readPackage(root: string): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } {
	try {
		return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
	} catch {
		return {};
	}
}

export async function add(names: string[], opts: AddOptions) {
	const root = findProjectRoot();
	const project = detectProject(root);
	const pkg = readPackage(root);
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };
	if (!deps.react || (project.tailwindMajor ?? 0) < 4) throw new Error(`Library components need React and Tailwind 4. For any other project, \`${cli()}\` applies the brand by restyling it.`);
	if (!project.hasAlias) console.log(color.yellow(`The components import from "@/…". Add "paths": { "@/*": ["./${project.srcDir ? 'src/' : ''}*"] } to tsconfig.json.`));

	const items = await closure(names);
	const base = project.srcDir ? 'src' : '';
	const w = new Writer(root, opts.dryRun);
	const written: string[] = [];
	const kept: string[] = [];
	const npm = new Set<string>();
	for (const item of items) {
		for (const d of item.dependencies ?? []) if (!deps[d.replace(/@[^/]*$/, '') || d]) npm.add(d);
		if (item.type === 'registry:theme') continue;
		for (const f of item.files ?? []) {
			const rel = join(base, f.target ?? f.path);
			if (existsSync(join(root, rel)) && !opts.overwrite) {
				kept.push(rel);
				continue;
			}
			if (!opts.dryRun) {
				mkdirSync(dirname(join(root, rel)), { recursive: true });
				writeFileSync(join(root, rel), f.content ?? '');
			}
			written.push(rel);
		}
	}
	// The theme goes in the way the rest of the CLI installs it: the brand stylesheet and the Tailwind names.
	if (items.some((i) => i.type === 'registry:theme')) {
		const files = styledFiles(root);
		const styleText = files.filter((f) => STYLES.test(f) || MARKUP.test(f)).map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
		installStyles(w, project, profile(root, files).surface, styleText);
	}
	if (npm.size && !opts.dryRun) {
		const pm = project.packageManager;
		const args = pm === 'npm' ? ['install', ...npm] : ['add', ...npm];
		process.stderr.write(`Installing ${[...npm].join(', ')}...\n`);
		const res = spawnSync(pm, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
		if (res.status !== 0) console.log(color.yellow(`Could not install the packages. Run \`${pm} ${args.join(' ')}\`.`));
	}
	recordInstalled(root, items.filter((i) => i.type !== 'registry:theme').map((i) => i.name), opts.dryRun);
	console.log(
		[
			color.bold(`${opts.dryRun ? 'Would add' : 'Added'} ${items.filter((i) => i.type !== 'registry:theme' && i.type !== 'registry:lib').map((i) => i.name).join(', ') || 'nothing new'}.`),
			...written.map((f) => `  + ${f}`),
			...kept.map((f) => color.dim(`  = ${f} (kept; --overwrite replaces it)`)),
			...w.changes.map((c) => color.dim(`  ~ ${c.file} (${c.action}: brand theme)`)),
			...(npm.size ? [`  npm: ${[...npm].join(', ')}`] : []),
		].join('\n'),
	);
}

function recordInstalled(root: string, names: string[], dryRun?: boolean) {
	if (dryRun || !names.length) return;
	const file = join(root, '.ds', 'installed.json');
	let installed: Record<string, string> = {};
	try {
		installed = JSON.parse(readFileSync(file, 'utf8'));
	} catch {}
	for (const n of names) installed[n] = new Date().toISOString();
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, `${JSON.stringify(installed, null, 2)}\n`);
}

/** `list`: every library item, grouped. */
export async function list(opts: { json?: boolean }) {
	const items = (await loadIndex()).filter((i) => i.type !== 'registry:theme' && i.type !== 'registry:lib');
	if (opts.json) return console.log(JSON.stringify(items, null, 2));
	const groups = new Map<string, typeof items>();
	for (const i of items) groups.set(i.type, [...(groups.get(i.type) ?? []), i]);
	for (const [type, list] of groups) {
		console.log(color.bold(type.replace('registry:', '')));
		for (const i of list) console.log(`  ${i.name.padEnd(22)} ${color.dim(i.description ?? '')}`);
	}
	console.log(color.dim(`\nAdd with \`${cli()} add <name>\`.`));
}

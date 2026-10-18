import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cli } from '../lib/brand.js';
import { color } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { Writer } from '../install/files.js';
import { installStyles } from '../install/styles.js';
import { closure } from '../library/registry.js';
import { patchUtils } from '../library/swap.js';
import { MARKUP, STYLES, detectProject, styledFiles } from '../project/detect.js';
import { selfInstall, type RunOptions } from './run.js';
import { installAgents } from '../install/agents.js';
import { profile } from '../project/surface.js';

// `add <items...>`: copies library components into a React + Tailwind project as source the project owns, with the
// items they need, the theme and their npm packages.

type AddOptions = RunOptions & { overwrite?: boolean };

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
	let reactVersion = deps.react ?? '';
	try { reactVersion = JSON.parse(readFileSync(join(root, 'node_modules/react/package.json'), 'utf8')).version; } catch {}
	const react = /([0-9]+)\.([0-9]+)/.exec(reactVersion);
	if (!react || Number(react[1]) < 19 || (Number(react[1]) === 19 && Number(react[2]) < 2) || (project.tailwindMajor ?? 0) < 4) throw new Error(`Library components need React 19.2+ and Tailwind 4. For any other project, \`${cli()}\` applies the brand by restyling it.`);
	if (opts.surface && !['site', 'product'].includes(opts.surface)) throw new Error('--surface is site or product.');
	const warnings = project.hasAlias ? [] : [`Configure @/* in TypeScript and the bundler to resolve to ./${project.srcDir ? 'src/' : ''}*.`];
	const items = await closure(names);
	for (const item of items) for (const file of item.files ?? []) {
		if (!/^(components|lib|hooks)\//.test(file.path) || file.path.split(/[\\/]/).includes('..')) {
			if (item.type !== 'theme') throw new Error(`Invalid registry file path: ${file.path}`);
		}
	}
	selfInstall(root, opts);
	const base = project.srcDir ? 'src' : '';
	const w = new Writer(root, opts.dryRun);
	const written: string[] = [];
	const kept: string[] = [];
	const npm = new Set<string>();
	for (const item of items) {
		for (const d of item.packages ?? []) if (!deps[d]) npm.add(d);
		if (item.type === 'theme') continue;
		for (const f of item.files ?? []) {
			const rel = join(base, f.path);
			// The app's own utils keep their exports; its cn learns the brand's scales.
			if (f.path === 'lib/utils.ts' && existsSync(join(root, rel)) && !opts.overwrite) {
				const patched = patchUtils(readFileSync(join(root, rel), 'utf8'));
				if (patched && !opts.dryRun) writeFileSync(join(root, rel), patched);
				(patched ? written : kept).push(rel);
				continue;
			}
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
	if (items.some((i) => i.type === 'theme')) {
		const files = styledFiles(root);
		const styleText = files.filter((f) => STYLES.test(f) || MARKUP.test(f)).map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
		installStyles(w, project, (opts.surface ?? w.json('.ds/config.json')?.surface ?? profile(root, files).surface) as 'site' | 'product', styleText);
	}
	installAgents(w);
	let packagesInstalled = npm.size === 0;
	if (npm.size && !opts.dryRun) {
		const pm = project.packageManager;
		const args = pm === 'npm' ? ['install', ...npm] : ['add', ...npm];
		process.stderr.write(`Installing ${[...npm].join(', ')}...\n`);
		const res = spawnSync(pm, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
		if (res.status !== 0) throw new Error(`Files were copied, but package installation failed. Run ${pm} ${args.join(' ')} and retry.`);
		packagesInstalled = true;
	}
	recordInstalled(root, items.filter((i) => i.type !== 'theme').map((i) => i.name), opts.dryRun);
	if (opts.json) return console.log(JSON.stringify({ schemaVersion: 1, dryRun: !!opts.dryRun, items: items.map(i => i.name), written, kept, changes: w.changes, packages: [...npm], packagesInstalled, warnings }, null, 2));
	console.log(
		[
			...warnings.map(message => color.yellow(message)),
			color.bold(`${opts.dryRun ? 'Would add' : 'Added'} ${items.filter((i) => i.type !== 'theme' && i.type !== 'lib').map((i) => i.name).join(', ') || 'nothing new'}.`),
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

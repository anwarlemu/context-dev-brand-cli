import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { loadConfig } from './config.js';
import { pkgPath } from './paths.js';
import { findItem, type RegistryItem } from './registry.js';
import { readInstalled, writeInstalled } from './state.js';

export function shadcnBin() {
	const require = createRequire(import.meta.url);
	let dir = dirname(require.resolve('shadcn'));
	while (!existsSync(join(dir, 'package.json')) || JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name !== 'shadcn') {
		if (dirname(dir) === dir) throw new Error(`shadcn is not installed next to ${loadConfig().bin}`);
		dir = dirname(dir);
	}
	const pkgJson = join(dir, 'package.json');
	const pkg = JSON.parse(readFileSync(pkgJson, 'utf8')) as { bin: string | Record<string, string> };
	const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.shadcn;
	return join(pkgJson, '..', bin);
}

// Until the registry is hosted, items install from this package. DS_REGISTRY_URL or registryMode "remote" switch to the hosted one.
export function isLocalRegistry() {
	if (process.env.DS_REGISTRY_LOCAL === '1') return true;
	if (process.env.DS_REGISTRY_URL) return false;
	return loadConfig().registryMode === 'local';
}

export function registryJsonFor(name: string, local: boolean) {
	const localPath = pkgPath('public', 'r-local', `${name}.json`);
	if (local || isLocalRegistry()) return localPath;
	const base = process.env.DS_REGISTRY_URL ?? loadConfig().registryUrl;
	return `${base.replace(/\/$/, '')}/r/${name}.json`;
}

export function dependencyClosure(item: RegistryItem): RegistryItem[] {
	const seen = new Map<string, RegistryItem>();
	const visit = (it: RegistryItem) => {
		if (seen.has(it.id)) return;
		seen.set(it.id, it);
		for (const dep of it.docs.dependencies) {
			const d = findItem(dep);
			if (!d) throw new Error(`${it.id} depends on unknown item ${dep}`);
			visit(d);
		}
	};
	visit(item);
	return [...seen.values()];
}

export function targetFor(item: RegistryItem, file: string) {
	const publicAt = file.indexOf(`${item.dir}/public/`);
	if (publicAt === 0) return file.slice(item.dir.length + 1);
	const folder = item.type === 'ui' ? 'ui' : item.type === 'block' ? 'blocks' : item.type === 'template' ? 'templates' : 'flows';
	return `components/ds/${folder}/${basename(file)}`;
}

export function installedPath(root: string, target: string) {
	if (target.startsWith('public/')) return target;
	return existsSync(join(root, 'src', target)) ? `src/${target}` : target;
}

export type AddOptions = { local?: boolean; overwrite?: boolean; dryRun?: boolean; diff?: boolean; quiet?: boolean };

export function addItems(root: string, items: RegistryItem[], opts: AddOptions) {
	const all = new Map<string, RegistryItem>();
	for (const item of items) for (const d of dependencyClosure(item)) all.set(d.id, d);
	const local = !!opts.local || isLocalRegistry();
	const urls = (local ? [...all.values()] : items).map((i) => registryJsonFor(i.name, local));
	const args = [shadcnBin(), 'add', ...urls, '--yes'];
	if (opts.overwrite) args.push('--overwrite');
	if (opts.dryRun) args.push('--dry-run');
	if (opts.diff) args.push('--diff');
	const run = spawnSync(process.execPath, args, { cwd: root, stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8', env: { ...process.env, CI: '1' } });
	if (run.status !== 0) {
		const detail = opts.quiet ? `\n${run.stdout ?? ''}${run.stderr ?? ''}` : '';
		throw new Error(`shadcn add failed (exit ${run.status}).${isLocalRegistry() ? '' : ' If the hosted registry is unreachable, retry with --local.'}${detail}`);
	}
	if (opts.dryRun || opts.diff) return [...all.values()];
	const installed = readInstalled(root);
	for (const item of all.values()) {
		const files = item.sourceFiles.map((f) => installedPath(root, targetFor(item, f)));
		installed[item.id] = { version: item.version, installedAt: new Date().toISOString(), files };
	}
	writeInstalled(root, installed);
	return [...all.values()];
}

export const readText = (path: string) => (existsSync(path) ? readFileSync(path, 'utf8') : '');

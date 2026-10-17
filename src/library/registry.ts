import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// The component library's items, in shadcn's registry-item format: from a folder (the copy bundled with the CLI, the
// docs build in this repo, or DS_REGISTRY) or fetched from the hosted registry.

export type RegistryFile = { path: string; type: string; target?: string; content?: string };
export type RegistryItem = {
	name: string;
	type: string;
	title?: string;
	description?: string;
	dependencies?: string[];
	registryDependencies?: string[];
	files?: RegistryFile[];
	cssVars?: Record<string, Record<string, string>>;
	css?: Record<string, unknown>;
	meta?: { surface?: string; kinds?: string[] };
};

function sources() {
	const env = process.env.DS_REGISTRY;
	const dirs = [env && !/^https?:/.test(env) ? (isAbsolute(env) ? env : join(process.cwd(), env)) : undefined, pkgPath('r'), pkgPath('apps', 'www', 'public', 'r')].filter((d): d is string => !!d && existsSync(d));
	const url = env && /^https?:/.test(env) ? env.replace(/\/$/, '') : `${(brand() as { registryUrl?: string }).registryUrl ?? ''}/r`;
	return { dirs, url };
}

/** The name an item is known by, from a bare name or a registry URL (https://…/r/button.json). */
export const itemName = (ref: string) => ref.replace(/^.*\//, '').replace(/\.json$/, '');

export async function loadItem(name: string): Promise<RegistryItem> {
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, `${name}.json`);
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
	}
	const res = await fetch(`${url}/${name}.json`).catch(() => undefined);
	if (!res?.ok) throw new Error(`No library item "${name}". \`${'list'}\` shows every item.`);
	return (await res.json()) as RegistryItem;
}

export async function loadIndex(): Promise<{ name: string; type: string; description?: string; meta?: RegistryItem['meta'] }[]> {
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, 'registry.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	const res = await fetch(`${url}/registry.json`).catch(() => undefined);
	if (!res?.ok) throw new Error('The component library could not be reached.');
	return ((await res.json()) as { items: { name: string; type: string; description?: string }[] }).items;
}

/** Every item the given ones need, dependencies first. */
export async function closure(names: string[]): Promise<RegistryItem[]> {
	const seen = new Map<string, RegistryItem>();
	const visit = async (name: string) => {
		if (seen.has(name)) return;
		const item = await loadItem(name);
		seen.set(name, item);
		for (const dep of item.registryDependencies ?? []) await visit(itemName(dep));
	};
	for (const n of names) await visit(itemName(n));
	// Dependencies before the items that need them.
	const order: RegistryItem[] = [];
	const placed = new Set<string>();
	const place = (item: RegistryItem) => {
		if (placed.has(item.name)) return;
		placed.add(item.name);
		for (const dep of item.registryDependencies ?? []) {
			const d = seen.get(itemName(dep));
			if (d) place(d);
		}
		order.push(item);
	};
	for (const item of seen.values()) place(item);
	return order;
}

/** The same, synchronously, from a local copy only (the one bundled with the CLI or this repo's docs build). */
export function loadItemSync(name: string): RegistryItem | undefined {
	for (const dir of sources().dirs) {
		const file = join(dir, `${name}.json`);
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
	}
	return undefined;
}

export function loadIndexSync(): { name: string; type: string }[] {
	for (const dir of sources().dirs) {
		const file = join(dir, 'registry.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	return [];
}

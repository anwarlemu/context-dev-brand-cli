import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// The component library's items: from a folder (the copy bundled with the CLI, the docs build in this repo, or
// DS_REGISTRY) or fetched from the hosted library. Each item is one JSON file: its files with their content, the
// items it requires and the npm packages it imports.

export type ItemType = 'ui' | 'product' | 'site' | 'visual' | 'block' | 'hook' | 'lib' | 'theme';
export type RegistryFile = { path: string; content: string };
export type RegistryItem = {
	name: string;
	type: ItemType;
	title?: string;
	description?: string;
	surface?: string;
	kinds?: string[];
	requires?: string[];
	packages?: string[];
	files?: RegistryFile[];
	schemaVersion?: number;
	revision?: string;
	usage?: string;
	avoid?: string[];
	notes?: string;
	documentation?: string;
	install?: string;
	requirements?: { react: string; tailwindcss: string; alias: string };
	api?: RegistryFile[];
	examples?: { name: string; url: string }[];
	exampleFiles?: RegistryFile[];
	exampleRequires?: string[];
	examplePackages?: string[];
	reference?: { source?: string; url?: string; audit?: string };
};
export type IndexEntry = Omit<RegistryItem, 'files' | 'api' | 'exampleFiles'>;

function sources() {
	const env = process.env.DS_REGISTRY;
	const dirs = [env && !/^https?:/.test(env) ? (isAbsolute(env) ? env : join(process.cwd(), env)) : undefined, !env ? pkgPath('r') : undefined, !env ? pkgPath('apps', 'www', 'public', 'r') : undefined].filter((d): d is string => !!d && existsSync(d));
	const url = env && /^https?:/.test(env) ? env.replace(/\/$/, '') : `${(brand() as { registryUrl?: string }).registryUrl ?? ''}/r`;
	return { dirs, url };
}

/** The name an item is known by, from a bare name or its URL (https://…/r/button.json). */
export function itemName(ref: string) {
	const name = ref.replace(/^.*\//, '').replace(/\.json$/, '');
	if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid library item name: ${name}`);
	return name;
}

export async function loadItem(name: string): Promise<RegistryItem> {
	if (itemName(name) !== name) throw new Error('Use a library item name.');
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, `${name}.json`);
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
	}
	const res = await fetch(`${url}/${name}.json`, { signal: AbortSignal.timeout(15000) }).catch(() => undefined);
	if (!res?.ok) throw new Error(`No library item "${name}". \`${'list'}\` shows every item.`);
	return (await res.json()) as RegistryItem;
}

export async function loadIndex(): Promise<IndexEntry[]> {
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, 'index.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	const res = await fetch(`${url}/index.json`, { signal: AbortSignal.timeout(15000) }).catch(() => undefined);
	if (!res?.ok) throw new Error('The component library could not be reached.');
	return ((await res.json()) as { items: IndexEntry[] }).items;
}

/** Every item the given ones need, dependencies first. */
export async function closure(names: string[]): Promise<RegistryItem[]> {
	const seen = new Map<string, RegistryItem>();
	const visit = async (name: string) => {
		if (seen.has(name)) return;
		const item = await loadItem(name);
		seen.set(name, item);
		for (const dep of item.requires ?? []) await visit(itemName(dep));
	};
	for (const n of names) await visit(itemName(n));
	// Dependencies before the items that need them.
	const order: RegistryItem[] = [];
	const placed = new Set<string>();
	const place = (item: RegistryItem) => {
		if (placed.has(item.name)) return;
		placed.add(item.name);
		for (const dep of item.requires ?? []) {
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

export function loadIndexSync(): IndexEntry[] {
	for (const dir of sources().dirs) {
		const file = join(dir, 'index.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	return [];
}

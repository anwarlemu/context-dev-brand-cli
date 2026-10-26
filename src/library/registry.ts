import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
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

function validateItem(value: any, source: string): RegistryItem {
	if (!value || typeof value.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value.name) || !Array.isArray(value.files)) throw new Error(`Invalid registry item: ${source}`);
	for (const file of value.files) if (typeof file.path !== 'string' || typeof file.content !== 'string') throw new Error(`Invalid registry file in ${source}`);
	if (String(value.type).startsWith('registry:')) throw new Error('This is a shadcn registry item. Use the shadcn add command through this CLI to install it.');
	return value;
}

export async function loadItem(ref: string): Promise<RegistryItem> {
	if (ref.startsWith(`@${brand().bin}/`)) ref = ref.slice(brand().bin.length + 2);
	const remote = /^https?:\/\//.test(ref);
	const local = !remote && /\.json$/.test(ref) && existsSync(ref);
	if (remote || local) {
		const value = local ? JSON.parse(readFileSync(ref, 'utf8')) : await fetch(ref, { signal: AbortSignal.timeout(15000) }).then(response => { if (!response.ok) throw new Error(`Registry returned ${response.status}: ${ref}`); return response.json(); });
		const item = validateItem(value, ref);
		item.requires = (item.requires ?? []).map(dep => /^https?:/.test(dep) ? dep : remote ? new URL(`${itemName(dep)}.json`, ref).href : resolve(dirname(ref), `${itemName(dep)}.json`));
		return item;
	}
	const name = itemName(ref);
	if (name !== ref) throw new Error(`Unsupported item address: ${ref}. Use a name, a JSON file, or an HTTP(S) URL.`);
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, `${name}.json`);
		if (existsSync(file)) return validateItem(JSON.parse(readFileSync(file, 'utf8')), file);
	}
	if (dirs.length) throw new Error(`No library item "${name}". Use search to find an item.`);
	const response = await fetch(`${url}/${name}.json`, { signal: AbortSignal.timeout(15000) });
	if (!response.ok) throw new Error(`No library item "${name}" (${response.status}). Use search to find an item.`);
	return validateItem(await response.json(), name);
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
	const done = new Set<string>(), active = new Set<string>();
	const order: RegistryItem[] = [];
	const visit = async (ref: string) => {
		if (active.has(ref)) throw new Error(`Circular registry dependency: ${[...active, ref].join(' -> ')}`);
		if (done.has(ref)) return;
		active.add(ref);
		const item = await loadItem(ref);
		for (const dependency of item.requires ?? []) await visit(dependency);
		active.delete(ref); done.add(ref); order.push(item);
	};
	for (const name of names) await visit(name);
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

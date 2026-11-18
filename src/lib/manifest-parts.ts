import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { pkgPath } from './paths.js';

// Command entries kept as data in brand/manifest.d/*.json, so each command owns its own entry and `manifest --json`
// reads them all. A name list given as "file#key" is resolved to that object's keys.

export type ManifestEntry = { name: string; usage: string; summary: string; flags: string[]; names?: Record<string, string[] | string>; [k: string]: unknown };

export function manifestParts(): ManifestEntry[] {
	const dir = pkgPath('brand', 'manifest.d');
	if (!existsSync(dir)) return [];
	const out: ManifestEntry[] = [];
	for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
		const doc = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')) as { commands: ManifestEntry[] };
		for (const entry of doc.commands) {
			const names: Record<string, string[] | string> = {};
			for (const [k, v] of Object.entries(entry.names ?? {})) {
				const ref = typeof v === 'string' ? /^(brand\/[\w./-]+\.json)#(\w+)$/.exec(v) : null;
				names[k] = ref ? Object.keys(JSON.parse(readFileSync(pkgPath(ref[1]!), 'utf8'))[ref[2]!] ?? {}) : v;
			}
			out.push({ ...entry, ...(entry.names ? { names } : {}) });
		}
	}
	return out;
}

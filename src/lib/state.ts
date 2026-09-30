import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dsDir } from './paths.js';

function readJson<T>(path: string, fallback: T): T {
	try {
		return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback;
	} catch {
		return fallback;
	}
}

function writeJson(path: string, data: unknown) {
	mkdirSync(join(path, '..'), { recursive: true });
	writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

export type Installed = Record<string, { version: string; installedAt: string; files: string[] }>;
export const readInstalled = (root: string) => readJson<Installed>(join(dsDir(root), 'installed.json'), {});
export const writeInstalled = (root: string, data: Installed) => writeJson(join(dsDir(root), 'installed.json'), data);

type SessionCache = Record<string, { injected: string[]; stopBlocks: number; updatedAt: string; startedAt?: number }>;
const sessionPath = (root: string) => join(dsDir(root), 'session-cache.json');

export function sessionState(root: string, sessionId: string) {
	const all = readJson<SessionCache>(sessionPath(root), {});
	const entry = all[sessionId] ?? { injected: [], stopBlocks: 0, updatedAt: new Date().toISOString() };
	return {
		entry,
		save() {
			entry.updatedAt = new Date().toISOString();
			const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
			for (const [id, value] of Object.entries(all)) if (Date.parse(value.updatedAt) < cutoff) delete all[id];
			all[sessionId] = entry;
			writeJson(sessionPath(root), all);
		},
	};
}

export type Baseline = { createdAt: string; findings: Record<string, number> };
export const readBaseline = (root: string) => readJson<Baseline | null>(join(dsDir(root), 'baseline.json'), null);
export const writeBaseline = (root: string, data: Baseline) => writeJson(join(dsDir(root), 'baseline.json'), data);

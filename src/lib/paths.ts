import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function findProjectRoot(start = process.cwd()): string {
	let dir = resolve(start);
	while (true) {
		if (existsSync(join(dir, 'package.json')) || existsSync(join(dir, '.git'))) return dir;
		const parent = dirname(dir);
		if (parent === dir) return resolve(start);
		dir = parent;
	}
}

export const pkgPath = (...parts: string[]) => join(PKG_ROOT, ...parts);
export const dsDir = (projectRoot: string) => join(projectRoot, '.ds');

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ProjectInfo = { framework: string; frameworkVersion?: string; tailwind?: string; packageManager: string; appDir?: string; srcDir: boolean; hasAlias: boolean };

export function detectProject(root: string): ProjectInfo {
	const pkg = existsSync(join(root, 'package.json')) ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) : {};
	const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
	const framework = deps.next ? 'next' : deps.astro ? 'astro' : deps.vite ? 'vite' : deps.react ? 'react' : 'unknown';
	const packageManager = existsSync(join(root, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(root, 'yarn.lock')) ? 'yarn' : existsSync(join(root, 'bun.lockb')) || existsSync(join(root, 'bun.lock')) ? 'bun' : 'npm';
	const srcDir = existsSync(join(root, 'src'));
	const appDir = ['src/app', 'app'].find((d) => existsSync(join(root, d)));
	const tsconfig = ['tsconfig.json', 'jsconfig.json'].map((f) => join(root, f)).find(existsSync);
	const hasAlias = tsconfig ? /"@\/\*"/.test(readFileSync(tsconfig, 'utf8')) : false;
	return { framework, frameworkVersion: deps.next ?? deps.astro ?? deps.vite, tailwind: deps.tailwindcss ?? deps['@tailwindcss/postcss'], packageManager, appDir, srcDir, hasAlias };
}

export function componentsRoot(root: string) {
	return existsSync(join(root, 'src')) ? 'src/components/ds' : 'components/ds';
}

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type ProjectInfo = { framework: string; frameworkVersion?: string; typescript: boolean; native?: string; tailwind?: string; tailwindMajor?: number; react: boolean; packageManager: string; appDir?: string; srcDir: boolean; hasAlias: boolean };

export function detectProject(root: string): ProjectInfo {
	const pkg = existsSync(join(root, 'package.json')) ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) : {};
	const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
	const framework = deps.next ? 'next' : deps.astro ? 'astro' : deps.vite ? 'vite' : deps.react ? 'react' : 'unknown';
	const packageManager = existsSync(join(root, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(root, 'yarn.lock')) ? 'yarn' : existsSync(join(root, 'bun.lockb')) || existsSync(join(root, 'bun.lock')) ? 'bun' : 'npm';
	const srcDir = existsSync(join(root, 'src'));
	const appDir = ['src/app', 'app'].find((d) => existsSync(join(root, d)));
	const tsconfig = ['tsconfig.json', 'jsconfig.json'].map((f) => join(root, f)).find(existsSync);
	const hasAlias = tsconfig ? /"@\/\*"/.test(readFileSync(tsconfig, 'utf8')) : false;
	const tailwind = deps.tailwindcss ?? deps['@tailwindcss/postcss'] ?? deps['@tailwindcss/vite'];
	// Registry items, blocks and templates are React components; other stacks get the tokens and the checks only.
	const react = !!(deps.react || deps.next);
	return { framework, frameworkVersion: deps.next ?? deps.astro ?? deps.vite, typescript: existsSync(join(root, 'tsconfig.json')), native: nativePlatform(root), tailwind, tailwindMajor: tailwindMajor(tailwind), react, packageManager, appDir, srcDir, hasAlias };
}

function tailwindMajor(range?: string) {
	const major = range?.match(/(\d+)/)?.[1];
	return major ? Number(major) : undefined;
}

/** Whether the registry's components can run here: they are React and styled through the Tailwind 4 theme. */
export const supportsComponents = (project: ProjectInfo) => project.react && (project.tailwindMajor ?? 0) >= 4;

export function requireComponents(root: string, cli: string) {
	const project = detectProject(root);
	if (supportsComponents(project)) return;
	const missing = [project.react ? '' : 'React', (project.tailwindMajor ?? 0) >= 4 ? '' : 'Tailwind 4'].filter(Boolean).join(' and ');
	throw new Error(`Registry components need React with Tailwind 4; this project has no ${missing}. Build with the project's own markup and the var(--ds-*) tokens (\`${cli} tokens --search <term>\`).`);
}

export function componentsRoot(root: string) {
	return existsSync(join(root, 'src')) ? 'src/components/ds' : 'components/ds';
}

/** A native app's platform, from its build files: its colors are converted in its own code, with no stylesheet. */
export function nativePlatform(root: string) {
	if (existsSync(join(root, 'pubspec.yaml'))) return 'Flutter';
	if (existsSync(join(root, 'Package.swift')) || readdirSync(root).some((f) => f.endsWith('.xcodeproj'))) return 'iOS (Swift)';
	if (['build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts'].some((f) => existsSync(join(root, f)))) return 'Android';
	if (readdirSync(root).some((f) => /\.(csproj|sln)$/.test(f))) return '.NET';
	return undefined;
}

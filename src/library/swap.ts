import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Project } from '../project/detect.js';
import { itemName, loadIndexSync, loadItemSync, type RegistryItem } from './registry.js';

// Swap where it matches: an app that already uses shadcn has its components/ui files replaced by the library's, which
// keep shadcn's names and props, so the app's code stays as it is and takes the brand's look. Its cn helper learns the
// brand's scales (so text-body-sm and a text color both survive a merge). The app is type-checked before and after;
// a swap that introduces errors is put back, and that component is restyled like any other instead.

type Aliases = { components: string; ui: string; utils: string; lib: string; hooks: string };
export type SwapResult = { swapped: string[]; reverted: string[]; added: string[]; packages: string[]; utils?: string; checked: boolean };

function readJson(path: string) {
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return undefined;
	}
}

/** Where the app keeps its shadcn components, and the import aliases it uses, from components.json or by looking. */
export function shadcnLayout(project: Project): { uiDir: string; aliases: Aliases } | undefined {
	const root = project.root;
	const config = readJson(join(root, 'components.json')) as { aliases?: Partial<Aliases> } | undefined;
	const base = project.srcDir ? 'src/' : '';
	const toPath = (alias: string) => (alias.startsWith('@/') ? `${base}${alias.slice(2)}` : alias.replace(/^~\//, base));
	const aliases: Aliases = {
		components: config?.aliases?.components ?? '@/components',
		ui: config?.aliases?.ui ?? `${config?.aliases?.components ?? '@/components'}/ui`,
		utils: config?.aliases?.utils ?? '@/lib/utils',
		lib: config?.aliases?.lib ?? '@/lib',
		hooks: config?.aliases?.hooks ?? '@/hooks',
	};
	const uiDir = toPath(aliases.ui);
	if (!existsSync(join(root, uiDir))) return undefined;
	const hasShadcn = !!config || readdirSync(join(root, uiDir)).some((f) => /^button\.tsx$/.test(f) && /buttonVariants|cva\(/.test(readFileSync(join(root, uiDir, f), 'utf8')));
	return hasShadcn ? { uiDir, aliases } : undefined;
}

/** The library's file, with its imports rewritten to the app's aliases. */
function retarget(content: string, a: Aliases) {
	return content
		.replaceAll('"@/components/ui/', `"${a.ui}/`)
		.replaceAll('"@/lib/utils"', `"${a.utils}"`)
		.replaceAll('"@/lib/', `"${a.lib}/`)
		.replaceAll('"@/hooks/', `"${a.hooks}/`)
		.replaceAll('"@/components/', `"${a.components}/`);
}

const BRAND_MERGE = `import { extendTailwindMerge } from "tailwind-merge";

// The brand's scales have their own names (text-body-sm, rounded-card, shadow-floating): taught here so a merge keeps
// both text-body-sm and a text color, and a brand radius replaces a default one.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["sm", "control", "card", "shell", "panel", "pill"],
      shadow: ["card", "raised", "floating", "key", "tooltip", "ring-hover"],
    },
    classGroups: {
      "font-size": [{ text: ["hero", "h1", "h2", "h3", "h4", "h5", "body-lg", "body", "body-sm", "caption", "axis"] }],
    },
  },
});`;

/** Teaches the app's cn the brand's scales, keeping every other export of its utils file. */
export function patchUtils(text: string): string | undefined {
	if (/extendTailwindMerge/.test(text) && /body-sm/.test(text)) return undefined;
	const importRe = /import\s*\{\s*twMerge\s*\}\s*from\s*["']tailwind-merge["'];?/;
	if (importRe.test(text)) return text.replace(importRe, BRAND_MERGE);
	// Newer shadcn re-exports cn from a package; it becomes the brand-aware cn, the same clsx plus tailwind-merge.
	const reexport = /export\s*\{\s*cn\s*\}\s*from\s*["'][^"']+["'];?/;
	if (reexport.test(text)) return text.replace(reexport, `import { type ClassValue, clsx } from "clsx";\n${BRAND_MERGE}\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`);
	return undefined;
}

function typeErrors(root: string): Set<string> | undefined {
	if (!existsSync(join(root, 'tsconfig.json')) || !existsSync(join(root, 'node_modules', 'typescript'))) return undefined;
	const run = spawnSync(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '-p', 'tsconfig.json'], { cwd: root, encoding: 'utf8', timeout: 180_000 });
	return new Set(`${run.stdout}`.split('\n').filter((l) => /error TS\d+/.test(l)));
}

export function swapShadcn(project: Project, { dryRun = false } = {}): SwapResult | undefined {
	const layout = shadcnLayout(project);
	if (!layout) return undefined;
	const root = project.root;
	const library = new Set(loadIndexSync().filter((i) => i.type === 'registry:ui').map((i) => i.name));
	if (!library.size) return undefined;
	const appUi = readdirSync(join(root, layout.uiDir)).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''));
	const matches = appUi.filter((n) => library.has(n));
	if (!matches.length) return undefined;

	const before = dryRun ? undefined : typeErrors(root);
	const backups = new Map<string, string | undefined>();
	const write = (rel: string, content: string) => {
		if (!backups.has(rel)) backups.set(rel, existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : undefined);
		if (dryRun) return;
		mkdirSync(dirname(join(root, rel)), { recursive: true });
		writeFileSync(join(root, rel), content);
	};
	const result: SwapResult = { swapped: [], reverted: [], added: [], packages: [], checked: !!before };
	const pkg = readJson(join(root, 'package.json')) ?? {};
	const installed = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;
	const packages = new Set<string>();
	const seen = new Set<string>();
	const base = project.srcDir ? 'src/' : '';

	const visit = (item: RegistryItem, swapping: boolean) => {
		if (seen.has(item.name)) return;
		seen.add(item.name);
		for (const d of item.dependencies ?? []) if (!installed[d]) packages.add(d);
		for (const dep of item.registryDependencies ?? []) {
			const d = loadItemSync(itemName(dep));
			if (d && d.type !== 'registry:theme') visit(d, false);
		}
		for (const f of item.files ?? []) {
			const target = f.target ?? f.path;
			const rel = target.startsWith('components/ui/') ? `${layout.uiDir}/${target.slice('components/ui/'.length)}` : `${base}${target}`;
			const exists = existsSync(join(root, rel));
			if (target === 'lib/utils.ts' && exists) {
				const patched = patchUtils(readFileSync(join(root, rel), 'utf8'));
				if (patched) {
					write(rel, patched);
					result.utils = rel;
					for (const d of ['clsx', 'tailwind-merge']) if (!installed[d]) packages.add(d);
				}
				continue;
			}
			if (swapping || !exists) {
				write(rel, retarget(f.content ?? '', layout.aliases));
				(swapping ? result.swapped : result.added).push(rel);
			}
		}
	};
	for (const name of matches) {
		const item = loadItemSync(name);
		if (item) visit(item, true);
	}
	result.packages = [...packages];
	if (dryRun) return result;
	if (packages.size) {
		const pm = project.packageManager;
		spawnSync(pm, pm === 'npm' ? ['install', ...packages] : ['add', ...packages], { cwd: root, stdio: 'ignore' });
	}
	// A swap that introduces type errors goes back: the app's own component stays and is restyled instead.
	if (before) {
		const after = typeErrors(root) ?? new Set<string>();
		const fresh = [...after].filter((l) => !before.has(l));
		if (fresh.length) {
			// An error usually shows in the file that uses a component, so a swap is implicated by the files it is imported in.
			const errorFiles = [...new Set(fresh.map((l) => l.replace(/\(\d+,\d+\).*$/, '').trim()))];
			const textOf = (f: string) => {
				try {
					return readFileSync(join(root, f), 'utf8');
				} catch {
					return '';
				}
			};
			for (const rel of result.swapped) {
				const name = rel.split('/').pop()!.replace(/\.tsx$/, '');
				const implicated = errorFiles.some((f) => f === rel || new RegExp(`/ui/${name}["']`).test(textOf(f)));
				if (!implicated) continue;
				const original = backups.get(rel);
				if (original !== undefined) writeFileSync(join(root, rel), original);
				result.reverted.push(rel);
			}
			result.swapped = result.swapped.filter((r) => !result.reverted.includes(r));
		}
	}
	return result;
}

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Project } from '../project/detect.js';
import { itemName, loadIndexSync, loadItemSync, type RegistryItem } from './registry.js';

// Swap where it matches: an app's components that the library also has (a components/ui folder of the same names, or
// its own simple Button, Badge, Card and the like) are replaced by the library's, so the app's code stays as it is and
// takes the brand's look. Its cn helper learns the brand's scales (so text-body-sm and a text color both survive a
// merge). The app is type-checked before and after; a swap that introduces errors is put back, and that component is
// restyled like any other instead.

type Aliases = { components: string; ui: string; utils: string; lib: string; hooks: string };
export type SwapResult = { swapped: string[]; reverted: string[]; added: string[]; packages: string[]; utils?: string; checked: boolean };

function readJson(path: string) {
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return undefined;
	}
}

/** Where the app keeps its interface components (components/ui), and the import aliases the library's files use. */
export function componentLayout(project: Project): { uiDir: string; aliases: Aliases } | undefined {
	if (!project.hasAlias) return undefined;
	const base = project.srcDir ? 'src/' : '';
	return { uiDir: `${base}components/ui`, aliases: { components: '@/components', ui: '@/components/ui', utils: '@/lib/utils', lib: '@/lib', hooks: '@/hooks' } };
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
	// A utils file that re-exports cn from a package gets the brand-aware cn instead, the same clsx plus tailwind-merge.
	const reexport = /export\s*\{\s*cn\s*\}\s*from\s*["'][^"']+["'];?/;
	if (reexport.test(text)) return text.replace(reexport, `import { type ClassValue, clsx } from "clsx";\n${BRAND_MERGE}\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`);
	return undefined;
}

function typeErrors(root: string): Set<string> | undefined {
	if (!existsSync(join(root, 'tsconfig.json')) || !existsSync(join(root, 'node_modules', 'typescript'))) return undefined;
	const run = spawnSync(process.execPath, [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '-p', 'tsconfig.json'], { cwd: root, encoding: 'utf8', timeout: 180_000 });
	return new Set(`${run.stdout}`.split('\n').filter((l) => /error TS\d+/.test(l)));
}

const pascal = (name: string) => name.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());

/**
 * An app's own simple components named like a library component (components/Button.tsx, badge.tsx): a TypeScript file
 * under 150 lines that exports only that component. Each becomes a re-export of the library's, so every use takes the
 * brand; the type check puts back any whose uses need props the library's does not have.
 */
function customCandidates(project: Project, library: Set<string>, skipDir?: string) {
	const root = project.root;
	if (!project.typescript || !project.hasAlias) return [];
	const out: { rel: string; name: string; exportName: string }[] = [];
	const walk = (dir: string, depth: number) => {
		if (depth > 4 || !existsSync(join(root, dir))) return;
		for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
			const rel = `${dir}/${entry.name}`;
			if (entry.isDirectory()) {
				if (!/^(node_modules|\.|_)/.test(entry.name) && rel !== skipDir) walk(rel, depth + 1);
				continue;
			}
			const m = entry.name.match(/^([A-Za-z][\w-]*)\.tsx$/);
			if (!m) continue;
			const name = m[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			if (!library.has(name)) continue;
			const text = readFileSync(join(root, rel), 'utf8');
			const exportName = pascal(name);
			const exports = [...text.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)|export\s*\{([^}]*)\}/g)].flatMap((x) => (x[1] ? [x[1]] : x[2].split(',').map((p) => p.trim().split(/\s+as\s+/).pop()!)));
			if (text.split('\n').length > 150 || /export\s+default/.test(text) || exports.some((e) => e && e !== exportName) || !exports.includes(exportName)) continue;
			out.push({ rel, name, exportName });
		}
	};
	for (const dir of [project.srcDir ? 'src/components' : 'components']) walk(dir, 0);
	return out;
}

export function swapMatching(project: Project, { dryRun = false } = {}): SwapResult | undefined {
	const root = project.root;
	// Only where the type check can catch a swap that does not fit.
	if (!project.typescript) return undefined;
	const library = new Set(loadIndexSync().filter((i) => i.type === 'ui').map((i) => i.name));
	if (!library.size) return undefined;
	const layout = componentLayout(project);
	if (!layout) return undefined;
	const appUi = existsSync(join(root, layout.uiDir)) ? readdirSync(join(root, layout.uiDir)).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, '')) : [];
	const matches = appUi.filter((n) => library.has(n));
	const custom = customCandidates(project, library, layout.uiDir);
	if (!matches.length && !custom.length) return undefined;

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
		for (const d of item.packages ?? []) if (!installed[d]) packages.add(d);
		for (const dep of item.requires ?? []) {
			const d = loadItemSync(itemName(dep));
			if (d && d.type !== 'theme') visit(d, false);
		}
		for (const f of item.files ?? []) {
			const target = f.path;
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
	// The app's own components: the library's file goes in alongside (unless the app has it), and the app's file
	// re-exports it, so imports across the app keep working.
	for (const c of custom) {
		const item = loadItemSync(c.name);
		if (!item) continue;
		visit(item, false);
		write(c.rel, `// The ${c.exportName} from the design system library: same name, the brand's look.\nexport { ${c.exportName} } from "${layout.aliases.ui}/${c.name}";\n`);
		result.swapped.push(c.rel);
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
			const textOf = (f: string) => {
				try {
					return readFileSync(join(root, f), 'utf8');
				} catch {
					return '';
				}
			};
			// The line each error points at usually names the component (<Badge variant="primary">); only when none is
			// named does every swap the file imports count.
			const errorLines = fresh.map((l) => {
				const m = l.match(/^(.*?)\((\d+),\d+\)/);
				return m ? { file: m[1].trim(), text: textOf(m[1].trim()).split('\n')[Number(m[2]) - 1] ?? '' } : { file: l, text: '' };
			});
			const named = (text: string, exportName: string) => new RegExp(`\\b${exportName}\\b`).test(text);
			const exportNames = result.swapped.map((rel) => pascal(rel.split('/').pop()!.replace(/\.tsx$/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()));
			for (const rel of result.swapped) {
				const name = rel.split('/').pop()!.replace(/\.tsx$/, '');
				const exportName = pascal(name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
				const implicated = errorLines.some(
					(e) => e.file === rel || (new RegExp(`/${name}["']`).test(textOf(e.file)) && (named(e.text, exportName) || !exportNames.some((n) => named(e.text, n)))),
				);
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

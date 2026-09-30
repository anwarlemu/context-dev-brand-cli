import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { runCheck, findingKey } from '../check/engine.js';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { PKG_ROOT, findProjectRoot, pkgPath } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { readBaseline, writeBaseline } from '../lib/state.js';
import { gatherInfo } from './info.js';

const START = '<!-- ds:contract:start -->';
const END = '<!-- ds:contract:end -->';

export function renderTemplate(name: string) {
	const config = loadConfig();
	const contract = readFileSync(pkgPath('src', 'skill', 'contract.md'), 'utf8').replaceAll('{{bin}}', config.cli).replaceAll('{{brand}}', config.brand).trim();
	if (name === 'contract') return contract;
	return readFileSync(pkgPath('src', 'skill', name), 'utf8').replaceAll('{{contract}}', contract).replaceAll('{{name}}', config.bin).replaceAll('{{bin}}', config.cli).replaceAll('{{brand}}', config.brand);
}

type Change = { file: string; action: string };

let dryRun = false;

function writeIfChanged(root: string, rel: string, content: string, changes: Change[], action = 'wrote') {
	const abs = join(root, rel);
	if (existsSync(abs) && readFileSync(abs, 'utf8') === content) return;
	changes.push({ file: rel, action: dryRun ? `would ${action.replace(/ed$/, '').replace(/^wrote$/, 'write')}` : action });
	if (dryRun) return;
	mkdirSync(dirname(abs), { recursive: true });
	writeFileSync(abs, content);
}

function appThemeNames(root: string) {
	const names = new Map<string, string>();
	const visit = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (['node_modules', '.next', '.git', 'dist', 'build', '.ds'].includes(entry.name)) continue;
			const abs = join(dir, entry.name);
			if (entry.isDirectory()) visit(abs);
			else if (entry.name.endsWith('.css') && !abs.includes(`/${loadConfig().bin}/`)) {
				for (const m of readFileSync(abs, 'utf8').matchAll(/(--(?:color|text|font|font-weight|radius|ease)-[a-z0-9-]+)\s*:/g)) if (!names.has(m[1])) names.set(m[1], relative(root, abs));
			}
		}
	};
	visit(root);
	return names;
}

function upsertBlock(existing: string, block: string, start = START, end = END) {
	const wrapped = `${start}\n${block}\n${end}`;
	if (existing.includes(start) && existing.includes(end)) return existing.replace(new RegExp(`${start}[\\s\\S]*?${end}`), wrapped);
	return existing.trim() ? `${existing.trimEnd()}\n\n${wrapped}\n` : `${wrapped}\n`;
}

export function binCommand(root: string, harness: 'claude-code' | 'other') {
	const local = join(root, 'node_modules', loadConfig().bin, 'bin.js');
	if (existsSync(local)) return harness === 'claude-code' ? `node "$CLAUDE_PROJECT_DIR/node_modules/${loadConfig().bin}/bin.js"` : `node node_modules/${loadConfig().bin}/bin.js`;
	return `node "${join(PKG_ROOT, 'bin.js')}"`;
}

function mergeClaudeHooks(existing: any, cmd: string, bin: string) {
	const settings = existing ?? {};
	settings.hooks ??= {};
	const ours = (c: string) => c.includes(' hook ') && (c.includes(bin) || c.includes('bin.js'));
	const events: [string, string | undefined, string, number][] = [
		['SessionStart', undefined, 'session-start', 10],
		['UserPromptSubmit', undefined, 'user-prompt-submit', 10],
		['PreToolUse', 'Write|Edit|MultiEdit', 'pre-tool-use', 20],
		['PostToolUse', 'Bash', 'post-tool-use', 10],
		['Stop', undefined, 'stop', 120],
	];
	for (const [event, matcher, name, timeout] of events) {
		const groups: any[] = (settings.hooks[event] ?? []).map((g: any) => ({ ...g, hooks: (g.hooks ?? []).filter((h: any) => !ours(String(h.command ?? ''))) })).filter((g: any) => g.hooks.length);
		groups.push({ ...(matcher ? { matcher } : {}), hooks: [{ type: 'command', command: `${cmd} hook ${name}`, timeout }] });
		settings.hooks[event] = groups;
	}
	return settings;
}

function readJson(path: string) {
	try {
		return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
	} catch {
		throw new Error(`${path} is not valid JSON. Fix it and run init again.`);
	}
}

function findGlobalCss(root: string) {
	for (const p of ['src/app/globals.css', 'app/globals.css', 'src/styles/globals.css', 'styles/globals.css', 'src/index.css', 'src/styles.css']) if (existsSync(join(root, p))) return p;
	return undefined;
}

const THEME_NAMES = /--(text-(display-xl|display|h[1-5]|body-lg|body|body-sm|caption)|color-(brand|surface|fg|fg-muted|tint|line|action)|radius-(card|pill|window))\s*:/;

export function registerInit(program: Command) {
	program
		.command('init')
		.description('Install tokens, contract, skill and hooks into this project (idempotent)')
		.option('--mode <mode>', 'new (replace the Tailwind theme) | scoped (add utilities, keep the app theme) | auto', 'auto')
		.option('--no-baseline', 'do not accept existing findings as legacy')
		.option('--harness <names...>', 'limit to claude-code, cursor, codex')
		.option('--scope <globs...>', 'limit checks and hooks to these paths (scoped mode detects layouts using the brand scope class)')
		.option('--dry-run', 'show what would change, write nothing')
		.option('--json', 'JSON output')
		.action((opts) => {
			dryRun = !!opts.dryRun;
			const root = findProjectRoot();
			const config = loadConfig();
			const project = detectProject(root);
			const changes: Change[] = [];
			const notes: string[] = [];
			const harnesses: string[] = opts.harness ?? config.harnesses;
			const appFiles = project.appDir ? readdirSync(join(root, project.appDir)).length : 0;
			const statePath = join(root, '.ds', 'config.json');
			const saved = existsSync(statePath) ? (JSON.parse(readFileSync(statePath, 'utf8')) as { mode?: string }).mode : undefined;
			const mode = opts.mode !== 'auto' ? opts.mode : saved ?? (appFiles <= 5 && !existsSync(join(root, 'components.json')) ? 'new' : 'scoped');
			writeIfChanged(root, '.ds/config.json', `${JSON.stringify({ mode }, null, 2)}\n`, changes);

			let scopedInclude: string[] | undefined;
			if (mode === 'scoped' || opts.scope) {
				const scope = new Set<string>(opts.scope ?? []);
				if (!opts.scope) {
					const found = spawnSync('grep', ['-rlE', '--include=layout.tsx', '--include=layout.jsx', `\\b${config.scopeClass}\\b`, 'src', 'app'], { cwd: root, encoding: 'utf8' });
					for (const file of found.stdout?.split('\n').filter(Boolean) ?? []) scope.add(`${dirname(file)}/**`);
				}
				scope.add(`${project.srcDir ? 'src/' : ''}components/ds/**`);
				const localCheck = join(root, '.ds', 'check.config.json');
				const current = existsSync(localCheck) ? JSON.parse(readFileSync(localCheck, 'utf8')) : {};
				if (!current.include) {
					const include = [...scope].map((g) => (g.endsWith('/**') ? `${g}/*.{tsx,jsx,ts,js,css,md,mdx}` : g));
					scopedInclude = include;
					writeIfChanged(root, '.ds/check.config.json', `${JSON.stringify({ ...current, include }, null, 2)}\n`, changes);
					notes.push(`Checks and hooks cover only: ${include.join(', ')}. Everything else (the dashboard, auth) keeps its own system. Widen it in .ds/check.config.json.`);
				}
			}

			const cssRel = findGlobalCss(root);
			const stylesDir = cssRel ? dirname(cssRel) : project.srcDir ? 'src/styles' : 'styles';
			const dsCssDir = `${stylesDir}/${config.bin}`;
			writeIfChanged(root, `${dsCssDir}/tokens.css`, readFileSync(pkgPath('build', 'tokens.css'), 'utf8'), changes);
			let themeCss = readFileSync(pkgPath('build', mode === 'new' ? 'theme.css' : 'theme.scoped.css'), 'utf8');
			if (mode === 'scoped') {
				const existing = appThemeNames(root);
				const kept: string[] = [];
				themeCss = themeCss
					.split('\n')
					.filter((line) => {
						const name = line.match(/^\t(--[a-z0-9-]+?)(?:--[a-z-]+)?:/)?.[1];
						if (name && existing.has(name)) {
							kept.push(`${name} (${existing.get(name)})`);
							return false;
						}
						return true;
					})
					.join('\n');
				if (kept.length) notes.push(`Scoped mode kept the app's own value for ${kept.length} theme names it already defines, so the live site does not change: ${[...new Set(kept)].slice(0, 12).join(', ')}${kept.length > 12 ? ', ...' : ''}. Registry blocks using them will render with the app's values until you align them.`);
			}
			writeIfChanged(root, `${dsCssDir}/theme.css`, themeCss, changes);
			if (cssRel) {
				const css = readFileSync(join(root, cssRel), 'utf8');
				const line = `@import "./${config.bin}/theme.css";`;
				if (mode === 'new' && css.includes('--font-geist-sans')) {
					writeIfChanged(root, cssRel, `@import "tailwindcss";\n${line}\n\nbody {\n  background: var(--ds-color-bg-default);\n  color: var(--ds-color-text-default);\n  font-family: var(--ds-font-sans);\n}\n`, changes, 'replaced');
				} else if (!css.includes(line)) {
					const conflicts = css.split('\n').filter((l) => THEME_NAMES.test(l)).map((l) => l.trim());
					if (conflicts.length && mode === 'new') notes.push(`${cssRel} already defines ${conflicts.length} names the design system defines (${conflicts.slice(0, 3).join(' ')}...). The import is placed after the tailwind import so the design system values win. Review the visual change.`);
					const next = /@import\s+["']tailwindcss["'];?/.test(css) ? css.replace(/(@import\s+["']tailwindcss["'];?)/, `$1\n${line}`) : `${line}\n${css}`;
					writeIfChanged(root, cssRel, next, changes, 'patched');
				}
			} else notes.push(`No global CSS found. Import ${dsCssDir}/theme.css after tailwindcss yourself.`);

			const loadsBrandFonts = (() => {
				const hits = spawnSync('grep', ['-rlE', '--include=*.ts', '--include=*.tsx', 'Rethink_Sans|--font-rethink-sans', 'src', 'app', 'lib'], { cwd: root, encoding: 'utf8' });
				return !!hits.stdout?.trim() && !hits.stdout.includes('ds-fonts.ts');
			})();
			if (loadsBrandFonts) notes.push('The app already loads Rethink Sans (--font-rethink-sans), so no font loader was added.');
			if (project.framework === 'next' && !loadsBrandFonts) {
				const libDir = project.srcDir ? 'src/lib' : 'lib';
				const fonts = `import { Doto, IBM_Plex_Mono, Rethink_Sans } from 'next/font/google';\n\nconst rethinkSans = Rethink_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-rethink-sans' });\nconst doto = Doto({ subsets: ['latin'], weight: ['800'], variable: '--font-doto' });\nconst ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-ibm-plex-mono' });\n\nexport const dsFontVariables = \`\${rethinkSans.variable} \${doto.variable} \${ibmPlexMono.variable}\`;\n`;
				writeIfChanged(root, `${libDir}/ds-fonts.ts`, fonts, changes);
				const layoutRel = project.appDir ? `${project.appDir}/layout.tsx` : undefined;
				if (layoutRel && existsSync(join(root, layoutRel))) {
					const layout = readFileSync(join(root, layoutRel), 'utf8');
					if (!layout.includes('dsFontVariables')) {
						if (mode === 'new' && /Geist/.test(layout)) {
							const patched = layout
								.replace(/import \{[^}]*\} from ["']next\/font\/google["'];?\n/, "import { dsFontVariables } from '@/lib/ds-fonts';\n")
								.replace(/const geist\w*\s*=\s*\w+\(\{[\s\S]*?\}\);\n\n?/g, '')
								.replace(/className=\{`\$\{geistSans\.variable\} \$\{geistMono\.variable\}([^`]*)`\}/, 'className={`${dsFontVariables}$1`}');
							writeIfChanged(root, layoutRel, patched, changes, 'patched');
						} else notes.push(`Add \`dsFontVariables\` from '@/lib/ds-fonts' to the <html> className in ${layoutRel}.`);
					}
				}
			}

			const pkgJson = existsSync(join(root, 'package.json')) ? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) : undefined;
			if (pkgJson && !{ ...pkgJson.dependencies, ...pkgJson.devDependencies }['tailwind-merge']) {
				const install = project.packageManager === 'npm' ? ['install', 'tailwind-merge@^3'] : ['add', 'tailwind-merge@^3'];
				const run = dryRun ? { status: 0 } : spawnSync(project.packageManager, install, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
				if (run.status === 0) changes.push({ file: 'package.json', action: dryRun ? 'would add tailwind-merge' : 'added tailwind-merge' });
				else notes.push(`Could not install tailwind-merge (${project.packageManager} ${install.join(' ')}). Install it before adding registry items.`);
			}

			if (!existsSync(join(root, 'components.json'))) {
				const components = { $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true, tailwind: { config: '', css: cssRel ?? 'app/globals.css', baseColor: 'neutral', cssVariables: true, prefix: '' }, aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' }, iconLibrary: 'lucide', registries: { [`@${config.presetId}`]: `${config.registryUrl}/r/{name}.json` } };
				writeIfChanged(root, 'components.json', `${JSON.stringify(components, null, 2)}\n`, changes);
			}

			const contract = renderTemplate('contract');
			if (!existsSync(join(root, 'CLAUDE.md')) && existsSync(join(root, 'AGENTS.md'))) writeIfChanged(root, 'CLAUDE.md', '@AGENTS.md\n', changes);
			const claudeImportsAgents = dryRun && !existsSync(join(root, 'CLAUDE.md')) && existsSync(join(root, 'AGENTS.md')) ? true : existsSync(join(root, 'CLAUDE.md')) && /^@AGENTS\.md\s*$/m.test(readFileSync(join(root, 'CLAUDE.md'), 'utf8'));
			for (const rel of claudeImportsAgents ? ['AGENTS.md'] : ['CLAUDE.md', 'AGENTS.md']) {
				const existing = existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : '';
				writeIfChanged(root, rel, upsertBlock(existing, contract), changes, existing ? 'patched' : 'wrote');
			}
			const skill = renderTemplate('SKILL.md');
			if (harnesses.includes('claude-code')) writeIfChanged(root, `.claude/skills/${config.bin}/SKILL.md`, skill, changes);
			if (harnesses.includes('cursor')) {
				writeIfChanged(root, '.cursor/rules/ds.mdc', `---\ndescription: ${config.brand} design system contract\nalwaysApply: true\n---\n\n${START}\n${contract}\n${END}\n`, changes);
				writeIfChanged(root, `.cursor/skills/${config.bin}/SKILL.md`, skill, changes);
			}
			if (harnesses.includes('codex')) writeIfChanged(root, `.agents/skills/${config.bin}/SKILL.md`, skill, changes);

			const claudeCmd = binCommand(root, 'claude-code');
			const otherCmd = binCommand(root, 'other');
			if (harnesses.includes('claude-code')) {
				const settings = mergeClaudeHooks(readJson(join(root, '.claude', 'settings.json')), claudeCmd, config.bin);
				writeIfChanged(root, '.claude/settings.json', `${JSON.stringify(settings, null, 2)}\n`, changes);
			}
			if (harnesses.includes('codex')) {
				const settings = mergeClaudeHooks(readJson(join(root, '.codex', 'hooks.json')), otherCmd.replace(/^node /, 'node '), config.bin);
				writeIfChanged(root, '.codex/hooks.json', `${JSON.stringify(settings, null, 2)}\n`, changes);
			}
			if (harnesses.includes('cursor')) {
				const existing = readJson(join(root, '.cursor', 'hooks.json')) ?? { version: 1, hooks: {} };
				existing.hooks ??= {};
				const strip = (list: any[] = []) => list.filter((h) => !String(h.command ?? '').includes(' hook '));
				existing.hooks.afterFileEdit = [...strip(existing.hooks.afterFileEdit), { command: `${otherCmd} hook after-file-edit --harness cursor` }];
				existing.hooks.stop = [...strip(existing.hooks.stop), { command: `${otherCmd} hook stop --harness cursor` }];
				writeIfChanged(root, '.cursor/hooks.json', `${JSON.stringify(existing, null, 2)}\n`, changes);
			}

			writeIfChanged(root, `.github/workflows/${config.bin}.yml`, readFileSync(pkgPath('src', 'ci', 'consumer-workflow.yml'), 'utf8').replaceAll('{{name}}', config.bin).replaceAll('{{cli}}', config.cli), changes);

			if (existsSync(join(root, '.git'))) {
				const hookPath = join(root, '.git', 'hooks', 'pre-commit');
				const existing = existsSync(hookPath) ? readFileSync(hookPath, 'utf8') : '#!/bin/sh\n';
				const block = `${otherCmd} check --changed || { echo "${config.cli} check failed. Fix the errors above before committing."; exit 1; }`;
				const next = upsertBlock(existing.startsWith('#!') ? existing : `#!/bin/sh\n${existing}`, block, '# ds:pre-commit:start', '# ds:pre-commit:end');
				if (next !== existing && dryRun) changes.push({ file: '.git/hooks/pre-commit', action: 'would write' });
				else if (next !== existing) {
					mkdirSync(dirname(hookPath), { recursive: true });
					writeFileSync(hookPath, next);
					chmodSync(hookPath, 0o755);
					changes.push({ file: '.git/hooks/pre-commit', action: existing.includes('ds:pre-commit') ? 'patched' : 'wrote' });
				}
			}

			const gitignore = existsSync(join(root, '.gitignore')) ? readFileSync(join(root, '.gitignore'), 'utf8') : '';
			if (!gitignore.includes('.ds/session-cache.json')) writeIfChanged(root, '.gitignore', `${gitignore.trimEnd()}\n.ds/session-cache.json\n.ds/review/\n`.replace(/^\n/, ''), changes, 'patched');

			if (opts.baseline && !readBaseline(root)) {
				const result = runCheck({ projectRoot: root, useBaseline: false, include: scopedInclude });
				if (result.findings.length) {
					const findings: Record<string, number> = {};
					for (const f of result.findings) findings[findingKey(f)] = (findings[findingKey(f)] ?? 0) + 1;
					if (!dryRun) writeBaseline(root, { createdAt: new Date().toISOString(), findings });
					changes.push({ file: '.ds/baseline.json', action: `${dryRun ? 'would write' : 'wrote'} (${result.findings.length} legacy findings accepted)` });
				}
			}

			const info = gatherInfo(root);
			emit(opts, { mode, changes, notes, info }, () =>
				[
					changes.length ? `${config.bin} init (${mode} mode)${dryRun ? ', dry run, nothing written' : ''}: ${changes.length} change${changes.length > 1 ? 's' : ''}` : `${config.bin} init: already up to date, nothing changed.`,
					...changes.map((c) => `  ${c.action.padEnd(8)} ${c.file}`),
					...notes.map((n) => color.yellow(`  note: ${n}`)),
					'',
					`Hooks: claude-code [${info.hooks['claude-code'].join(', ')}], cursor [${info.hooks.cursor.join(', ') || 'none'}], codex [${info.hooks.codex.join(', ') || 'none'}], pre-commit [${info.hooks['pre-commit'].join(', ') || 'none'}]`,
					`Next: ${config.cli} resolve "<task>"`,
				].join('\n'),
			);
		});
}

export { relative };

import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { runCheck, findingKey } from '../check/engine.js';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { PKG_ROOT, findProjectRoot, pkgPath } from '../lib/paths.js';
import { detectProject, supportsComponents } from '../lib/project.js';
import { installArgs } from '../lib/source.js';
import { readBaseline, writeBaseline } from '../lib/state.js';
import { gatherInfo } from './info.js';

const START = '<!-- ds:contract:start -->';
const END = '<!-- ds:contract:end -->';

/** `full: false` renders the styling-only contract for existing sites: restyle what is there, never content or structure. */
export function renderTemplate(name: string, { full = true } = {}) {
	const config = loadConfig();
	const contract = readFileSync(pkgPath('src', 'skill', full ? 'contract.md' : 'contract.styles.md'), 'utf8').replaceAll('{{bin}}', config.cli).replaceAll('{{brand}}', config.brand).trim();
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

// Each harness runs hooks from a different directory, so the command finds the project's copy its own way: Claude Code
// and Cursor name the project dir; Codex runs in the session's cwd, which may be a subfolder, so it asks git.
export function binCommand(root: string, harness: 'claude-code' | 'codex' | 'cursor' | 'other') {
	const bin = loadConfig().bin;
	if (!existsSync(join(root, 'node_modules', bin, 'bin.js'))) return `node "${join(PKG_ROOT, 'bin.js')}"`;
	if (harness === 'claude-code') return `node "$CLAUDE_PROJECT_DIR/node_modules/${bin}/bin.js"`;
	if (harness === 'cursor') return `node "$CURSOR_PROJECT_DIR/node_modules/${bin}/bin.js"`;
	if (harness === 'codex') return `node "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/node_modules/${bin}/bin.js"`;
	return `node node_modules/${bin}/bin.js`;
}

function mergeClaudeHooks(existing: any, cmd: string, bin: string, harness: 'claude-code' | 'codex' = 'claude-code') {
	const settings = existing ?? {};
	settings.hooks ??= {};
	const ours = (c: string) => c.includes(' hook ') && (c.includes(bin) || c.includes('bin.js'));
	const events: [string, string | undefined, string, number][] = [
		['SessionStart', undefined, 'session-start', 10],
		['UserPromptSubmit', undefined, 'user-prompt-submit', 10],
		// Codex reports file edits as apply_patch; Edit and Write are its aliases for it.
		['PreToolUse', harness === 'codex' ? 'apply_patch|Edit|Write' : 'Write|Edit|MultiEdit', 'pre-tool-use', 20],
		['PostToolUse', 'Bash', 'post-tool-use', 10],
		['Stop', undefined, 'stop', 120],
	];
	for (const [event, matcher, name, timeout] of events) {
		const groups: any[] = (settings.hooks[event] ?? []).map((g: any) => ({ ...g, hooks: (g.hooks ?? []).filter((h: any) => !ours(String(h.command ?? ''))) })).filter((g: any) => g.hooks.length);
		groups.push({ ...(matcher ? { matcher } : {}), hooks: [{ type: 'command', command: `${cmd} hook ${name}${harness === 'codex' ? ' --harness codex' : ''}`, timeout }] });
		settings.hooks[event] = groups;
	}
	return settings;
}

/**
 * Writes the check into .git/hooks/pre-commit. Git does not commit that folder, so a fresh clone has no hook; the
 * session start hook calls this too, which puts it back for whoever opens the project with an agent.
 */
export function installPreCommit(root: string) {
	if (!existsSync(join(root, '.git'))) return undefined;
	const config = loadConfig();
	const hookPath = join(root, '.git', 'hooks', 'pre-commit');
	const existing = existsSync(hookPath) ? readFileSync(hookPath, 'utf8') : '#!/bin/sh\n';
	const block = `${binCommand(root, 'other')} check --changed || { echo "${config.cli} check failed. Fix the errors above before committing."; exit 1; }`;
	const next = upsertBlock(existing.startsWith('#!') ? existing : `#!/bin/sh\n${existing}`, block, '# ds:pre-commit:start', '# ds:pre-commit:end');
	if (next === existing) return undefined;
	if (dryRun) return 'would write';
	mkdirSync(dirname(hookPath), { recursive: true });
	writeFileSync(hookPath, next);
	chmodSync(hookPath, 0o755);
	return existing.includes('ds:pre-commit') ? 'patched' : 'wrote';
}

function readJson(path: string) {
	try {
		return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;
	} catch {
		throw new Error(`${path} is not valid JSON. Fix it and run init again.`);
	}
}

export function findGlobalCss(root: string) {
	for (const p of ['src/app/globals.css', 'app/globals.css', 'src/styles/globals.css', 'src/styles/global.css', 'styles/globals.css', 'styles/global.css', 'src/index.css', 'src/styles.css']) if (existsSync(join(root, p))) return p;
	// Otherwise the stylesheet holding the site's own variables: the .css file with the most custom properties in :root.
	let best: { rel: string; vars: number } | undefined;
	const visit = (dir: string, depth: number) => {
		if (depth > 4 || !existsSync(join(root, dir))) return;
		for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
			const rel = dir ? `${dir}/${entry.name}` : entry.name;
			if (entry.isDirectory() && !['node_modules', 'dist', 'build', '.next', '.astro', loadConfig().bin].includes(entry.name)) visit(rel, depth + 1);
			else if (entry.name.endsWith('.css')) {
				const css = readFileSync(join(root, rel), 'utf8');
				const vars = css.includes(':root') ? (css.match(/--[\w-]+\s*:/g) ?? []).length : 0;
				if (vars && (!best || vars > best.vars)) best = { rel, vars };
			}
		}
	};
	for (const dir of ['src', 'styles', 'public', 'app']) visit(dir, 0);
	return best?.rel;
}

/** The agent running this command, from the variables each one sets in its shell tool. Codex is checked first because
 * a Codex started from a Claude Code terminal inherits CLAUDECODE. */
export function runningHarness(env = process.env): 'claude-code' | 'codex' | 'cursor' | undefined {
	if (env.CODEX_THREAD_ID || env.CODEX_SESSION_ID) return 'codex';
	if (env.CLAUDECODE) return 'claude-code';
	if (env.CURSOR_AGENT || env.CURSOR_TRACE_ID) return 'cursor';
	return undefined;
}

const HARNESS_NAMES = { 'claude-code': 'Claude Code', codex: 'Codex', cursor: 'Cursor' } as const;

const THEME_NAMES = /--(text-(display-xl|display|h[1-5]|body-lg|body|body-sm|caption)|color-(brand|surface|fg|fg-muted|tint|line|action)|radius-(card|pill|window))\s*:/;

// What to do after init, addressed to whoever ran it. An agent acts on everything it reads here, so setup for the
// other agents' files stays out of its instructions: those files are inert until a teammate uses that agent.
function nextSteps(harnesses: string[], dry: boolean, full: boolean) {
	const cli = loadConfig().cli;
	const current = runningHarness();
	const others = harnesses.filter((h) => h !== current).map((h) => HARNESS_NAMES[h as keyof typeof HARNESS_NAMES]);
	if (dry) return [`Dry run. Run \`${cli} init\` to apply.`];
	const lines = [
		current ? `Set up for ${HARNESS_NAMES[current]}, the agent running this.` : 'Set up.',
		`Next: commit the files above. That is the whole setup; nothing else to install or run.`,
	];
	if (others.length) lines.push(`  ${others.join(' and ')} files were written for teammates who use ${others.length > 1 ? 'them' : 'it'}. ${current ? `Do not open, install or configure ${others.join(' or ')} yourself.` : ''}`.trimEnd());
	if (current === 'codex') lines.push('  Tell the user: Codex runs these hooks once they trust them with /hooks in Codex. You cannot do this for them.');
	else if (!current && harnesses.includes('codex')) lines.push('  Codex users trust the hooks once with /hooks in Codex.');
	if (full) lines.push(`  From now on: \`${cli} resolve "<task>"\` before UI work; \`${cli} update\` for design system changes.`);
	else {
		lines.push(`  Styling only: the design system changes how this project looks (a site or a product), never its copy or which elements it has.`);
		lines.push(`  The brand is installed, not applied: pages look the same until \`${cli} apply\` runs. It restyles every page, so run it only when the user asks to apply the brand.`);
		lines.push(`  From now on: no raw values in styles (\`${cli} tokens --search <term>\` finds the token); \`${cli} update\` for design system changes.`);
	}
	return lines;
}

export function registerInit(program: Command) {
	program
		.command('init')
		.description('Install tokens, contract, skill and hooks into this project (idempotent)')
		.option('--mode <mode>', 'new (replace the Tailwind theme) | scoped (add utilities, keep the app theme) | auto', 'auto')
		.option('--no-baseline', 'do not accept existing findings as legacy')
		.option('--harness <names...>', 'limit to claude-code, cursor, codex')
		.option('--scope <globs...>', 'limit checks and hooks to these paths (scoped mode detects layouts using the brand scope class)')
		.option('--rules <rules>', 'styles (an existing site: restyle only, never copy or structure) | all (a new app built from the templates). Default: all only for a fresh React + Tailwind 4 app')
		.option('--no-install', 'when run through npx, do not add the package to the project first')
		.option('--dry-run', 'show what would change, write nothing')
		.option('--json', 'JSON output')
		.action((opts) => {
			dryRun = !!opts.dryRun;
			const root = findProjectRoot();
			const config = loadConfig();
			// Run as `npx <source> init`, this copy lives in npx's cache. Hooks need a copy inside the project, so install
			// the package from its source branch and hand over to that copy, which does the rest.
			if (opts.install && !dryRun && /[\\/]_npx[\\/]/.test(PKG_ROOT) && existsSync(join(root, 'package.json'))) {
				const pm = detectProject(root).packageManager;
				const args = installArgs(pm, config.source);
				process.stderr.write(`Adding ${config.source} to this project (${pm} ${args.join(' ')})...\n`);
				const install = spawnSync(pm, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
				const local = join(root, 'node_modules', config.bin, 'bin.js');
				if (install.status !== 0 || !existsSync(local)) throw new Error(`Could not install ${config.source}. Run \`${pm} ${args.join(' ')}\` and then \`${config.cli} init\`.`);
				const handOff = spawnSync(process.execPath, [local, ...process.argv.slice(process.argv.indexOf('init')), '--no-install'], { cwd: process.cwd(), stdio: 'inherit' });
				process.exit(handOff.status ?? 1);
			}
			const project = detectProject(root);
			const changes: Change[] = [];
			const notes: string[] = [];
			const harnesses: string[] = opts.harness ?? config.harnesses;
			const appFiles = project.appDir ? readdirSync(join(root, project.appDir)).length : 0;
			const statePath = join(root, '.ds', 'config.json');
			const saved = existsSync(statePath) ? (JSON.parse(readFileSync(statePath, 'utf8')) as { mode?: string }).mode : undefined;
			const mode = opts.mode !== 'auto' ? opts.mode : saved ?? (appFiles <= 5 && !existsSync(join(root, 'components.json')) ? 'new' : 'scoped');
			const savedRules = existsSync(statePath) ? (JSON.parse(readFileSync(statePath, 'utf8')) as { rules?: string }).rules : undefined;
			if (opts.rules && !['styles', 'all'].includes(opts.rules)) throw new Error('--rules is styles or all');
			const rules: 'styles' | 'all' = opts.rules ?? savedRules ?? (mode === 'new' && supportsComponents(project) ? 'all' : 'styles');
			writeIfChanged(root, '.ds/config.json', `${JSON.stringify({ mode, rules }, null, 2)}\n`, changes);

			let scopedInclude: string[] | undefined;
			if (mode === 'scoped' || opts.scope) {
				const scope = new Set<string>(opts.scope ?? []);
				if (!opts.scope) {
					const found = spawnSync('grep', ['-rlE', '--include=layout.tsx', '--include=layout.jsx', `\\b${config.scopeClass}\\b`, 'src', 'app'], { cwd: root, encoding: 'utf8' });
					for (const file of found.stdout?.split('\n').filter(Boolean) ?? []) scope.add(`${dirname(file)}/**`);
				}
				const localCheck = join(root, '.ds', 'check.config.json');
				const current = existsSync(localCheck) ? JSON.parse(readFileSync(localCheck, 'utf8')) : {};
				const dsGlob = `${project.srcDir ? 'src/' : ''}components/ds/**`;
				const toGlob = (g: string) => (g.endsWith('/**') ? `${g}/*.{tsx,jsx,ts,js,css,md,mdx,astro,vue,svelte,html}` : g);
				// Narrow the checks only to parts the project marked as on the brand (layouts with the scope class) or that
				// --scope names. A site with neither is restyled as a whole; a scope of components/ds alone would check nothing.
				if (scope.size && !current.include) {
					scope.add(dsGlob);
					const include = [...scope].map(toGlob);
					scopedInclude = include;
					writeIfChanged(root, '.ds/check.config.json', `${JSON.stringify({ ...current, include }, null, 2)}\n`, changes);
					notes.push(`Checks and hooks cover only: ${include.join(', ')}. Everything else (the dashboard, auth) keeps its own system. Widen it in .ds/check.config.json.`);
				} else if (!scope.size && Array.isArray(current.include) && current.include.length === 1 && current.include[0] === toGlob(dsGlob)) {
					// Earlier versions wrote that empty scope; widen it to the whole project.
					const { include: _drop, ...rest } = current;
					writeIfChanged(root, '.ds/check.config.json', `${JSON.stringify(rest, null, 2)}\n`, changes, 'widened');
				}
			}
			const cssRel = findGlobalCss(root);
			const stylesDir = cssRel ? dirname(cssRel) : project.srcDir ? 'src/styles' : 'styles';
			const dsCssDir = `${stylesDir}/${config.bin}`;
			writeIfChanged(root, `${dsCssDir}/tokens.css`, readFileSync(pkgPath('build', 'tokens.css'), 'utf8'), changes);
			// theme.css is Tailwind 4 (@theme) and the components need React, so other stacks get the tokens alone.
			const tailwindTheme = (project.tailwindMajor ?? 0) >= 4;
			const componentKit = supportsComponents(project);
			if (tailwindTheme) {
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
			} else if (cssRel) {
				const css = readFileSync(join(root, cssRel), 'utf8');
				const line = `@import "./${config.bin}/tokens.css";`;
				if (!css.includes(line)) {
					// An @import has to come before every rule: after a @charset, leading comments and the file's own imports.
					const lead = css.match(/^(?:\s*(?:@charset[^;]*;|@import[^;]*;|\/\*[\s\S]*?\*\/))*/)?.[0] ?? '';
					writeIfChanged(root, cssRel, `${lead}${lead ? '\n' : ''}${line}\n${css.slice(lead.length).replace(/^\n/, '')}`, changes, 'patched');
				}
				notes.push(`${project.tailwindMajor ? `Tailwind ${project.tailwindMajor}` : 'No Tailwind'}, so only the tokens were installed: CSS variables (var(--ds-*)) imported into ${cssRel}. They change nothing until styles use them.${project.tailwindMajor === 3 ? ` Tailwind 3 classes for them: the preset in node_modules/${config.bin}/build/tailwind.preset.ts.` : ''}`);
			} else notes.push(project.native ? `${project.native} app: \`${config.cli} apply\` converts its colors to the brand in its own code; \`${config.cli} tokens\` lists every value (sizes, radii, type) to use in it.` : `No global CSS found. The tokens are in ${dsCssDir}/tokens.css for the site's main stylesheet to import.`);

			const loadsBrandFonts = (() => {
				const hits = spawnSync('grep', ['-rlE', '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx', 'Rethink_Sans|--font-rethink-sans', 'src', 'app', 'lib'], { cwd: root, encoding: 'utf8' });
				return !!hits.stdout?.trim() && !/ds-fonts\.[jt]s/.test(hits.stdout);
			})();
			if (loadsBrandFonts) notes.push('The app already loads Rethink Sans (--font-rethink-sans), so no font loader was added.');
			if (project.framework === 'next' && !loadsBrandFonts) {
				const libDir = project.srcDir ? 'src/lib' : 'lib';
				const fonts = `import { Doto, IBM_Plex_Mono, Rethink_Sans } from 'next/font/google';\n\nconst rethinkSans = Rethink_Sans({ subsets: ['latin'], variable: '--font-rethink-sans' });\nconst doto = Doto({ subsets: ['latin'], weight: ['800'], variable: '--font-doto' });\nconst ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-ibm-plex-mono' });\n\nexport const dsFontVariables = \`\${rethinkSans.variable} \${doto.variable} \${ibmPlexMono.variable}\`;\n`;
				writeIfChanged(root, `${libDir}/ds-fonts.${project.typescript ? 'ts' : 'js'}`, fonts, changes);
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
			if (project.native) notes.push('Brand typefaces: add Rethink Sans (text), IBM Plex Mono (code) and Doto (figures) to the app as fonts and set them on its text styles.');
			else if (!project.framework.startsWith('next') && !loadsBrandFonts) notes.push('Brand typefaces (Rethink Sans, Doto, IBM Plex Mono) are not loaded. The site needs them from Google Fonts once its styles use var(--ds-font-sans).');
			if (componentKit && rules === 'all' && pkgJson && !{ ...pkgJson.dependencies, ...pkgJson.devDependencies }['tailwind-merge']) {
				const install = project.packageManager === 'npm' ? ['install', 'tailwind-merge@^3'] : ['add', 'tailwind-merge@^3'];
				const run = dryRun ? { status: 0 } : spawnSync(project.packageManager, install, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
				if (run.status === 0) changes.push({ file: 'package.json', action: dryRun ? 'would add tailwind-merge' : 'added tailwind-merge' });
				else notes.push(`Could not install tailwind-merge (${project.packageManager} ${install.join(' ')}). Install it before adding registry items.`);
			}

			if (componentKit && rules === 'all' && !existsSync(join(root, 'components.json'))) {
				const components = { $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true, tailwind: { config: '', css: cssRel ?? 'app/globals.css', baseColor: 'neutral', cssVariables: true, prefix: '' }, aliases: { components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' }, iconLibrary: 'lucide', registries: { [`@${config.presetId}`]: `${config.registryUrl}/r/{name}.json` } };
				writeIfChanged(root, 'components.json', `${JSON.stringify(components, null, 2)}\n`, changes);
			}

			const contract = renderTemplate('contract', { full: rules === 'all' });
			if (!existsSync(join(root, 'CLAUDE.md')) && existsSync(join(root, 'AGENTS.md'))) writeIfChanged(root, 'CLAUDE.md', '@AGENTS.md\n', changes);
			const claudeImportsAgents = dryRun && !existsSync(join(root, 'CLAUDE.md')) && existsSync(join(root, 'AGENTS.md')) ? true : existsSync(join(root, 'CLAUDE.md')) && /^@AGENTS\.md\s*$/m.test(readFileSync(join(root, 'CLAUDE.md'), 'utf8'));
			for (const rel of claudeImportsAgents ? ['AGENTS.md'] : ['CLAUDE.md', 'AGENTS.md']) {
				const existing = existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : '';
				writeIfChanged(root, rel, upsertBlock(existing, contract), changes, existing ? 'patched' : 'wrote');
			}
			// The skill teaches resolve, scaffold and add, which only work where the components do.
			const skill = componentKit && rules === 'all' ? renderTemplate('SKILL.md') : undefined;
			if (skill && harnesses.includes('claude-code')) writeIfChanged(root, `.claude/skills/${config.bin}/SKILL.md`, skill, changes);
			if (harnesses.includes('cursor')) {
				writeIfChanged(root, '.cursor/rules/ds.mdc', `---\ndescription: ${config.brand} design system contract\nalwaysApply: true\n---\n\n${START}\n${contract}\n${END}\n`, changes);
				if (skill) writeIfChanged(root, `.cursor/skills/${config.bin}/SKILL.md`, skill, changes);
			}
			if (skill && harnesses.includes('codex')) writeIfChanged(root, `.agents/skills/${config.bin}/SKILL.md`, skill, changes);

			const claudeCmd = binCommand(root, 'claude-code');
			const codexCmd = binCommand(root, 'codex');
			const cursorCmd = binCommand(root, 'cursor');
			if (harnesses.includes('claude-code')) {
				const settings = mergeClaudeHooks(readJson(join(root, '.claude', 'settings.json')), claudeCmd, config.bin);
				writeIfChanged(root, '.claude/settings.json', `${JSON.stringify(settings, null, 2)}\n`, changes);
			}
			if (harnesses.includes('codex')) {
				const settings = mergeClaudeHooks(readJson(join(root, '.codex', 'hooks.json')), codexCmd, config.bin, 'codex');
				writeIfChanged(root, '.codex/hooks.json', `${JSON.stringify(settings, null, 2)}\n`, changes);
			}
			if (harnesses.includes('cursor')) {
				const existing = readJson(join(root, '.cursor', 'hooks.json')) ?? { version: 1, hooks: {} };
				existing.hooks ??= {};
				const strip = (list: any[] = []) => list.filter((h) => !String(h.command ?? '').includes(' hook '));
				// preToolUse can deny a write before it lands (afterFileEdit cannot); stop sends the agent back while errors remain.
				existing.hooks.afterFileEdit = strip(existing.hooks.afterFileEdit);
				if (!existing.hooks.afterFileEdit.length) delete existing.hooks.afterFileEdit;
				existing.hooks.preToolUse = [...strip(existing.hooks.preToolUse), { command: `${cursorCmd} hook pre-tool-use --harness cursor`, matcher: 'Write|Edit|MultiEdit|StrReplace|apply_patch', timeout: 20 }];
				existing.hooks.stop = [...strip(existing.hooks.stop), { command: `${cursorCmd} hook stop --harness cursor`, loop_limit: 5 }];
				writeIfChanged(root, '.cursor/hooks.json', `${JSON.stringify(existing, null, 2)}\n`, changes);
			}

			writeIfChanged(root, `.github/workflows/${config.bin}.yml`, readFileSync(pkgPath('src', 'ci', 'consumer-workflow.yml'), 'utf8').replaceAll('{{name}}', config.bin).replaceAll('{{cli}}', config.cli), changes);

			const preCommit = installPreCommit(root);
			if (preCommit) changes.push({ file: '.git/hooks/pre-commit', action: preCommit });

			const gitignore = existsSync(join(root, '.gitignore')) ? readFileSync(join(root, '.gitignore'), 'utf8') : '';
			// Local run state stays out of git; .ds/baseline.json and .ds/approved-overrides.json are committed.
			const ignoreLines = ['.ds/session-cache.json', '.ds/review/', '.ds/hooks.log', '.ds/watch.json', '.ds/update-check.json'].filter((l) => !gitignore.split('\n').includes(l));
			if (ignoreLines.length) writeIfChanged(root, '.gitignore', `${gitignore.trimEnd()}\n${ignoreLines.join('\n')}\n`.replace(/^\n/, ''), changes, 'patched');

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
			emit(opts, { mode, changes, notes, next: nextSteps(harnesses, dryRun, rules === 'all'), info }, () =>
				[
					changes.length ? `${config.bin} init (${mode} mode)${dryRun ? ', dry run, nothing written' : ''}: ${changes.length} change${changes.length > 1 ? 's' : ''}` : `${config.bin} init: already up to date, nothing changed.`,
					...changes.map((c) => `  ${c.action.padEnd(8)} ${c.file}`),
					...notes.map((n) => color.yellow(`  note: ${n}`)),
					'',
					`Hooks: claude-code [${info.hooks['claude-code'].join(', ')}], cursor [${info.hooks.cursor.join(', ') || 'none'}], codex [${info.hooks.codex.join(', ') || 'none'}], pre-commit [${info.hooks['pre-commit'].join(', ') || 'none'}]`,
					...nextSteps(harnesses, dryRun, rules === 'all').map((l) => (l.startsWith('  ') ? l : color.bold(l))),
				].join('\n'),
			);
		});
}

export { relative };

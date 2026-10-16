import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatFinding, runCheck } from '../check/engine.js';
import { convertProject } from '../convert/project.js';
import { installAgents, runningHarness } from '../install/agents.js';
import { Writer } from '../install/files.js';
import { installDots, installStyles } from '../install/styles.js';
import { brand, cli } from '../lib/brand.js';
import { color, emit } from '../lib/output.js';
import { PKG_ROOT, findProjectRoot } from '../lib/paths.js';
import { MARKUP, STYLES, detectProject, styledFiles } from '../project/detect.js';
import { listScreens, shellFiles } from '../project/screens.js';
import { type Surface, profile } from '../project/surface.js';
import { type State, readState, writeState } from '../plan/state.js';
import { MAX_SCREENS, mainScreens, renderTask, taskStatus } from '../plan/tasks.js';

// The one command: the first run installs the brand and converts every style value; every run after that prints the
// next task, until each main screen passes its review and the whole project passes the check.

export type RunOptions = { surface?: string; theme?: string; redo?: boolean; dryRun?: boolean; install?: boolean; json?: boolean };

export function run(opts: RunOptions) {
	const root = findProjectRoot();
	selfInstall(root, opts);
	const existing = readState(root);
	if (!existing || opts.redo || opts.surface || opts.theme) return setUp(root, opts, existing);
	return next(root, existing, opts);
}

/** Run through npx, this copy lives in npx's cache; hooks need a copy in the project, so install it there and hand over. */
function selfInstall(root: string, opts: RunOptions) {
	if (opts.install === false || opts.dryRun || !/[\\/]_npx[\\/]/.test(PKG_ROOT)) return;
	const b = brand();
	// A plain site with no package.json gets a minimal private one, so the tool and its hooks have a home.
	if (!existsSync(join(root, 'package.json'))) writeFileSync(join(root, 'package.json'), `${JSON.stringify({ name: root.split('/').pop()?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'site', private: true }, null, 2)}\n`);
	const pm = detectProject(root).packageManager;
	const args = pm === 'npm' ? ['install', '--save-dev', b.source] : ['add', pm === 'bun' ? '-d' : '-D', b.source];
	process.stderr.write(`Adding ${b.name}'s design system to this project (${pm} ${args.join(' ')})...\n`);
	const install = spawnSync(pm, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
	const local = join(root, 'node_modules', b.bin, 'bin.js');
	if (install.status !== 0 || !existsSync(local)) throw new Error(`Could not install ${b.source}. Run \`${pm} ${args.join(' ')}\`, then \`${cli()}\`.`);
	const handOff = spawnSync(process.execPath, [local, ...process.argv.slice(2), '--no-install'], { cwd: process.cwd(), stdio: 'inherit' });
	process.exit(handOff.status ?? 1);
}

function setUp(root: string, opts: RunOptions, previous?: State) {
	const project = detectProject(root);
	const files = styledFiles(root);
	const found = profile(root, files);
	if (opts.surface && !['site', 'product'].includes(opts.surface)) throw new Error('--surface is site or product.');
	const surface: Surface = (opts.surface as Surface | undefined) ?? previous?.surface ?? found.surface;
	const theme = opts.theme === 'dark' ? 'dark' : previous?.theme ?? 'light';
	const mixed = !opts.surface && found.mixed;
	const converted = convertProject(project, files, mixed ? 'site' : surface, { dryRun: opts.dryRun, theme });
	const w = new Writer(root, opts.dryRun);
	const styleText = files.filter((f) => STYLES.test(f) || MARKUP.test(f)).map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
	const styles = installStyles(w, project, mixed ? 'site' : surface, styleText);
	const dots = surface === 'site' || mixed ? installDots(w, project) : [];
	installAgents(w);
	const fixed = opts.dryRun ? 0 : runCheck(root, { fix: true }).fixed;
	const screens = listScreens(detectProject(root), styledFiles(root), { ...found, surface, mixed });
	const shell = shellFiles(project, files);
	if (screens[0]) screens[0].files = [...new Set([...screens[0].files, ...shell])];
	const state: State = { version: 2, surface, mixed, theme, appliedAt: new Date().toISOString(), baseUrl: previous?.baseUrl, screens, marked: previous?.marked ?? [], reviews: previous?.reviews ?? {} };
	if (!opts.dryRun) writeState(root, state);
	const left = opts.dryRun ? undefined : runCheck(root);
	const s = converted.stats;
	const values = s.colors + s.fonts + s.type + s.radius + s.spacing + s.motion + s.shadows;
	const harness = runningHarness();
	emit(opts, { surface, mixed, evidence: found.reasons, converted: { files: converted.written.length, ...s }, fixed, left: left?.findings.length, styles, dots, changes: w.changes, screens: screens.map((x) => x.id) }, () =>
		[
			color.bold(`${brand().name} design system ${opts.dryRun ? 'dry run (nothing written)' : previous ? 'applied again' : 'installed and applied'}.`),
			`  This is ${mixed ? 'a site with product screens (each route gets its own look)' : surface === 'product' ? 'a product: an app people work in' : 'a site: pages people read and act on'}. Evidence: ${found.reasons.slice(0, 4).join('; ') || 'none, so it is treated as a site'}.${opts.surface ? '' : ` Wrong? \`${cli()} --surface ${surface === 'site' ? 'product' : 'site'}\`.`}`,
			`  Converted ${values} style values in ${converted.written.length} files to brand tokens${converted.palette.mode === 'dark' && theme !== 'dark' ? ' (the dark interface becomes the brand\'s light one)' : ''}; ${fixed} more matched exactly.${left ? ` ${left.findings.length} left to change by hand, listed in the tasks.` : ''}`,
			`  Brand stylesheet: ${styles.brandCss}${styles.imported ? `, imported by ${styles.imported}` : styles.linked.length ? `, linked from ${styles.linked.length} pages` : ''}; fonts load ${styles.fonts === 'brand.css' ? 'with it' : `through ${styles.fonts}`}.${dots.length ? ` Hero dots script loads in ${dots.length} layout${dots.length > 1 ? 's' : ''}.` : ''}`,
			...(converted.marks.length ? [`  Redrew ${converted.marks.length} light one-color marks (logos, icons) for the white page: ${converted.marks.slice(0, 3).join(', ')}${converted.marks.length > 3 ? ', ...' : ''}`] : []),
			...(converted.rasterLogos.length ? [`  Logo images drawn for the dark site (not recolored): ${converted.rasterLogos.join(', ')}. Check each on white; a white one-color mark needs filter: brightness(0).`] : []),
			...styles.notes.map((n) => color.yellow(`  Note: ${n}`)),
			`  Agents are kept on it: the rules are in AGENTS.md and CLAUDE.md, and hooks check every write in Claude Code, Codex and Cursor, plus a git pre-commit check.${harness === 'codex' ? ' Tell the user: Codex runs the hooks once they trust them with /hooks.' : ''}`,
			`  ${screens.length} screens found; the ${Math.min(screens.length, MAX_SCREENS)} main ones are tasks.`,
			'',
			...(opts.dryRun ? [] : [nextText(root, state)]),
		].join('\n'),
	);
}

function nextText(root: string, state: State) {
	const screens = mainScreens(state);
	const total = screens.length + 1;
	for (const [i, screen] of screens.entries()) {
		const status = taskStatus(root, state, screen, i);
		if (!status.done) return renderTask(root, state, status, i, total);
	}
	// The final sweep: every file in the project passes the check.
	const all = runCheck(root);
	if (all.findings.length) {
		const byFile = new Map<string, number>();
		for (const f of all.findings) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
		return [
			color.bold(`Task ${total} of ${total}: the rest of the project (${all.findings.length} values in ${byFile.size} files are not brand tokens yet).`),
			...[...byFile].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([f, n]) => `    ${String(n).padStart(4)}  ${f}`),
			`  \`${cli()} check <file>\` lists each value with the token to use. Then run \`${cli()}\` again.`,
			...all.findings.slice(0, 3).map((f) => color.dim(`  e.g. ${formatFinding(f)}`)),
		].join('\n');
	}
	return [color.bold(`Done: every main screen passed its review and the whole project passes the check.`), `  Show the person the result (desktop and phone) before committing. From now on the hooks keep new work on the brand.`].join('\n');
}

function next(root: string, state: State, opts: RunOptions) {
	const screens = mainScreens(state);
	const done = screens.filter((s, i) => taskStatus(root, state, s, i).done).length;
	const text = nextText(root, state);
	emit(opts, { done, total: screens.length + 1 }, () => [color.dim(`${brand().name} design system: ${done} of ${screens.length} screens done.`), text].join('\n'));
}

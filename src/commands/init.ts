import { readFileSync } from 'node:fs';
import { installAgents } from '../install/agents.js';
import { Writer } from '../install/files.js';
import { installStyles } from '../install/styles.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { MARKUP, STYLES, detectProject, styledFiles } from '../project/detect.js';
import { selfInstall, type RunOptions } from './run.js';

/** Set up a design-system workspace without converting the application's existing styles or creating a restyle queue. */
export function init(opts: RunOptions) {
	if (opts.surface !== 'site' && opts.surface !== 'product') throw new Error('Choose --surface site or --surface product.');
	const root = findProjectRoot();
	selfInstall(root, opts);
	const project = detectProject(root);
	const w = new Writer(root, opts.dryRun);
	const text = styledFiles(root).filter(f => STYLES.test(f) || MARKUP.test(f)).map(f => readFileSync(root + '/' + f, 'utf8')).join('\n');
	const styles = project.framework === 'native' ? undefined : installStyles(w, project, opts.surface, text);
	w.write('.ds/config.json', JSON.stringify({ schemaVersion: 1, surface: opts.surface }, null, 2) + '\n');
	installAgents(w);
	const componentsSupported = ['next', 'react', 'vite'].includes(project.framework) && (project.tailwindMajor ?? 0) >= 4;
	const next = componentsSupported ? [`${cli()} list --surface ${opts.surface} --json`, `${cli()} inspect <name> --json`, `${cli()} add <name> --surface ${opts.surface} --json`] : [`${cli()} guide`, `${cli()} tokens --json`, `${cli()} check --changed --json`];
	emit(opts, { schemaVersion: 1, mode: 'build', dryRun: !!opts.dryRun, surface: opts.surface, framework: project.framework, changes: w.changes, styles, guide: '.ds/guide.md', componentsSupported, next }, () => [
		`${opts.dryRun ? 'Would initialize' : 'Initialized'} the ${opts.surface} design system. Existing component styles were not converted.`,
		...w.changes.map(c => `  ${c.action}: ${c.file}`),
		...(styles?.notes ?? []),
		`Read .ds/guide.md. Next: ${next.join('; ')}.`,
		...(!componentsSupported ? ['React components need React 19.2+ and Tailwind 4. Use tokens with the existing stack, or set up those requirements before add.'] : []),
	].join('\n'));
}

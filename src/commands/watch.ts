import type { Command } from 'commander';
import { appendFileSync, existsSync, mkdirSync, type FSWatcher, watch, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { formatFinding, isInScope, runCheck } from '../check/engine.js';
import { loadCheckConfig, loadConfig } from '../lib/config.js';
import { color } from '../lib/output.js';
import { dsDir, findProjectRoot } from '../lib/paths.js';

const IGNORED = /(^|\/)(node_modules|\.git|\.next|\.ds|dist|build|out|\.turbo|\.vercel)(\/|$)/;
const SETTLE_MS = 150;

export type WatchStatus = Record<string, { errors: number; at: string }>;

/** Checks one changed file and returns its line for the terminal, or undefined when it is out of scope. */
export function checkChanged(root: string, rel: string, status: WatchStatus) {
	const config = loadCheckConfig(root);
	if (!isInScope(rel, config) || !existsSync(join(root, rel))) return undefined;
	const result = runCheck({ projectRoot: root, paths: [join(root, rel)] });
	const errors = result.findings.filter((f) => f.severity === 'error');
	status[rel] = { errors: errors.length, at: new Date().toISOString() };
	const lines = errors.length
		? [color.red(`✗ ${rel}  ${errors.length} error${errors.length > 1 ? 's' : ''}`), ...errors.slice(0, 20).map((f) => `  ${formatFinding(f)}`)]
		: [color.green(`✓ ${rel}`)];
	for (const o of result.overrides) lines.push(color.yellow(`  ds-override ${o.file}:${o.line} ${o.overridden}`));
	return { errors: errors.length, text: lines.join('\n') };
}

export function registerWatch(program: Command) {
	program
		.command('watch')
		.description('Check every file as it is saved. For agents and editors without hooks: errors show the moment a file lands')
		.option('--json', 'one JSON line per checked file')
		.action((opts) => {
			const root = findProjectRoot();
			const bin = loadConfig().cli;
			const status: WatchStatus = {};
			const timers = new Map<string, ReturnType<typeof setTimeout>>();
			mkdirSync(dsDir(root), { recursive: true });
			const statusPath = join(dsDir(root), 'watch.json');
			const run = (rel: string) => {
				const out = checkChanged(root, rel, status);
				if (!out) return;
				// The status file lets an agent (or `info`) read the current state without the terminal.
				writeFileSync(statusPath, `${JSON.stringify(status, null, 2)}\n`);
				appendFileSync(join(dsDir(root), 'hooks.log'), `${JSON.stringify({ at: new Date().toISOString(), harness: 'watch', event: 'save', exit: out.errors ? 2 : 0, blocked: out.errors > 0 })}\n`);
				if (opts.json) process.stdout.write(`${JSON.stringify({ file: rel, errors: out.errors })}\n`);
				else process.stdout.write(`${out.text}\n`);
			};
			let watcher: FSWatcher;
			try {
				watcher = watch(root, { recursive: true }, (_event, name) => {
					if (!name) return;
					const rel = relative(root, join(root, String(name))).split(sep).join('/');
					if (IGNORED.test(rel)) return;
					clearTimeout(timers.get(rel));
					timers.set(rel, setTimeout(() => run(rel), SETTLE_MS));
				});
			} catch (error) {
				throw new Error(`Cannot watch ${root}: ${(error as Error).message}`);
			}
			if (!opts.json) process.stdout.write(`${bin} watch: checking files in ${root} as they are saved. Ctrl+C to stop.\n`);
			const stop = () => {
				watcher.close();
				process.exit(Object.values(status).some((s) => s.errors) ? 1 : 0);
			};
			process.on('SIGINT', stop);
			process.on('SIGTERM', stop);
		});
}

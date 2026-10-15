import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { emit } from '../lib/output.js';
import { dsDir, findProjectRoot } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { gitRemote, installArgs, installedCommit, latestCommit, sourceSpec } from '../lib/source.js';

const short = (sha?: string) => sha?.slice(0, 7) ?? 'unknown';

export function registerUpdate(program: Command) {
	program
		.command('update')
		.description('Install the latest design system from its source branch, then refresh tokens, contract and hooks (re-runs init)')
		.option('--check', 'only say whether a newer version exists')
		.option('--json', 'JSON output')
		.action((opts) => {
			const root = findProjectRoot();
			const config = loadConfig();
			const spec = sourceSpec(root);
			const remote = gitRemote(spec);
			const before = installedCommit(root);
			const latest = remote ? latestCommit(remote) : undefined;
			if (opts.check) {
				const behind = !!(latest && before && latest !== before);
				emit(opts, { spec, installed: before, latest, behind }, () =>
					!remote ? `Installed from ${spec}, not a git branch; nothing to check.` : !latest ? `Could not reach ${remote.url}.` : behind ? `A newer version is on ${remote.ref}: ${short(before)} -> ${short(latest)}. Run \`${config.cli} update\`.` : `Up to date with ${remote.ref} (${short(before ?? latest)}).`,
				);
				return;
			}
			const pm = detectProject(root).packageManager;
			if (remote) {
				// Installing the spec again makes the package manager resolve the branch to its newest commit.
				const args = installArgs(pm, spec);
				if (!opts.json) process.stdout.write(`${pm} ${args.join(' ')}\n`);
				const install = spawnSync(pm, args, { cwd: root, stdio: opts.json ? 'pipe' : 'inherit' });
				if (install.status !== 0) throw new Error(`${pm} ${args.join(' ')} failed.`);
			}
			rmSync(join(dsDir(root), 'update-check.json'), { force: true });
			const after = installedCommit(root);
			// The new copy refreshes the files init owns (tokens, theme, contract, skill, hooks); its own code runs, not this one.
			const local = join(root, 'node_modules', config.bin, 'bin.js');
			const init = spawnSync(process.execPath, [existsSync(local) ? local : process.argv[1], 'init', '--json'], { cwd: root, encoding: 'utf8' });
			if (init.status !== 0) throw new Error(`init failed after the update:\n${init.stderr}`);
			const result = JSON.parse(init.stdout) as { changes: { file: string; action: string }[]; info: { installed: { id: string; drift: string }[] } };
			const behind = result.info.installed.filter((i) => i.drift === 'behind').map((i) => i.id.split('/').pop());
			emit(opts, { spec, before, after, changes: result.changes, behindItems: behind }, () =>
				[
					remote ? (before === after ? `Already at the latest ${remote.ref} (${short(after)}).` : `Updated ${spec}: ${short(before)} -> ${short(after)}.`) : `Installed from ${spec}; refreshed from it.`,
					result.changes.length ? `Refreshed: ${result.changes.map((c) => c.file).join(', ')}` : 'Tokens, contract and hooks were already current.',
					behind.length ? `Installed components with newer versions: ${behind.join(', ')}. Run \`${config.cli} diff\`, then \`${config.cli} add ${behind.join(' ')} --overwrite\` for the ones not edited by hand.` : '',
					before !== after || result.changes.length ? 'Commit the changed files so teammates and CI get the same version.' : '',
				]
					.filter(Boolean)
					.join('\n'),
			);
		});
}

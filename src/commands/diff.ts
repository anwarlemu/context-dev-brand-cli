import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { findItem } from '../lib/registry.js';
import { readInstalled } from '../lib/state.js';

export function registerDiff(program: Command) {
	program
		.command('diff')
		.description('Compare installed items with the registry: versions behind and local edits')
		.option('--json', 'JSON output')
		.action((opts) => {
			const root = findProjectRoot();
			const rows = Object.entries(readInstalled(root)).map(([id, entry]) => {
				const item = findItem(id);
				const edits: { file: string; diff: string }[] = [];
				for (const file of entry.files) {
					const source = item?.sourceFiles.find((f) => basename(f) === basename(file));
					if (!source || !existsSync(join(root, file))) continue;
					const d = spawnSync('git', ['diff', '--no-index', '--no-color', source, join(root, file)], { encoding: 'utf8' });
					if (d.stdout.trim()) edits.push({ file, diff: d.stdout });
				}
				return { id, installed: entry.version, latest: item?.version ?? 'removed', behind: item ? item.version !== entry.version : true, edits };
			});
			emit(opts, rows, () => {
				if (!rows.length) return 'Nothing installed.';
				return rows.map((r) => `${r.id}  installed ${r.installed}  latest ${r.latest}${r.behind ? '  BEHIND' : ''}${r.edits.length ? `  EDITED (${r.edits.map((e) => e.file).join(', ')})` : ''}${r.edits.map((e) => `\n${e.diff}`).join('')}`).join('\n');
			});
		});
}

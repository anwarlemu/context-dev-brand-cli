import { loadConfig } from '../lib/config.js';
import type { Command } from 'commander';
import { addItems } from '../lib/install.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { findItem, renderDocs } from '../lib/registry.js';

export function registerAdd(program: Command) {
	program
		.command('add <names...>')
		.description('Install registry items with the shadcn CLI, record versions, print docs')
		.option('--dry-run', 'show what would change')
		.option('--diff', 'show the diff against installed files')
		.option('--overwrite', 'replace local files (restores hand-edited items)')
		.option('--local', 'install from this package instead of the hosted registry')
		.option('--json', 'JSON output')
		.action((names: string[], opts) => {
			const root = findProjectRoot();
			const items = names.map((n) => {
				const item = findItem(n);
				if (!item) throw new Error(`No registry item "${n}"`);
				if (item.type === 'flow') throw new Error(`${n} is a flow. Add its steps: ${loadConfig().cli} docs ${item.id}`);
				return item;
			});
			const added = addItems(root, items, { ...opts, quiet: !!opts.json });
			emit(opts, { added: added.map((i) => ({ id: i.id, version: i.version })) }, () => {
				if (opts.dryRun || opts.diff) return '';
				return [`Added ${added.map((i) => `${i.id}@${i.version}`).join(', ')}`, '', ...items.map((i) => renderDocs(i))].join('\n');
			});
		});
}

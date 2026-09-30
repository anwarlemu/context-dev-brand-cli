import type { Command } from 'commander';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { findItem, loadRegistry, renderDocs } from '../lib/registry.js';
import { readInstalled } from '../lib/state.js';

export function docsIndex() {
	const groups: Record<string, string[]> = {};
	for (const item of loadRegistry()) {
		const label = item.type === 'flow-step' ? 'flow steps' : `${item.type}s`;
		(groups[label] ??= []).push(`${item.id}  ${item.docs.use_for}${item.docs.variants ? `  [${item.docs.variants.join(', ')}]` : ''}`);
	}
	return groups;
}

export function registerDocs(program: Command) {
	program
		.command('docs [name]')
		.description('Docs for one item (80 lines max), or the index of every item')
		.option('--json', 'JSON output')
		.action((name: string | undefined, opts) => {
			if (!name) {
				const groups = docsIndex();
				emit(opts, groups, () => Object.entries(groups).map(([g, lines]) => `${g}:\n${lines.map((l) => `  ${l}`).join('\n')}`).join('\n\n'));
				return;
			}
			const item = findItem(name);
			if (!item) throw new Error(`No registry item "${name}". Run \`docs\` with no name for the index.`);
			const installed = readInstalled(findProjectRoot())[item.id]?.version;
			const text = renderDocs(item, installed);
			emit(opts, { id: item.id, version: item.version, installed, frontmatter: item.docs, body: item.body, example: item.example, text }, () => text);
		});
}

import type { Command } from 'commander';
import { loadConfig } from '../lib/config.js';
import { resolveIntent } from '../lib/intents.js';
import { emit } from '../lib/output.js';
import { findItem, loadRegistry, renderDocs } from '../lib/registry.js';

export function templateIndex() {
	return loadRegistry().filter((i) => i.type === 'template' || i.type === 'flow').map((i) => `${i.id}  ${i.docs.use_for}`);
}

export function resolveTask(text: string) {
	const bin = loadConfig().cli;
	const r = resolveIntent(text);
	if (r.kind === 'match') {
		const item = findItem(r.target);
		return {
			...r,
			item: item?.id,
			instruction: item?.type === 'template' ? `Start from \`${bin} scaffold ${item.name}\`. Do not build structure by hand.` : `Build each step with \`${bin} docs ${r.target}/<step>\`.`,
			docs: item ? renderDocs(item) : undefined,
		};
	}
	if (r.kind === 'out_of_scope') return { ...r, instruction: r.reason };
	return { ...r, instruction: `No template matches. Pick one explicitly with \`${bin} scaffold <template>\`, or ask the user.`, index: templateIndex() };
}

export function registerResolve(program: Command) {
	program
		.command('resolve <text...>')
		.description('Map a task to its template or flow by lookup (never calls a model)')
		.option('--json', 'JSON output')
		.action((words: string[], opts) => {
			const result = resolveTask(words.join(' '));
			emit(opts, result, () => {
				if (result.kind === 'match') return [`Match: "${result.matched}" -> ${result.target}`, result.instruction, '', result.docs ?? ''].join('\n');
				if (result.kind === 'out_of_scope') return `Out of scope: "${result.matched}". ${result.instruction}`;
				return [`No match.`, result.instruction, '', 'Templates:', ...(result.index ?? []).map((l) => `  ${l}`)].join('\n');
			});
		});
}

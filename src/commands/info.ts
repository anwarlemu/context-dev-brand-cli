import type { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../lib/config.js';
import { emit } from '../lib/output.js';
import { PKG_ROOT, findProjectRoot } from '../lib/paths.js';
import { detectProject } from '../lib/project.js';
import { findItem } from '../lib/registry.js';
import { readBaseline, readInstalled } from '../lib/state.js';

export function hookStatus(root: string) {
	const read = (p: string) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
	const claude = read('.claude/settings.json');
	return {
		'claude-code': ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop'].filter((e) => claude.includes(`"${e}"`) && claude.includes(' hook ')),
		cursor: read('.cursor/hooks.json').includes(' hook ') ? ['installed'] : [],
		codex: read('.codex/hooks.json').includes(' hook ') ? ['installed'] : [],
		'pre-commit': read('.git/hooks/pre-commit').includes(' check') ? ['installed'] : [],
		contract: ['CLAUDE.md', 'AGENTS.md', '.cursor/rules/ds.mdc'].filter((f) => read(f).includes('ds:contract')),
	};
}

export function gatherInfo(root: string) {
	const config = loadConfig();
	const project = detectProject(root);
	const installed = readInstalled(root);
	const items = Object.entries(installed).map(([id, entry]) => {
		const current = findItem(id);
		return { id, installed: entry.version, latest: current?.version ?? 'unknown', drift: current ? (current.version === entry.version ? 'current' : 'behind') : 'missing' };
	});
	const baseline = readBaseline(root);
	return {
		brand: config.brand,
		bin: config.bin,
		version: JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version,
		tokenVersion: JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version,
		registryUrl: config.registryMode === 'local' && !process.env.DS_REGISTRY_URL ? 'bundled with the package (registryMode local)' : process.env.DS_REGISTRY_URL ?? config.registryUrl,
		project,
		installed: items,
		hooks: hookStatus(root),
		baseline: baseline ? Object.values(baseline.findings).reduce((a, b) => a + b, 0) : 0,
	};
}

export function registerInfo(program: Command) {
	program
		.command('info')
		.description('Framework, tokens, installed items and drift, hooks, registry')
		.option('--json', 'JSON output')
		.action((opts) => {
			const info = gatherInfo(findProjectRoot());
			emit(opts, info, () => {
				const h = info.hooks;
				return [
					`${info.brand} design system ${info.version} (${info.bin})`,
					`Framework: ${info.project.framework} ${info.project.frameworkVersion ?? ''}  Tailwind: ${info.project.tailwind ?? 'not found'}  PM: ${info.project.packageManager}`,
					`Tokens: ${info.tokenVersion}  Registry: ${info.registryUrl}`,
					`Installed: ${info.installed.length ? info.installed.map((i) => `${i.id}@${i.installed}${i.drift === 'behind' ? ` (latest ${i.latest})` : ''}`).join(', ') : 'none'}`,
					`Hooks: claude-code [${h['claude-code'].join(', ') || 'none'}], cursor [${h.cursor.join(', ') || 'none'}], codex [${h.codex.join(', ') || 'none'}], pre-commit [${h['pre-commit'].join(', ') || 'none'}]`,
					`Contract in: ${h.contract.join(', ') || 'none'}`,
					`Baseline: ${info.baseline} legacy findings accepted`,
				].join('\n');
			});
		});
}

import type { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { loadCheckConfig, loadConfig } from '../lib/config.js';
import { changedFiles } from '../lib/git.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { writeBaseline } from '../lib/state.js';
import { type CheckResult, checkText, findingKey, formatFinding, isInScope, runCheck } from '../check/engine.js';

export function formatResult(result: CheckResult, bin: string) {
	const lines = result.findings.map((f) => `${f.severity === 'error' ? color.red('error') : color.yellow('warn ')} ${formatFinding(f)}`);
	if (result.overrides.length) {
		lines.push('', `Overrides (${result.overrides.length}), report these in your summary:`);
		for (const o of result.overrides) lines.push(`  ${o.file}:${o.line}  ${o.rule}  ds-override: ${o.overridden}`);
	}
	lines.push('', `${result.files} files, ${result.errors} errors, ${result.warnings} warnings${result.baselined ? `, ${result.baselined} baselined` : ''}${result.fixed ? `, ${result.fixed} fixed` : ''} (${result.ms}ms)`);
	if (result.errors) lines.push(`Fix every error. Safe fixes: \`${bin} check --fix\`.`);
	return lines.join('\n');
}

export function registerCheck(program: Command) {
	program
		.command('check [paths...]')
		.description('Deterministic brand checks. Non-zero exit on any error')
		.option('--fix', 'apply safe fixes (hex to token, em dash, spacing within 2px)')
		.option('--fast', 'only the per-file rules used by the PreToolUse hook')
		.option('--changed', 'only files changed in git (staged, unstaged, untracked)')
		.option('--stdin <path>', 'check content from stdin as if it were <path>')
		.option('--write-baseline', 'accept all current findings as legacy (for adopting in an existing app)')
		.option('--no-baseline', 'ignore .ds/baseline.json')
		.option('--json', 'JSON output')
		.action((paths: string[], opts) => {
			const root = findProjectRoot();
			const bin = loadConfig().cli;
			if (opts.stdin) {
				const text = readFileSync(0, 'utf8');
				const { findings, overrides } = checkText(root, opts.stdin, text, { fast: opts.fast });
				const result: CheckResult = { files: 1, findings, overrides, baselined: 0, errors: findings.filter((f) => f.severity === 'error').length, warnings: findings.filter((f) => f.severity === 'warn').length, fixed: 0, ms: 0 };
				emit(opts, result, () => formatResult(result, bin));
				process.exitCode = result.errors ? 1 : 0;
				return;
			}
			let targets = paths;
			if (opts.changed) {
				const config = loadCheckConfig(root);
				targets = changedFiles(root).filter((f) => isInScope(f, config));
				if (!targets.length) {
					emit(opts, { files: 0, findings: [], errors: 0 }, () => 'No changed files in scope.');
					return;
				}
			}
			if (opts.writeBaseline) {
				const result = runCheck({ projectRoot: root, paths: targets, useBaseline: false });
				const findings: Record<string, number> = {};
				for (const f of result.findings) findings[findingKey(f)] = (findings[findingKey(f)] ?? 0) + 1;
				writeBaseline(root, { createdAt: new Date().toISOString(), findings });
				emit(opts, { baselined: result.findings.length }, () => `Baseline written: ${result.findings.length} legacy findings in ${result.files} files accepted. New code is still checked.`);
				return;
			}
			const result = runCheck({ projectRoot: root, paths: targets, fast: opts.fast, fix: opts.fix, useBaseline: opts.baseline });
			emit(opts, result, () => formatResult(result, bin));
			process.exitCode = result.errors ? 1 : 0;
		});
}

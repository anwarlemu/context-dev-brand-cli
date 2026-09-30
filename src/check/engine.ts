import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, sep } from 'node:path';
import { loadCheckConfig } from '../lib/config.js';
import { matchesAny, walkFiles } from '../lib/glob.js';
import { readBaseline, readInstalled } from '../lib/state.js';
import { loadVoice } from '../lib/voice.js';
import type { CheckConfig } from '../schema/index.js';
import type { RuleContext } from './context.js';
import { RULES } from './rules/index.js';
import { lineOf, loadSource } from './source.js';
import type { Finding, Fix } from './types.js';
import { loadVocab } from './vocab.js';

export type CheckOptions = { projectRoot: string; paths?: string[]; fast?: boolean; fix?: boolean; useBaseline?: boolean; include?: string[] };
export type CheckResult = { files: number; findings: Finding[]; overrides: Finding[]; baselined: number; errors: number; warnings: number; fixed: number; ms: number };

export const findingKey = (f: Finding) => `${f.file}::${f.rule}::${f.snippet.trim() || f.message}`;

export function isInScope(relPath: string, config: CheckConfig) {
	return matchesAny(relPath, config.include) && !matchesAny(relPath, config.exclude);
}

export function checkText(projectRoot: string, relPath: string, text: string, opts: { fast?: boolean; config?: CheckConfig } = {}): { findings: Finding[]; overrides: Finding[] } {
	const config = opts.config ?? loadCheckConfig(projectRoot);
	const file = loadSource(relPath, text);
	const ctx: RuleContext = {
		file,
		relPath,
		isPage: matchesAny(relPath, config.pageGlobs),
		vocab: loadVocab(),
		voice: loadVoice(),
		config,
		installed: readInstalled(projectRoot),
		projectRoot,
	};
	const findings: Finding[] = [];
	const overrides: Finding[] = [];
	const rawAllowed = matchesAny(relPath, config.allowRawValues);
	for (const rule of RULES) {
		const level = config.rules[rule.id] ?? 'error';
		if (level === 'off') continue;
		if (opts.fast && !config.fast.includes(rule.id)) continue;
		if (rawAllowed && rule.id !== 'copy-rules') continue;
		let raw;
		try {
			raw = rule.run(ctx);
		} catch (error) {
			raw = [{ rule: rule.id, message: `rule crashed: ${(error as Error).message}`, hint: 'Report this to the design system owners', offset: 0 }];
		}
		for (const r of raw) {
			const { line, column } = lineOf(file, r.offset);
			const finding: Finding = { file: relPath, line, column, rule: r.rule, severity: level, message: r.message, hint: r.hint, snippet: text.slice(r.offset, r.offset + Math.min(r.length ?? 40, 80)).split('\n')[0], fix: r.fix };
			const reason = file.overrides.fileReason ?? file.overrides.lines.get(line) ?? file.overrides.lines.get(line - 1);
			if (reason) overrides.push({ ...finding, overridden: reason });
			else findings.push(finding);
		}
	}
	if (file.parseError) findings.push({ file: relPath, line: 1, column: 1, rule: 'parse', severity: 'warn', message: `Could not parse: ${file.parseError}`, hint: '', snippet: '' });
	findings.sort((a, b) => a.line - b.line || a.column - b.column);
	return { findings, overrides: dedupeOverrides(overrides, file.overrides.fileReason) };
}

function dedupeOverrides(overrides: Finding[], fileReason?: string) {
	const seen = new Set<string>();
	return overrides.filter((o) => {
		const key = `${o.file}:${fileReason ? 'file' : o.line}:${o.overridden}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export function applyFixes(text: string, fixes: Fix[]) {
	const sorted = [...fixes].sort((a, b) => b.start - a.start);
	let out = text;
	let lastStart = Infinity;
	let applied = 0;
	for (const f of sorted) {
		if (f.end > lastStart) continue;
		out = out.slice(0, f.start) + f.text + out.slice(f.end);
		lastStart = f.start;
		applied++;
	}
	return { text: out, applied };
}

export function collectFiles(projectRoot: string, config: CheckConfig, paths?: string[]) {
	if (!paths?.length) return walkFiles(projectRoot, config.include, config.exclude);
	const out = new Set<string>();
	for (const p of paths) {
		const abs = isAbsolute(p) ? p : join(process.cwd(), p);
		if (!existsSync(abs)) continue;
		const rel = relative(projectRoot, abs).split(sep).join('/');
		if (statSync(abs).isDirectory()) for (const f of walkFiles(projectRoot, config.include.map((g) => g), config.exclude)) { if (f.startsWith(rel === '' ? '' : `${rel}/`)) out.add(f); }
		else out.add(rel);
	}
	return [...out].sort();
}

export function runCheck(opts: CheckOptions): CheckResult {
	const started = performance.now();
	const config = loadCheckConfig(opts.projectRoot);
	if (opts.include) config.include = opts.include;
	const files = collectFiles(opts.projectRoot, config, opts.paths);
	let findings: Finding[] = [];
	const overrides: Finding[] = [];
	let fixed = 0;
	for (const rel of files) {
		const abs = join(opts.projectRoot, rel);
		let text = readFileSync(abs, 'utf8');
		let result = checkText(opts.projectRoot, rel, text, { fast: opts.fast, config });
		if (opts.fix) {
			const fixes = result.findings.map((f) => f.fix).filter((f): f is Fix => !!f);
			if (fixes.length) {
				const applied = applyFixes(text, fixes);
				text = applied.text;
				fixed += applied.applied;
				writeFileSync(abs, text);
				result = checkText(opts.projectRoot, rel, text, { fast: opts.fast, config });
			}
		}
		findings.push(...result.findings);
		overrides.push(...result.overrides);
	}
	let baselined = 0;
	if (opts.useBaseline !== false) {
		const baseline = readBaseline(opts.projectRoot);
		if (baseline) {
			const budget = new Map(Object.entries(baseline.findings));
			findings = findings.filter((f) => {
				const key = findingKey(f);
				const left = budget.get(key) ?? 0;
				if (left > 0) {
					budget.set(key, left - 1);
					baselined++;
					return false;
				}
				return true;
			});
		}
	}
	return {
		files: files.length,
		findings,
		overrides,
		baselined,
		errors: findings.filter((f) => f.severity === 'error').length,
		warnings: findings.filter((f) => f.severity === 'warn').length,
		fixed,
		ms: Math.round(performance.now() - started),
	};
}

export function formatFinding(f: Finding) {
	return `${f.file}:${f.line}  ${f.rule}  ${f.message}  ${f.hint}`;
}

export function newFindings(before: Finding[], after: Finding[]) {
	const budget = new Map<string, number>();
	for (const f of before) budget.set(findingKey(f), (budget.get(findingKey(f)) ?? 0) + 1);
	return after.filter((f) => {
		const key = findingKey(f);
		const left = budget.get(key) ?? 0;
		if (left > 0) {
			budget.set(key, left - 1);
			return false;
		}
		return true;
	});
}

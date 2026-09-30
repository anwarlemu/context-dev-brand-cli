import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { checkText, findingKey, formatFinding, isInScope, newFindings, runCheck } from '../check/engine.js';
import { loadSource } from '../check/source.js';
import { gatherInfo } from '../commands/info.js';
import { resolveTask, templateIndex } from '../commands/resolve.js';
import { loadCheckConfig, loadConfig } from '../lib/config.js';
import { changedFiles } from '../lib/git.js';
import { matchesAny } from '../lib/glob.js';
import { dsDir } from '../lib/paths.js';
import { findItem, itemByImport, type RegistryItem, renderDocs } from '../lib/registry.js';
import { readInstalled, sessionState } from '../lib/state.js';
import { type HookInput, promptOf, proposedWrite, sessionIdOf } from './payload.js';

export type HookResult = { stdout?: string; stderr?: string; exitCode?: number; json?: Record<string, unknown> };

const MAX_DOCS_PER_INJECTION = 3;

function injectDocs(root: string, sessionId: string, items: RegistryItem[], reason: string) {
	const state = sessionState(root, sessionId);
	const installed = readInstalled(root);
	const fresh = items.filter((i, idx) => items.findIndex((x) => x.id === i.id) === idx && !state.entry.injected.includes(i.id)).slice(0, MAX_DOCS_PER_INJECTION);
	if (!fresh.length) return '';
	state.entry.injected.push(...fresh.map((i) => i.id));
	state.save();
	return [`${loadConfig().brand} design system: docs for ${fresh.map((i) => i.id).join(', ')} (${reason}). Follow them.`, ...fresh.map((i) => `\n--- ${i.id} ---\n${renderDocs(i, installed[i.id]?.version)}`)].join('\n');
}

export function sessionStart(root: string, input: HookInput = {}): HookResult {
	const state = sessionState(root, sessionIdOf(input));
	state.entry.startedAt ??= Date.now();
	state.save();
	const info = gatherInfo(root);
	const bin = loadConfig().cli;
	const lines = [
		`${info.brand} design system ${info.version} is active in this project (${bin}).`,
		`Framework: ${info.project.framework} ${info.project.frameworkVersion ?? ''}. Tailwind: ${info.project.tailwind ?? 'none'}. Tokens: ${info.tokenVersion}.`,
		`Installed: ${info.installed.length ? info.installed.map((i) => `${i.id.split('/').pop()}@${i.installed}${i.drift === 'behind' ? '*' : ''}`).join(', ') : 'none yet'}.`,
		info.installed.some((i) => i.drift === 'behind') ? `* behind the registry. Run \`${bin} diff\`.` : '',
		`Before any UI work run \`${bin} resolve "<task>"\` and start from the template it returns.`,
		`Writes are checked before they reach disk. \`${bin} check\` must pass before you finish.`,
	].filter(Boolean);
	return { stdout: lines.slice(0, 15).join('\n') };
}

export function userPromptSubmit(root: string, input: HookInput): HookResult {
	const prompt = promptOf(input);
	if (!prompt.trim()) return {};
	const result = resolveTask(prompt);
	const bin = loadConfig().cli;
	if (result.kind === 'match') {
		const item = result.item ? findItem(result.item) : undefined;
		const docs = item ? injectDocs(root, sessionIdOf(input), [item], `task matched "${result.matched}"`) : '';
		return { stdout: [`${bin} resolve: "${result.matched}" -> ${result.target}. ${result.instruction}`, docs].filter(Boolean).join('\n\n') };
	}
	if (result.kind === 'out_of_scope') return { stdout: `${bin} resolve: "${result.matched}" is outside the brand system. ${result.instruction}` };
	if (!result.ui) return {};
	return { stdout: [`${bin} resolve: no template matched this task. Pick one explicitly with \`${bin} scaffold <template>\` or ask the user:`, ...templateIndex().map((l) => `  ${l}`)].join('\n') };
}

export function preToolUse(root: string, input: HookInput): HookResult {
	const write = proposedWrite(input, root);
	if (!write) return {};
	const config = loadCheckConfig(root);
	if (!isInScope(write.relPath, config)) return {};
	const bin = loadConfig().cli;
	const after = checkText(root, write.relPath, write.after, { fast: true, config });
	const before = write.before ? checkText(root, write.relPath, write.before, { fast: true, config }) : { findings: [], overrides: [] };
	const introduced = newFindings(before.findings, after.findings).filter((f) => f.severity === 'error');
	if (introduced.length) {
		const shown = introduced.slice(0, 25).map(formatFinding);
		return {
			exitCode: 2,
			stderr: [`${bin} blocked this write to ${write.relPath}: ${introduced.length} brand error${introduced.length > 1 ? 's' : ''}. Nothing was written.`, ...shown, introduced.length > 25 ? `...and ${introduced.length - 25} more` : '', `Fix them and write again. Only if a deviation is genuinely required, add \`// ds-override: <reason>\` above the line and report it in your summary.`].filter(Boolean).join('\n'),
		};
	}
	const file = loadSource(write.relPath, write.after);
	const items = file.imports.map((i) => itemByImport(i.source)).filter((i): i is RegistryItem => !!i);
	const ordered = [...items.filter((i) => i.type === 'template'), ...items.filter((i) => i.type === 'block'), ...items.filter((i) => i.type === 'ui')];
	const docs = injectDocs(root, sessionIdOf(input), ordered, `imported in ${write.relPath}`);
	const newOverrides = newFindings(before.overrides, after.overrides);
	const notes = [docs, newOverrides.length ? `ds-override recorded in ${write.relPath}: ${newOverrides.map((o) => `${o.rule} (${o.overridden})`).join('; ')}. Report it in your summary.` : ''].filter(Boolean).join('\n\n');
	if (!notes) return {};
	return { json: { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow', additionalContext: notes } } };
}

export function postToolUse(root: string, input: HookInput): HookResult {
	const bin = loadConfig().cli;
	const command = String(input.tool_input?.command ?? input.command ?? '');
	const m = command.match(new RegExp(`${loadConfig().bin}(?:/bin\\.js)?\\s+(add|scaffold)\\s+([^;&|]+)`));
	if (!m) return {};
	const names = m[2].split(/\s+/).filter((w) => w && !w.startsWith('-') && !w.includes('='));
	const items = names.map((n) => findItem(n)).filter((i): i is RegistryItem => !!i);
	const docs = injectDocs(root, sessionIdOf(input), items, `just ran ${bin} ${m[1]}`);
	return docs ? { json: { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: docs } } } : {};
}

function reviewedSince(root: string, files: string[]) {
	const marker = join(dsDir(root), 'review', 'last.json');
	if (!existsSync(marker)) return false;
	const reviewedAt = statSync(marker).mtimeMs;
	return files.every((f) => !existsSync(join(root, f)) || statSync(join(root, f)).mtimeMs <= reviewedAt);
}

export function stop(root: string, input: HookInput): HookResult {
	const bin = loadConfig().cli;
	const state = sessionState(root, sessionIdOf(input));
	const config = loadCheckConfig(root);
	const since = state.entry.startedAt ?? 0;
	const changed = changedFiles(root).filter((f) => isInScope(f, config) && existsSync(join(root, f)) && statSync(join(root, f)).mtimeMs >= since);
	if (!changed.length) return {};
	const result = runCheck({ projectRoot: root, paths: changed });
	if (result.errors) {
		state.entry.stopBlocks++;
		state.save();
		if (state.entry.stopBlocks > 5) return { stderr: `${bin}: ${result.errors} errors remain after 5 attempts. Stopping so a person can look. Tell the user.` };
		const lines = result.findings.filter((f) => f.severity === 'error').slice(0, 30).map(formatFinding);
		return { json: { decision: 'block', reason: [`${bin} check: ${result.errors} brand errors in files you changed. You are not done.`, ...lines, `Fix every error (safe fixes: \`${bin} check --fix\`), then finish.`].join('\n') } };
	}
	const touchesTemplates = changed.filter((f) => matchesAny(f, config.pageGlobs));
	const reviewNudged = state.entry.injected.includes('review-nudge');
	if (touchesTemplates.length && !reviewedSince(root, touchesTemplates) && !reviewNudged) {
		state.entry.injected.push('review-nudge');
		state.save();
		return { json: { decision: 'block', reason: `${bin} check passed. Done is not good: you changed ${touchesTemplates.join(', ')}. Run \`${bin} review ${touchesTemplates[0]}\` and address the punch list before handing over. If review cannot run (no ANTHROPIC_API_KEY or no dev server), say so in your summary.` } };
	}
	if (result.overrides.length) return { stdout: `${bin}: ${result.overrides.length} ds-override(s) in changed files. List them in your summary: ${result.overrides.map((o) => `${o.file}:${o.line} ${o.overridden}`).join('; ')}` };
	return {};
}

export function cursorAfterEdit(root: string, input: HookInput): HookResult {
	const path = input.file_path ?? input.filePath;
	if (!path) return {};
	const rel = String(path).startsWith(root) ? String(path).slice(root.length + 1) : String(path);
	const config = loadCheckConfig(root);
	if (!isInScope(rel, config) || !existsSync(join(root, rel))) return {};
	const { findings } = checkText(root, rel, readFileSync(join(root, rel), 'utf8'), { config });
	return findings.length ? { stderr: findings.map(formatFinding).join('\n') } : {};
}

export function cursorStop(root: string, input: HookInput): HookResult {
	const r = stop(root, input);
	const reason = (r.json as { reason?: string } | undefined)?.reason;
	return reason ? { json: { followup_message: reason } } : {};
}

export { findingKey };

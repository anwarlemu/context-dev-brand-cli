import type { Command } from 'commander';
import { createInterface } from 'node:readline/promises';
import { runCheck } from '../check/engine.js';
import { loadConfig } from '../lib/config.js';
import { color, emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { type Approval, overrideKey, readApprovals, writeApprovals } from '../lib/state.js';

/** Overrides in the project that no person has approved yet. */
export function pendingOverrides(root: string) {
	const result = runCheck({ projectRoot: root, useBaseline: true });
	return result.findings.filter((f) => f.rule === 'override-approval');
}

export function registerApprove(program: Command) {
	program
		.command('approve')
		.description('Review and approve ds-override exceptions. A person runs this in a terminal; agents cannot')
		.option('--list', 'only list the overrides waiting for approval')
		.option('--json', 'JSON output (with --list)')
		.action(async (opts) => {
			const root = findProjectRoot();
			const bin = loadConfig().cli;
			const pending = pendingOverrides(root);
			const describe = (f: (typeof pending)[number]) => `${f.file}:${f.line}  ${f.message.replace(/^ds-override not approved: /, '')}\n    ${f.snippet}`;
			if (opts.list || !pending.length) {
				emit(opts, { pending: pending.map((f) => ({ file: f.file, line: f.line, message: f.message })) }, () => (pending.length ? [`${pending.length} ds-override(s) waiting for approval:`, ...pending.map((f) => `  ${describe(f)}`), '', `A person approves them with \`${bin} approve\` in a terminal.`].join('\n') : 'No ds-overrides are waiting for approval.'));
				return;
			}
			// The whole point is a person's sign-off, so it never runs where nobody can answer: an agent's shell tool has no TTY.
			if (!process.stdin.isTTY || !process.stdout.isTTY) {
				throw new Error(`approve needs a person at an interactive terminal. If you are an agent: stop and ask the user to run \`${bin} approve\` themselves. Do not try to work around this.`);
			}
			const rl = createInterface({ input: process.stdin, output: process.stdout });
			const store = readApprovals(root);
			let approved = 0;
			try {
				process.stdout.write(`${pending.length} ds-override(s) waiting for approval. Each one lets code skip a brand rule.\n\n`);
				for (const f of pending) {
					process.stdout.write(`${color.yellow(describe(f))}\n`);
					const answer = (await rl.question('  Approve? [y/N] ')).trim().toLowerCase();
					if (answer !== 'y' && answer !== 'yes') continue;
					const reason = f.overridden ?? '';
					const rule = f.overrideOf ?? '';
					const entry: Approval = { key: overrideKey({ file: f.file, rule, overridden: reason }), file: f.file, rule, reason, at: new Date().toISOString() };
					store.approvals.push(entry);
					approved++;
				}
			} finally {
				rl.close();
			}
			writeApprovals(root, store);
			process.stdout.write(`\nApproved ${approved} of ${pending.length}. Recorded in .ds/approved-overrides.json; commit it so CI sees the same.\n`);
		});
}

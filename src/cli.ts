import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Command } from 'commander';
import { review } from './commands/review.js';
import { run } from './commands/run.js';
import { approve, check, done, look, skip, tokensCommand } from './commands/small.js';
import { type HookResult, cursorPreToolUse, cursorStop, preToolUse, sessionStart, stop, userPromptSubmit } from './hooks/handlers.js';
import { readHookInput } from './hooks/payload.js';
import { brand, cli } from './lib/brand.js';
import { findProjectRoot } from './lib/paths.js';

const program = new Command();
const b = brand();

program
	.name(b.bin)
	.description(`Make any website or app look like ${b.name}, and keep coding agents on it. Run it with no command and do what it says.`)
	.option('--surface <surface>', 'site (pages people read) or product (an app people work in); default: read from the project')
	.option('--theme <theme>', 'product only: light (default) or dark')
	.option('--redo', 'convert the project again (after an update, or after reverting)')
	.option('--dry-run', 'show what would change, write nothing')
	.option('--no-install', 'do not add the package to the project when run through npx')
	.option('--json', 'JSON output')
	.action((opts) => run(opts));

program.command('review [url]').description('Screenshot a page at desktop and phone width and score it against the brand; a task is done when it passes').option('--threshold <n>', 'minimum score').option('--json', 'JSON output').action((url, opts) => review(url, opts));
program.command('look [target]').description('The brand styling (CSS, Tailwind, states) for every element in a file, or for one element kind').option('--surface <surface>', 'site or product').option('--json', 'JSON output').action((target, opts) => look(target, opts));
program.command('check [files...]').description('Check that every style value is a brand token (used by hooks, pre-commit and CI)').option('--fix', 'replace exact matches with their token').option('--changed', 'only files changed in git').option('--json', 'JSON output').action((files, opts) => check(files ?? [], opts));
program.command('tokens [term]').description('Find a brand token by name or value').option('--json', 'JSON output').action((term, opts) => tokensCommand(term, opts));
program.command('approve').description('Approve ds-override comments (a person, in a terminal)').option('--all', 'approve every pending override').action((opts) => approve(opts));
program.command('skip <screen>').description('Leave a screen as it is when it cannot pass without changing words or elements; the person sees the reason').requiredOption('--reason <text>', 'why').action((id, opts) => skip(id, opts.reason));
program.command('done <screen>').description('Mark a native screen restyled (web screens are done when their review passes)').action((id) => done(id));

program
	.command('hook <event>')
	.description('Agent hook entry point (session-start, user-prompt-submit, pre-tool-use, stop); reads the event JSON on stdin')
	.option('--harness <name>', 'claude-code | cursor | codex', 'claude-code')
	.action((event: string, opts) => {
		const input = readHookInput();
		const root = findProjectRoot(input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.env.CURSOR_PROJECT_DIR ?? process.cwd());
		let result: HookResult = {};
		try {
			if (opts.harness === 'cursor') result = event === 'pre-tool-use' ? cursorPreToolUse(root, input) : event === 'stop' ? cursorStop(root, input) : {};
			else if (event === 'session-start') result = sessionStart(root, input);
			else if (event === 'user-prompt-submit') result = userPromptSubmit(root, input);
			else if (event === 'pre-tool-use') result = preToolUse(root, input);
			else if (event === 'stop') result = stop(root, input);
		} catch (error) {
			// Hooks fail open: a bug in the checker must never stop someone's work.
			process.stderr.write(`${b.bin} hook ${event} failed open: ${(error as Error).message}\n`);
			process.exit(0);
		}
		try {
			mkdirSync(join(root, '.ds'), { recursive: true });
			appendFileSync(join(root, '.ds', 'hooks.log'), `${JSON.stringify({ at: new Date().toISOString(), harness: opts.harness, event, blocked: result.exitCode === 2 || !!(result.json as any)?.decision || (result.json as any)?.permission === 'deny' })}\n`);
		} catch {}
		if (result.json) process.stdout.write(`${JSON.stringify(result.json)}\n`);
		else if (result.stdout) process.stdout.write(`${result.stdout}\n`);
		if (result.stderr) process.stderr.write(`${result.stderr}\n`);
		process.exit(result.exitCode ?? 0);
	});

program.parseAsync().catch((error: Error) => {
	process.stderr.write(`${error.message}\n`);
	process.exit(1);
});
void cli;

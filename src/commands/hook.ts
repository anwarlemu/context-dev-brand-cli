import type { Command } from 'commander';
import { loadConfig } from '../lib/config.js';
import { findProjectRoot } from '../lib/paths.js';
import { type HookResult, cursorAfterEdit, cursorStop, postToolUse, preToolUse, sessionStart, stop, userPromptSubmit } from '../hooks/handlers.js';
import { readHookInput } from '../hooks/payload.js';

const EVENTS = ['session-start', 'user-prompt-submit', 'pre-tool-use', 'post-tool-use', 'stop'] as const;

export function registerHook(program: Command) {
	program
		.command('hook <event>')
		.description(`Harness hook entry point (${EVENTS.join(', ')}). Reads the event JSON on stdin`)
		.option('--harness <name>', 'claude-code | cursor | codex', 'claude-code')
		.action((event: string, opts) => {
			const input = readHookInput();
			const root = findProjectRoot(input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
			let result: HookResult = {};
			try {
				if (opts.harness === 'cursor') {
					if (event === 'after-file-edit') result = cursorAfterEdit(root, input);
					else if (event === 'stop') result = cursorStop(root, input);
				} else if (event === 'session-start') result = sessionStart(root, input);
				else if (event === 'user-prompt-submit') result = userPromptSubmit(root, input);
				else if (event === 'pre-tool-use') result = preToolUse(root, input);
				else if (event === 'post-tool-use') result = postToolUse(root, input);
				else if (event === 'stop') result = stop(root, input);
				else throw new Error(`Unknown hook event "${event}"`);
			} catch (error) {
				process.stderr.write(`${loadConfig().bin} hook ${event} failed open: ${(error as Error).message}\n`);
				process.exit(0);
			}
			if (result.json) process.stdout.write(`${JSON.stringify(result.json)}\n`);
			else if (result.stdout) process.stdout.write(`${result.stdout}\n`);
			if (result.stderr) process.stderr.write(`${result.stderr}\n`);
			process.exit(result.exitCode ?? 0);
		});
}

import type { Command } from 'commander';
import { unknown } from '../assets/io.js';
import { designCommand } from './design.js';
import { iconsCommand } from './icons.js';
import { emailCommand } from './email.js';
import { deckCommand } from './deck.js';
import { imageCommand } from './image.js';
import { manifestCommand } from './manifest.js';
import { merchCommand } from './merch.js';
import { videoCommand } from './video.js';

// The asset commands: image (share images and social posts), video, deck and merch, design (revising any of them), and manifest (describe), the one
// document that lists them all for agents.

export function assets(program: Command) {
	imageCommand(program);
	deckCommand(program);
	videoCommand(program);
	merchCommand(program);
	iconsCommand(program);
	emailCommand(program);
	designCommand(program);
	manifestCommand(program);
	rejectUnknownCommand(program, process.argv.slice(2));
}

/** The bare command restyles the project and takes no arguments, so a mistyped command would read as an extra
 * argument. Name it as an unknown command with the closest ones instead, and exit 1. */
function rejectUnknownCommand(program: Command, argv: string[]) {
	const valued = new Set(program.options.filter((o) => o.required || o.optional).flatMap((o) => [o.long, o.short].filter((f): f is string => !!f)));
	let first: string | undefined;
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]!;
		if (a === '--') break;
		if (a.startsWith('-')) {
			if (valued.has(a)) i++;
			continue;
		}
		first = a;
		break;
	}
	if (!first) return;
	const names = program.commands.flatMap((c) => [c.name(), ...c.aliases()]);
	if (names.includes(first)) return;
	const err = unknown('command', first, program.commands.map((c) => c.name()));
	if (argv.includes('--json')) process.stdout.write(`${JSON.stringify({ error: { message: err.message } })}\n`);
	else process.stderr.write(`${err.message}\n`);
	process.exit(1);
}

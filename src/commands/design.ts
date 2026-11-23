import type { Command } from 'commander';
import { adapter, paint } from '../design/adapter.js';
import { designManifest, runDesign } from '../design/index.js';
import { cli } from '../lib/brand.js';

// `design`: make a design, revise it in plain words or exact edits, check it, undo it. The command itself is the shared
// core (src/design/run.ts); here it is only mounted and listed.

export async function design(argv: string[]): Promise<void> {
	process.exitCode = await runDesign(argv, adapter(), { cwd: process.cwd(), bin: cli(), out: (s) => process.stdout.write(`${s}\n`), err: (s) => process.stderr.write(`${s}\n`), paint });
}

/** Listed so help and the manifest name it; its arguments go straight to the core (src/cli.ts). */
export function designCommand(program: Command) {
	program
		.command('design [command] [args...]')
		.description('Make a design (image, slide, merch, illustration, video), revise it in plain words or exact edits, check it, undo it; works on a small JSON file')
		.allowUnknownOption()
		.helpOption(false)
		.action(() => undefined);
}

export const designEntry = () => designManifest(adapter(), cli());

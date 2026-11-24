import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { surface, toPng } from '../assets/canvas.js';
import { EMAILS, emailHtml, emailWords, type EmailKind } from '../assets/email.js';
import { display, pick, write } from '../assets/io.js';
import { drawLogo, logoRatio } from '../assets/logo.js';
import { palettes } from '../assets/og.js';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `email`: newsletter, announcement, receipt and password reset as plain HTML tables mail clients keep, with the logo
// as a PNG beside it (or a hosted address with --logo-url). Only the words passed are written.

type Opts = Record<string, string | boolean | string[] | undefined> & { json?: boolean };

export function emailCommand(program: Command) {
	program
		.command('email [kind]')
		.description('Emails as HTML tables mail clients keep: newsletter, announcement, receipt, password-reset')
		.option('--set <slot=value>', 'a word slot; repeat it (email <kind> --list shows them)', (v: string, all: string[] = []) => [...all, v])
		.option('--sample', 'fill the words you did not pass with sample copy')
		.option('--logo-url <url>', 'the hosted logo (default: logo.png written beside the email)')
		.option('-o, --out <dir>', 'output directory (default email/)')
		.option('--list', 'the kinds and their words')
		.option('--json', 'JSON output')
		.action((kind: string | undefined, _o, cmd: Command) => runEmail(kind, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => `\nExamples:\n  ${cli()} email announcement --set title="Browser profiles are here" --set body="..." --set cta="Try it" --set cta-href=https://acme.com\n  ${cli()} email receipt --sample\n`);
}

function runEmail(typed: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list || !typed) {
		const doc = Object.entries(EMAILS).map(([id, e]) => ({ id, description: e.description, words: e.slots }));
		if (!typed && !o.list) throw new Error(`Name a kind: ${cli()} email ${Object.keys(EMAILS).join('|')}`);
		emit(o, { kinds: doc }, () => doc.map((k) => `${k.id.padEnd(15)} ${k.description}\n${' '.repeat(16)}${k.words.map((w) => `--set ${w.id}=...${w.required ? ' (needed)' : ''}`).join(', ')}`).join('\n'));
		return;
	}
	const kind = pick('email', typed, Object.keys(EMAILS) as EmailKind[]);
	const given: Record<string, string> = {};
	for (const s of (o.set as string[] | undefined) ?? []) {
		const at = s.indexOf('=');
		if (at < 1) throw new Error(`--set takes slot=value, not "${s}".`);
		given[s.slice(0, at)] = s.slice(at + 1);
	}
	const words = emailWords(kind, given, !!o.sample);
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'email');
	const files: { path: string }[] = [];
	let logo = typeof o['logoUrl'] === 'string' ? (o['logoUrl'] as string) : 'logo.png';
	if (logo === 'logo.png') {
		// The logo at twice its shown 24 px height, on a transparent ground, in the light palette's colors.
		const h = 48;
		const w = Math.ceil(logoRatio() * h);
		const s = surface(w, h);
		const p = palettes()[0]!;
		drawLogo(s.ctx, 0, 0, h, p.mark, p.ink);
		write(join(dir, 'logo.png'), toPng(s));
		files.push({ path: display(cwd, join(dir, 'logo.png')) });
	} else if (!/^https?:/.test(logo)) throw new Error('--logo-url takes a full link (https://...).');
	write(join(dir, `${kind}.html`), emailHtml(kind, words, { logo, brand: brand().name }));
	files.push({ path: display(cwd, join(dir, `${kind}.html`)) });
	emit(o, { files }, () => files.map((f) => f.path).join('\n'));
	void logo;
}

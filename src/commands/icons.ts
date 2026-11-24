import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { surface, toPng } from '../assets/canvas.js';
import { display, pick, write } from '../assets/io.js';
import { drawMark, markRatio } from '../assets/logo.js';
import { palettes } from '../assets/og.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `icons`: the favicon set and app icons from the mark alone: favicon.ico (16, 32 and 48 inside), PNGs at 16, 32, 180
// (Apple touch), 192 and 512, a maskable 512 (the mark inside the middle 80%, the safe zone of maskable icons), and the
// web manifest's icons entry. On a palette's ground, or transparent for the plain favicons.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

function icon(size: number, ground: string | undefined, color: string, share: number): Buffer {
	const s = surface(size, size);
	if (ground) {
		s.ctx.fillStyle = ground;
		s.ctx.fillRect(0, 0, size, size);
	}
	const w = size * share;
	const h = w / markRatio();
	drawMark(s.ctx, (size - w) / 2, (size - h) / 2, h, color);
	return toPng(s);
}

/** PNGs packed in an ICO (Vista and later read PNG entries). */
function ico(pngs: { size: number; data: Buffer }[]): Buffer {
	const head = Buffer.alloc(6 + 16 * pngs.length);
	head.writeUInt16LE(0, 0);
	head.writeUInt16LE(1, 2);
	head.writeUInt16LE(pngs.length, 4);
	let at = head.length;
	pngs.forEach((p, i) => {
		const o = 6 + i * 16;
		head[o] = p.size >= 256 ? 0 : p.size;
		head[o + 1] = p.size >= 256 ? 0 : p.size;
		head.writeUInt16LE(1, o + 4);
		head.writeUInt16LE(32, o + 6);
		head.writeUInt32LE(p.data.length, o + 8);
		head.writeUInt32LE(at, o + 12);
		at += p.data.length;
	});
	return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

export function iconsCommand(program: Command) {
	program
		.command('icons')
		.description('The favicon set and app icons from the mark: favicon.ico, 16 to 512 PNGs, Apple touch, maskable, and the manifest entry')
		.option('--theme <name>', 'the ground of the app icons: Paper, Blue, Ink, Mist, Night or Graphite', 'Blue')
		.option('-o, --out <dir>', 'output directory (default icons/)')
		.option('--json', 'JSON output')
		.action((_o, cmd: Command) => runIcons(cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => `\nExamples:\n  ${cli()} icons\n  ${cli()} icons --theme Ink --out public\n`);
}

function runIcons(o: Opts) {
	const cwd = process.cwd();
	const p = palettes().find((x) => x.name === pick('theme', String(o.theme ?? 'Blue'), palettes().map((x) => x.name)))!;
	const paper = palettes()[0]!;
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'icons');
	const mark = p.mark === p.bg ? p.ink : p.mark;
	const files: { path: string; size: number; purpose: string }[] = [];
	const put = (name: string, data: Buffer, size: number, purpose: string) => {
		write(join(dir, name), data);
		files.push({ path: display(cwd, join(dir, name)), size, purpose });
	};
	// Favicons: the mark alone on a transparent ground, in the brand color, as large as the square allows.
	const small = [16, 32, 48].map((size) => ({ size, data: icon(size, undefined, paper.mark, 0.94) }));
	put('favicon.ico', ico(small), 48, 'favicon (16, 32, 48)');
	put('favicon-16.png', small[0]!.data, 16, 'favicon');
	put('favicon-32.png', small[1]!.data, 32, 'favicon');
	// App icons on the theme's ground; the maskable one keeps the mark inside the middle 80%.
	put('apple-touch-icon.png', icon(180, p.bg, mark, 0.62), 180, 'apple-touch-icon');
	put('icon-192.png', icon(192, p.bg, mark, 0.62), 192, 'any');
	put('icon-512.png', icon(512, p.bg, mark, 0.62), 512, 'any');
	put('icon-512-maskable.png', icon(512, p.bg, mark, 0.5), 512, 'maskable');
	const manifest = { icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] };
	put('manifest-icons.json', Buffer.from(`${JSON.stringify(manifest, null, '\t')}\n`), 0, 'web manifest entry');
	emit(o, { files, html: '<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="/apple-touch-icon.png">' }, () => files.map((f) => `${f.path}  ${f.purpose}`).join('\n'));
}

import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, pick, unknown, write, type OutFile } from '../assets/io.js';
import { checkItem, findItem, merchCatalog, merchItems, renderItem, PX_PER_IN } from '../assets/merch.js';
import { readPicture } from '../assets/picture.js';
import { samplePicture, sampleNames } from '../assets/samples.js';
import { checkText, errorsOf } from '../design/index.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `merch`: print files only (never mockups). SVG at physical size and PNG at 300 dpi, bleed included.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

export function merchCommand(program: Command) {
	program
		.command('merch [item]')
		.description('Merch print files (cap, tee front and back, hoodie, tote, mug wrap, sticker with die line, poster, socks): SVG at physical size and 300 dpi PNG with bleed')
		.option('--item <id>', 'cap-front, tee-front, tee-back, hoodie-front, tote, mug-wrap, sticker, poster or socks')
		.option('-v, --variant <id>', 'blue, paper or ink (palette ground to the bleed); color, white, black or brand (logo alone, transparent); each item names its own')
		.option('--theme <id>', 'the same as --variant')
		.option('--headline <text>', 'tee-back and poster: the line (nothing is printed unless it is passed; also --title)')
		.option('--title <text>', 'the same as --headline')
		.option('--sample', 'print the sample line')
		.option('--seed <n>', 'turns the burst')
		.option('--url <text>', 'poster: the address (the brand\'s own by default, empty for none)')
		.option('--image <file>', 'poster: any picture, through the dot shader (default: the burst)')
		.option('--dpi <n>', 'PNG resolution, 72 to 600', String(PX_PER_IN))
		.option('--guides', 'draw the trim and safe lines for proofing')
		.option('-f, --format <formats>', 'svg, png, pdf (at print size), several with commas, or both (SVG and PNG)', 'both')
		.option('-o, --out <path>', 'output directory (default merch/), or one .svg, .png or .pdf file')
		.option('--all', 'every item in every variant')
		.option('--list', 'items with trim, bleed, safe area, variants and sources')
		.option('--json', 'JSON output')
		.action(async (item: string | undefined, _o, cmd: Command) => runMerch(item, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => [
			'',
			'Examples:',
			`  ${cli()} merch tee-front --variant color`,
			`  ${cli()} merch sticker --variant blue --guides      (trim and safe lines for proofing)`,
			`  ${cli()} merch poster --headline "Web data API for AI Agents" --image hero.png`,
			`  ${cli()} merch --all --dpi 150 --out merch`,
			'',
			'Sizes are common vendor print areas: confirm with the vendor template. The sticker SVG holds a CutContour path (the die line), not printed.',
		].join('\n'));
}

const unknownSample = (typed: string): never => {
	throw unknown('sample picture', typed.slice(7), sampleNames());
};

async function runMerch(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = merchCatalog();
		emit(o, cat, () => cat.items.map((i) => `${i.id.padEnd(13)} ${`${i.trim.width} x ${i.trim.height} in`.padEnd(14)} bleed ${String(i.bleed).padEnd(6)} safe ${String(i.safe).padEnd(6)} ${`${i.pixels.width}x${i.pixels.height}px`.padEnd(12)} ${i.variants.join(', ')}\n${' '.repeat(14)}${i.method}. ${i.source}`).join('\n'));
		return;
	}
	const out = typeof o.out === 'string' ? o.out : undefined;
	const outExt = out ? /\.(svg|png|pdf)$/i.exec(out)?.[1]?.toLowerCase() : undefined;
	const typed = outExt && o.format === 'both' ? outExt : String(o.format ?? 'both');
	const formats = typed.toLowerCase() === 'both' ? ['svg', 'png'] : [...new Set(typed.split(',').map((f) => pick('format', f.trim(), ['svg', 'png', 'pdf'] as const)))];
	if (outExt && (formats.length > 1 || formats[0] !== outExt)) throw new Error(`--out ends in .${outExt}, but the format is ${formats.join(', ')}.`);
	if (outExt && o.all) throw new Error('--out names one file; --all needs a directory.');
	const seed = num('seed', o.seed, 0, 1e9, { integer: true });
	if (o.title !== undefined && o.headline !== undefined && o.title !== o.headline) throw new Error('--title and --headline are the same thing; pass one.');
	o.headline ??= o.title;
	if (o.theme !== undefined && o.variant !== undefined && o.theme !== o.variant) throw new Error('--theme and --variant are the same thing; pass one.');
	o.variant ??= o.theme;
	const dpi = num('dpi', o.dpi, 72, 600, { integer: true }) ?? PX_PER_IN;
	const slots: Record<string, string> = {};
	for (const k of ['headline', 'url']) if (typeof o[k] === 'string') slots[k] = o[k] as string;
	const named = positional ?? (typeof o.item === 'string' ? o.item : undefined);
	const jobs: { id: string; variant?: string }[] = [];
	if (o.all) {
		if (named) throw new Error('Pass an item or --all, not both.');
		for (const i of merchItems()) for (const v of i.variants) jobs.push({ id: i.id, variant: v });
	} else {
		if (!named) throw new Error(`Name an item: ${cli()} merch tee-front (--list shows them).`);
		jobs.push({ id: findItem(named).id, variant: typeof o.variant === 'string' ? o.variant : undefined });
	}
	const pic = typeof o.image === 'string' ? (o.image.toLowerCase().startsWith('sample:') ? (samplePicture(o.image) ?? unknownSample(o.image)) : await readPicture(cwd, o.image)) : null;
	const dir = resolve(cwd, out && !outExt ? out : 'merch');
	const files: OutFile[] = [];
	for (const job of jobs) {
		const item = findItem(job.id);
		const r = renderItem(item, { variant: job.variant, slots: o.all ? {} : slots, picture: o.all ? null : pic, guides: !!o.guides, dpi, sample: !!o.sample || !!o.all, seed, png: formats.includes('png'), svg: formats.includes('svg'), pdf: formats.includes('pdf') });
		const bad = errorsOf(checkItem(item, r, { slots, sample: !!o.sample || !!o.all }));
		if (bad.length) throw new Error(`${item.id}: ${checkText(bad)}`);
		const base = outExt ? resolve(cwd, out!).replace(/\.\w+$/, '') : join(dir, `${item.id}-${r.variant}`);
		const inches = `${r.widthIn} x ${r.heightIn} in`;
		if (r.svg) {
			write(`${base}.svg`, r.svg);
			files.push({ path: display(cwd, `${base}.svg`), format: 'svg', item: item.id, variant: r.variant, inches, width: Math.round(r.widthIn * PX_PER_IN), height: Math.round(r.heightIn * PX_PER_IN) });
		}
		if (r.pdf) {
			write(`${base}.pdf`, r.pdf);
			files.push({ path: display(cwd, `${base}.pdf`), format: 'pdf', item: item.id, variant: r.variant, inches, dpi, width: r.width, height: r.height });
		}
		if (r.png) {
			write(`${base}.png`, r.png);
			files.push({ path: display(cwd, `${base}.png`), format: 'png', item: item.id, variant: r.variant, inches, dpi, width: r.width, height: r.height });
		}
	}
	emit(o, { files, dpi }, () => files.map((f) => `${f.path}  ${f.inches}${f.format !== 'svg' ? `, ${f.width}x${f.height} px at ${f.dpi} dpi` : ''}`).join('\n'));
}

import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { checkSlide, deckCatalog, renderSlide, slideOf, slidePicture, slideTypes, type Slide } from '../assets/deck.js';
import { wordColors } from '../assets/image.js';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { checkText, errorsOf, parseDoc } from '../design/index.js';
import { adapter } from '../design/adapter.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `deck`: slides at 1920 by 1080 from a JSON file or flags, a PNG per slide and one PDF, each slide checked first.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const SLOT_FLAGS = ['title', 'body', 'number', 'items', 'stat', 'quote', 'attribution', 'url'];

export function deckCommand(program: Command) {
	program
		.command('deck [slide]')
		.description('Slides at 1920 by 1080 (cover, section, statement, bullets, stat, quote, image, closing): PNG per slide and one PDF')
		.option('-i, --input <file>', 'deck.json: { "slides": [ { "type": "cover", "title": "..." }, ... ] }')
		.option('--slide <type>', 'one slide of this type, from flags')
		.option('-p, --palette <name>', 'Paper, Blue, Ink, Mist, Night or Graphite (default: the type\'s)')
		.option('--theme <name>', 'the same as --palette')
		.option('--title <text>', 'the title (every type but quote; also --headline)')
		.option('--headline <text>', 'the same as --title')
		.option('--body <text>', 'cover and image: the line under the title')
		.option('--number <text>', 'section: the number set in dots')
		.option('--items <text>', 'bullets: points separated by |')
		.option('--stat <text>', 'stat: the big number set in dots')
		.option('--quote <text>', 'quote: the quote')
		.option('--attribution <text>', 'quote: who said it (role and company)')
		.option('--url <text>', 'closing: the address')
		.option('--image <file>', 'cover, bullets and image: any picture, through the dot shader (sample:Globe works)')
		.option('--sample', 'fill the words you did not pass with sample copy')
		.option('-f, --format <formats>', 'png, pdf, svg, jpg, webp, several with commas, or both (PNG and PDF)', 'both')
		.option('-o, --out <path>', 'output directory (default deck/), or one .pdf, .png, .svg, .jpg or .webp file')
		.option('--list', 'slide types with their slots')
		.option('--json', 'JSON output')
		.action(async (slide: string | undefined, _o, cmd: Command) => runDeck(slide, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => [
			'',
			'Examples:',
			`  ${cli()} deck --input deck.json --out deck`,
			`  ${cli()} deck cover --title "The web data APIs for agents"`,
			`  ${cli()} deck bullets --title "What it does" --items "Scrape any page | Crawl a site | Search the web"`,
			`  ${cli()} deck --list`,
			'',
			'deck.json slides take their type\'s slots by name, "theme", and "image" (a path relative to the file). A slide can also be',
			'{ "design": "cover.design.json" }, one made and revised with design. Only the words you pass are drawn.',
		].join('\n'));
}

async function runDeck(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = deckCatalog();
		emit(o, cat, () => cat.slides.map((s) => `${s.id.padEnd(10)} ${s.description} Slots: ${Object.keys(s.slots).join(', ')}. Palette: ${s.palette}.`).join('\n'));
		return;
	}
	const out = typeof o.out === 'string' ? o.out : undefined;
	const outExt = out ? /\.(pdf|png|svg|jpe?g|webp)$/i.exec(out)?.[1]?.toLowerCase().replace('jpeg', 'jpg') : undefined;
	const typedFormat = outExt && o.format === 'both' ? outExt : String(o.format ?? 'both');
	const formats = typedFormat.toLowerCase() === 'both' ? ['png', 'pdf'] : [...new Set(typedFormat.split(',').map((f) => pick('format', f.trim().replace(/^jpeg$/i, 'jpg'), ['png', 'pdf', 'svg', 'jpg', 'webp'] as const)))];
	if (outExt && (formats.length > 1 || formats[0] !== outExt)) throw new Error(`--out ends in .${outExt}, but the format is ${formats.join(', ')}.`);
	for (const [a, b] of [['headline', 'title'], ['theme', 'palette']]) if (o[a!] !== undefined && o[b!] !== undefined && o[a!] !== o[b!]) throw new Error(`--${a} and --${b} are the same thing; pass one.`);
	o.title ??= o.headline;
	o.palette ??= o.theme;
	const type = positional ?? (typeof o.slide === 'string' ? o.slide : undefined);
	if (type && o.input) throw new Error('Pass --input or one slide type, not both.');
	let slides: Slide[];
	let base = cwd;
	if (typeof o.input === 'string') {
		const path = isAbsolute(o.input) ? o.input : resolve(cwd, o.input);
		let parsed: { slides?: unknown };
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${o.input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${o.input} needs a "slides" list.`);
		slides = parsed.slides as Slide[];
		base = dirname(path);
		for (const flag of [...SLOT_FLAGS, 'image', 'palette']) if (o[flag] !== undefined) throw new Error(`--${flag} goes with one slide; with --input, put it in the file.`);
	} else {
		if (!type) throw new Error(`Pass --input deck.json or a slide type: ${cli()} deck cover (one of ${slideTypes().join(', ')}).`);
		const one: Slide = { type };
		for (const k of SLOT_FLAGS) if (typeof o[k] === 'string') one[k] = (o[k] as string).replace(/\\n/g, '\n');
		if (typeof o.palette === 'string') one.palette = o.palette;
		if (typeof o.image === 'string') one.image = o.image;
		slides = [one];
	}
	if (outExt && outExt !== 'pdf' && slides.length > 1) throw new Error('--out names one file; several slides need a directory (or a .pdf).');
	const dir = resolve(cwd, out && !outExt ? out : 'deck');
	const files: OutFile[] = [];
	const warnings: string[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	// Every slide is drawn and checked before any file is written.
	const ready: { path: string; data: Buffer | string; file: OutFile }[] = [];
	for (const [i, given] of slides.entries()) {
		const s = given as Slide & { design?: unknown };
		if (!s || (typeof s.type !== 'string' && typeof s.design !== 'string')) throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		let id: string;
		let r;
		try {
			if (typeof s.design === 'string') {
				const path = resolve(base, s.design);
				const a = adapter();
				const doc = parseDoc(readFileSync(path, 'utf8'), a, s.design);
				if (doc.kind !== 'slide') throw new Error(`${s.design} is not a slide.`);
				id = doc.template;
				const one = await slideOf(doc, dirname(path));
				r = renderSlide(one, { png: formats.includes('png'), svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), rgb: formats.includes('pdf') }, doc.layers);
				const f = checkSlide(one, r.layers, wordColors, doc.allow);
				if (errorsOf(f).length) throw new Error(checkText(errorsOf(f)));
			} else {
				const type = pick('slide type', s.type, slideTypes());
				id = type;
				const one: Slide = { ...s, type, ...(o.sample || s.sample ? { sample: true } : {}), picture: await slidePicture(base, type, s.image) };
				r = renderSlide(one, { png: formats.includes('png'), svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), rgb: formats.includes('pdf') });
				const f = checkSlide(one, r.layers, wordColors);
				if (errorsOf(f).length) throw new Error(checkText(errorsOf(f)));
				warnings.push(...f.map((x) => `slide ${i + 1}: ${x.message}`));
			}
		} catch (err) {
			throw new Error(`Slide ${i + 1}${typeof s.type === 'string' ? ` (${s.type})` : ''}: ${(err as Error).message}`);
		}
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		for (const f of formats) {
			if (f === 'pdf') continue;
			const path = outExt === f ? resolve(cwd, out!) : `${name}.${f}`;
			ready.push({ path, data: r[f as 'png']!, file: { path: display(cwd, path), format: f, slide: id, width: r.width, height: r.height } });
		}
		if (r.rgb) pages.push({ rgb: r.rgb, width: r.width, height: r.height });
	}
	if (formats.includes('pdf')) {
		const pdf = outExt === 'pdf' ? resolve(cwd, out!) : join(dir, 'deck.pdf');
		// 16:9 pages, 13.33 by 7.5 in.
		ready.push({ path: pdf, data: imagesToPdf(pages, 960), file: { path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 } });
	}
	for (const r of ready) {
		write(r.path, r.data);
		files.push(r.file);
	}
	emit(o, { files, ...(warnings.length ? { warnings } : {}) }, () => [...files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`), ...warnings.map((w) => `warning ${w}`)].join('\n'));
}

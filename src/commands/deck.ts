import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { deckCatalog, deckDoc, renderSlide, slideTypes, type Slide } from '../assets/deck.js';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { readPicture } from '../assets/picture.js';
import { samplePicture } from '../assets/samples.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `deck`: slides at 1920 by 1080 from a JSON file or flags, a PNG per slide and one PDF.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const SLOT_FLAGS = ['title', 'body', 'number', 'items', 'stat', 'quote', 'attribution', 'url'];

export function deckCommand(program: Command) {
	program
		.command('deck [slide]')
		.description('Slides at 1920 by 1080 (cover, section, statement, bullets, stat, quote, image, closing): PNG per slide and one PDF')
		.option('-i, --input <file>', 'deck.json: { "slides": [ { "type": "cover", "title": "..." }, ... ] }')
		.option('--slide <type>', 'one slide of this type, from flags')
		.option('-p, --palette <name>', 'Paper, Blue, Ink, Mist, Night or Graphite (default: the type\'s)')
		.option('--title <text>', 'the title (every type but quote)')
		.option('--body <text>', 'cover and image: the line under the title')
		.option('--number <text>', 'section: the number set in dots')
		.option('--items <text>', 'bullets: points separated by |')
		.option('--stat <text>', 'stat: the big number set in dots')
		.option('--quote <text>', 'quote: the quote')
		.option('--attribution <text>', 'quote: who said it (role and company)')
		.option('--url <text>', 'closing: the address')
		.option('--image <file>', 'cover, bullets and image: any picture, through the dot shader (sample:Globe works)')
		.option('-f, --format <format>', 'both (PNG and PDF), png, pdf or svg', 'both')
		.option('-o, --out <dir>', 'output directory (default deck/)')
		.option('--list', 'slide types with their slots')
		.option('--json', 'JSON output')
		.action(async (slide: string | undefined, _o, cmd: Command) => runDeck(slide, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => [
			'',
			'Examples:',
			`  ${cli()} deck --input deck.json --out deck`,
			`  ${cli()} deck cover --title "The web data APIs for agents"`,
			`  ${cli()} deck bullets --items "Scrape any page | Crawl a site | Search the web"`,
			`  ${cli()} deck --list`,
			'',
			'deck.json slides take their type\'s slots by name, "palette", and "image" (a path relative to the file).',
		].join('\n'));
}

async function picture(base: string, value: unknown) {
	if (typeof value !== 'string' || !value.trim() || value === 'none') return null;
	if (value.toLowerCase().startsWith('sample:')) {
		const s = samplePicture(value);
		if (!s) throw new Error(`Unknown sample picture \`${value}\`.`);
		return s;
	}
	return readPicture(base, value);
}

async function runDeck(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = deckCatalog();
		emit(o, cat, () => cat.slides.map((s) => `${s.id.padEnd(10)} ${s.description} Slots: ${Object.keys(s.slots).join(', ')}. Palette: ${s.palette}.`).join('\n'));
		return;
	}
	const format = pick('format', String(o.format ?? 'both'), ['both', 'png', 'pdf', 'svg'] as const);
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
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'deck');
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, s] of slides.entries()) {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		const id = pick('slide type', s.type, slideTypes());
		// A slide's own picture, else its type's opening one (the image slide's sample).
		const pic = await picture(base, s.image ?? deckDoc().slides[id].slots.image);
		let r;
		try {
			r = renderSlide({ ...s, type: id, picture: pic }, { png: format !== 'svg', svg: format === 'svg' });
		} catch (err) {
			throw new Error(`Slide ${i + 1} (${id}): ${(err as Error).message}`);
		}
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		if (r.svg) {
			write(`${name}.svg`, r.svg);
			files.push({ path: display(cwd, `${name}.svg`), format: 'svg', slide: id, width: r.width, height: r.height });
		}
		if (r.png && format !== 'pdf') {
			write(`${name}.png`, r.png);
			files.push({ path: display(cwd, `${name}.png`), format: 'png', slide: id, width: r.width, height: r.height });
		}
		if (r.rgb) pages.push({ rgb: r.rgb, width: r.width, height: r.height });
	}
	if (format === 'both' || format === 'pdf') {
		const pdf = join(dir, 'deck.pdf');
		// 16:9 pages, 13.33 by 7.5 in.
		write(pdf, imagesToPdf(pages, 960));
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 });
	}
	emit(o, { files }, () => files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`).join('\n'));
}

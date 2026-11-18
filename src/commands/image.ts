import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { designOf, imageCatalog, imageSizes, pictureFor, renderDesign, type Kind } from '../assets/image.js';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { imageDoc, TEMPLATES, type Design } from '../assets/og.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `image`: the share images and social posts (the editor's templates, sizes, palettes and dot shader) as PNG and SVG.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

export function imageCommand(program: Command) {
	const c = program
		.command('image [template]')
		.description('Share images and social posts (banner, products, social, cards, customer) as PNG and SVG; any --image becomes dots')
		.option('-t, --template <name>', 'banner, products, social, cards or customer')
		.option('-k, --kind <kind>', 'share (link previews, banners) or social (posts in any shape); picks the default size')
		.option('-s, --size <size>', 'banner, og, square, s-16x9 (16:9), s-191, s-1x1, s-4x5, s-3x4, s-9x16, s-3x1, custom, or all')
		.option('--width <px>', 'custom size width, 200 to 4000')
		.option('--height <px>', 'custom size height, 200 to 4000')
		.option('-p, --palette <name>', 'Paper, Blue, Ink, Mist, Night or Graphite')
		.option('--headline <text>', 'the headline (every template)')
		.option('--body <text>', 'social: the line under the headline')
		.option('--cta <text>', 'products: the button label (empty for none)')
		.option('--lists <text>', 'products: "# Group" lines then items, newline separated')
		.option('--cards <text>', 'cards: cards separated by blank lines, heading first')
		.option('--footer <text>', 'cards: the address in the footer')
		.option('--stat <text>', 'customer: the big number set in dots')
		.option('--partner <file>', 'customer: the customer\'s logo (PNG, JPEG, WebP or SVG); shown only when passed')
		.option('--partner-name <text>', 'customer: their name, shown when no logo is passed')
		.option('--partner-color', 'customer: keep the logo\'s own colors (default: recolored to the palette ink)')
		.option('--partner-size <px>', 'customer: logo height in the image\'s pixels')
		.option('--logo', 'draw the logo')
		.option('--no-logo', 'leave the logo out')
		.option('--burst', 'customer: draw the burst of dots')
		.option('--no-burst', 'customer: leave the burst out')
		.option('-i, --image <file>', 'any picture, turned into dots by the dot shader; sample:Globe (Sphere, Cursor, Layers, Key) or none')
		.option('--image-x <share>', 'picture center across, as a share of the width (or of its area); dragging in the editor')
		.option('--image-y <share>', 'picture center down, as a share of the height')
		.option('--image-scale <percent>', 'picture size, percent of the size that just fits (10 to 400)')
		.option('--text-x <share>', 'headline left (social, cards: center) as a share of the width')
		.option('--text-y <share>', 'headline top as a share of the height')
		.option('--text-size <px>', 'headline size in the image\'s pixels')
		.option('--text-width <share>', 'wrap width as a share of the width')
		.option('--dot <px>', 'dot size (2 to 40)')
		.option('--gap <px>', 'gap between dots (0 to 40)')
		.option('--render <mode>', 'toneEdges, tone, edges or silhouette')
		.option('--fill <percent>', 'share of the picture\'s dots that are filled')
		.option('--hollow <percent>', 'share that are rings')
		.option('--dither <mode>', 'none, diffuse or pattern')
		.option('--invert', 'filled dots stand for the dark parts')
		.option('--cutout <mode>', 'auto (cut the subject out of its background) or whole')
		.option('--key-tol <n>', 'cut-out tolerance (0 to 30)')
		.option('--field <mode>', 'the grid behind: none, faint or rings')
		.option('-f, --format <format>', 'png, svg or both', 'both')
		.option('--scale <n>', 'PNG pixel multiple, 1 to 4 (the editor downloads at 2)', '1')
		.option('-o, --out <path>', 'a directory (default assets/), or one .png or .svg file')
		.option('--all', 'every template at every size of the kind')
		.option('--list', 'templates, sizes, palettes and samples')
		.option('--json', 'JSON output')
		.action(async (template: string | undefined, _o, cmd: Command) => runImage(template, cmd.optsWithGlobals() as Opts));
	c.addHelpText('after', () => imageHelp());
}

export function imageHelp(): string {
	const b = cli();
	return [
		'',
		'Examples:',
		`  ${b} image banner --headline "The web data APIs for agents" --image hero.png`,
		`  ${b} image social --kind social --size 4:5 --headline "NEW!" --body "..."`,
		`  ${b} image customer --stat "20M+" --headline "companies." --partner acme.svg`,
		`  ${b} image products --size square --palette Ink`,
		`  ${b} image banner --size custom --width 1600 --height 900 --image-x 0.7 --image-y 0.5`,
		`  ${b} image --kind social --all --out posts`,
		'',
		'Templates draw the same as the share-image editor; the same inputs write the same bytes.',
	].join('\n');
}

const SET_FLAGS: [string, keyof Design, 'text' | 'number' | 'flag'][] = [
	['palette', 'palette', 'text'], ['headline', 'headline', 'text'], ['body', 'body', 'text'], ['cta', 'cta', 'text'], ['lists', 'lists', 'text'],
	['cards', 'cards', 'text'], ['footer', 'footer', 'text'], ['stat', 'stat', 'text'], ['partnerName', 'partnerName', 'text'], ['image', 'image', 'text'],
	['render', 'render', 'text'], ['dither', 'dither', 'text'], ['cutout', 'cutout', 'text'], ['field', 'field', 'text'],
];
const NUMBERS: [string, keyof Design, number, number][] = [
	['imageX', 'imgX', -1, 2], ['imageY', 'imgY', -1, 2], ['imageScale', 'imgScale', 10, 400], ['textX', 'textX', -1, 2], ['textY', 'textY', -1, 2],
	['textSize', 'textSize', 8, 600], ['textWidth', 'textWidth', 0.05, 1], ['dot', 'dot', 2, 40], ['gap', 'gap', 0, 40], ['fill', 'fillPct', 0, 100],
	['hollow', 'hollowPct', 0, 100], ['keyTol', 'keyTol', 0, 30], ['partnerSize', 'partnerSize', 8, 400],
];
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** The design settings a set of flags asks for. */
export function settingsFrom(o: Opts): Partial<Design> {
	const set: Record<string, unknown> = {};
	for (const [flag, key] of SET_FLAGS) if (typeof o[flag] === 'string') set[key] = (o[flag] as string).replace(/\\n/g, '\n');
	for (const [flag, key, min, max] of NUMBERS) {
		const v = num(kebab(flag), o[flag], min, max);
		if (v !== undefined) set[key] = v;
	}
	if (o.logo !== undefined) set.logo = o.logo;
	if (o.burst !== undefined) set.burst = o.burst;
	if (o.invert) set.invert = true;
	if (o.partnerColor) set.partnerWhite = false;
	return set as Partial<Design>;
}

async function runImage(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = imageCatalog();
		emit(o, cat, () => [
			...cat.templates.map((t) => `${t.id.padEnd(10)} ${t.name}. ${t.description} Text: ${t.slots.map((s) => `--${s}`).join(', ')}. Picture: ${t.picture}.`),
			'',
			`Kinds: ${cat.kinds.map((k) => `${k.id} (${k.sizes.join(', ')}${k.custom ? ', custom' : ''})`).join('; ')}`,
			`Sizes: ${cat.sizes.filter((s) => s.width).map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}, custom`,
			`Palettes: ${cat.palettes.map((p) => p.name).join(', ')}`,
			`Samples: ${cat.samples.join(', ')}`,
		].join('\n'));
		return;
	}
	if (positional && o.template && positional.toLowerCase() !== String(o.template).toLowerCase()) throw new Error(`Pass the template once (got ${positional} and --template ${o.template}).`);
	const named = positional ?? (o.template as string | undefined);
	const format = pick('format', String(o.format ?? 'both'), ['png', 'svg', 'both'] as const);
	const scale = num('scale', o.scale, 1, 4) ?? 1;
	const kind = o.kind ? pick('kind', String(o.kind), ['share', 'social'] as const) as Kind : undefined;
	const width = num('width', o.width, 200, 4000, { integer: true });
	const height = num('height', o.height, 200, 4000, { integer: true });
	const set = settingsFrom(o);
	type Job = { template: string; size?: string };
	const jobs: Job[] = [];
	if (o.all) {
		if (named) throw new Error('Pass a template or --all, not both.');
		const k = imageDoc().kinds[kind ?? 'share'];
		const sizes = imageSizes().filter((s) => s.kind === (kind ?? 'share')).map((s) => s.id);
		for (const t of k.templates) for (const size of sizes) jobs.push({ template: t, size });
	} else {
		if (!named) throw new Error(`Name a template: ${cli()} image banner (one of ${TEMPLATES.join(', ')}; --list shows them).`);
		if (String(o.size ?? '').toLowerCase() === 'all') {
			for (const s of imageSizes().filter((s) => s.kind === (kind ?? 'share'))) jobs.push({ template: named, size: s.id });
		} else jobs.push({ template: named, size: o.size as string | undefined });
	}
	const out = typeof o.out === 'string' ? o.out : undefined;
	const single = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
	if (single && (jobs.length > 1 || format === 'both')) throw new Error('--out names one file, so pass one template, one size and --format png or svg. For several files, pass a directory.');
	if (single && !single.toLowerCase().endsWith(`.${format}`)) throw new Error(`--out ends in ${single.split('.').pop()} but --format is ${format}.`);
	const dir = resolve(cwd, out && !single ? out : 'assets');
	const files: OutFile[] = [];
	for (const job of jobs) {
		const d = designOf({ template: job.template, kind, size: job.size, width, height, set });
		const picture = await pictureFor(d, cwd, typeof o.partner === 'string' ? o.partner : undefined);
		const r = renderDesign(d, picture, { png: format !== 'svg', svg: format !== 'png', scale });
		const base = single ? single.replace(/\.(png|svg)$/i, '') : join(dir, `${d.template}-${d.size === 'custom' ? `${d.w}x${d.h}` : d.size}`);
		if (r.png) {
			write(`${base}.png`, r.png);
			files.push({ path: display(cwd, `${base}.png`), format: 'png', template: d.template, size: d.size, width: r.width, height: r.height });
		}
		if (r.svg) {
			write(`${base}.svg`, r.svg);
			files.push({ path: display(cwd, `${base}.svg`), format: 'svg', template: d.template, size: d.size, width: Math.round(r.width / scale), height: Math.round(r.height / scale) });
		}
	}
	emit(o, { files }, () => files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n'));
}

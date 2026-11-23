import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { checkImage, designOf, imageCatalog, pictureFor, renderDesign, sizeId, slotKey, slotsOf, type Kind } from '../assets/image.js';
import { display, num, pick, unknown, write, type OutFile } from '../assets/io.js';
import { imageDoc, TEMPLATES, type Design, type Template } from '../assets/og.js';
import { checkText, errorsOf, NEVER_ALLOWED, RULES } from '../design/index.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `image`: the share images and social posts (the editor's templates, sizes, palettes and dot shader) as PNG, SVG, JPEG and WebP, each checked before it is written.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

export function imageCommand(program: Command) {
	const c = program
		.command('image [template]')
		.description('Share images and social posts (banner, products, social, cards, customer, mark) as PNG, SVG, JPEG and WebP; any --image becomes dots')
		.option('-t, --template <name>', 'banner, products, social, cards, customer or mark')
		.option('-k, --kind <kind>', 'share (link previews, banners) or social (posts in any shape); picks the default size')
		.option('-s, --size <sizes>', 'og, x-banner, square, portrait, tall, story, landscape, linkedin, linkedin-banner, linkedin-page, youtube, youtube-thumbnail, email, avatar, custom; several with commas, or all')
		.option('--width <px>', 'custom size width, 200 to 4000')
		.option('--height <px>', 'custom size height, 200 to 4000')
		.option('-p, --palette <name>', 'Paper, Blue, Ink, Mist, Night or Graphite (also --theme)')
		.option('--theme <name>', 'the same as --palette')
		.option('--headline <text>', 'the headline (also --title)')
		.option('--title <text>', 'the same as --headline')
		.option('--body <text>', 'banner, social: the line under the headline')
		.option('--badge <text>', 'banner, social: a short label above the headline')
		.option('--cta <text>', 'products: the button label')
		.option('--lists <text>', 'products: "# Group" lines then items, newline separated')
		.option('--cards <text>', 'cards: cards separated by blank lines, heading first')
		.option('--footer <text>', 'cards: the address in the footer (the brand\'s own by default, empty for none)')
		.option('--stat <text>', 'customer: the big number set in dots')
		.option('--partner <file>', 'customer: the customer\'s logo (PNG, JPEG, WebP or SVG); shown only when passed')
		.option('--partner-name <text>', 'customer: their name, when no logo is passed')
		.option('--partner-color', 'customer: keep the logo\'s own colors (default: recolored to the palette ink)')
		.option('--partner-size <px>', 'customer: logo height in the image\'s pixels')
		.option('--sample', 'fill the copy you did not pass with sample copy')
		.option('--seed <n>', 'banner, social: which built-in picture when none is passed; customer: turns the burst')
		.option('--allow <rules>', 'accept composition rules the check finds broken (overlap, safe-area, cut, small-text)')
		.option('--logo', 'draw the logo')
		.option('--no-logo', 'leave the logo out')
		.option('--burst', 'customer: draw the burst of dots')
		.option('--no-burst', 'customer: leave the burst out')
		.option('-i, --image <file>', 'any picture, turned into dots by the dot shader; sample:Globe (Sphere, Cursor, Layers, Key) or none')
		.option('--image-x <share>', 'picture center across, as a share of the width (default: whole, in the room the words leave)')
		.option('--image-y <share>', 'picture center down, as a share of the height')
		.option('--image-scale <percent>', 'picture size, percent of the size that just fits its room (10 to 400; of the frame, with --image-x or --image-y)')
		.option('--text-x <share>', 'headline left (social: center) as a share of the width')
		.option('--text-y <share>', 'headline top as a share of the height')
		.option('--text-size <px>', 'headline size to start from, in the image\'s pixels')
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
		.option('-f, --format <formats>', 'png, svg, jpg, webp, or several with commas (default: png and svg, or the format an --out file name ends in)')
		.option('--scale <n>', 'pixel multiple, 1 to 4', '1')
		.option('-o, --out <path>', 'a directory (default assets/), or one .png, .svg, .jpg or .webp file')
		.option('--input <file>', 'a carousel: carousel.json with "slides" (each its own copy and picture), one template, size and theme, numbered')
		.option('--no-number', 'carousel: leave the page numbers out')
		.option('--all', 'every template at every size of the kind, with sample copy')
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
		`  ${b} image banner --headline "The web data APIs for agents" --size og,x-banner,story`,
		`  ${b} image social --size portrait --headline "NEW!" --body "..." --theme Ink`,
		`  ${b} image customer --stat "42%" --headline "less time on setup" --partner acme.svg`,
		`  ${b} image --input carousel.json --size portrait        (numbered posts, one look)`,
		`  ${b} image banner --size custom --width 1600 --height 900 --headline "..." -o post.webp`,
		'',
		'Only the copy you pass is drawn, whole: it wraps and shrinks to a readable floor, and what still does not fit is an',
		'error. Every image is checked (contrast, overlap, the logo, safe areas) before it is written. The same inputs write',
		`the same bytes. To go on changing one image, start it with ${b} design new.`,
	].join('\n');
}

const SET_FLAGS: [string, keyof Design, 'text' | 'number' | 'flag'][] = [
	['palette', 'palette', 'text'], ['headline', 'headline', 'text'], ['body', 'body', 'text'], ['cta', 'cta', 'text'], ['lists', 'lists', 'text'],
	['cards', 'cards', 'text'], ['footer', 'footer', 'text'], ['badge', 'badge', 'text'], ['title', 'headline', 'text'], ['theme', 'palette', 'text'], ['stat', 'stat', 'text'], ['partnerName', 'partnerName', 'text'], ['image', 'image', 'text'],
	['render', 'render', 'text'], ['dither', 'dither', 'text'], ['cutout', 'cutout', 'text'], ['field', 'field', 'text'],
];
const NUMBERS: [string, keyof Design, number, number][] = [
	['imageX', 'imgX', -1, 2], ['imageY', 'imgY', -1, 2], ['imageScale', 'imgScale', 10, 400], ['textX', 'textX', -1, 2], ['textY', 'textY', -1, 2],
	['textSize', 'textSize', 8, 600], ['textWidth', 'textWidth', 0.05, 1], ['dot', 'dot', 2, 40], ['gap', 'gap', 0, 40], ['fill', 'fillPct', 0, 100],
	['hollow', 'hollowPct', 0, 100], ['keyTol', 'keyTol', 0, 30], ['partnerSize', 'partnerSize', 8, 400], ['seed', 'seed', 0, 1e9],
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
			...cat.templates.map((t) => `${t.id.padEnd(10)} ${t.name}. ${t.description} Text: ${t.slots.map((s) => `--${s}${t.required.includes(s) ? ' (needed)' : ''}`).join(', ') || 'none'}. Picture: ${t.picture}. Sizes: ${t.sizes.join(', ')}.`),
			'',
			`Kinds: ${cat.kinds.map((k) => `${k.id} (${k.sizes.join(', ')}${k.custom ? ', custom' : ''})`).join('; ')}`,
			`Sizes: ${cat.sizes.filter((s) => s.width).map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}, custom`,
			`Palettes: ${cat.palettes.map((p) => p.name).join(', ')}`,
			`Samples: ${cat.samples.join(', ')}`,
		].join('\n'));
		return;
	}
	if (typeof o.input === 'string') return runCarousel(o.input, cwd, o);
	if (positional && o.template && positional.toLowerCase() !== String(o.template).toLowerCase()) throw new Error(`Pass the template once (got ${positional} and --template ${o.template}).`);
	for (const [a, b] of [['title', 'headline'], ['theme', 'palette']]) if (o[a!] !== undefined && o[b!] !== undefined && o[a!] !== o[b!]) throw new Error(`--${a} and --${b} are the same thing; pass one.`);
	const named = positional ?? (o.template as string | undefined);
	const out = typeof o.out === 'string' ? o.out : undefined;
	// A file named in --out picks its own format (post.png is a PNG); otherwise PNG and SVG.
	const outExt = out ? /\.(png|svg|jpe?g|webp)$/i.exec(out)?.[1]?.toLowerCase().replace('jpeg', 'jpg') : undefined;
	const formats = formatsOf(String(o.format ?? outExt ?? 'both'));
	const scale = num('scale', o.scale, 1, 4) ?? 1;
	const kind = o.kind ? pick('kind', String(o.kind), ['share', 'social'] as const) as Kind : undefined;
	const width = num('width', o.width, 200, 4000, { integer: true });
	const height = num('height', o.height, 200, 4000, { integer: true });
	const set = settingsFrom(o);
	const allow = typeof o.allow === 'string' ? o.allow.split(',').map((s) => s.trim()).filter(Boolean) : [];
	for (const r of allow) {
		if (!RULES.some((x) => x.id === r)) throw unknown('rule', r, RULES.filter((x) => !NEVER_ALLOWED.has(x.id)).map((x) => x.id));
		if (NEVER_ALLOWED.has(r)) throw new Error(`"${r}" is a brand rule and can never be allowed.`);
	}
	type Job = { template: string; size?: string };
	const jobs: Job[] = [];
	if (o.all) {
		if (named) throw new Error('Pass a template or --all, not both.');
		const k = imageDoc().kinds[kind ?? 'share'];
		for (const t of k.templates) for (const size of k.sizes) if (imageDoc().templates[t].sizes.includes(size)) jobs.push({ template: t, size });
	} else {
		if (!named) throw new Error(`Name a template: ${cli()} image banner (one of ${TEMPLATES.join(', ')}; --list shows them).`);
		const t = pick('template', named, TEMPLATES);
		const typed = typeof o.size === 'string' ? o.size.split(',').map((x) => x.trim()).filter(Boolean) : [];
		if (typed.length === 1 && typed[0]!.toLowerCase() === 'all') for (const s of imageDoc().templates[t].sizes.filter((x) => x !== 'custom' && (!kind || imageDoc().kinds[kind].sizes.includes(x)))) jobs.push({ template: t, size: s });
		else if (typed.length) for (const s of new Set(typed.map(sizeId))) jobs.push({ template: t, size: s });
		else jobs.push({ template: t, size: width || height ? 'custom' : undefined });
	}
	const single = out && outExt ? resolve(cwd, out) : undefined;
	if (single && (jobs.length > 1 || formats.length > 1)) throw new Error('--out names one file, so pass one template, one size and one --format. For several files, pass a directory.');
	if (single && formats[0] !== outExt) throw new Error(`--out ends in .${outExt} but --format is ${formats[0]}.`);
	const dir = resolve(cwd, out && !single ? out : 'assets');
	const files: OutFile[] = [];
	const warnings: string[] = [];
	const failed: string[] = [];
	for (const job of jobs) {
		const label = `${job.template}${job.size ? ` ${job.size}` : ''}`;
		try {
			const d = designOf({ template: job.template, kind, size: job.size, width, height, set, sample: !!o.sample || !!o.all });
			const picture = await pictureFor(d, cwd, typeof o.partner === 'string' ? o.partner : undefined);
			const r = renderDesign(d, picture, { png: true, svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp'), scale });
			const findings = checkImage(d, r.layers, r.png, allow);
			if (errorsOf(findings).length) throw new Error(checkText(findings.filter((f) => f.severity === 'error')));
			if (formats.includes('png')) warnings.push(...findings.filter((f) => f.rule === 'upload-size').map((f) => `${label}: ${f.message}`));
			warnings.push(...findings.filter((f) => f.rule !== 'upload-size').map((f) => `${label}: ${f.message}`));
			const base = single ? single.replace(/\.\w+$/, '') : join(dir, `${d.template}-${d.size === 'custom' ? `${d.w}x${d.h}` : d.size}`);
			for (const f of formats) {
				const path = single ?? `${base}.${f}`;
				write(path, r[f]!);
				files.push({ path: display(cwd, path), format: f, template: d.template, size: d.size, width: f === 'svg' ? Math.round(r.width / scale) : r.width, height: f === 'svg' ? Math.round(r.height / scale) : r.height });
			}
		} catch (err) {
			if (jobs.length === 1) throw err;
			failed.push(`${label}: ${(err as Error).message}`);
		}
	}
	// Several sizes: the ones that can be drawn are written, and the rest named.
	emit(o, { files, ...(warnings.length ? { warnings } : {}), ...(failed.length ? { failed } : {}) }, () => [...files.map((f) => `${f.path}  ${f.width}x${f.height}`), ...warnings.map((w) => `warning ${w}`), ...failed.map((f) => `not made: ${f}`)].join('\n'));
	if (failed.length) process.exitCode = 1;
}

const FORMATS = ['png', 'svg', 'jpg', 'webp'] as const;
type ImageFormat = (typeof FORMATS)[number];
/** `both` (PNG and SVG), or a list of formats. */
export function formatsOf(typed: string): ImageFormat[] {
	if (typed.trim().toLowerCase() === 'both') return ['png', 'svg'];
	return [...new Set(typed.split(',').map((f) => pick('format', f.trim().replace(/^jpeg$/i, 'jpg'), FORMATS)))];
}

type CarouselDoc = { template?: string; size?: string; theme?: string; palette?: string; number?: boolean; slides?: Record<string, unknown>[] };

/** A carousel: the same template, size and theme for every slide, each with its own words and picture, numbered. Every
 * slide is drawn and checked before any is written. */
async function runCarousel(input: string, cwd: string, o: Opts) {
	const path = resolve(cwd, input);
	let doc: CarouselDoc;
	try {
		doc = JSON.parse(readFileSync(path, 'utf8')) as CarouselDoc;
	} catch (err) {
		throw new Error(`Could not read ${input} as JSON (${(err as Error).message}).`);
	}
	const slides = doc.slides;
	if (!Array.isArray(slides) || slides.length < 2 || slides.length > 20) throw new Error(`${input} needs "slides": 2 to 20 of them, each with its own copy.`);
	const extra = Object.keys(doc).filter((k) => !['template', 'size', 'theme', 'palette', 'number', 'slides', '$comment'].includes(k));
	if (extra.length) throw new Error(`${input} holds ${extra.map((k) => `"${k}"`).join(', ')}; a carousel takes template, size, theme, number and slides.`);
	const template = pick('template', String(o.template ?? doc.template ?? 'social'), TEMPLATES) as Template;
	const size = sizeId(String(o.size ?? doc.size ?? 'portrait'));
	if (!['square', 'portrait', 'tall', 'story'].includes(size)) throw new Error(`A carousel is square, portrait, tall or story, not ${size}.`);
	const theme = (o.palette ?? o.theme ?? doc.theme ?? doc.palette) as string | undefined;
	const numbered = o.number !== false && doc.number !== false;
	const base = dirname(path);
	const out = resolve(cwd, typeof o.out === 'string' ? o.out : 'carousel');
	const formats = formatsOf(String(o.format ?? 'png'));
	const ready: { path: string; data: Buffer | string; file: OutFile }[] = [];
	const designs: Design[] = [];
	for (const [i, s] of slides.entries()) {
		const set: Partial<Design> = { ...(theme ? { palette: theme } : {}), ...(numbered ? { page: `${i + 1} / ${slides.length}` } : {}) };
		for (const [k, v] of Object.entries(s)) {
			if (k === 'image') continue;
			const slot = k === 'title' ? 'headline' : k;
			if (!slotsOf(template).includes(slot)) throw new Error(`Slide ${i + 1}: the ${template} layout does not draw "${k}". It draws ${slotsOf(template).join(', ')}.`);
			if (typeof v !== 'string') throw new Error(`Slide ${i + 1}: "${k}" takes text.`);
			(set as Record<string, unknown>)[slotKey(slot)] = v;
		}
		if (typeof s.image === 'string') set.image = s.image.startsWith('sample:') || s.image === 'none' ? s.image : resolve(base, s.image);
		try {
			designs.push(designOf({ template, size, set, sample: !!o.sample }));
		} catch (err) {
			throw new Error(`Slide ${i + 1}: ${(err as Error).message}`);
		}
	}
	// One headline size for every slide: the size the longest one fits at.
	const sizes: number[] = [];
	for (const [i, d] of designs.entries()) {
		try {
			const r = renderDesign(d, await pictureFor(d, base), { png: false });
			const h = r.layers.find((l) => l.id === 'headline')?.text?.size;
			if (h) sizes.push(h);
		} catch (err) {
			throw new Error(`Slide ${i + 1}: ${(err as Error).message}`);
		}
	}
	const one = sizes.length ? Math.min(...sizes) : undefined;
	for (const [i, d0] of designs.entries()) {
		const d = one && d0.textSize === undefined ? { ...d0, textSize: one } : d0;
		try {
			const r = renderDesign(d, await pictureFor(d, base), { png: true, svg: formats.includes('svg'), jpg: formats.includes('jpg'), webp: formats.includes('webp') });
			const f = checkImage(d, r.layers, r.png);
			if (errorsOf(f).length) throw new Error(checkText(errorsOf(f)));
			for (const fmt of formats) {
				const file = join(out, `${String(i + 1).padStart(2, '0')}-${template}-${size}.${fmt}`);
				ready.push({ path: file, data: r[fmt]!, file: { path: display(cwd, file), format: fmt, slide: i + 1, width: r.width, height: r.height } });
			}
		} catch (err) {
			throw new Error(`Slide ${i + 1}: ${(err as Error).message}`);
		}
	}
	for (const r of ready) write(r.path, r.data);
	const files = ready.map((r) => r.file);
	emit(o, { files }, () => files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n'));
}

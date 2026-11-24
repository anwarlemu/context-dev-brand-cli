import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, pick, write } from '../assets/io.js';
import { introFrames, lowerThirdFrames, MOTION_KINDS, outroFrames, revealFrames, walkthroughFrames, type Frame, type MotionKind } from '../assets/motion.js';
import { paletteOf, palettes } from '../assets/og.js';
import { readPicture } from '../assets/picture.js';
import { encode, hasFfmpeg } from '../assets/video.js';
import { adapter } from '../design/adapter.js';
import { parseDoc } from '../design/index.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `motion`: brand motion from any graphic (a design revealed through the dot grid), intro and outro stings, a lower
// third and a screenshot walkthrough, as MP4, WebM or GIF through ffmpeg, PNG frames without it, and --still for the
// finished frame (reduced motion, a poster).

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const SIZES: Record<string, [number, number]> = { landscape: [1920, 1080], square: [1080, 1080], vertical: [1080, 1920] };

export function motionCommand(program: Command) {
	program
		.command('motion [kind] [inputs...]')
		.description('Brand motion: reveal <design file>, intro and outro stings, lower-third, walkthrough <screenshots...>; MP4, WebM, GIF or frames')
		.option('-s, --size <size>', 'stings, lower third, walkthrough: landscape, square or vertical (a reveal takes its design\'s size)', 'landscape')
		.option('--theme <name>', 'Paper, Blue, Ink, Mist, Night or Graphite')
		.option('--headline <text>', 'intro and outro: the line under the logo')
		.option('--url <text>', 'outro: the address')
		.option('--name <text>', 'lower third: the name')
		.option('--role <text>', 'lower third: the role')
		.option('--captions <text>', 'walkthrough: a caption per screenshot, with | between')
		.option('--seconds <n>', 'length (reveal 4, stings 3, lower third 5; walkthrough: per screenshot, 3)')
		.option('--fps <n>', '12 to 60', '30')
		.option('-f, --format <formats>', 'mp4, webm, gif or frames, several with commas (default: mp4 with ffmpeg, frames without)')
		.option('--still', 'the finished frame as one PNG instead of a video (for reduced motion, or a poster)')
		.option('-o, --out <dir>', 'output directory (default motion/)')
		.option('--list', 'the kinds')
		.option('--json', 'JSON output')
		.action((kind: string | undefined, inputs: string[], _o, cmd: Command) => runMotion(kind, inputs ?? [], cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => [
			'',
			'Examples:',
			`  ${cli()} motion reveal banner.design.json             (any design: image, recipe, compose)`,
			`  ${cli()} motion intro --headline "Web data for your agents" --theme Blue`,
			`  ${cli()} motion lower-third --name "Alex Doe" --role "Engineer, Acme" -f webm`,
			`  ${cli()} motion walkthrough one.png two.png --captions "Scrape a page | Get Markdown"`,
		].join('\n'));
}

async function runMotion(typed: string | undefined, inputs: string[], o: Opts) {
	const cwd = process.cwd();
	if (o.list || !typed) {
		if (!typed && !o.list) throw new Error(`Name a kind: ${cli()} motion ${MOTION_KINDS.map((k) => k.id).join('|')}`);
		emit(o, { kinds: MOTION_KINDS }, () => MOTION_KINDS.map((k) => `${k.id.padEnd(12)} ${k.description}`).join('\n'));
		return;
	}
	const kind = pick('motion', typed, MOTION_KINDS.map((k) => k.id)) as MotionKind;
	const fps = num('fps', o.fps, 12, 60, { integer: true }) ?? 30;
	const ff = hasFfmpeg();
	const formats = String(o.format ?? (ff ? 'mp4' : 'frames')).split(',').map((f) => pick('format', f.trim(), ['mp4', 'webm', 'gif', 'frames'] as const));
	if (!ff && formats.some((f) => f !== 'frames')) throw new Error('MP4, WebM and GIF need ffmpeg on the PATH. Without it: --format frames.');
	const theme = typeof o.theme === 'string' ? pick('theme', o.theme, palettes().map((p) => p.name)) : undefined;
	const [W, H] = SIZES[pick('size', String(o.size ?? 'landscape'), Object.keys(SIZES))]!;
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'motion');
	let frames: () => AsyncIterable<Frame> | Iterable<Frame>;
	let size: [number, number] = [W, H];
	let name: string = kind;
	let alpha = false;
	if (kind === 'reveal') {
		if (inputs.length !== 1) throw new Error(`Name one design file: ${cli()} motion reveal banner.design.json`);
		const path = resolve(cwd, inputs[0]!);
		const a = adapter();
		const doc = parseDoc(readFileSync(path, 'utf8'), a, inputs[0]);
		if (doc.kind !== 'image' && doc.kind !== 'slide') throw new Error(`A reveal takes an image or slide design; ${inputs[0]} is ${doc.kind}.`);
		const png = Buffer.from((await a.render(doc, dirname(path), { formats: ['png'], scale: 1 })).files.png!);
		const seconds = num('seconds', o.seconds, 2.5, 20) ?? 4;
		const ground = paletteOf({ palette: doc.theme ?? 'Paper' }).bg;
		size = [doc.size.width, doc.size.height];
		name = `${basename(path).replace(/\.design\.json$|\.json$/, '')}-reveal`;
		if (o.still) {
			write(join(dir, `${name}.png`), png);
			emit(o, { files: [display(cwd, join(dir, `${name}.png`))] }, () => display(cwd, join(dir, `${name}.png`)));
			return;
		}
		frames = () => revealFrames(png, { seconds, fps, ground });
	} else if (kind === 'intro' || kind === 'outro') {
		const seconds = num('seconds', o.seconds, 2, 10) ?? 3;
		const opts = { width: W, height: H, seconds, fps, palette: theme, headline: o.headline as string | undefined, url: o.url as string | undefined };
		frames = () => (kind === 'intro' ? introFrames(opts) : outroFrames(opts));
	} else if (kind === 'lower-third') {
		if (typeof o.name !== 'string' || !o.name.trim()) throw new Error('A lower third needs --name (and --role). Nothing is made up for it.');
		const seconds = num('seconds', o.seconds, 2, 20) ?? 5;
		frames = () => lowerThirdFrames({ width: W, height: H, seconds, fps, palette: theme, name: o.name as string, role: o.role as string | undefined });
		alpha = true;
	} else {
		if (!inputs.length) throw new Error(`Name the screenshots: ${cli()} motion walkthrough one.png two.png`);
		const captions = typeof o.captions === 'string' ? o.captions.split('|').map((x) => x.trim()) : [];
		if (captions.length && captions.length !== inputs.length) throw new Error(`--captions has ${captions.length} parts for ${inputs.length} screenshots.`);
		const shots = await Promise.all(inputs.map(async (f, i) => ({ picture: await readPicture(cwd, f, 1800), caption: captions[i] || undefined })));
		const each = num('seconds', o.seconds, 1.5, 20) ?? 3;
		frames = () => walkthroughFrames({ width: W, height: H, fps, palette: theme, shots, each });
	}
	const files: string[] = [];
	if (o.still) {
		// The finished frame: the last of a sting or lower third's hold, the first screenshot settled.
		let last: Frame | undefined;
		let i = 0;
		const stopAt = kind === 'lower-third' ? Math.round(fps * 2) : kind === 'walkthrough' ? Math.round(fps) : Infinity;
		for await (const f of frames()) {
			last = f;
			if (++i >= stopAt) break;
		}
		write(join(dir, `${name}.png`), last!.png());
		files.push(display(cwd, join(dir, `${name}.png`)));
	} else {
		const video = formats.filter((f): f is 'mp4' | 'webm' => f === 'mp4' || f === 'webm');
		if (video.length) {
			async function* raw() {
				for await (const f of frames()) yield f.rgba;
			}
			for (const e of await encode(raw(), { width: size[0], height: size[1], fps, input: 'rgba', outputs: video.map((f) => ({ path: join(dir, `${name}.${f}`), format: f, alpha: alpha && f === 'webm' })) })) files.push(display(cwd, e.path));
		}
		if (formats.includes('frames') || formats.includes('gif')) {
			const frameDir = formats.includes('frames') ? join(dir, `${name}-frames`) : mkdtempSync(join(tmpdir(), 'ds-motion-'));
			let i = 0;
			for await (const f of frames()) write(join(frameDir, `frame-${String(i++).padStart(5, '0')}.png`), f.png());
			if (formats.includes('frames')) files.push(display(cwd, frameDir));
			if (formats.includes('gif')) {
				const gif = join(dir, `${name}.gif`);
				const w = Math.min(size[0], 800);
				execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frameDir, 'frame-%05d.png'), '-vf', `fps=${Math.min(fps, 20)},scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=reserve_transparent=1[p];[b][p]paletteuse`, '-loop', '0', gif]);
				files.push(display(cwd, gif));
				if (!formats.includes('frames')) rmSync(frameDir, { recursive: true, force: true });
			}
		}
	}
	emit(o, { files }, () => files.join('\n'));
}

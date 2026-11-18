import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { encode, hasFfmpeg, loopFrames, loopTemplates, reelFrames, videoCatalog, videoDoc, writeFrame, type LoopTemplate, type ReelCopy } from '../assets/video.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `video`: the reel (10 s, 1920 by 1080) and short dot-field loops, as MP4 and WebM through ffmpeg or PNG frames.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const COPY_FLAGS: [string, keyof ReelCopy][] = [['headline', 'headline'], ['url', 'url'], ['tagline', 'tagline'], ['markdown', 'markdown'], ['quote', 'quote'], ['attribution', 'attribution'], ['statLabel', 'statLabel'], ['card', 'cardBlue']];

export function videoCommand(program: Command) {
	program
		.command('video [template]')
		.description('The reel (10 s, 1920 by 1080, with its copy as flags) and dot-field loops (edges, twinkle, ripple, logo) at square, vertical and landscape: MP4 and WebM through ffmpeg, else PNG frames')
		.option('-s, --size <size>', 'loops: square, vertical or landscape (the reel is 1920 by 1080)')
		.option('-p, --palette <name>', 'loops: Paper, Blue, Ink, Mist, Night or Graphite')
		.option('--headline <text>', 'reel: the end card line; logo loop: the line under the logo')
		.option('--url <text>', 'reel: the address on the end card')
		.option('--tagline <text>', 'reel: the tagline tile (*word* sets a word in the brand blue)')
		.option('--markdown <text>', 'reel: the Markdown tile\'s sentence')
		.option('--quote <text>', 'reel: the testimonial')
		.option('--attribution <text>', 'reel: who said it (a role and a company, never a made-up person)')
		.option('--stat <n>', 'reel: the stat tile\'s percentage (0 to 100)')
		.option('--stat-label <text>', 'reel: the line beside it')
		.option('--card <text>', 'reel: the blue card\'s sentence')
		.option('--seconds <n>', 'loops: length, 2 to 20 (default 6)')
		.option('--fps <n>', '12 to 60 (default 30)')
		.option('--seed <n>', 'loops: which dots twinkle or fray', '0')
		.option('-f, --format <format>', 'mp4, webm, frames or all (default: mp4 and webm with ffmpeg, frames without)')
		.option('--still <seconds>', 'one PNG frame at this time instead of a video (a poster frame, or for reduced motion)')
		.option('-o, --out <dir>', 'output directory (default video/); with --still, a .png file name')
		.option('--list', 'the reel, loop templates and sizes')
		.option('--json', 'JSON output')
		.action(async (template: string | undefined, _o, cmd: Command) => runVideo(template, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => [
			'',
			'Examples:',
			`  ${cli()} video reel --headline "Web data API for AI Agents"`,
			`  ${cli()} video twinkle --size vertical --palette Blue`,
			`  ${cli()} video logo --size square --headline "Web data API for AI Agents"`,
			`  ${cli()} video reel --still 9.5           (the end card as a PNG)`,
			'',
			'Frames are a pure function of time: the same flags give the same frames. The reel needs Chromium, as review does.',
		].join('\n'));
}

async function runVideo(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = videoCatalog();
		emit(o, cat, () => [
			`reel        ${cat.reel.seconds} s at ${cat.reel.width}x${cat.reel.height}. Copy flags: --headline, --url, --tagline, --markdown, --quote, --attribution, --stat, --stat-label, --card.`,
			...cat.loops.templates.map((t) => `${t.id.padEnd(11)} ${t.description} (${t.palette})`),
			'',
			`Loop sizes: ${cat.loops.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}; ${cat.loops.seconds} s at ${cat.loops.fps} fps by default.`,
			cat.encoder,
		].join('\n'));
		return;
	}
	const id = pick('video template', positional ?? 'reel', ['reel', ...loopTemplates()]);
	const ff = hasFfmpeg();
	const format = pick('format', String(o.format ?? (ff ? 'all' : 'frames')), ['mp4', 'webm', 'frames', 'all'] as const);
	if ((format === 'mp4' || format === 'webm') && !ff) throw new Error(`${format.toUpperCase()} needs ffmpeg on the PATH. Without it: --format frames.`);
	const fps = num('fps', o.fps, 12, 60, { integer: true }) ?? (id === 'reel' ? videoDoc().reel.fps : videoDoc().loops.fps);
	// With --still, an --out ending in .png names the frame itself; otherwise --out is a directory.
	const stillFile = o.still !== undefined && typeof o.out === 'string' && /\.png$/i.test(o.out) ? resolve(cwd, o.out) : undefined;
	const dir = stillFile ? resolve(stillFile, '..') : resolve(cwd, typeof o.out === 'string' ? o.out : 'video');
	const still = num('still', o.still, 0, 20);
	const files: OutFile[] = [];
	const outputs = (name: string) => (format === 'frames' ? [] : (format === 'all' ? (['mp4', 'webm'] as const) : [format]).map((f) => ({ path: join(dir, `${name}.${f}`), format: f as 'mp4' | 'webm' })));

	if (id === 'reel') {
		if (o.size || o.palette || o.seconds || o.seed !== '0') throw new Error('--size, --palette, --seconds and --seed go with the loops; the reel is 10 s at 1920 by 1080.');
		const copy: Partial<ReelCopy> = {};
		for (const [flag, key] of COPY_FLAGS) if (typeof o[flag] === 'string') (copy as Record<string, unknown>)[key] = o[flag];
		const stat = num('stat', o.stat, 0, 100, { integer: true });
		if (stat !== undefined) copy.statValue = stat;
		const { width, height, seconds } = videoDoc().reel;
		if (still !== undefined) {
			if (still > seconds) throw new Error(`--still takes 0 to ${seconds} for the reel.`);
			const path = stillFile ?? join(dir, `reel-${still}s.png`);
			await reelFrames(copy, fps, (png) => write(path, png), [still]);
			files.push({ path: display(cwd, path), format: 'png', width, height });
		} else if (format === 'frames') {
			const frameDir = join(dir, 'reel-frames');
			await reelFrames(copy, fps, (png, i) => void writeFrame(frameDir, i, png));
			files.push({ path: display(cwd, frameDir), format: 'frames', frames: Math.round(seconds * fps), fps, width, height });
		} else {
			const queue: Buffer[] = [];
			let finished = false;
			let wake: (() => void) | undefined;
			async function* pngs() {
				while (!finished || queue.length) {
					if (!queue.length) await new Promise<void>((r) => (wake = r));
					while (queue.length) yield queue.shift()!;
				}
			}
			const encoding = encode(pngs(), { width, height, fps, input: 'png', outputs: outputs('reel') });
			await reelFrames(copy, fps, (png) => {
				queue.push(png);
				wake?.();
			});
			finished = true;
			wake?.();
			for (const e of await encoding) files.push({ path: display(cwd, e.path), format: e.format, seconds, fps, width, height });
		}
	} else {
		for (const flag of ['url', 'tagline', 'markdown', 'quote', 'attribution', 'stat', 'statLabel', 'card']) if (o[flag] !== undefined) throw new Error(`--${flag.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} goes with the reel.`);
		if (o.headline !== undefined && id !== 'logo') throw new Error('--headline goes with the reel and the logo loop.');
		const sizes = videoDoc().loops.sizes;
		const sizeId = pick('size', String(o.size ?? 'square'), Object.keys(sizes));
		const [width, height] = sizes[sizeId]!;
		const seconds = num('seconds', o.seconds, 2, 20) ?? videoDoc().loops.seconds;
		const seed = num('seed', o.seed, 0, 1_000_000, { integer: true }) ?? 0;
		const opts = { template: id as LoopTemplate, width, height, palette: typeof o.palette === 'string' ? o.palette : undefined, seed, headline: typeof o.headline === 'string' ? o.headline : undefined, seconds, fps };
		const name = `${id}-${sizeId}${seed ? `-${seed}` : ''}`;
		if (still !== undefined) {
			if (still > seconds) throw new Error(`--still takes 0 to ${seconds} for this loop.`);
			const frames = loopFrames({ ...opts, seconds: still + 1 / fps });
			let last: Buffer | undefined;
			for (const f of frames) if (f.index === Math.round(still * fps)) last = f.png();
			const path = stillFile ?? join(dir, `${name}-${still}s.png`);
			write(path, last!);
			files.push({ path: display(cwd, path), format: 'png', width, height });
		} else if (format === 'frames') {
			const frameDir = join(dir, `${name}-frames`);
			let n = 0;
			for (const f of loopFrames(opts)) {
				writeFrame(frameDir, f.index, f.png());
				n++;
			}
			files.push({ path: display(cwd, frameDir), format: 'frames', frames: n, fps, width, height });
		} else {
			function* raw() {
				for (const f of loopFrames(opts)) yield f.rgba;
			}
			for (const e of await encode(raw(), { width, height, fps, input: 'rgba', outputs: outputs(name) })) files.push({ path: display(cwd, e.path), format: e.format, seconds, fps, width, height });
		}
	}
	emit(o, { files, encoder: ff ? 'ffmpeg' : 'frames' }, () => files.map((f) => `${f.path}  ${f.width}x${f.height}${f.frames ? `, ${f.frames} frames at ${f.fps} fps` : f.seconds ? `, ${f.seconds} s at ${f.fps} fps` : ''}`).join('\n'));
}

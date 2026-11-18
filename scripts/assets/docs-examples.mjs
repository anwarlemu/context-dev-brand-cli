// Writes the Assets page's examples into apps/www/public/assets-examples by running the CLI itself (built first), so
// the page shows exactly what the commands write. Pictures are shrunk to JPEG for the page; the full files are what the
// commands produce. Rerun after a brand or layout change: node scripts/assets/docs-examples.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const root = new URL('../..', import.meta.url).pathname;
const bin = join(root, 'bin.js');
const out = join(root, 'apps', 'www', 'public', 'assets-examples');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'ds-docs-assets-'));
const run = (...args) => execFileSync(process.execPath, [bin, ...args], { cwd: work, encoding: 'utf8' });

async function jpeg(src, name, width) {
	const img = await loadImage(readFileSync(join(work, src)));
	const h = Math.round((width * img.height) / img.width);
	const c = createCanvas(width, h);
	const ctx = c.getContext('2d');
	// Transparent print files (logo alone) sit on the brand's frame gray, as a proof would.
	ctx.fillStyle = JSON.parse(readFileSync(join(root, 'build', 'tokens.json'), 'utf8')).site['--ds-color-bg-frame'];
	ctx.fillRect(0, 0, width, h);
	ctx.drawImage(img, 0, 0, width, h);
	writeFileSync(join(out, name), await c.encode('jpeg', 86));
	return { src: `/assets-examples/${name}`, width, height: h };
}

const examples = { image: [], social: [], deck: [], merch: [], video: [] };
const commands = {};
for (const [t, extra] of [['banner', []], ['products', []], ['customer', []]]) {
	const cmd = ['image', t, '--size', 'og', '--format', 'png', '--out', `img/${t}.png`, ...extra];
	run(...cmd);
	examples.image.push({ id: t, command: `image ${t}`, ...(await jpeg(`img/${t}.png`, `image-${t}.jpg`, 800)) });
}
for (const [t, size] of [['social', '4:5'], ['cards', '16:9'], ['customer', '9:16'], ['banner', '1:1']]) {
	run('image', t, '--kind', 'social', '--size', size, '--format', 'png', '--out', `soc/${t}.png`, ...(t === 'banner' ? ['--palette', 'Ink', '--image', 'sample:Sphere', '--field', 'faint'] : []));
	examples.social.push({ id: `${t}-${size}`, command: `image ${t} --kind social --size ${size}${t === 'banner' ? ' --palette Ink --image sample:Sphere --field faint' : ''}`, ...(await jpeg(`soc/${t}.png`, `social-${t}.jpg`, 520)) });
}
for (const t of ['cover', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'closing']) {
	run('deck', t, '--format', 'png', '--out', 'deck');
	examples.deck.push({ id: t, command: `deck ${t}`, ...(await jpeg(`deck/slide-01-${t}.png`, `deck-${t}.jpg`, 640)) });
}
for (const [item, variant] of [['tee-front', 'color'], ['tee-back', 'blue'], ['poster', 'paper'], ['mug-wrap', 'blue'], ['sticker', 'ink'], ['socks', 'blue'], ['tote', 'black'], ['cap-front', 'brand'], ['hoodie-front', 'color']]) {
	run('merch', item, '--variant', variant, '--dpi', '72', '--format', 'png', '--guides', '--out', 'merch');
	examples.merch.push({ id: `${item}-${variant}`, command: `merch ${item} --variant ${variant}`, ...(await jpeg(`merch/${item}-${variant}.png`, `merch-${item}.jpg`, 420)) });
}
// Video: the reel's end card and a still of each loop; the twinkle loop as a short MP4 when ffmpeg is here.
run('video', 'reel', '--still', '9.6', '--out', 'video');
examples.video.push({ id: 'reel', command: 'video reel', ...(await jpeg('video/reel-9.6s.png', 'video-reel.jpg', 800)) });
for (const t of ['edges', 'twinkle', 'ripple', 'logo']) {
	run('video', t, '--size', 'square', '--still', '1', '--out', 'video');
	examples.video.push({ id: t, command: `video ${t} --size square`, ...(await jpeg(`video/${t}-square-1s.png`, `video-${t}.jpg`, 360)) });
}
if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0) {
	run('video', 'twinkle', '--size', 'landscape', '--seconds', '4', '--fps', '24', '--format', 'mp4', '--out', 'video');
	execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(work, 'video', 'twinkle-landscape.mp4'), '-vf', 'scale=960:-2', '-c:v', 'libx264', '-crf', '26', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', join(out, 'loop-twinkle.mp4')]);
	commands.loopVideo = '/assets-examples/loop-twinkle.mp4';
}
writeFileSync(join(out, 'examples.json'), `${JSON.stringify({ ...examples, ...commands }, null, '\t')}\n`);
rmSync(work, { recursive: true, force: true });
console.log(`assets examples: ${Object.values(examples).flat().length} pictures in apps/www/public/assets-examples`);

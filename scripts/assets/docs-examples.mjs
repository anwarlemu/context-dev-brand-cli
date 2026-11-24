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
// Every example passes its own words (the CLI draws nothing it is not given); --sample uses the templates' sample copy.
for (const [t, size, extra] of [['banner', 'og', ['--headline', 'The web data APIs for agents']], ['products', 'og', ['--sample']], ['customer', 'og', ['--sample']], ['banner', 'x-banner', ['--headline', 'The web data APIs for agents', '--body', 'Search, scrape and crawl the live web']], ['social', 'linkedin-banner', ['--headline', 'Browser profiles are here', '--theme', 'Ink']], ['mark', 'avatar', []]]) {
	const name = `${t}-${size}`;
	run('image', t, '--size', size, '--format', 'png', '--out', `img/${name}.png`, ...extra);
	examples.image.push({ id: name, command: `image ${t} --size ${size} ${extra.map((x) => (/\s/.test(x) ? JSON.stringify(x) : x)).join(' ')}`.trim(), ...(await jpeg(`img/${name}.png`, `image-${name}.jpg`, 800)) });
}
for (const [t, size, extra] of [['social', 'portrait', ['--headline', 'NEW!', '--body', 'Browser profiles: log in once, reuse the session.']], ['cards', 'landscape', ['--sample']], ['customer', 'story', ['--sample']], ['banner', 'square', ['--headline', 'Search the live web', '--theme', 'Ink', '--image', 'sample:Sphere', '--field', 'faint']]]) {
	run('image', t, '--size', size, '--format', 'png', '--out', `soc/${t}.png`, ...extra);
	examples.social.push({ id: `${t}-${size}`, command: `image ${t} --size ${size} ${extra.map((x) => (/\s/.test(x) ? JSON.stringify(x) : x)).join(' ')}`, ...(await jpeg(`soc/${t}.png`, `social-${t}.jpg`, 520)) });
}
for (const t of ['cover', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'closing']) {
	run('deck', t, '--sample', '--format', 'png', '--out', 'deck');
	examples.deck.push({ id: t, command: `deck ${t} --sample`, ...(await jpeg(`deck/slide-01-${t}.png`, `deck-${t}.jpg`, 640)) });
}
for (const [item, variant] of [['tee-front', 'color'], ['tee-back', 'blue'], ['poster', 'paper'], ['mug-wrap', 'blue'], ['sticker', 'ink'], ['socks', 'blue'], ['tote', 'black'], ['cap-front', 'brand'], ['hoodie-front', 'color']]) {
	run('merch', item, '--variant', variant, '--dpi', '72', '--format', 'png', '--guides', '--sample', '--out', 'merch');
	examples.merch.push({ id: `${item}-${variant}`, command: `merch ${item} --variant ${variant}`, ...(await jpeg(`merch/${item}-${variant}.png`, `merch-${item}.jpg`, 420)) });
}
// Video: the reel's end card and a still of each loop; the twinkle loop as a short MP4 when ffmpeg is here.
run('video', 'reel', '--sample', '--still', '9.6', '--out', 'video');
examples.video.push({ id: 'reel', command: 'video reel --sample', ...(await jpeg('video/reel-9.6s.png', 'video-reel.jpg', 800)) });
for (const t of ['edges', 'twinkle', 'ripple', 'logo']) {
	run('video', t, '--size', 'square', '--still', '1', '--out', 'video', ...(t === 'logo' ? ['--headline', 'Web data API for AI Agents'] : []));
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

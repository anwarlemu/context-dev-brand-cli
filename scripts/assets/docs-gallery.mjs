// Writes the Gallery page's pictures into apps/www/public/gallery by running the CLI itself (built first): one of every
// kind the CLI makes, each with the command that made it. Rerun after a layout change: node scripts/assets/docs-gallery.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const root = new URL('../..', import.meta.url).pathname;
const bin = join(root, 'bin.js');
const out = join(root, 'apps', 'www', 'public', 'gallery');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'ds-docs-gallery-'));
const run = (...args) => execFileSync(process.execPath, [bin, ...args], { cwd: work, encoding: 'utf8' });
const quote = (a) => a.map((x) => (/[\s"|]/.test(x) ? JSON.stringify(x) : x)).join(' ');
let n = 0;
async function jpeg(src, width) {
	const img = await loadImage(readFileSync(join(work, src)));
	const w = Math.min(width, img.width);
	const h = Math.round((w * img.height) / img.width);
	const c = createCanvas(w, h);
	const ctx = c.getContext('2d');
	ctx.fillStyle = '#F2F2F2';
	ctx.fillRect(0, 0, w, h);
	ctx.drawImage(img, 0, 0, w, h);
	const name = `g-${String(++n).padStart(3, '0')}.jpg`;
	writeFileSync(join(out, name), await c.encode('jpeg', 84));
	return { src: `/gallery/${name}`, width: w, height: h };
}
// A screenshot for the templates that frame one: a slide the CLI draws.
run('deck', 'chart', '--sample', '--format', 'png', '--out', 'shot');
const shot = join(work, 'shot', 'slide-01-chart.png');
const groups = [];
async function group(title, description, jobs) {
	const items = [];
	for (const [label, args, file, width = 640] of jobs) {
		run(...args);
		items.push({ label, command: quote(args), ...(await jpeg(file, width)) });
	}
	groups.push({ title, description, items });
}
await group('Social and share images', 'The share-image templates at the platforms\' sizes, clear of what each covers.', [
	['X header', ['image', 'banner', '--size', 'x-banner', '--headline', 'The web data APIs for agents', '-f', 'png', '-o', 'a.png'], 'a.png'],
	['LinkedIn cover', ['image', 'social', '--size', 'linkedin-banner', '--headline', 'Browser profiles are here', '--theme', 'Ink', '-f', 'png', '-o', 'b.png'], 'b.png'],
	['YouTube channel art', ['image', 'customer', '--size', 'youtube', '--sample', '-f', 'png', '-o', 'c.png'], 'c.png'],
	['Story', ['image', 'social', '--size', 'story', '--headline', 'NEW!', '--body', 'Log in once, reuse the session.', '-f', 'png', '-o', 'd.png'], 'd.png', 320],
	['Pinterest pin', ['image', 'banner', '--size', 'pinterest', '--headline', 'Turn any page into Markdown', '-f', 'png', '-o', 'e.png'], 'e.png', 320],
	['Profile picture', ['image', 'mark', '--theme', 'Blue', '-f', 'png', '-o', 'f.png'], 'f.png', 320],
]);
const recipes = [['quote-card', 'square'], ['stat-card', 'og'], ['launch-card', 'square'], ['feature-card', 'og'], ['comparison-card', 'square'], ['pricing-card', 'portrait'], ['event-card', 'og'], ['hiring-card', 'square'], ['before-after', 'og'], ['screenshot', 'og'], ['ad', 'ad-300x250'], ['ad', 'ad-728x90'], ['background', 'meeting'], ['email-header', 'email']];
await group('Cards, ads and backgrounds', 'Made of the brand\'s blocks; each takes its words with --set.', recipes.map(([id, size], i) => [`${id} ${size}`, ['image', id, '--sample', '--size', size, ...(id === 'screenshot' ? ['--image', `screenshot=${shot}`] : id === 'before-after' ? [] : []), '-f', 'png', '-o', `r${i}.png`], `r${i}.png`, size.startsWith('ad-728') ? 728 : 480]).filter(([, args]) => args[1] !== 'before-after'));
await group('Documents and print', 'Pages and print files at their real sizes; PDF with --format pdf.', [
	['One-pager, A4', ['image', 'one-pager', '--sample', '--size', 'a4', '-f', 'png', '-o', 'p1.png'], 'p1.png', 360],
	['Report cover', ['image', 'report-cover', '--sample', '--size', 'letter', '-f', 'png', '-o', 'p2.png'], 'p2.png', 360],
	['Letterhead', ['image', 'letterhead', '--sample', '--size', 'a4', '-f', 'png', '-o', 'p3.png'], 'p3.png', 360],
	['Certificate', ['image', 'certificate', '--sample', '--size', 'landscape', '-f', 'png', '-o', 'p4.png'], 'p4.png', 480],
	['Business card', ['image', 'business-card', '--sample', '-f', 'png', '-o', 'p5.png'], 'p5.png', 420],
	['Name tag', ['image', 'name-tag', '--sample', '--size', 'event-badge', '-f', 'png', '-o', 'p6.png'], 'p6.png', 360],
	['Email signature', ['image', 'email-signature', '--sample', '-f', 'png', '-o', 'p7.png'], 'p7.png', 480],
]);
await group('Slides', 'The newer slide types; deck --input deck.json makes a whole deck and one PDF.', ['agenda', 'team', 'timeline', 'chart', 'comparison', 'image-grid', 'qa'].map((t) => [t, ['deck', t, '--sample', '--format', 'png', '--out', `deck-${t}`], `deck-${t}/slide-01-${t}.png`, 480]));
await group('Merch', 'Print files with bleed; confirm sizes with the vendor\'s template.', [['poster-24x36', 'blue'], ['sticker-sheet', 'paper'], ['notebook-cover', 'blue'], ['lanyard', 'blue']].map(([item, v]) => [`${item}`, ['merch', item, '--variant', v, '--dpi', '72', '--sample', '-f', 'png', '--out', 'merch'], `merch/${item}-${v}.png`, item === 'lanyard' ? 900 : 360]));
await group('Motion stills', 'Each is a video (motion <kind>, MP4, WebM or GIF); these are their finished frames, which --still writes.', [
	['Intro sting', ['motion', 'intro', '--headline', 'Web data for your agents', '--still', '--out', 'm1'], 'm1/intro.png', 480],
	['Lower third', ['motion', 'lower-third', '--name', 'Alex Doe', '--role', 'Engineer, Acme', '--theme', 'Blue', '--still', '--out', 'm2'], 'm2/lower-third.png', 480],
	['Walkthrough', ['motion', 'walkthrough', shot, '--captions', 'Calls by kind', '--still', '--out', 'm3'], 'm3/walkthrough.png', 480],
]);
let video;
if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0) {
	run('design', 'new', 'stat-card', '--sample', '--size', 'square', '-o', 'sc.design.json', '--force');
	run('motion', 'reveal', 'sc.design.json', '--format', 'mp4', '--fps', '24', '--out', 'mv');
	execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(work, 'mv', 'sc-reveal.mp4'), '-vf', 'scale=540:-2', '-c:v', 'libx264', '-crf', '26', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', join(out, 'reveal.mp4')]);
	run('motion', 'reveal', 'sc.design.json', '--still', '--out', 'mv');
	video = { src: '/gallery/reveal.mp4', still: (await jpeg('mv/sc-reveal.png', 540)).src, command: 'motion reveal stat-card.design.json' };
}
writeFileSync(join(out, 'gallery.json'), `${JSON.stringify({ groups, video }, null, '\t')}\n`);
rmSync(work, { recursive: true, force: true });
console.log(`gallery: ${groups.reduce((a, g) => a + g.items.length, 0)} pictures in apps/www/public/gallery`);

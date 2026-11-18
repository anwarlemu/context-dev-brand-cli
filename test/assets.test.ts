import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compactSvg, surface, toPng, tokenColor } from '../src/assets/canvas.js';
import { deckCatalog, renderSlide, slideTypes } from '../src/assets/deck.js';
import { designOf, imageCatalog, imageSizes, renderDesign } from '../src/assets/image.js';
import { merchItems, renderItem } from '../src/assets/merch.js';
import { imageDoc, palettes, TEMPLATES } from '../src/assets/og.js';
import { samplePicture } from '../src/assets/samples.js';
import { drawLoopFrame, loopTemplates, reelHtml } from '../src/assets/video.js';
import { tokens } from '../src/lib/brand.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const cli = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8', env: { ...process.env, CLAUDECODE: '' } });

describe('asset brand data', () => {
	it('palettes, cards and video colors are token names that resolve', () => {
		const names = (o: Record<string, unknown>) => Object.entries(o).filter(([k, v]) => typeof v === 'string' && k !== 'name');
		for (const p of imageDoc().palettes) for (const [, v] of names(p)) expect(tokens().site[`--ds-color-${v}`], `${p.name}: ${v}`).toBeTruthy();
		for (const k of ['fill', 'edge', 'heading', 'body', 'badge', 'badgeInk'] as const) expect(tokens().site[`--ds-color-${imageDoc().cards[k]}`], k).toBeTruthy();
		expect(palettes().every((p) => /^#[0-9A-F]{6}$/.test(p.bg))).toBe(true);
	});
	it('every template draws at every size with its opening copy', () => {
		for (const t of TEMPLATES) for (const s of imageSizes()) {
			const r = renderDesign(designOf({ template: t, size: s.id }), t === 'customer' ? null : samplePicture('Globe')!, { png: true });
			expect(r.width, `${t} ${s.id}`).toBe(s.width);
			expect(r.png!.subarray(1, 4).toString()).toBe('PNG');
		}
	});
	it('unknown names fail with the closest names', () => {
		expect(() => designOf({ template: 'bannr' })).toThrow(/Did you mean `banner`/);
		expect(() => designOf({ template: 'banner', size: '4:6' })).toThrow(/Unknown size/);
		expect(() => designOf({ template: 'banner', set: { palette: 'Inc' } })).toThrow(/Did you mean `Ink`/);
		expect(() => renderSlide({ type: 'covr' })).toThrow(/Did you mean `cover`/);
		expect(() => renderItem(merchItems()[0]!, { variant: 'green' })).toThrow(/Unknown variant/);
		expect(() => renderSlide({ type: 'bullets', headline: 'x' })).toThrow(/does not take "headline"/);
	});
	it('ratios and custom sizes resolve', () => {
		expect(designOf({ template: 'social', size: '4:5' }).size).toBe('s-4x5');
		expect(() => designOf({ template: 'banner', size: 'custom' })).toThrow(/--width and --height/);
		expect(designOf({ template: 'banner', size: 'custom', width: 1600, height: 900 }).w).toBe(1600);
	});
});

describe('asset determinism', () => {
	it('the same inputs give the same bytes; another picture or seed gives others', () => {
		const a = renderDesign(designOf({ template: 'banner' }), samplePicture('Globe')!, { png: true, svg: true });
		const b = renderDesign(designOf({ template: 'banner' }), samplePicture('Globe')!, { png: true, svg: true });
		const c = renderDesign(designOf({ template: 'banner' }), samplePicture('Sphere')!, { png: true });
		expect(sha(a.png!)).toBe(sha(b.png!));
		expect(sha(a.svg!)).toBe(sha(b.svg!));
		expect(sha(a.png!)).not.toBe(sha(c.png!));
		const loop = (seed: number, p: number) => {
			const s = surface(540, 540);
			drawLoopFrame(s.ctx, { template: 'twinkle', width: 540, height: 540, seconds: 6, seed }, p);
			return sha(toPng(s));
		};
		expect(loop(1, 0.25)).toBe(loop(1, 0.25));
		expect(loop(1, 0.25)).not.toBe(loop(2, 0.25));
		// Seamless: the frame after the last is the first.
		expect(loop(3, 0)).toBe(loop(3, 1));
	});
	it('two separate runs of the command write identical files', () => {
		const run = () => {
			const dir = mkdtempSync(join(tmpdir(), 'ds-assets-'));
			execFileSync(process.execPath, [BIN, 'image', 'customer', '--kind', 'social', '--size', '4:5', '--stat', '42%', '--format', 'both'], { cwd: dir });
			execFileSync(process.execPath, [BIN, 'deck', 'quote', '--format', 'both'], { cwd: dir });
			execFileSync(process.execPath, [BIN, 'merch', 'sticker', '--variant', 'ink', '--dpi', '100'], { cwd: dir });
			const files = ['assets/customer-s-4x5.png', 'assets/customer-s-4x5.svg', 'deck/slide-01-quote.png', 'deck/deck.pdf', 'merch/sticker-ink.png', 'merch/sticker-ink.svg'];
			return files.map((f) => sha(readFileSync(join(dir, f))));
		};
		expect(run()).toEqual(run());
	});
});

describe('asset outputs', () => {
	it('SVG keeps circles as arcs and stays small', () => {
		const d = 'M15 10Q15 12.07 13.54 13.54Q12.07 15 10 15Q7.93 15 6.46 13.54Q5 12.07 5 10Q5 7.93 6.46 6.46Q7.93 5 10 5Q12.07 5 13.54 6.46Q15 7.93 15 10';
		const out = compactSvg(`<path d="${d}"/>`);
		expect(out).toContain('A5 5 0 1');
		const svg = renderDesign(designOf({ template: 'banner', set: { field: 'faint' } }), samplePicture('Globe')!, { png: false, svg: true }).svg!;
		expect(svg.length).toBeLessThan(1_500_000);
		expect(svg).toMatch(/^<\?xml/);
	});
	it('merch files are physical size with bleed, and the sticker carries its die line only in the SVG', () => {
		const sticker = merchItems().find((i) => i.id === 'sticker')!;
		const r = renderItem(sticker, { variant: 'blue', svg: true, dpi: 300 });
		expect(r.svg).toContain('width="3.25in" height="2in"');
		expect(r.svg).toContain('id="CutContour"');
		expect([r.width, r.height]).toEqual([975, 600]);
		expect(r.png!.includes(Buffer.from('pHYs'))).toBe(true);
		expect(merchItems().map((i) => i.id)).toEqual(['cap-front', 'tee-front', 'tee-back', 'hoodie-front', 'tote', 'mug-wrap', 'sticker', 'poster', 'socks']);
	});
	it('every slide type draws at 1920 by 1080', () => {
		expect(slideTypes()).toEqual(['cover', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'closing']);
		for (const t of slideTypes()) expect(renderSlide({ type: t }).width).toBe(1920);
		expect(deckCatalog().slides).toHaveLength(8);
	});
	it('the reel page carries tokens and copy, and loops name their templates', () => {
		const html = reelHtml({ headline: 'Hello <there>' });
		expect(html).toContain(tokenColor('brand'));
		expect(html).toContain('Hello \\u003cthere>');
		expect(loopTemplates()).toEqual(['edges', 'twinkle', 'ripple', 'logo']);
	});
});

describe('asset commands', () => {
	const dir = mkdtempSync(join(tmpdir(), 'ds-assets-cli-'));
	it('unknown commands, templates, flags and items exit 1 with a suggestion', () => {
		for (const [args, re] of [
			[['imgae'], /Did you mean `image`/],
			[['image', 'bannr'], /Did you mean `banner`/],
			[['image', 'banner', '--palete', 'Ink'], /Did you mean --palette/],
			[['deck', 'statment'], /Did you mean `statement`/],
			[['video', 'twinkel'], /Did you mean `twinkle`/],
			[['merch', 'tshirt'], /Unknown item/],
			[['merch', 'mug-wrap', '--variant', 'gold'], /Unknown variant/],
		] as [string[], RegExp][]) {
			const r = cli(dir, ...args);
			expect(r.status, args.join(' ')).toBe(1);
			expect(r.stderr, args.join(' ')).toMatch(re);
		}
	});
	it('manifest lists every command with its flags and every asset', () => {
		const doc = JSON.parse(cli(dir, 'manifest', '--json').stdout);
		const names = doc.commands.map((c: { name: string }) => c.name);
		for (const n of ['image', 'deck', 'video', 'merch', 'manifest', 'add', 'review']) expect(names).toContain(n);
		expect(doc.commands.find((c: { name: string }) => c.name === 'image').flags).toContain('image-x');
		expect(doc.assets.image.templates.map((t: { id: string }) => t.id)).toEqual(TEMPLATES);
		expect(doc.assets.image.sizes.length).toBe(imageCatalog().sizes.length);
		expect(JSON.parse(cli(dir, 'describe', '--json').stdout).alias).toBe('describe');
	});
	it('loops write PNG frames without ffmpeg', () => {
		const r = spawnSync(process.execPath, [BIN, 'video', 'edges', '--size', 'square', '--seconds', '2', '--fps', '12', '--json'], { cwd: dir, encoding: 'utf8', env: { ...process.env, DS_NO_FFMPEG: '1' } });
		expect(r.status, r.stderr).toBe(0);
		expect(readdirSync(join(dir, 'video', 'edges-square-frames'))).toHaveLength(24);
	});
});

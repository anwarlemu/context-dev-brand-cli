import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { cutShort, pictureKind } from '../assets/picture.js';
import { decodePng, isPng, type Pixels } from './png.js';

const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.bmp': 'image/bmp', '.png': 'image/png' };

/** Reads any picture into straight RGBA: PNG in-process, anything else through Chromium (or macOS sips for photos). */
export async function readPicture(path: string): Promise<Pixels> {
	let bytes: Buffer;
	try {
		bytes = readFileSync(path);
	} catch {
		throw new Error(`No picture at ${path}.`);
	}
	const kind = pictureKind(bytes);
	if (!kind) throw new Error(`${path} is not a PNG, JPEG, WebP, GIF or SVG picture.`);
	if (cutShort(bytes, kind)) throw new Error(`${path} is cut short: the end of the file is missing.`);
	if (isPng(bytes)) {
		try {
			return decodePng(bytes);
		} catch {}
	}
	const mime = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
	try {
		return await viaBrowser(bytes, mime);
	} catch (error) {
		if (process.platform === 'darwin' && mime !== 'image/svg+xml') {
			const dir = mkdtempSync(join(tmpdir(), 'ds-pic-'));
			try {
				execFileSync('sips', ['-s', 'format', 'png', path, '--out', join(dir, 'p.png')], { stdio: 'ignore' });
				return decodePng(readFileSync(join(dir, 'p.png')));
			} finally {
				rmSync(dir, { recursive: true, force: true });
			}
		}
		throw new Error(`Could not read ${path}: pass a PNG, or install a browser for other formats (${(error as Error).message})`);
	}
}

async function viaBrowser(bytes: Buffer, mime: string): Promise<Pixels> {
	const { launch } = await import('../review/capture.js');
	const browser = await launch();
	try {
		const page = await browser.newPage();
		const src = `data:${mime};base64,${bytes.toString('base64')}`;
		const out = await page.evaluate(async (s: string) => {
			const img = new Image();
			img.src = s;
			await img.decode();
			const w = img.naturalWidth || 1000;
			const h = img.naturalHeight || 1000;
			const c = document.createElement('canvas');
			c.width = w;
			c.height = h;
			const x = c.getContext('2d')!;
			x.drawImage(img, 0, 0, w, h);
			return { w, h, d: Array.from(x.getImageData(0, 0, w, h).data) };
		}, src);
		return { width: out.w, height: out.h, data: Uint8ClampedArray.from(out.d) };
	} finally {
		await browser.close();
	}
}

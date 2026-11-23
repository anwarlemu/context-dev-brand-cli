import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { loadImage, type Canvas } from '@napi-rs/canvas';
import { scratch, type Ctx } from './canvas.js';

// Pictures the asset commands take (--image, --partner): read from disk, decoded by Skia, shrunk to 1000 px on the
// long side the way the editor shrinks a dropped picture (the shader samples at 900), and keyed by their bytes so the
// shader's caches hold across calls.

export type Picture = { canvas: Canvas; width: number; height: number; key: string };

const KINDS: [string, (b: Buffer) => boolean][] = [
	['png', (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47],
	['jpeg', (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8],
	['webp', (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'],
	['gif', (b) => b.length > 6 && b.toString('ascii', 0, 3) === 'GIF'],
	['svg', (b) => /<svg[\s>]/i.test(b.toString('utf8', 0, Math.min(b.length, 4096)))],
];

export function pictureKind(data: Buffer): string | undefined {
	return KINDS.find(([, test]) => test(data))?.[0];
}

/** A file whose end is missing decodes to blank pixels, so it is refused instead. */
function cutShort(b: Buffer, kind: string): boolean {
	if (kind === 'png') return b.indexOf('IEND', Math.max(0, b.length - 4096), 'latin1') < 0;
	if (kind === 'jpeg') return b.lastIndexOf(Buffer.from([0xff, 0xd9])) < 0;
	if (kind === 'webp') return b.readUInt32LE(4) + 8 > b.length + 1;
	return false;
}

/** Decodes picture bytes. `max` is the long side kept (the editor's 1000 by default). */
export async function pictureFrom(data: Buffer, max = 1000): Promise<Picture> {
	const kind = pictureKind(data);
	if (!kind) throw new Error('Use a PNG, JPEG, WebP, GIF or SVG picture.');
	if (cutShort(data, kind)) throw new Error('That picture is cut short: the end of the file is missing.');
	let img;
	try {
		img = await loadImage(data);
	} catch {
		throw new Error(`That ${kind.toUpperCase()} picture could not be read.`);
	}
	const iw = img.width || max;
	const ih = img.height || (img.width ? max : iw);
	const k = Math.min(1, max / Math.max(iw, ih));
	const w = Math.max(1, Math.round(iw * k));
	const h = Math.max(1, Math.round(ih * k));
	const { canvas, ctx } = scratch(w, h);
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, w, h);
	const px = ctx.getImageData(0, 0, w, h).data;
	let seen = false;
	for (let i = 3; i < px.length && !seen; i += 4) seen = px[i]! > 8;
	if (!seen) throw new Error('That picture has nothing in it: every pixel is transparent.');
	return { canvas, width: w, height: h, key: createHash('sha1').update(data).update(String(max)).digest('hex') };
}

/** Reads a picture from a path relative to `cwd`. */
export async function readPicture(cwd: string, path: string, max = 1000): Promise<Picture> {
	const abs = isAbsolute(path) ? path : resolve(cwd, path);
	let data: Buffer;
	try {
		data = readFileSync(abs);
	} catch {
		throw new Error(`No picture at ${path}.`);
	}
	if (!pictureKind(data)) throw new Error(`${path} is not a PNG, JPEG, WebP, GIF or SVG picture.`);
	try {
		return await pictureFrom(data, max);
	} catch (err) {
		throw new Error(`${path}: ${(err as Error).message}`);
	}
}

/** A picture drawn by code (a built-in sample) at its own size. */
export function pictureOf(width: number, height: number, draw: (ctx: Ctx) => void, key: string): Picture {
	const { canvas, ctx } = scratch(width, height);
	draw(ctx);
	return { canvas, width, height, key: `drawn:${key}` };
}

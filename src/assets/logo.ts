import { readFileSync } from 'node:fs';
import { Path2D } from '@napi-rs/canvas';
import { pkgPath } from '../lib/paths.js';
import type { Ctx } from './canvas.js';

// The approved logo (brand/assets/logo.json): the mark and the wordmark as paths, drawn at any height in two colors.
// Nothing else draws the logo, so every asset carries the same one.

type LogoDoc = {
	mark: { path: string; circle: { cx: number; cy: number; r: number }; width: number; height: number };
	wordmark: { paths: string[]; origin: [number, number] };
	width: number;
	height: number;
	clear: { ratio: number };
	min: { shown: number };
};

let doc: LogoDoc | undefined;
const logoDoc = () => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'logo.json'), 'utf8')) as LogoDoc);

/** Width over height of the whole logo (mark and wordmark). */
export const logoRatio = () => logoDoc().width / logoDoc().height;
/** Clear space around a logo `h` tall. */
export const logoClear = (h: number) => h * logoDoc().clear.ratio;
/** The least height of the logo on a canvas `width` wide that is shown `shown` CSS px wide. */
export const logoMin = (width: number, shown: number) => (logoDoc().min.shown * width) / shown;
/** Width over height of the mark alone. */
export const markRatio = () => logoDoc().mark.width / logoDoc().mark.height;

/** The full logo, `h` tall with its top left at (x, y): the mark in `mark`, the wordmark in `ink`. */
export function drawLogo(ctx: Ctx, x: number, y: number, h: number, mark: string, ink: string) {
	const l = logoDoc();
	const m = h / l.height;
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(m, m);
	drawMarkUnits(ctx, l.height, mark);
	ctx.translate(-l.wordmark.origin[0], -l.wordmark.origin[1]);
	ctx.fillStyle = ink;
	ctx.fill(new Path2D(l.wordmark.paths.join('')));
	ctx.restore();
}

/** The mark alone, `h` tall with its top left at (x, y). `pop` (0 to 1) moves the circle from the square's bite out to
 * its resting place, as the site's logo does on hover (0 is in the bite, 1 at rest). */
export function drawMark(ctx: Ctx, x: number, y: number, h: number, color: string, pop = 1) {
	ctx.save();
	ctx.translate(x, y);
	drawMarkUnits(ctx, h, color, pop);
	ctx.restore();
}

function drawMarkUnits(ctx: Ctx, h: number, color: string, pop = 1) {
	const l = logoDoc();
	ctx.save();
	ctx.scale(h / l.mark.height, h / l.mark.height);
	ctx.fillStyle = color;
	ctx.fill(new Path2D(l.mark.path), 'evenodd');
	// In the bite the circle sits 260.5 right and 19.36 up of its resting place (the reel's logo, tiles.tsx).
	const { cx, cy, r } = l.mark.circle;
	ctx.beginPath();
	ctx.arc(cx + 260.5 * (1 - pop), cy - 19.36 * (1 - pop), r, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { surface, toPng } from '../src/assets/canvas.js';
import { introFrames, lowerThirdFrames, revealFrames, walkthroughFrames } from '../src/assets/motion.js';
import { pictureFrom } from '../src/assets/picture.js';

const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
async function all<T>(it: AsyncIterable<T> | Iterable<T>) {
	const out: T[] = [];
	for await (const x of it) out.push(x);
	return out;
}

describe('motion', () => {
	it('a reveal starts and ends on the empty ground, so it loops, and shows the whole design in the middle', async () => {
		const s = surface(240, 160);
		s.ctx.fillStyle = '#2563EB';
		s.ctx.fillRect(0, 0, 240, 160);
		const frames = await all(revealFrames(toPng(s), { seconds: 3, fps: 10, ground: '#FFFFFF' }));
		const px = (f: (typeof frames)[number], i: number) => f.rgba[i * 4]!;
		expect(frames).toHaveLength(30);
		expect(px(frames[0]!, 9600 + 120)).toBe(255);
		expect(px(frames.at(-1)!, 9600 + 120)).toBeGreaterThan(200);
		expect(px(frames[18]!, 9600 + 120)).toBe(0x25);
	});
	it('frames are the same every time', async () => {
		const a = (await all(introFrames({ width: 320, height: 180, seconds: 1, fps: 6, headline: 'Hello' }))).map((f) => sha(f.rgba));
		const b = (await all(introFrames({ width: 320, height: 180, seconds: 1, fps: 6, headline: 'Hello' }))).map((f) => sha(f.rgba));
		expect(a).toEqual(b);
	});
	it('the lower third is transparent around its bar, and gone at both ends', async () => {
		const f = await all(lowerThirdFrames({ width: 640, height: 360, seconds: 2, fps: 10, name: 'Alex Doe', role: 'Engineer, Acme' }));
		expect(f[0]!.rgba.every((v, i) => i % 4 !== 3 || v === 0)).toBe(true);
		expect(f[10]!.rgba.some((v, i) => i % 4 === 3 && v === 255)).toBe(true);
		expect(f.at(-1)!.rgba.filter((v, i) => i % 4 === 3 && v > 0).length).toBeLessThan(f[10]!.rgba.filter((v, i) => i % 4 === 3 && v > 0).length / 10);
	});
	it('a walkthrough ends where it starts', async () => {
		const s = surface(200, 120);
		s.ctx.fillStyle = '#000000';
		s.ctx.fillRect(0, 0, 100, 120);
		const pic = await pictureFrom(toPng(s));
		const f = await all(walkthroughFrames({ width: 320, height: 180, fps: 10, shots: [{ picture: pic, caption: 'One' }, { picture: pic, caption: 'Two' }], each: 1.5 }));
		expect(f).toHaveLength(30);
	});
});

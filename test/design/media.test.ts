import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkItem, findItem, merchItems, renderItem } from '../../src/assets/merch.js';
import { adapter } from '../../src/design/adapter.js';
import { checkDesign, create, errorsOf, type Edit } from '../../src/design/index.js';

const a = adapter();
const dir = mkdtempSync(join(tmpdir(), 'design-media-'));

describe('merch, illustrations and video as designs', () => {
	for (const t of a.templates().filter((x) => (x.kind === 'merch' || x.kind === 'illustration' || x.kind === 'video') && x.id !== 'reel' && !x.images.some((i) => i.required))) {
		it(`${t.id} draws in every theme, the same bytes twice`, { timeout: 60_000 }, async () => {
			for (const theme of t.themes) {
				const edits: Edit[] = [{ op: 'theme', value: theme }, ...t.copy.filter((c) => c.id !== 'url').map((c) => ({ op: 'copy', slot: c.id, value: 'Ship your next idea' }) as Edit), ...(t.kind === 'merch' ? [{ op: 'option', id: 'dpi', value: 72 } as Edit] : [])];
				const doc = create(a, t.id, undefined, edits).doc;
				const r = await a.render(doc, dir, { formats: ['png', 'svg'].filter((f) => (t.formats ?? ['png', 'svg']).includes(f as 'png')) as 'png'[], scale: t.kind === 'illustration' ? 0.5 : 1 });
				expect(errorsOf(checkDesign({ doc, info: t, layers: r.layers, adapter: a, png: r.files.png })).map((f) => f.message)).toEqual([]);
				expect(r.files.png!.byteLength).toBeGreaterThan(500);
				if (theme === t.themes[0]) expect(Buffer.compare(Buffer.from((await a.render(doc, dir, { formats: ['png'], scale: t.kind === 'illustration' ? 0.5 : 1 })).files.png!), Buffer.from(r.files.png!))).toBe(0);
			}
		});
	}
	it('merch keeps words and logos in the safe area and prints nothing that was not passed', { timeout: 60_000 }, () => {
		for (const item of merchItems()) for (const variant of item.variants) for (const slots of [{}, ...(item.id === 'tee-back' || item.id === 'poster' ? [{ headline: 'Everything your agents need to search, buy and reply' }] : [])]) {
			const r = renderItem(item, { variant, slots, dpi: 72 });
			expect(checkItem(item, r, { slots }).filter((f) => f.severity === 'error').map((f) => `${item.id} ${variant}: ${f.message}`)).toEqual([]);
			if (!Object.keys(slots).length) expect(r.layers.filter((l) => l.text && !l.text.own).map((l) => l.id)).toEqual([]);
		}
		expect(() => renderItem(findItem('cap-front'), { slots: { headline: 'x' } })).toThrow(/does not draw --headline/);
	});
	it('the reel asks for every word it draws', async () => {
		expect(() => create(a, 'reel', undefined, [])).toThrow(/needs headline/);
		const full = create(a, 'reel', undefined, Object.entries(a.sample!('reel')).map(([slot, value]) => ({ op: 'copy', slot, value }) as Edit)).doc;
		expect((await a.render(full, dir, { formats: [], scale: 1 })).layers.length).toBeGreaterThan(8);
		await expect(a.render({ ...full, copy: { ...full.copy, bench: 'Acme lots | B 2 | C 3' } }, dir, { formats: [], scale: 1 })).rejects.toThrow(/name share/);
		await expect(a.render({ ...full, copy: { ...full.copy, quote: 'word '.repeat(60) } }, dir, { formats: [], scale: 1 })).rejects.toThrow(/too long/);
	});
});

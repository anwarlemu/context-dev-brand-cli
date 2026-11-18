import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkFigmaValues } from '../src/figma/check.js';
import { illustrationScripts, parseFigmaUrl, svgScript } from '../src/figma/push.js';
import { figmaTokens, figmaTokenScripts } from '../src/figma/tokens.js';
import { buildIllustration, illustrateData, subjectPixels } from '../src/illustrate/build.js';
import { decodePng, encodePng } from '../src/illustrate/png.js';
import { countDots, toPixels, toSvg } from '../src/illustrate/render.js';
import { colorHex } from '../src/lib/brand.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex').slice(0, 16);
const run = (args: string[], cwd = mkdtempSync(join(tmpdir(), 'ds-ill-'))) => ({ cwd, ...spawnSync('node', [BIN, ...args], { cwd, encoding: 'utf8' }) });

/** A small stand-in for the Figma Plugin API: enough to run the generated scripts and count what they make. */
function mockFigma({ modeLimit = 40 } = {}) {
	let id = 0;
	const nid = () => `1:${++id}`;
	const collections: any[] = [];
	const variables: any[] = [];
	const styles: any[] = [];
	const node = (type: string): any => ({
		id: nid(), type, name: '', x: 0, y: 0, width: 0, height: 0, children: [] as any[], fills: [], strokes: [], opacity: 1,
		resize(w: number, h: number) { this.width = w; this.height = h; },
		appendChild(c: any) { c.parent?.children.splice(c.parent.children.indexOf(c), 1); c.parent = this; this.children.push(c); },
		insertChild(i: number, c: any) { this.children.splice(this.children.indexOf(c), 1); this.children.splice(i, 0, c); },
		remove() { const p = this.parent ?? page; p.children.splice(p.children.indexOf(this), 1); },
	});
	const page: any = { children: [] as any[] };
	const top = (n: any) => { n.parent = page; page.children.push(n); return n; };
	const figma = {
		currentPage: page,
		variables: {
			async getLocalVariableCollectionsAsync() { return collections; },
			async getLocalVariablesAsync(type?: string) { return variables.filter((v) => !type || v.resolvedType === type); },
			createVariableCollection(name: string) {
				const c: any = { id: `VC:${collections.length}`, name, modes: [{ modeId: `${collections.length}:0`, name: 'Mode 1' }], variableIds: [] as string[],
					renameMode(m: string, n: string) { c.modes.find((x: any) => x.modeId === m).name = n; },
					addMode(n: string) { if (c.modes.length >= modeLimit) throw new Error('Limited to 1 mode on this plan'); const m = `${c.id}:${c.modes.length}`; c.modes.push({ modeId: m, name: n }); return m; } };
				collections.push(c);
				return c;
			},
			createVariable(name: string, c: any, type: string) {
				const v: any = { id: `V:${variables.length}`, name, variableCollectionId: c.id, resolvedType: type, valuesByMode: {} as Record<string, unknown>, scopes: ['ALL_SCOPES'], codeSyntax: {},
					setValueForMode(m: string, val: unknown) { if (!c.modes.some((x: any) => x.modeId === m)) throw new Error(`no mode ${m}`); if (type === 'COLOR' && typeof (val as any)?.r !== 'number') throw new Error('bad color'); v.valuesByMode[m] = val; },
					setVariableCodeSyntax(p: string, s: string) { v.codeSyntax[p] = s; }, remove() { variables.splice(variables.indexOf(v), 1); } };
				variables.push(v);
				c.variableIds.push(v.id);
				return v;
			},
			setBoundVariableForPaint(p: any, _f: string, v: any) { return { ...p, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } } }; },
		},
		async getLocalEffectStylesAsync() { return styles; },
		createEffectStyle() { const s: any = { id: `S:${styles.length}`, name: '', effects: [] }; styles.push(s); return s; },
		createFrame: () => top(node('FRAME')),
		createEllipse: () => top(node('ELLIPSE')),
		createNodeFromSvg(svg: string) { const n = top(node('FRAME')); n.children = (svg.match(/<g /g) ?? []).map(() => node('GROUP')); return n; },
	};
	return { figma, collections, variables, styles, page };
}
const runScript = (code: string, figma: unknown) => new (Object.getPrototypeOf(async () => {}).constructor)('figma', code)(figma);

describe('illustrate', () => {
	it('writes the same SVG and PNG bytes for the same subject, settings and seed', () => {
		const a = buildIllustration({ subject: 'globe', settings: { seed: 3 } }).illustration;
		const b = buildIllustration({ subject: 'globe', settings: { seed: 3 } }).illustration;
		expect(sha(toSvg(a))).toBe(sha(toSvg(b)));
		expect(sha(encodePng(toPixels(a, 1)))).toBe(sha(encodePng(toPixels(b, 1))));
	});

	it('pins the output of every subject (a changed hash is a changed picture)', () => {
		const hashes = Object.fromEntries(Object.keys(illustrateData().subjects).map((s) => [s, sha(toSvg(buildIllustration({ subject: s, settings: { width: 400, height: 400 } }).illustration))]));
		expect(hashes).toMatchSnapshot();
	});

	it('changes only tie-breaks with the seed', () => {
		const s0 = buildIllustration({ subject: 'cursor', settings: { seed: 0 } }).illustration;
		const s1 = buildIllustration({ subject: 'cursor', settings: { seed: 1 } }).illustration;
		expect(toSvg(s0)).not.toBe(toSvg(s1));
		const total = (i: typeof s0) => Object.values(countDots(i)).reduce((x, y) => x + y, 0);
		expect(Math.abs(total(s0) - total(s1))).toBeLessThanOrEqual(2);
	});

	it('draws only brand token colors', () => {
		for (const palette of Object.keys(illustrateData().palettes)) {
			const svg = toSvg(buildIllustration({ subject: 'sphere', settings: { palette, field: 'faint', empty: 'field', width: 200, height: 200 } }).illustration);
			const allowed = new Set(Object.values(illustrateData().palettes[palette]!).filter((v) => typeof v === 'string' && !v.includes(':')).map((t) => colorHex(t as string)));
			for (const hex of svg.match(/#[0-9A-F]{6}/gi) ?? []) expect(allowed.has(hex.toUpperCase())).toBe(true);
		}
	});

	it('keeps every dot one size in a shaded picture, and real circles in the SVG', () => {
		const ill = buildIllustration({ subject: 'layers', settings: {} }).illustration;
		const filled = ill.layers.find((l) => l.id === 'filled')!;
		expect(new Set(filled.circles.filter((_, i) => i % 3 === 2)).size).toBe(1);
		expect((toSvg(ill).match(/<circle /g) ?? []).length).toBe(Object.values(countDots(ill)).reduce((a, b) => a + b, 0));
		expect(toSvg(ill)).toMatch(/<g id="filled"/);
	});

	it('round-trips PNG and reads the kit artwork back', () => {
		const px = subjectPixels('key');
		const back = decodePng(encodePng(px));
		expect(back.width).toBe(900);
		expect(Buffer.from(back.data).equals(Buffer.from(px.data))).toBe(true);
		const kit = buildIllustration({ subject: 'logomark', settings: {} });
		expect(kit.kind).toBe('kit');
		expect(countDots(kit.illustration).filled).toBeGreaterThan(100);
	});

	it('shades any picture passed with --image and writes both formats', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-ill-'));
		writeFileSync(join(dir, 'pic.png'), encodePng(subjectPixels('cursor')));
		const r = run(['illustrate', '--image', 'pic.png', '--palette', 'paper', '--json'], dir);
		expect(r.status).toBe(0);
		const doc = JSON.parse(r.stdout);
		expect(doc.files.map((f: string) => f.slice(-4))).toEqual(['.svg', '.png']);
		expect(doc.dots.filled).toBeGreaterThan(100);
		expect(readFileSync(doc.files[1]).subarray(1, 4).toString()).toBe('PNG');
	});

	it('exits 1 with a suggestion for an unknown name', () => {
		for (const [args, near] of [[['illustrate', 'glob'], 'globe'], [['illustrate', 'globe', '--palette', 'papr'], 'paper'], [['illustrate', 'globe', '--preset', 'heros'], 'hero'], [['illustrate', 'globe', '--dither', 'difuse'], 'diffuse'], [['figma', 'toknes'], 'tokens'], [['figma', 'push', 'ilustration'], 'illustration']] as const) {
			const r = run([...args]);
			expect(r.status, args.join(' ')).toBe(1);
			expect(r.stderr).toContain(`Did you mean \`${near}\``);
		}
	});
});

describe('figma', () => {
	it('types every token and applies them in three modes, or three collections on a one-mode plan', async () => {
		const doc = figmaTokens();
		expect(doc.variables.find((v) => v.css === '--ds-color-brand')).toMatchObject({ name: 'color/brand', type: 'COLOR' });
		expect(doc.variables.find((v) => v.css === '--ds-font-sans')).toMatchObject({ type: 'STRING', scopes: ['FONT_FAMILY'], values: ['Rethink Sans', 'Rethink Sans', 'Rethink Sans'] });
		const bg = doc.variables.find((v) => v.css === '--ds-color-bg-default')!;
		expect(bg.values[0]).not.toEqual(bg.values[2]);
		const scripts = figmaTokenScripts(doc);
		for (const s of scripts) expect(s.length).toBeLessThanOrEqual(45000);
		const pro = mockFigma();
		for (const s of scripts) await runScript(s, pro.figma);
		expect(pro.collections.map((c) => c.modes.length)).toEqual([3]);
		expect(pro.variables.length).toBe(doc.variables.length);
		expect(pro.styles.length).toBe(doc.effects.length);
		const again = await runScript(scripts[0]!, pro.figma);
		expect(again.created).toBe(0);
		const starter = mockFigma({ modeLimit: 1 });
		let result: any;
		for (const s of scripts) result = await runScript(s, starter.figma);
		expect(result.layout).toBe('collections');
		expect(starter.collections.length).toBe(3);
		expect(starter.variables.length).toBe(doc.variables.length * 3);
	});

	it('draws an illustration as ellipses bound to the color variables', async () => {
		const ill = buildIllustration({ subject: 'globe', settings: {} }).illustration;
		const scripts = illustrationScripts(ill, 'Illustration / globe');
		for (const s of scripts) expect(s.length).toBeLessThanOrEqual(45000);
		const m = mockFigma();
		for (const s of figmaTokenScripts(figmaTokens())) await runScript(s, m.figma);
		for (const s of scripts) await runScript(s, m.figma);
		const frame = m.page.children.find((n: any) => n.name === 'Illustration / globe');
		const ellipses = frame.children.flatMap((g: any) => g.children);
		expect(ellipses.length).toBe(Object.values(countDots(ill)).reduce((a, b) => a + b, 0));
		expect(ellipses.every((e: any) => (e.fills[0] ?? e.strokes[0]).boundVariables?.color)).toBe(true);
		expect(frame.children.map((g: any) => g.name)).toEqual(['hollow', 'filled']);
		// Positions survive the grid encoding.
		const c = ill.layers.find((l) => l.id === 'filled')!.circles;
		const first = frame.children.find((g: any) => g.name === 'filled').children[0];
		expect(first.x + first.width / 2).toBeCloseTo(c[0]!, 1);
		expect(first.y + first.height / 2).toBeCloseTo(c[1]!, 1);
		expect(svgScript('<svg xmlns="http://www.w3.org/2000/svg"><g id="a"/></svg>', 'x')).toContain('createNodeFromSvg');
	});

	it('flags off-brand values from Figma responses and names the brand ones', () => {
		const vars = checkFigmaValues(JSON.stringify({ 'Brand/Blue': '#2563EB', 'Accent/Purple': '#7C3AED', 'Body font': 'Font(family: "Inter", style: Regular)' }));
		expect(vars.find((f) => f.value === '#2563EB')).toMatchObject({ ok: true, token: '--ds-color-brand' });
		expect(vars.find((f) => f.value === '#7C3AED')).toMatchObject({ ok: false });
		expect(vars.find((f) => f.kind === 'font')).toMatchObject({ ok: false, value: 'Inter' });
		const code = checkFigmaValues('<div className="bg-[#2563eb] text-[13.7px] rounded-[9.5px] font-[\'Rethink_Sans\']" style={{ color: "#000000" }} />');
		expect(code.filter((f) => !f.ok).map((f) => f.kind).sort()).toEqual(['radius', 'size']);
		expect(code.find((f) => f.kind === 'font')).toMatchObject({ ok: true });
	});

	it('parses Figma URLs and writes the pull and push steps', () => {
		expect(parseFigmaUrl('https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Brand?node-id=12-34')).toEqual({ fileKey: 'AbCdEfGhIjKlMnOpQrStUv', nodeId: '12:34', kind: 'design' });
		expect(parseFigmaUrl('https://figma.com/design/AbCdEfGhIjKlMnOpQrStUv/branch/ZyXwVuTsRqPoNmLkJiHgFe/Brand').fileKey).toBe('ZyXwVuTsRqPoNmLkJiHgFe');
		const pull = run(['figma', 'pull', 'https://figma.com/design/AbCdEfGhIjKlMnOpQrStUv/x?node-id=1-2', '--json']);
		expect(JSON.parse(pull.stdout).steps.map((s: any) => s.tool)).toEqual(['create_session', 'get_variable_defs', 'get_design_context', 'shell']);
		const push = run(['figma', 'push', 'illustration', 'burst', '--json']);
		expect(push.status).toBe(0);
		const steps = JSON.parse(push.stdout).steps.map((s: any) => s.tool);
		expect(steps.indexOf('create_session')).toBeLessThan(steps.indexOf('use_figma'));
		expect(steps.at(-1)).toBe('get_screenshot');
		const bad = run(['figma', 'check', join(push.cwd, 'x.json')]);
		expect(bad.status).toBe(1);
		writeFileSync(join(push.cwd, 'v.json'), JSON.stringify({ a: '#123456' }));
		expect(run(['figma', 'check', 'v.json'], push.cwd).status).toBe(1);
		writeFileSync(join(push.cwd, 'ok.json'), JSON.stringify({ a: '#2563EB' }));
		expect(run(['figma', 'check', 'ok.json'], push.cwd).status).toBe(0);
	});
});


describe('manifest entries', () => {
	it('lists illustrate and figma with flags the commands really take and resolved names', async () => {
		const { manifestParts } = await import('../src/lib/manifest-parts.js');
		const parts = manifestParts();
		expect(parts.map((p) => p.name)).toEqual(expect.arrayContaining(['figma tokens', 'figma push', 'figma pull', 'figma check', 'illustrate']));
		const ill = parts.find((p) => p.name === 'illustrate')!;
		expect(ill.names!.subject).toEqual(Object.keys(illustrateData().subjects));
		for (const p of parts) {
			const help = run([...p.name.split(' ').slice(0, 1), '--help']).stdout;
			for (const f of p.flags) expect(help, `${p.name} --${f}`).toContain(`--${f}`);
		}
	});
});

describe('merged commands', () => {
	const cli = (...args: string[]) => spawnSync(process.execPath, [join(__dirname, '..', 'bin.js'), ...args], { encoding: 'utf8' });

	it('registers illustrate and figma before the unknown-command check runs', () => {
		expect(cli('illustrate', '--list', '--json').status).toBe(0);
		const typo = cli('illustrat');
		expect(typo.status).toBe(1);
		expect(typo.stderr).toContain('`illustrate`');
	});

	it('puts the illustrate and figma entries from brand/manifest.d into manifest --json', () => {
		const doc = JSON.parse(cli('manifest', '--json').stdout) as { commands: { name: string; entries?: { name: string; names?: Record<string, unknown> }[] }[] };
		const by = (n: string) => doc.commands.find((c) => c.name === n);
		expect(by('illustrate')?.entries?.[0]?.names).toHaveProperty('subject');
		expect(by('figma')?.entries?.map((e) => e.name)).toEqual(['figma tokens', 'figma push', 'figma pull', 'figma check']);
		for (const n of ['image', 'deck', 'video', 'merch']) expect(by(n)).toBeTruthy();
	});
});

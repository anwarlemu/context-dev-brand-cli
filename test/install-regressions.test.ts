import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { runCheck } from '../src/check/engine.js';
import { convertCss, newStats } from '../src/convert/css.js';
import { sitePalette } from '../src/convert/palette.js';
import { convertClasses, convertScript } from '../src/convert/script.js';
import { elementLayer } from '../src/install/layer.js';

it('styles generic buttons and limits field styling to controls, preserving secondary variants', () => {
	const css = '.button { background: blue } .button-secondary { background: white } .field { display: grid } label.field { color: black } .form input { border: 1px solid gray } .pricing-card .button { margin-top: auto; width: 100%; }';
	const { block, styled } = elementLayer('styles.css', css, 'site');
	expect(styled.some(({ selector, kind }) => selector.endsWith('.button') && kind === 'button-primary')).toBe(true);
	expect(styled.some(({ selector, kind }) => selector.endsWith('.button-secondary') && kind === 'button-secondary')).toBe(true);
	expect(styled.filter(({ kind }) => kind === 'input').every(({ selector }) => selector.startsWith(':where(input,') || selector.endsWith(' input'))).toBe(true);
	expect(styled.some(({ selector }) => selector === 'label.field' || selector === '.field')).toBe(false);
	expect(styled.some(({ selector, kind }) => kind === 'button-primary' && selector.startsWith('.pricing-card '))).toBe(false);
	expect(block).toContain('border-radius: var(--ds-radius-pill)');
	expect(block).toContain('background-color: var(--ds-color-action-primary)');
});

it('keeps pale descendant text readable on a dark panel without recoloring accent links', () => {
	const css = ':root { --panel: #173b43; } body { background: #fff; color: #172b3a; } .quote { background: var(--panel); color: #fff; } .quote p { color: #b6d9dc; } .quote a { color: #2563eb; } .quote + p { color: #b6d9dc; } .quote span, .outside span { color: #b6d9dc; }';
	const out = convertCss(css, sitePalette(css), newStats());
	expect(out).toContain('.quote p { color: var(--ds-color-text-on-brand); }');
	expect(out).toContain('.quote a { color: var(--ds-color-text-brand); }');
	expect(out).toContain('.quote + p { color: var(--ds-color-text-brand); }');
	expect(out).toContain('.quote span, .outside span { color: var(--ds-color-text-brand); }');
});

it('uses the nearest panel and avoids guessing across responsive backgrounds', () => {
	const css = 'body { background: #fff; color: #111; } .quote { background: #173b43; } .quote .panel { background: #fff; } .quote .panel p { color: #b6d9dc; } @media (max-width: 600px) { .quote { background: #fff; } } .quote p { color: #b6d9dc; }';
	const out = convertCss(css, sitePalette(css), newStats());
	expect(out).toContain('.quote .panel p { color: var(--ds-color-text-brand); }');
	expect(out).toContain('.quote p { color: var(--ds-color-text-brand); }');
});

it('converts uppercase styles without altering the displayed copy in code', () => {
	const palette = sitePalette('');
	expect(convertCss('.eyebrow { text-transform: uppercase !important; }', palette, newStats())).toContain('text-transform: none !important');
	expect(convertClasses('uppercase md:uppercase !uppercase', palette, newStats(), true)).toBe('normal-case md:normal-case !normal-case');
	const code = 'const label = "uppercase"; export const Title = () => <p className="uppercase" style={{ textTransform: "uppercase" }}>Keep This Copy</p>;';
	const out = convertScript(code, palette, newStats(), { tailwind: 'theme' });
	expect(out).toContain('className="normal-case"');
	expect(out).toContain('textTransform: "none"');
	expect(out).toContain('>Keep This Copy</p>');
	expect(out).toContain('const label = "uppercase"');
});

it('the automatic install passes its own check on the sample regression cases', () => {
	const root = mkdtempSync(join(tmpdir(), 'ds-install-regression-'));
	try {
		writeFileSync(join(root, 'package.json'), '{"name":"sample-site","private":true}');
		writeFileSync(join(root, 'index.html'), '<!doctype html><html><head><link rel="stylesheet" href="styles.css"></head><body><main><section class="hero"><h1>Keep this heading</h1><p class="eyebrow">Keep this label</p><a class="button" href="#contact">Continue</a></section><section id="contact"><div class="quote"><p>Keep this quote</p></div><label class="field">Email<input type="email"></label></section></main></body></html>');
		writeFileSync(join(root, 'styles.css'), 'body { background: #fff; color: #172b3a; } .eyebrow { text-transform: uppercase; } .button { background: #0d9488; color: white; border-radius: 8px; } .field { display: grid; gap: 6px; } .quote { background: #173b43; } .quote p { color: #b6d9dc; }');
		execFileSync('git', ['init', '-q'], { cwd: root });
		execFileSync(process.execPath, [join(import.meta.dirname, '../bin.js'), '--no-install'], { cwd: root, stdio: 'pipe' });
		expect(runCheck(root).findings).toEqual([]);
		const css = readFileSync(join(root, 'styles.css'), 'utf8');
		expect(css).toContain('.quote p { color: var(--ds-color-text-on-brand); }');
		expect(css).toContain('background-color: var(--ds-color-action-primary)');
		expect(readFileSync(join(root, 'index.html'), 'utf8')).toContain('Keep this quote');
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

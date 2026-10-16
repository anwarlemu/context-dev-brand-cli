import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyFixes, checkText, runCheck } from '../src/check/engine.js';
import { convertCss, newStats } from '../src/convert/css.js';
import { convertMarkup } from '../src/convert/markup.js';
import { convertNative } from '../src/convert/native.js';
import { sitePalette } from '../src/convert/palette.js';
import { convertClasses, convertScript } from '../src/convert/script.js';
import { convertSvgMark } from '../src/convert/svg.js';
import { cursorPreToolUse, preToolUse, stop } from '../src/hooks/handlers.js';
import { patchWrites } from '../src/hooks/payload.js';
import { runningHarness } from '../src/install/agents.js';
import { elements, tokens } from '../src/lib/brand.js';
import { elementsIn } from '../src/plan/elements.js';
import { readState } from '../src/plan/state.js';
import { detectProject, styledFiles } from '../src/project/detect.js';
import { listScreens } from '../src/project/screens.js';
import { profile } from '../src/project/surface.js';
import { pickEngine, scorecardJsonSchema } from '../src/review/critique.js';
import { elementLayer } from '../src/install/layer.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');

function project(files: Record<string, string>) {
	const dir = mkdtempSync(join(tmpdir(), 'ds-'));
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
	execFileSync('git', ['init', '-q'], { cwd: dir });
	return dir;
}
const run = (dir: string, ...args: string[]) => execFileSync(process.execPath, [BIN, ...args, '--no-install'], { cwd: dir, encoding: 'utf8', env: { ...process.env, CLAUDECODE: '' } });

describe('brand data', () => {
	it('every element style uses only brand tokens and follows the motion rules', () => {
		const known = new Set([...Object.keys(tokens().site), ...Object.keys(tokens().product)]);
		for (const surface of ['site', 'product'] as const) {
			for (const [id, el] of Object.entries(elements()[surface])) {
				const values = [...Object.values(el.css), ...Object.values(el.states ?? {}).flatMap((o) => Object.values(o))];
				for (const v of values) {
					for (const m of v.matchAll(/var\((--ds-[\w-]+)/g)) expect(known.has(m[1]), `${id}: ${m[1]}`).toBe(true);
					const raw = v.replace(/var\([^)]*\)/g, '').replace(/color-mix\(in srgb,\s*,?/g, '');
					expect(raw, `${id}: ${v}`).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
					expect(raw.replace(/\b[12]px\b|4px\b/g, ''), `${id}: ${v}`).not.toMatch(/\d(px|rem|ms)\b/);
					expect(v, `${id}`).not.toMatch(/\bease-in\b(?!-)|transition:\s*all/);
				}
				expect(el.rules.length, id).toBeGreaterThan(0);
				expect(el.source, id).toBeTruthy();
			}
		}
	});
	it('text tokens are readable on the page: AA contrast', () => {
		const hex = (n: string) => tokens().site[n];
		const lum = (h: string) => {
			const c = [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
			return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
		};
		const ratio = (a: string, b: string) => {
			const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
			return (x + 0.05) / (y + 0.05);
		};
		for (const t of ['text-default', 'text-secondary', 'text-muted', 'text-subtle', 'text-nav', 'text-brand']) expect(ratio(hex(`--ds-color-${t}`), '#FFFFFF'), t).toBeGreaterThanOrEqual(4.5);
	});
});

describe('convert', () => {
	const stats = newStats;
	it('turns a dark site into the brand light one by role', () => {
		const css = 'body { background: #0b0b0c; color: #f5f5f5; }\n.card { background: #18181b; border: 1px solid rgba(255,255,255,.08); }\n.muted { color: #a1a1aa; }\n.cta { background: #7c3aed; color: #fff; }';
		const out = convertCss(css, sitePalette(css), stats());
		expect(out).toContain('body { background: var(--ds-color-bg-default); color: var(--ds-color-text-default)');
		expect(out).toContain('.cta { background: var(--ds-color-bg-brand); color: var(--ds-color-text-on-brand)');
		expect(out).toMatch(/\.muted \{ color: var\(--ds-color-text-(muted|subtle)\)/);
	});
	it('maps dark inks to black, warm paper to white, and red only where it means an error', () => {
		const css = ':root { --ink: #2b1a1f; --wine: #5c1a2c; --paper: #fbf6f0; }\nbody { background: var(--paper); color: var(--ink); }\n.btn { background: var(--wine); }\n.rose { color: #b85566; }\n.err { color: #dc2626; }';
		const out = convertCss(css, sitePalette(css), stats());
		expect(out).toContain('--ink: var(--ds-color-text-default)');
		expect(out).toContain('--paper: var(--ds-color-bg-default)');
		expect(out).toContain('.rose { color: var(--ds-color-text-brand)');
		expect(out).toContain('.err { color: var(--ds-color-status-danger)');
	});
	it('keeps fonts, fluid type, long animations and @font-face intact where it must', () => {
		const css = "/* fonts */\n@font-face { font-family: 'X'; font-weight: 700; }\nh1 { font-size: clamp(40px, 6vw, 72px); font-weight: 700; letter-spacing: -0.04em; }\n.m { animation: scroll 48s linear infinite; transition: all .3s ease-in; }";
		const out = convertCss(css, sitePalette(''), stats());
		expect(out).toContain("@font-face { font-family: 'X'; font-weight: 700; }");
		expect(out).toMatch(/font-size: clamp\(var\(--ds-text-[\w-]+\), 6vw, var\(--ds-text-[\w-]+\)\)/);
		expect(out).toContain('font-weight: var(--ds-font-weight-regular)');
		expect(out).toContain('letter-spacing: var(--ds-tracking-tight)');
		expect(out).toContain('animation: scroll 48s linear infinite');
		expect(out).toMatch(/transition: color, background-color, border-color, box-shadow, opacity, transform var\(--ds-duration-slow\) var\(--ds-easing-out\)/);
	});
	it('reads channel triplets and a comment above :root does not flip the theme', () => {
		const css = '/* same under prefers-color-scheme: dark */\n:root { --black: 0 0 0; --bg: #ffffff; }\nbody { background: var(--bg); }\n.x { background: rgb(var(--black) / 0.5); }';
		const out = convertCss(css, sitePalette(css), stats());
		expect(out).toContain('--bg: var(--ds-color-bg-default)');
		expect(out).toMatch(/\.x \{ background: color-mix\(in srgb, var\(--ds-color-(text-default|black)\) 50%/);
	});
	it('converts Tailwind classes, style objects, chart literals and native colors', () => {
		const pal = sitePalette('body { background: #fff; color: #111; }');
		expect(convertClasses('bg-white text-gray-500 hover:bg-blue-600 border-zinc-200', pal, stats(), true)).toBe('bg-surface text-fg-muted hover:bg-brand border-line-subtle');
		expect(convertScript("const s = { color: '#ff0000', marginTop: 16 }; const series = ['#22c55e', '#f59e0b', '#8b5cf6'];", pal, stats(), {})).toMatch(/marginTop: 'var\(--ds-space-4\)'.*#3B82F6.*#14B8A6/s);
		expect(convertNative('val bg = Color(0xFF0B0B0C)\nText(color = Color(0xFFF5F5F5))', sitePalette('body{background:#0b0b0c;color:#f5f5f5}'), stats(), 'site')).toContain('Color(0xFFFFFFFF)');
	});
	it('puts wide containers on the ruled column, on a site only', () => {
		const css = ':root { --max-w: 1200px; --measure: 640px } .wrap { max-width: 1280px } .form { max-width: 480px }';
		const out = convertCss(css, { ...sitePalette(''), column: true }, stats());
		expect(out).toContain('--max-w: var(--ds-frame-column)');
		expect(out).toContain('.wrap { max-width: var(--ds-frame-column) }');
		expect(out).toContain('--measure: 640px');
		expect(out).toContain('max-width: 480px');
		expect(convertCss(css, sitePalette(''), stats())).not.toContain('frame-column');
		expect(convertClasses('mx-auto max-w-7xl px-6', { ...sitePalette(''), column: true }, stats(), true)).toBe('mx-auto max-w-(--ds-frame-column) px-6');
	});
	it('leaves the colors of a 3D or canvas scene alone', () => {
		const scene = "import * as THREE from 'three';\nconst sea = new THREE.Color('#1a4fd0');\nconst style = { color: '#ff6600' };";
		const out = convertScript(scene, sitePalette(''), stats(), {});
		expect(out).toContain("'#1a4fd0'");
	});
	it('keeps style guide swatches and redraws only light one-color marks for a dark site', () => {
		expect(convertMarkup('<div style="background:#ff6600"></div><span>#ff6600</span>', sitePalette(''), stats())).toContain('background:#ff6600');
		const dark = sitePalette('body{background:#000;color:#fff}');
		expect(convertSvgMark('<svg><path fill="#ffffff"/></svg>', dark)).toContain('fill="#000000"');
		expect(convertSvgMark('<svg><path fill="#ff0000"/><path fill="#fff"/></svg>', dark)).toContain('#ff0000');
	});
});

describe('project', () => {
	it('tells a product from a site, and lists screens home first', () => {
		const p = project({ 'package.json': '{"name":"acme-admin","dependencies":{"next":"15"}}', 'app/(dashboard)/page.tsx': "import { LineChart } from 'recharts'; export default () => <table/>", 'app/settings/page.tsx': '<div/>', 'app/login/page.tsx': '<form/>' });
		expect(profile(p, styledFiles(p)).surface).toBe('product');
		const s = project({ 'index.html': '<section class="hero"><h1>Hi</h1></section><footer></footer>', 'about.html': '<h1>About</h1>', 'pricing.html': '<p>pricing</p>', '404.html': '<h1>Lost</h1>', 'styles.css': 'body{}' });
		const found = profile(s, styledFiles(s));
		expect(found.surface).toBe('site');
		expect(listScreens(detectProject(s), styledFiles(s), found).map((x) => x.url)).toEqual(['/', '/about.html', '/pricing.html', '/404.html']);
		// A project route that shares the CLI's name is still the project's; only the files the CLI writes are skipped.
		const n = project({ 'src/app/context-ds/page.tsx': '<div style={{ color: "#ff0000" }} />', 'src/app/context-ds/brand.css': ':root{}' });
		expect(styledFiles(n)).toEqual(['src/app/context-ds/page.tsx']);
		rmSync(n, { recursive: true });
		for (const d of [p, s]) rmSync(d, { recursive: true });
	});
});

describe('check', () => {
	it('flags raw values with the token to use, and fixes exact matches', () => {
		const css = '.a { color: #2563eb; padding: 16px; font-weight: 700; transition: all 300ms ease-in; font-family: Inter; }';
		const r = checkText('a.css', css);
		expect(r.findings.map((f) => f.rule)).toEqual(expect.arrayContaining(['raw-color', 'off-scale', 'font', 'motion']));
		expect(r.findings.find((f) => f.rule === 'raw-color')?.hint).toContain('var(--ds-color-brand)');
		const fixed = applyFixes(css, r.findings.map((f) => f.fix).filter((f): f is NonNullable<typeof f> => !!f)).text;
		expect(fixed).toContain('color: var(--ds-color-brand)');
		expect(fixed).toContain('padding: var(--ds-space-4)');
	});
	it('checks Tailwind classes, style objects and template styles, and accepts brand values', () => {
		expect(checkText('a.tsx', 'export const A = () => <p className="text-red-500 p-[13px] font-bold text-sm">x</p>;').findings.map((f) => f.rule)).toEqual(['raw-color', 'off-scale', 'font', 'off-scale']);
		expect(checkText('a.tsx', 'export const A = () => <p style={{ color: "#ff0000" }}>x</p>;').findings[0].rule).toBe('raw-color');
		expect(checkText('a.astro', '<p style="color: #ff0000">x</p><style>.a { gap: 13px }</style>').findings.map((f) => f.rule)).toEqual(['raw-color', 'off-scale']);
		expect(checkText('a.tsx', 'export const A = () => <p className="bg-surface text-fg-muted p-4 rounded-card" style={{ color: "var(--ds-color-brand)" }}>x</p>;').findings).toEqual([]);
		expect(checkText('a.css', '.a { color: var(--ds-color-nope); }').findings[0].rule).toBe('unknown-token');
	});
	it('a ds-override counts only once a person approves it', () => {
		const p = project({ 'a.css': '.a { color: #ff0000; } /* ds-override: partner logo color */' });
		const r = runCheck(p);
		expect(r.findings.map((f) => f.rule)).toEqual(['override-approval']);
		rmSync(p, { recursive: true });
	});
});

describe('element layer', () => {
	it('styles only elements whose class says what they are, skin only, with gated hover and reduced motion', () => {
		const css = '.btn-primary { padding: 10px; display: grid } .hw-msg-main { color: red } .plan-card { width: 300px } button { color: red } .nav-links > a { color: red }';
		const { block, count } = elementLayer('styles.css', css, 'site');
		expect(block).toMatch(/\.btn-primary \{[^}]*background-color: var\(--ds-color-action-primary\)/);
		expect(block).not.toContain('.hw-msg-main');
		expect(block).toMatch(/\.plan-card \{/);
		expect(block).not.toMatch(/^button/m);
		expect(block).not.toMatch(/display:|width:/);
		expect(block).toContain('@media (hover: hover) and (pointer: fine)');
		expect(block).toContain('prefers-reduced-motion: reduce');
		expect(count).toBeGreaterThanOrEqual(2);
	});
});

describe('elements', () => {
	it('recognizes buttons, headings, cards and nav links', () => {
		const html = '<header><nav><a href="/">Docs</a><a class="btn btn-primary">Start</a></nav></header><section class="hero"><h1>Title</h1></section><section><h2 class="title">Features</h2><div class="feature-card"><h3>One</h3></div><a class="btn-outline">More</a></section>';
		const kinds = elementsIn('index.html', html, 'site').map((h) => h.kind);
		expect(kinds).toEqual(expect.arrayContaining(['header', 'nav-link', 'header-action', 'hero', 'hero-title', 'section-heading', 'card', 'button-secondary']));
		const app = elementsIn('page.tsx', '<aside className="sidebar"><a href="/">Overview</a></aside><table><th>Name</th></table><button className="btn-primary">Create</button>', 'product').map((h) => h.kind);
		expect(app).toEqual(expect.arrayContaining(['app-sidebar', 'app-nav-item', 'app-table', 'app-th', 'app-button-brand']));
	});
});

describe('hooks', () => {
	it('blocks a write that adds an off-brand value, for Claude Code, Codex and Cursor', () => {
		const p = project({ 'package.json': '{}', 'a.tsx': 'export const A = () => null;' });
		const bad = 'export const A = () => <p style={{ color: "#ff0000" }}>x</p>;';
		expect(preToolUse(p, { tool_name: 'Write', tool_input: { file_path: join(p, 'b.tsx'), content: bad } }).exitCode).toBe(2);
		const patch = ['*** Begin Patch', '*** Add File: c.tsx', `+${bad}`, '*** End Patch'].join('\n');
		expect(patchWrites(patch, p)[0].relPath).toBe('c.tsx');
		expect(preToolUse(p, { tool_name: 'apply_patch', cwd: p, tool_input: { command: patch } }).exitCode).toBe(2);
		expect(cursorPreToolUse(p, { tool_name: 'Write', tool_input: { file_path: join(p, 'd.tsx'), contents: bad } }).json).toMatchObject({ permission: 'deny' });
		expect(preToolUse(p, { tool_name: 'Write', tool_input: { file_path: join(p, 'e.tsx'), content: 'export const A = () => <p className="text-fg">x</p>;' } }).exitCode).toBeUndefined();
		rmSync(p, { recursive: true });
	});
	it('does not block for errors that were already there, and blocks finishing while changed files fail', () => {
		const p = project({ 'package.json': '{}', 'a.css': '.a { color: #ff0000; }\n' });
		expect(preToolUse(p, { tool_name: 'Edit', tool_input: { file_path: join(p, 'a.css'), old_string: '.a', new_string: '.b' } }).exitCode).toBeUndefined();
		expect((stop(p, { session_id: 's' }).json as any)?.decision).toBe('block');
		rmSync(p, { recursive: true });
	});
	it('knows which agent runs it', () => {
		expect(runningHarness({ CODEX_THREAD_ID: '1', CLAUDECODE: '1' })).toBe('codex');
		expect(runningHarness({ CLAUDECODE: '1' })).toBe('claude-code');
	});
});

describe('review', () => {
	it('runs on whatever agent is at hand, or lets the agent score it itself', () => {
		const keep = { ...process.env };
		for (const k of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_PROFILE', 'CODEX_THREAD_ID', 'CLAUDECODE']) delete process.env[k];
		process.env.PATH = '/nonexistent';
		process.env.HOME = '/nonexistent';
		try {
			expect(pickEngine()).toBe('self');
			process.env.DS_REVIEW_ENGINE = 'codex';
			expect(pickEngine()).toBe('codex');
		} finally {
			process.env = keep;
		}
		const schema = scorecardJsonSchema();
		expect(schema.additionalProperties).toBe(false);
		expect(schema.properties.punch_list.items.required).toEqual(['viewport', 'region', 'issue', 'fix', 'severity']);
	});
});

describe('the one command', () => {
	it('installs, converts and prints the first task on a plain HTML site; runs again with the next task', () => {
		const p = project({
			'index.html': '<!doctype html><html><head><link rel="stylesheet" href="/styles.css"></head><body><section class="hero"><h1>Fast sites</h1><a class="btn btn-primary">Start</a></section><section><h2 class="title">Features</h2></section></body></html>',
			'about.html': '<!doctype html><html><head><link rel="stylesheet" href="/styles.css"></head><body><h1>About</h1></body></html>',
			'styles.css': "/* site */\n@font-face { font-family: 'Brand'; src: url(b.woff2); }\nbody { background: #0a0a0a; color: #fafafa; font-family: 'Brand', sans-serif; }\n.btn-primary { background: #7c3aed; padding: 13px 22px; border-radius: 6px; }",
		});
		const first = run(p);
		expect(first).toMatch(/installed and applied/);
		expect(first).toMatch(/Task 1 of 3: the home page/);
		const css = readFileSync(join(p, 'styles.css'), 'utf8');
		expect(css.startsWith('/* site */\n@import "./context-ds/brand.css";')).toBe(true);
		expect(css).toContain("@font-face { font-family: 'Brand'; src: url(b.woff2); }");
		expect(css).toContain('background: var(--ds-color-bg-default)');
		expect(readFileSync(join(p, 'context-ds/brand.css'), 'utf8')).toMatch(/^@import url\("https:\/\/fonts\.googleapis\.com/);
		expect(readFileSync(join(p, 'index.html'), 'utf8')).toContain('<script src="./context-ds/dots.js" defer></script>');
		expect(readFileSync(join(p, 'AGENTS.md'), 'utf8')).toContain('ds:contract:start');
		expect(JSON.parse(readFileSync(join(p, '.claude/settings.json'), 'utf8')).hooks.PreToolUse[0].hooks[0].command).toMatch(/hook pre-tool-use/);
		expect(existsSync(join(p, '.git/hooks/pre-commit'))).toBe(true);
		expect(readState(p)?.screens.map((s) => s.url)).toEqual(['/', '/about.html']);
		const again = run(p);
		expect(again).toMatch(/0 of 2 screens done/);
		expect(again).toMatch(/Add data-ds-dots to the hero section/);
		run(p, 'skip', '/', '--reason', 'needs a database');
		const skipped = run(p);
		expect(skipped).toMatch(/1 of 2 screens done/);
		expect(skipped).toMatch(/Task 2 of 3: the other main screen/);
		expect(skipped).toMatch(/\/about\.html \(about\.html\)/);
		expect(skipped).toMatch(/review --all/);
		expect(readState(p)?.skipped).toEqual({ '/': 'needs a database' });
		const refused = (() => {
			try {
				return run(p, 'review', 'http://localhost:9/missing.html');
			} catch (e) {
				return String((e as { stdout?: string }).stdout);
			}
		})();
		expect(refused).toMatch(/not one of the tasks/);
		// An agent with no separate reviewer scores the screen itself and submits it; the person is told.
		const dir = '.ds/review/manual';
		mkdirSync(join(p, dir), { recursive: true });
		writeFileSync(join(p, dir, 'meta.json'), JSON.stringify({ url: 'http://localhost:9/about.html', screen: '/about.html' }));
		writeFileSync(join(p, dir, 'scorecard.json'), JSON.stringify({ purpose: 'About', scores: { hierarchy: 8, coherence: 8, brand_voice: 8, detail_quality: 8, accessibility: 8 }, punch_list: [], verdict: 'ok' }));
		expect(run(p, 'review', '--submit', dir)).toMatch(/Passed/);
		expect(readState(p)?.reviews['/about.html']).toMatchObject({ passed: true, by: 'self' });
		rmSync(p, { recursive: true });
	});
	it('every command answers --help', () => {
		for (const c of ['review', 'look', 'check', 'tokens', 'approve', 'done', 'skip', 'hook']) expect(execFileSync(process.execPath, [BIN, c, '--help'], { encoding: 'utf8' })).toMatch(/Usage/);
	});
});

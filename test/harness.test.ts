import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyFixes, checkText, runCheck } from '../src/check/engine.js';
import { planScaffold } from '../src/commands/scaffold.js';
import { cursorPreToolUse, cursorStop, preToolUse, userPromptSubmit } from '../src/hooks/handlers.js';
import { patchWrites, proposedWrite } from '../src/hooks/payload.js';
import { resolveIntent } from '../src/lib/intents.js';
import { isProductTarget } from '../src/review/critique.js';
import { checkChanged } from '../src/commands/watch.js';
import { overrideKey, writeApprovals } from '../src/lib/state.js';
import { gitRemote, installedCommit } from '../src/lib/source.js';
import { colorRole, remapVariables } from '../src/commands/apply.js';
import { detectComponents, findRecipe, loadRecipes, recipeCss } from '../src/lib/recipes.js';
import { runningHarness } from '../src/commands/init.js';

const FIXTURES = join(__dirname, 'fixtures', 'violations');
const expected: Record<string, string> = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'expected.json'), 'utf8'));

describe('resolve', () => {
	it.each([
		['Build the pricing page for Context.dev', 'templates/pricing'],
		['build a new homepage', 'templates/landing'],
		['create a marketing page for the launch', 'templates/landing'],
		['make a product page for Monitors', 'templates/product'],
		['redesign the search page', 'templates/product'],
	])('%s -> %s', (prompt, target) => {
		const r = resolveIntent(prompt);
		expect(r.kind).toBe('match');
		expect(r.kind === 'match' && r.target).toBe(target);
	});
	it('routes dashboard work to the product templates', () => {
		expect(resolveIntent('add a usage chart to the dashboard')).toMatchObject({ kind: 'match', target: 'templates/app-overview' });
		expect(resolveIntent('build the API keys page')).toMatchObject({ kind: 'match', target: 'templates/app-list' });
		expect(resolveIntent('build the settings page')).toMatchObject({ kind: 'match', target: 'templates/app-settings' });
	});
	it('keeps auth screens out of scope', () => expect(resolveIntent('build the sign in screen').kind).toBe('out_of_scope'));
	it('says no match and flags UI intent', () => expect(resolveIntent('design a careers section')).toEqual({ kind: 'none', ui: true }));
	it('ignores non-UI prompts', () => expect(resolveIntent('fix the flaky vitest in utils')).toEqual({ kind: 'none', ui: false }));
});

describe('scaffold', () => {
	it('is byte-identical across runs', () => {
		for (const t of ['landing', 'pricing', 'product']) expect(planScaffold(t, {}, FIXTURES).code).toBe(planScaffold(t, {}, FIXTURES).code);
	});
	it('rejects blocks outside the allowed list', () => expect(() => planScaffold('pricing', { plans: 'logo-wall' }, FIXTURES)).toThrow(/not allowed/));
	it('rejects dropping a required slot', () => expect(() => planScaffold('pricing', { hero: 'none' }, FIXTURES)).toThrow(/required/));
	it('drops an optional slot on request', () => expect(planScaffold('landing', { stories: 'none' }, FIXTURES).code).not.toContain('StoryRail'));
	it('scaffolded pages pass check', () => {
		for (const t of ['landing', 'pricing', 'product']) {
			const { findings } = checkText(FIXTURES, `app/${t}/page.tsx`, planScaffold(t, {}, FIXTURES).code);
			expect(findings.map((f) => `${f.rule} ${f.message}`)).toEqual([]);
		}
	});
});

describe('product templates', () => {
	const PAGES = ['app-overview', 'app-list', 'app-detail', 'app-form', 'app-settings', 'app-playground'];
	it('scaffolded product pages pass check', () => {
		for (const t of PAGES) {
			const plan = planScaffold(t, {}, FIXTURES);
			const { findings } = checkText(FIXTURES, plan.out, plan.code);
			expect(findings.map((f) => `${t}: ${f.rule} ${f.message}`)).toEqual([]);
		}
	});
	it('the first-run list page swaps the table for the empty page', () => {
		const plan = planScaffold('app-list', { header: 'none', banner: 'none', content: 'app-empty-page' }, FIXTURES);
		expect(plan.code).toContain('AppEmptyPage');
		expect(checkText(FIXTURES, plan.out, plan.code).findings).toEqual([]);
	});
	it('app-shell scaffolds a layout with children', () => {
		const plan = planScaffold('app-shell', {}, FIXTURES);
		expect(plan.out).toMatch(/\(dashboard\)\/layout\.tsx$/);
		expect(plan.code).toContain('{children}');
		expect(checkText(FIXTURES, plan.out, plan.code).findings).toEqual([]);
	});
	it('review judges product pages by the product rubric', () => {
		expect(isProductTarget('http://localhost:3000/team', '', "import { AppListTemplate } from '@/components/ds/templates/app-list';")).toBe(true);
		expect(isProductTarget('http://localhost:3000/pricing', '', "import { PricingTemplate } from '@/components/ds/templates/pricing';")).toBe(false);
	});
	it('counts one brand button per product page', () => {
		const code = `import { AppButton } from '@/components/ds/ui/app-button';\nimport { AppListTemplate } from '@/components/ds/templates/app-list';\nexport default function Page() {\n\treturn <AppListTemplate content={<><AppButton variant="brand">Create key</AppButton><AppButton variant="brand">Create batch</AppButton></>} />;\n}\n`;
		expect(checkText(FIXTURES, 'app/(dashboard)/x/page.tsx', code).findings.map((f) => f.rule)).toContain('single-primary-action');
	});
});

describe('check fixtures (M6)', () => {
	const result = runCheck({ projectRoot: FIXTURES, useBaseline: false });
	it('reports exactly one error per fixture, for the expected rule', () => {
		expect(result.errors).toBe(Object.keys(expected).length);
		for (const [file, rule] of Object.entries(expected)) expect(result.findings.filter((f) => f.file === file).map((f) => f.rule)).toEqual([rule]);
	});
	it('covers every rule', () => expect(new Set(Object.values(expected)).size).toBe(13));
	it('--fix resolves the fixable ones', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-fix-'));
		cpSync(FIXTURES, dir, { recursive: true });
		const fixed = runCheck({ projectRoot: dir, fix: true, useBaseline: false });
		expect(fixed.fixed).toBe(3);
		expect(fixed.findings.map((f) => f.file)).not.toContain('components/raw-color.tsx');
		expect(readFileSync(join(dir, 'components/raw-color.tsx'), 'utf8')).toContain('bg-brand');
		expect(readFileSync(join(dir, 'components/spacing.tsx'), 'utf8')).toContain('p-3');
		expect(readFileSync(join(dir, 'components/copy.tsx'), 'utf8')).toContain('Fast, reliable');
		rmSync(dir, { recursive: true });
	});
	it('--fast runs under 300ms on a single file', () => {
		const text = readFileSync(join(FIXTURES, 'app/primary/page.tsx'), 'utf8');
		const t = performance.now();
		checkText(FIXTURES, 'app/primary/page.tsx', text, { fast: true });
		expect(performance.now() - t).toBeLessThan(300);
	});
	it('flags color classes that are not brand tokens', () => {
		const { findings } = checkText(FIXTURES, 'components/x.tsx', 'export const X = () => <p className="text-brand-primary text-center text-h3 bg-cover border-2 border-line">Search</p>;');
		expect(findings.map((f) => f.message)).toEqual(['Unknown color token `text-brand-primary`']);
	});
	it('knows when Doto applies', () => {
		const words = checkText(FIXTURES, 'components/x.tsx', 'export const X = () => <h2 className="font-data text-h2">Start building</h2>;');
		expect(words.findings.map((f) => f.message)).toEqual(['Doto on words: "Start building"']);
		const figure = checkText(FIXTURES, 'components/x.tsx', 'export const X = () => <span className="text-display text-brand">94%</span>;');
		expect(figure.findings.map((f) => f.message)).toEqual(['Large figure "94%" is not in Doto']);
		const ok = checkText(FIXTURES, 'components/x.tsx', 'export const X = () => <span className="font-data text-stat text-brand">1,000</span>;');
		expect(ok.findings).toEqual([]);
	});
	it('enforces the closed scene list on DotScene', () => {
		const { findings } = checkText(FIXTURES, 'components/x.tsx', "import { DotScene } from '@/components/ds/ui/dot-scene';\nexport const X = () => <DotScene variant=\"fireworks\" />;");
		expect(findings.map((f) => f.rule)).toEqual(['variant-from-list']);
	});
	it('honours ds-override and reports it', () => {
		const { findings, overrides } = checkText(FIXTURES, 'components/x.tsx', '// ds-override: partner co-brand color\nexport const X = () => <div className="bg-[#ff0000]" />;');
		expect(findings).toEqual([]);
		expect(overrides[0].overridden).toBe('partner co-brand color');
	});
});

describe('hooks (M5 logic)', () => {
	it('parses Write, Edit and MultiEdit payloads', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-hook-'));
		writeFileSync(join(dir, 'a.tsx'), 'one two three');
		expect(proposedWrite({ tool_name: 'Write', tool_input: { file_path: join(dir, 'b.tsx'), content: 'x' } }, dir)).toMatchObject({ relPath: 'b.tsx', after: 'x' });
		expect(proposedWrite({ tool_name: 'Edit', tool_input: { file_path: join(dir, 'a.tsx'), old_string: 'two', new_string: '2' } }, dir)?.after).toBe('one 2 three');
		expect(proposedWrite({ tool_name: 'MultiEdit', tool_input: { file_path: join(dir, 'a.tsx'), edits: [{ old_string: 'one', new_string: '1' }, { old_string: 'three', new_string: '3' }] } }, dir)?.after).toBe('1 two 3');
		rmSync(dir, { recursive: true });
	});
	it('blocks a raw color write before it reaches disk', () => {
		const r = preToolUse(FIXTURES, { session_id: 't1', tool_name: 'Write', tool_input: { file_path: join(FIXTURES, 'components/new.tsx'), content: 'export const N = () => <p style={{ color: "#ff0000" }}>Search</p>;' } });
		expect(r.exitCode).toBe(2);
		expect(r.stderr).toMatch(/no-raw-color/);
	});
	it('parses Codex apply_patch: added, updated and moved files', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-patch-'));
		writeFileSync(join(dir, 'a.tsx'), 'line one\nline two\nline three\n');
		const patch = ['*** Begin Patch', '*** Add File: b.tsx', '+export const B = 1;', '+// two', '*** Update File: a.tsx', '@@', ' line one', '-line two', '+line 2', ' line three', '*** Delete File: c.tsx', '*** End Patch'].join('\n');
		const writes = patchWrites(patch, dir);
		expect(writes.map((w) => w.relPath)).toEqual(['b.tsx', 'a.tsx']);
		expect(writes[0].after).toBe('export const B = 1;\n// two');
		expect(writes[1].after).toBe('line one\nline 2\nline three\n');
		rmSync(dir, { recursive: true });
	});
	it('blocks a Codex patch that adds a raw color', () => {
		const patch = ['*** Begin Patch', '*** Add File: components/codex.tsx', '+export const N = () => <p className="text-[#ff0000]">Search</p>;', '*** End Patch'].join('\n');
		const r = preToolUse(FIXTURES, { session_id: 'cx', cwd: FIXTURES, tool_name: 'apply_patch', tool_input: { command: patch } });
		expect(r.exitCode).toBe(2);
		expect(r.stderr).toMatch(/components\/codex\.tsx/);
		expect(r.stderr).toMatch(/no-raw-color/);
	});
	it('denies a Cursor write with the reason for the agent, and keeps it going at stop', () => {
		const r = cursorPreToolUse(FIXTURES, { tool_name: 'Write', tool_input: { file_path: join(FIXTURES, 'components/cur.tsx'), contents: 'export const N = () => <p style={{ color: "#ff0000" }}>Search</p>;' } });
		expect(r.json).toMatchObject({ permission: 'deny' });
		expect(String((r.json as any).agent_message)).toMatch(/no-raw-color/);
		expect(cursorPreToolUse(FIXTURES, { tool_name: 'Write', tool_input: { file_path: join(FIXTURES, 'components/ok.tsx'), contents: 'export const N = () => null;' } }).json).toEqual({ permission: 'allow' });
		expect(typeof cursorStop).toBe('function');
	});
	it('watch reports a saved file with errors, and nothing for files out of scope', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-watch-'));
		writeFileSync(join(dir, 'package.json'), '{}');
		cpSync(join(FIXTURES, 'components/raw-color.tsx'), join(dir, 'components/raw-color.tsx'), { recursive: true });
		const status = {};
		expect(checkChanged(dir, 'components/raw-color.tsx', status)?.errors).toBe(1);
		expect(checkChanged(dir, 'node_modules/x.tsx', status)).toBeUndefined();
		rmSync(dir, { recursive: true });
	});
	it('an override needs a person: approve refuses without a terminal, and the approval clears it', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-approve-'));
		writeFileSync(join(dir, 'package.json'), '{}');
		cpSync(join(FIXTURES, 'components/override.tsx'), join(dir, 'components/override.tsx'), { recursive: true });
		const pending = runCheck({ projectRoot: dir }).findings.filter((f) => f.rule === 'override-approval');
		expect(pending.map((f) => [f.overrideOf, f.overridden])).toEqual([['no-raw-color', 'the agent decided this was fine']]);
		const cli = spawnSync('node', [join(__dirname, '..', 'bin.js'), 'approve'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
		expect(cli.status).not.toBe(0);
		expect(cli.stderr).toMatch(/person at an interactive terminal/);
		writeApprovals(dir, { approvals: [{ key: overrideKey({ file: 'components/override.tsx', rule: 'no-raw-color', overridden: 'the agent decided this was fine' }), file: 'components/override.tsx', rule: 'no-raw-color', reason: 'the agent decided this was fine', at: '' }] });
		expect(runCheck({ projectRoot: dir }).errors).toBe(0);
		rmSync(dir, { recursive: true });
	});
	it('only blocks errors the edit introduces, not legacy ones', () => {
		const r = preToolUse(FIXTURES, { session_id: 't2', tool_name: 'Edit', tool_input: { file_path: join(FIXTURES, 'components/radius.tsx'), old_string: 'Search', new_string: 'Search the web' } });
		expect(r.exitCode ?? 0).toBe(0);
	});
	it('injects item docs once per session', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-inject-'));
		writeFileSync(join(dir, 'package.json'), '{}');
		const payload = { session_id: 'inject', tool_name: 'Write', tool_input: { file_path: join(dir, 'components/x.tsx'), content: "import { Hero } from '@/components/ds/blocks/hero';\nexport const X = () => null;\n" } };
		const first = preToolUse(dir, payload);
		const ctx = (first.json as any).hookSpecificOutput.additionalContext as string;
		expect(ctx).toContain('blocks/hero');
		expect(ctx).not.toMatch(/pricing-table|footer/);
		expect(preToolUse(dir, payload)).toEqual({});
		rmSync(dir, { recursive: true });
	});
	it('prompt hook injects the matched template docs only', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-prompt-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '16.0.0', react: '19.0.0' }, devDependencies: { tailwindcss: '^4' } }));
		const out = userPromptSubmit(dir, { session_id: 'p', prompt: 'build the pricing page' }).stdout ?? '';
		expect(out).toContain('templates/pricing');
		expect(out).not.toContain('templates/landing');
		rmSync(dir, { recursive: true });
	});
	it('prompt hook offers no templates where the components cannot run', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-prompt-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { astro: '^5.0.0' } }));
		expect(userPromptSubmit(dir, { session_id: 'p', prompt: 'build the pricing page' })).toEqual({});
		rmSync(dir, { recursive: true });
	});
});

describe('init', () => {
	it('--dry-run writes nothing', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-init-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', dependencies: { next: '16.0.0', 'tailwind-merge': '3.7.0' } }));
		const out = execFileSync(process.execPath, [join(__dirname, '..', 'bin.js'), 'init', '--dry-run', '--json'], { cwd: dir, encoding: 'utf8' });
		expect(JSON.parse(out).changes.length).toBeGreaterThan(5);
		expect(readdirSync(dir)).toEqual(['package.json']);
		rmSync(dir, { recursive: true });
	});
});

describe('markup files', () => {
	it('checks the styles of an .astro file and nothing else', () => {
		const text = '---\nconst c = "#ff0000";\n---\n<div class="card" style="color: #00ff00">Hi</div>\n<style>\n.card { background: #123456; }\n</style>\n';
		const errors = checkText(FIXTURES, 'src/pages/a.astro', text).findings.filter((f) => f.rule === 'no-raw-color');
		expect(errors.map((f) => f.line).sort()).toEqual([4, 6]);
		expect(checkText(FIXTURES, 'a.css', '.t { letter-spacing: -0.02em; }\n.u { letter-spacing: normal; }').findings.filter((f) => f.rule === 'font-family-from-tokens').length).toBe(1);
	});
});

describe('init on other stacks', () => {
	it('installs only the tokens in an Astro site with plain CSS', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-astro-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', dependencies: { astro: '^5.0.0' } }));
		execFileSync('mkdir', ['-p', join(dir, 'public'), join(dir, 'src', 'pages')]);
		writeFileSync(join(dir, 'public', 'global.css'), '@charset "utf-8";\n:root { --accent: #2563eb; --bg: #fff; }\nbody { color: var(--accent); }\n');
		const out = JSON.parse(execFileSync(process.execPath, [join(__dirname, '..', 'bin.js'), 'init', '--json', '--no-baseline', '--harness', 'claude-code'], { cwd: dir, encoding: 'utf8' }));
		const files = out.changes.map((c: { file: string }) => c.file);
		expect(files).not.toContain('components.json');
		expect(files.some((f: string) => f.endsWith('theme.css') || f.includes('SKILL.md'))).toBe(false);
		expect(readFileSync(join(dir, 'public', 'global.css'), 'utf8').split('\n').slice(0, 2)).toEqual(['@charset "utf-8";', `@import "./${files.find((f: string) => f.endsWith('tokens.css')).split('/')[1]}/tokens.css";`]);
		expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf8')).toContain('Never change copy');
		expect(JSON.parse(readFileSync(join(dir, '.ds', 'config.json'), 'utf8')).rules).toBe('styles');
		rmSync(dir, { recursive: true });
	});
});

describe('apply', () => {
	it('re-points site variables at brand tokens by name, then by value', () => {
		const css = ':root {\n  --accent: #e4572e;\n  --ink: #1b1b1b;\n  --paper: #fdfbf7;\n  --c7: #f0c419;\n  --space: 4px;\n  --font-body: Georgia, serif;\n  --ds-color-brand: #000;\n}\n.a { color: #fff; }';
		const out = remapVariables(css, 'g.css');
		expect(out.css).toContain('--accent: var(--ds-color-brand);');
		expect(out.css).toContain('--ink: var(--ds-color-text-default);');
		expect(out.css).toContain('--paper: var(--ds-color-bg-default);');
		expect(out.css).toContain('--font-body: var(--ds-font-sans);');
		expect(out.css).toContain('--space: 4px;');
		expect(out.css).toContain('--ds-color-brand: #000;');
		expect(out.css).toContain('.a { color: #fff; }');
		expect(out.mappings.find((m) => m.name === '--c7')?.how).toBe('value');
	});
	it('reads roles from common names', () => {
		expect(colorRole('--text-muted', '#666')?.to).toBe('--ds-color-text-muted');
		expect(colorRole('--border', '#ddd')?.to).toBe('--ds-color-border-default');
		expect(colorRole('--on-primary', '#fff')?.to).toBe('--ds-color-text-on-brand');
		expect(colorRole('--x', '#fefefe')?.to).toBe('--ds-color-bg-default');
	});
});

describe('styling only', () => {
	it('an existing site runs only the style rules', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-styles-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '16.0.0', react: '19.0.0' }, devDependencies: { tailwindcss: '^4' } }));
		execFileSync('mkdir', ['-p', join(dir, '.ds'), join(dir, 'app')]);
		writeFileSync(join(dir, '.ds', 'config.json'), JSON.stringify({ mode: 'scoped', rules: 'styles' }));
		const page = 'export default function P() { return <section><h1>We Build Amazing Things For Everyone Who Visits This Site</h1><p style={{ color: "#ff0000" }}>Hi</p></section>; }';
		writeFileSync(join(dir, 'app', 'page.tsx'), page);
		const rules = new Set(runCheck({ projectRoot: dir, useBaseline: false }).findings.map((f) => f.rule));
		expect(rules.has('no-raw-color')).toBe(true);
		for (const r of ['copy-rules', 'template-structure', 'no-unregistered-section']) expect(rules.has(r)).toBe(false);
		rmSync(dir, { recursive: true });
	});
	it('a request to apply the brand points to apply, never to a template', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-apply-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '16.0.0', react: '19.0.0' }, devDependencies: { tailwindcss: '^4' } }));
		for (const prompt of ['Apply the brand design and CLI system to this website', 'apply the Context.dev design system to my site', 'restyle the site with the brand']) {
			const out = userPromptSubmit(dir, { session_id: 'a', prompt }).stdout ?? '';
			expect(out).toContain('apply');
			expect(out).not.toContain('templates/');
		}
		rmSync(dir, { recursive: true });
	});
});

describe('recipes', () => {
	it('cover both surfaces and render states, hover gated to real pointers', () => {
		const recipes = loadRecipes();
		expect(recipes.filter((r) => r.surface === 'marketing').length).toBeGreaterThan(40);
		expect(recipes.filter((r) => r.surface === 'product').length).toBeGreaterThan(40);
		const css = recipeCss(findRecipe('button-primary')!, '.btn');
		expect(css).toContain('.btn {');
		expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\) \{\n  \.btn:hover/);
	});
	it('match marketing elements by what they are, not by utility classes', () => {
		const page = '<section className="hero"><h1 className="text-[52px] font-bold">Hi</h1><p className="text-lg">Sub</p><a href="/x" className="rounded bg-orange-600 px-5 py-3">Go</a><a href="/y" className="rounded border px-5 py-3">More</a></section><nav><a href="/a">A</a></nav><footer><a href="/b">B</a></footer><div className="pricing-card featured">P</div>';
		const kinds = detectComponents('app/page.tsx', page, 'marketing').map((h) => h.recipe);
		expect(detectComponents('c.tsx', '<div className="rounded-xl bg-white p-6 shadow-sm">x</div>', 'marketing')[0]?.recipe).toBe('card');
		expect(kinds).toEqual(['section', 'text-display', 'text-lede', 'button-primary', 'button-secondary', 'header', 'link-nav', 'footer', 'link-footer', 'card-pricing-featured']);
	});
	it('match product elements to the dashboard recipes, and CSS selectors too', () => {
		const page = '<aside className="sidebar"><a href="/">Overview</a></aside><button className="btn btn-outline">Docs</button><table><thead><tr><th>N</th></tr></thead><tbody><tr><td>x</td></tr></tbody></table>';
		expect(detectComponents('app/dashboard/page.tsx', page, 'product').map((h) => h.recipe)).toEqual(['app-sidebar', 'app-sidebar-item', 'app-button-outline', 'app-table', 'app-table-header-cell', 'app-table-row', 'app-table-cell']);
		const css = 'body { margin: 0; }\nnav a { color: red; }\n.btn-secondary { border: 1px solid; }\n.btn:hover { opacity: 1; }\nh2 { font-size: 2rem; }';
		expect(detectComponents('styles.css', css, 'marketing').map((h) => h.recipe)).toEqual(['page-background', 'link-nav', 'button-secondary', 'text-h2']);
	});
});

describe('running harness', () => {
	it('tells the agents apart, Codex first', () => {
		expect(runningHarness({ CLAUDECODE: '1' })).toBe('claude-code');
		expect(runningHarness({ CLAUDECODE: '1', CODEX_THREAD_ID: 't' })).toBe('codex');
		expect(runningHarness({})).toBeUndefined();
	});
});

describe('source', () => {
	it('reads git specs as a clone URL and ref', () => {
		expect(gitRemote('github:acme/ds-cli#main')).toEqual({ url: 'https://github.com/acme/ds-cli.git', ref: 'main' });
		expect(gitRemote('acme/ds-cli')).toEqual({ url: 'https://github.com/acme/ds-cli.git', ref: 'HEAD' });
		expect(gitRemote('git+ssh://git@github.com/acme/ds-cli.git#main')).toEqual({ url: 'ssh://git@github.com/acme/ds-cli.git', ref: 'main' });
		expect(gitRemote('^0.2.0')).toBeUndefined();
		expect(gitRemote('file:../ds')).toBeUndefined();
	});
	it('finds the commit the lockfile pins', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-src-'));
		const sha = 'a'.repeat(40);
		const bin = JSON.parse(readFileSync(join(__dirname, '..', 'ds.config.json'), 'utf8')).bin;
		writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({ packages: { [`node_modules/${bin}`]: { resolved: `git+ssh://git@github.com/acme/ds-cli.git#${sha}` } } }));
		expect(installedCommit(dir)).toBe(sha);
		rmSync(dir, { recursive: true });
	});
});

describe('cli', () => {
	it('every command supports --help', () => {
		for (const c of ['init', 'info', 'resolve', 'scaffold', 'docs', 'add', 'tokens', 'check', 'review', 'diff', 'hook', 'watch', 'approve', 'update', 'apply', 'style']) {
			expect(spawnSync(process.execPath, [join(__dirname, '..', 'bin.js'), c, '--help'], { encoding: 'utf8' }).status).toBe(0);
		}
	});
	it('info --json is valid JSON', () => {
		expect(() => JSON.parse(execFileSync(process.execPath, [join(__dirname, '..', 'bin.js'), 'info', '--json'], { cwd: FIXTURES, encoding: 'utf8' }))).not.toThrow();
	});
});

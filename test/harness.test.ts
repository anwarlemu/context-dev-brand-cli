import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyFixes, checkText, runCheck } from '../src/check/engine.js';
import { planScaffold } from '../src/commands/scaffold.js';
import { preToolUse, userPromptSubmit } from '../src/hooks/handlers.js';
import { proposedWrite } from '../src/hooks/payload.js';
import { resolveIntent } from '../src/lib/intents.js';

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
	it('routes dashboard work out of scope', () => expect(resolveIntent('add a usage chart to the dashboard').kind).toBe('out_of_scope'));
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

describe('check fixtures (M6)', () => {
	const result = runCheck({ projectRoot: FIXTURES, useBaseline: false });
	it('reports exactly one error per fixture, for the expected rule', () => {
		expect(result.errors).toBe(Object.keys(expected).length);
		for (const [file, rule] of Object.entries(expected)) expect(result.findings.filter((f) => f.file === file).map((f) => f.rule)).toEqual([rule]);
	});
	it('covers every rule', () => expect(new Set(Object.values(expected)).size).toBe(12));
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
		writeFileSync(join(dir, 'package.json'), '{}');
		const out = userPromptSubmit(dir, { session_id: 'p', prompt: 'build the pricing page' }).stdout ?? '';
		expect(out).toContain('templates/pricing');
		expect(out).not.toContain('templates/landing');
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

describe('cli', () => {
	it('every command supports --help', () => {
		for (const c of ['init', 'info', 'resolve', 'scaffold', 'docs', 'add', 'tokens', 'check', 'review', 'diff', 'hook']) {
			expect(spawnSync(process.execPath, [join(__dirname, '..', 'bin.js'), c, '--help'], { encoding: 'utf8' }).status).toBe(0);
		}
	});
	it('info --json is valid JSON', () => {
		expect(() => JSON.parse(execFileSync(process.execPath, [join(__dirname, '..', 'bin.js'), 'info', '--json'], { cwd: FIXTURES, encoding: 'utf8' }))).not.toThrow();
	});
});

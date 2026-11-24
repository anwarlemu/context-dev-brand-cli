import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { adapter, paint } from '../../src/design/adapter.js';
import { runDesign, validateOutline } from '../../src/design/index.js';

const ROOT = join(import.meta.dirname, '..', '..');
const OUTLINE = {
	title: 'Acme launch',
	sections: [
		{ type: 'header', copy: { action: 'Start for free' }, items: [{ label: 'Pricing', href: '/pricing' }, { label: 'Docs' }] },
		{ type: 'hero', copy: { title: 'Web data for your agents', accent: 'agents', description: 'Scrape, search and crawl from one API.', primary: 'Start for free', note: 'No card required', secondary: 'Read the docs' } },
		{ type: 'features', copy: { title: 'What it does' }, items: [{ name: 'Scrape', description: 'Any page as Markdown.', tags: 'Markdown | PDFs' }, { name: 'Search', description: 'Ranked results with content.' }] },
		{ type: 'stats', items: [{ value: '42%', label: 'less time on setup at Acme' }] },
		{ type: 'testimonials', copy: { title: 'What teams say' }, items: [{ quote: 'It just works.', name: 'Alex Doe', role: 'Engineer @ Acme' }] },
		{ type: 'faq', copy: { title: 'Questions' }, items: [{ question: 'Is there a free plan?', answer: 'Yes, with monthly credits.' }] },
		{ type: 'blog', copy: { title: 'From the blog' }, items: [{ title: 'Launch week', date: 'October 8, 2026', excerpt: 'Five things we shipped.' }] },
		{ type: 'text', copy: { title: 'Why it matters', body: 'Agents need the live web.' } },
		{ type: 'cta', copy: { title: 'Start building today.', figure: '1,000', 'figure-label': 'free credits', primary: 'Start for free', secondary: 'Read the docs' } },
		{ type: 'footer', copy: { description: 'Web data for agents.', copyright: '© 2026 Acme' }, items: [{ label: 'Privacy', href: '/privacy' }] },
	],
};

describe('page compose', () => {
	it('checks the outline: unknown sections, words and counts are refused', () => {
		const a = adapter();
		expect(() => validateOutline(a, { sections: [{ type: 'carousel' }] })).toThrow(/no section "carousel"/);
		expect(() => validateOutline(a, { sections: [{ type: 'hero', copy: {} }] })).toThrow(/needs "title"/);
		expect(() => validateOutline(a, { sections: [{ type: 'hero', copy: { title: 'x', color: 'red' } }] })).toThrow(/does not take "color"/);
		expect(() => validateOutline(a, { sections: [{ type: 'stats', items: [] }] })).toThrow(/1 to 4 items/);
		expect(validateOutline(a, OUTLINE).sections).toHaveLength(10);
	});
	it('writes a React page that type-checks against the library, and plain HTML with only the outline\'s words', { timeout: 120_000 }, async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'page-'));
		writeFileSync(join(cwd, 'outline.json'), JSON.stringify(OUTLINE));
		const out: string[] = [];
		const code = await runDesign(['page', 'compose', 'outline.json', '-o', 'site'], adapter(), { cwd, bin: 'x', out: (s) => out.push(s), err: (s) => out.push(s), paint });
		expect(code, out.join('\n')).toBe(0);
		const tsx = readFileSync(join(cwd, 'site', 'page.tsx'), 'utf8');
		const html = readFileSync(join(cwd, 'site', 'index.html'), 'utf8');
		for (const s of OUTLINE.sections) for (const v of [...Object.values(s.copy ?? {}), ...(s.items ?? []).flatMap((i) => Object.values(i))]) {
			if (v.startsWith('/')) continue;
			for (const part of v.split('|').map((x) => x.trim())) {
				expect(tsx, part).toContain(JSON.stringify(part).slice(1, -1));
				expect(html.replace(/<[^>]+>/g, ''), part).toContain(part.replace(/&/g, '&amp;'));
			}
		}
		// Type-checked inside the repo, against the registry's own components.
		const dir = join(ROOT, 'registry', '.page-check');
		mkdirSync(dir, { recursive: true });
		try {
			writeFileSync(join(dir, 'page.tsx'), tsx);
			writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ extends: '../../tsconfig.registry.json', compilerOptions: { baseUrl: '../..', noEmit: true }, include: ['page.tsx', '../../registry/**/*.d.ts'] }));
			execFileSync(process.execPath, [join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(dir, 'tsconfig.json')], { stdio: 'pipe' });
		} catch (err) {
			throw new Error(String((err as { stdout?: Buffer }).stdout ?? err));
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

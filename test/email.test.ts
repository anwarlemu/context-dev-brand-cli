import { describe, expect, it } from 'vitest';
import { EMAILS, emailHtml, emailWords, type EmailKind } from '../src/assets/email.js';

describe('emails', () => {
	for (const kind of Object.keys(EMAILS) as EmailKind[]) it(`${kind}: every word passed is written, nothing else, in tables`, () => {
		const w = emailWords(kind, {}, true);
		const html = emailHtml(kind, w, { logo: 'logo.png', brand: 'Acme' });
		const text = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
		for (const [k, v] of Object.entries(w)) if (!k.endsWith('href') && !k.endsWith('url')) for (const part of v.split('|').flatMap((x) => x.split(':')).map((x) => x.trim()).filter(Boolean)) expect(text, `${kind} ${k}`).toContain(part);
		const words = new Set(Object.values(w).join(' ').toLowerCase().match(/[a-z]+/g));
		for (const word of text.replace(/^.*?<body/s, '').toLowerCase().match(/[a-z]+/g) ?? []) if (!['acme'].includes(word)) expect(words.has(word), `${kind}: "${word}" was not passed`).toBe(true);
		expect(html).toContain('role="presentation"');
		expect(html).not.toMatch(/<div|flex|grid/);
	});
	it('refuses missing and unknown words, and links that are not links', () => {
		expect(() => emailWords('receipt', { title: 'x' })).toThrow(/needs --items/);
		expect(() => emailWords('newsletter', { title: 'x', items: 'a', color: 'red' })).toThrow(/does not take "color"/);
		expect(() => emailWords('password-reset', { title: 'x', body: 'y', cta: 'Go', 'cta-href': 'javascript:alert(1)' })).toThrow(/full link/);
	});
});

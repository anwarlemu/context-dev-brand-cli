import { colorHex } from '../lib/brand.js';

// Emails as plain HTML tables with inline styles, the form mail clients keep (Gmail, Outlook, Apple Mail): a 600 px
// column, the brand's colors as hex from the tokens, the brand sans with system fallbacks, a pill button in the brand
// blue. The brand has no email designs of its own, so these are derived only from its tokens and its site's parts
// (the pill button, the white card in a hairline, the muted caption); brand/assets/email.md says so. Only the words
// passed are written.

export type EmailKind = 'newsletter' | 'announcement' | 'receipt' | 'password-reset';
type Slot = { id: string; required?: boolean; description: string };
export const EMAILS: Record<EmailKind, { description: string; slots: Slot[]; sample: Record<string, string> }> = {
	newsletter: {
		description: 'A newsletter: a title, a line, sections ("Heading: text" with | between) and a button.',
		slots: [{ id: 'title', required: true, description: 'the subject line as a heading' }, { id: 'intro', description: 'a line under it' }, { id: 'items', required: true, description: '"Heading: text" sections with | between' }, { id: 'cta', description: 'the button' }, { id: 'cta-href', description: 'where it goes' }, { id: 'footer', description: 'the address and why they get this' }],
		sample: { title: 'What shipped in October', intro: 'Three things that make scraping faster.', items: 'Browser profiles: log in once and reuse the session. | Batches: scrape thousands of pages with one call. | Webhooks: hear when a crawl is done.', cta: 'Read the changelog', 'cta-href': 'https://acme.com/changelog', footer: 'Acme, 123 Market Street, San Francisco. You get this because you signed up at acme.com.' },
	},
	announcement: {
		description: 'One announcement: a label, a title, a paragraph, an optional header picture and a button.',
		slots: [{ id: 'badge', description: 'a short label' }, { id: 'title', required: true, description: 'the heading' }, { id: 'body', required: true, description: 'the paragraph' }, { id: 'image-url', description: 'a hosted header picture (make one with image email-header)' }, { id: 'cta', description: 'the button' }, { id: 'cta-href', description: 'where it goes' }, { id: 'footer', description: 'the address line' }],
		sample: { badge: 'New', title: 'Browser profiles are here', body: 'Log in once and reuse the session on every scrape, so pages behind a login come back whole.', cta: 'Try it', 'cta-href': 'https://acme.com/profiles', footer: 'Acme, 123 Market Street, San Francisco.' },
	},
	receipt: {
		description: 'A receipt: a title, the order number and date, lines ("Item: amount" with | between) and the total.',
		slots: [{ id: 'title', required: true, description: 'the heading' }, { id: 'number', description: 'the order or invoice number' }, { id: 'date', description: 'the date' }, { id: 'items', required: true, description: '"Item: amount" lines with | between' }, { id: 'total', required: true, description: 'the total line, "label: amount"' }, { id: 'footer', description: 'the address and a support line' }],
		sample: { title: 'Your receipt', number: 'Invoice 2026-0142', date: 'October 8, 2026', items: 'Developer plan: $49.00 | Extra credits: $10.00', total: 'Total: $59.00', footer: 'Acme, 123 Market Street, San Francisco. Questions? billing@acme.com' },
	},
	'password-reset': {
		description: 'A password reset: a title, a line, the button and a note for people who did not ask.',
		slots: [{ id: 'title', required: true, description: 'the heading' }, { id: 'body', required: true, description: 'the line' }, { id: 'cta', required: true, description: 'the button' }, { id: 'cta-href', required: true, description: 'the reset link' }, { id: 'note', description: 'what to do if they did not ask' }, { id: 'footer', description: 'the address line' }],
		sample: { title: 'Reset your password', body: 'Use the button below to choose a new password. The link works for one hour.', cta: 'Reset password', 'cta-href': 'https://acme.com/reset?token=example', note: 'If you did not ask for this, you can ignore this email.', footer: 'Acme, 123 Market Street, San Francisco.' },
	},
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const hex = (t: string) => colorHex(t)!.slice(0, 7);

/** Checks the words: known slots, needed ones present. */
export function emailWords(kind: EmailKind, given: Record<string, string | undefined>, sample = false): Record<string, string> {
	const spec = EMAILS[kind];
	const out: Record<string, string> = sample ? { ...spec.sample } : {};
	for (const [k, v] of Object.entries(given)) {
		if (v === undefined) continue;
		if (!spec.slots.some((s) => s.id === k)) throw new Error(`A ${kind} email does not take "${k}". It takes ${spec.slots.map((s) => s.id).join(', ')}.`);
		out[k] = v;
	}
	for (const s of spec.slots) if (s.required && !out[s.id]?.trim()) throw new Error(`A ${kind} email needs --${s.id}. Nothing is made up for it; --sample fills in sample copy.`);
	for (const k of ['cta-href', 'image-url']) if (out[k] && !/^(https?:|mailto:)/.test(out[k]!)) throw new Error(`--${k} takes a full link (https://...), not "${out[k]}".`);
	if (out.cta && !out['cta-href']) throw new Error('A button needs --cta-href.');
	return out;
}

/** The email's HTML. `logo` is the hosted logo's address (or a file name beside the email). */
export function emailHtml(kind: EmailKind, w: Record<string, string>, opts: { logo: string; brand: string }): string {
	const c = { bg: hex('bg-frame'), card: hex('white'), ink: hex('text-default'), muted: hex('text-muted'), brand: hex('brand'), onBrand: hex('white'), line: hex('neutral-10') };
	const font = "'Rethink Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
	const p = (text: string, style = '') => `<p style="margin:0 0 16px;font-family:${font};font-size:16px;line-height:24px;color:${c.ink};${style}">${esc(text)}</p>`;
	const h1 = (text: string) => `<h1 style="margin:0 0 12px;font-family:${font};font-size:28px;line-height:34px;font-weight:500;letter-spacing:-0.02em;color:${c.brand};">${esc(text)}</h1>`;
	const button = (label?: string, href?: string) => (label && href ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:999px;background:${c.brand};"><a href="${esc(href)}" style="display:inline-block;padding:12px 22px;font-family:${font};font-size:15px;font-weight:500;color:${c.onBrand};text-decoration:none;border-radius:999px;">${esc(label)}</a></td></tr></table>` : '');
	const badge = (text?: string) => (text ? `<p style="margin:0 0 12px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${c.brand};color:${c.onBrand};font-family:'Courier New',monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${esc(text)}</span></p>` : '');
	const list = (v: string) => v.split('|').map((x) => x.trim()).filter(Boolean).map((x) => {
		const at = x.indexOf(':');
		return at > 0 ? [x.slice(0, at).trim(), x.slice(at + 1).trim()] : [x, ''];
	});
	let body = '';
	if (kind === 'newsletter') {
		body = h1(w.title!) + (w.intro ? p(w.intro, `color:${c.muted};`) : '') + list(w.items!).map(([h, t]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${c.line};"><tr><td style="padding:16px 0;"><h2 style="margin:0 0 6px;font-family:${font};font-size:18px;line-height:24px;font-weight:500;color:${c.ink};">${esc(h!)}</h2>${t ? p(t, 'margin:0;') : ''}</td></tr></table>`).join('') + button(w.cta, w['cta-href']);
	} else if (kind === 'announcement') {
		body = (w['image-url'] ? `<img src="${esc(w['image-url'])}" width="552" alt="" style="display:block;width:100%;height:auto;margin:0 0 24px;border-radius:12px;">` : '') + badge(w.badge) + h1(w.title!) + p(w.body!) + button(w.cta, w['cta-href']);
	} else if (kind === 'receipt') {
		const rows = list(w.items!).map(([item, amount]) => `<tr><td style="padding:10px 0;border-top:1px solid ${c.line};font-family:${font};font-size:15px;color:${c.ink};">${esc(item!)}</td><td align="right" style="padding:10px 0;border-top:1px solid ${c.line};font-family:${font};font-size:15px;color:${c.ink};">${esc(amount!)}</td></tr>`).join('');
		body = h1(w.title!) + ((w.number || w.date) ? p([w.number, w.date].filter(Boolean).join(' · '), `color:${c.muted};font-size:14px;`) : '') + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}${list(w.total!).map(([label, amount]) => `<tr><td style="padding:12px 0;border-top:1px solid ${c.ink};font-family:${font};font-size:16px;font-weight:500;color:${c.ink};">${esc(label!)}</td><td align="right" style="padding:12px 0;border-top:1px solid ${c.ink};font-family:${font};font-size:16px;font-weight:500;color:${c.ink};">${esc(amount!)}</td></tr>`).join('')}</table>`;
	} else {
		body = h1(w.title!) + p(w.body!) + button(w.cta, w['cta-href']) + (w.note ? p(w.note, `color:${c.muted};font-size:14px;`) : '');
	}
	const footer = w.footer ? `<p style="margin:24px 0 0;font-family:${font};font-size:12px;line-height:18px;color:${c.muted};">${esc(w.footer)}</p>` : '';
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(w.title ?? opts.brand)}</title>
</head>
<body style="margin:0;padding:0;background:${c.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="padding:0 0 20px;"><img src="${esc(opts.logo)}" height="24" alt="${esc(opts.brand)}" style="display:block;height:24px;width:auto;border:0;"></td></tr>
<tr><td style="background:${c.card};border-radius:16px;border:1px solid ${c.line};padding:24px;">
${body}
</td></tr>
<tr><td style="padding:0 8px;">${footer}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}

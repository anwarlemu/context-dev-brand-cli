import type { ComposeBlock, DesignState, TemplateInfo } from '../design/index.js';
import { palettes } from './og.js';

// Graphics no share-image template covers (a quote card, a pricing card, an event, a certificate, a business card, an
// ad), each made only from the brand's blocks (src/assets/compose.ts) on the grid, so they keep every rule the blocks
// keep. They behave as templates: `design new quote-card`, `image quote-card`, the words as flags. Each lays its blocks
// out by the shape of the size it is drawn at. Nothing here is drawn from a source the brand does not have: the layouts
// are the share images' (logo in a corner, headline, a picture or burst in dots), arranged for the job.

type Shape = 'wide' | 'strip' | 'square' | 'tall' | 'tiny';
type Built = Pick<DesignState, 'blocks' | 'copy'> & Partial<Pick<DesignState, 'grid' | 'theme' | 'layers'>>;
export type Recipe = {
	id: string;
	label: string;
	description: string;
	sizes: string[];
	theme: string;
	copy: { id: string; required?: boolean }[];
	images?: { id: string; required?: boolean }[];
	sample: Record<string, string>;
	build(copy: Record<string, string>, shape: Shape): Built;
};

const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
const b = (id: string, type: string, a: ComposeBlock['at']): ComposeBlock => ({ id, type, at: a });
const words = (pairs: [string, string, string | undefined][]) => Object.fromEntries(pairs.filter(([, , v]) => v?.trim()).map(([id, slot, v]) => [`${id}.${slot}`, v!]));
const has = (c: Record<string, string>, k: string) => !!c[k]?.trim();
const SOCIAL = ['square', 'portrait', 'landscape', 'og', 'linkedin', 'story', 'facebook'];

export function shapeOf(w: number, h: number): Shape {
	const r = w / h;
	return r >= 2.2 ? 'strip' : r >= 1.25 ? 'wide' : r <= 0.8 ? 'tall' : 'square';
}

export const RECIPES: Recipe[] = [
	{
		id: 'quote-card', label: 'Quote card', description: 'A quote with the open quote mark, who said it, and the logo.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'quote', required: true }, { id: 'attribution' }], sample: { quote: 'We cut our setup from a week to an afternoon.', attribution: 'Head of growth, Acme' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', s === 'tall' ? at(0, 0, 5, 1) : at(0, 0, 4, 1)), b('quote', 'quote', s === 'wide' ? at(0, 2, 11, 9) : s === 'tall' ? at(0, 3, 12, 6) : at(0, 2, 12, 8))],
			copy: words([['quote', 'text', c.quote], ['quote', 'attribution', c.attribution]]),
		}),
	},
	{
		id: 'stat-card', label: 'Stat card', description: 'A big number in dots, what it counts, a line of context, and the burst.', sizes: SOCIAL, theme: 'Blue',
		copy: [{ id: 'stat', required: true }, { id: 'label', required: true }, { id: 'headline' }], sample: { stat: '42%', label: 'less time on setup', headline: 'Acme moved its crawling in a day.' },
		build: (c, s) => ({
			blocks: [b('burst', 'burst', s === 'tall' ? at(3, 7, 9, 5) : at(6, 2, 6, 10)), b('logo', 'logo', at(0, 0, 4, 1)), b('stat', 'stat', s === 'tall' ? at(0, 2, 12, 4) : at(0, 2, 7, 5)), ...(has(c, 'headline') ? [b('headline', 'body', s === 'tall' ? at(0, 6, 10, 2) : at(0, 8, 6, 3))] : [])],
			copy: words([['stat', 'value', c.stat], ['stat', 'label', c.label], ['headline', 'text', c.headline]]),
		}),
	},
	{
		id: 'launch-card', label: 'Launch card', description: 'A release or changelog entry: a label, what shipped, a line, and a picture in dots.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'badge' }, { id: 'headline', required: true }, { id: 'body' }, { id: 'date' }], images: [{ id: 'picture' }], sample: { badge: 'New', headline: 'Browser profiles', body: 'Log in once, reuse the session on every scrape.', date: 'October 8, 2026' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), ...(has(c, 'badge') ? [b('badge', 'badge', s === 'tall' ? at(0, 2, 4, 1) : at(0, 2, 3, 1))] : []), b('headline', 'headline', s === 'wide' ? at(0, 3, 6, 4) : at(0, 3, 12, 2)), ...(has(c, 'body') ? [b('body', 'body', s === 'wide' ? at(0, 7, 6, 2) : at(0, 5, 11, 1))] : []), ...(has(c, 'date') ? [b('date', 'body', s === 'wide' ? at(0, 10, 5, 1) : at(0, 11, 6, 1))] : []), b('picture', 'picture', s === 'wide' ? at(7, 1, 5, 10) : at(2, 6, 8, 5))],
			copy: words([['badge', 'text', c.badge], ['headline', 'text', c.headline], ['body', 'text', c.body], ['date', 'text', c.date]]),
		}),
	},
	{
		id: 'feature-card', label: 'Feature card', description: 'A feature: its name, a line, three points with their dot glyphs, and a picture in dots.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'headline', required: true }, { id: 'body' }, { id: 'items' }], images: [{ id: 'picture' }], sample: { headline: 'Scrape any page', body: 'Markdown, HTML or screenshots in one request.', items: 'PDFs and pages | Structured fields | Screenshots' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('headline', 'headline', s === 'wide' ? at(0, 2, 6, 3) : at(0, 2, 12, 2)), ...(has(c, 'body') ? [b('body', 'body', s === 'wide' ? at(0, 5, 6, 2) : at(0, 4, 11, 1))] : []), ...(has(c, 'items') ? [b('items', 'list', s === 'wide' ? at(0, 8, 6, 4) : at(0, 6, 6, 5))] : []), b('picture', 'picture', s === 'wide' ? at(7, 1, 5, 10) : at(6, 6, 6, 6))],
			copy: words([['headline', 'text', c.headline], ['body', 'text', c.body], ['items', 'items', c.items]]),
		}),
	},
	{
		id: 'comparison-card', label: 'Comparison card', description: 'Two sides with a heading and points each: before and after, us and the old way.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'headline' }, { id: 'left-title', required: true }, { id: 'left-items', required: true }, { id: 'right-title', required: true }, { id: 'right-items', required: true }],
		sample: { headline: 'Two ways to get web data', 'left-title': 'Your own crawlers', 'left-items': 'Proxies to run | Breaks on layout changes | Weeks to build', 'right-title': 'One API', 'right-items': 'No proxies | Clean Markdown | Minutes to start' },
		build: (c, s) => {
			const tall = s === 'tall';
			return {
				blocks: [b('logo', 'logo', at(0, 0, 4, 1)), ...(has(c, 'headline') ? [b('headline', 'headline', at(0, 1, 12, 2))] : []), b('divider', 'divider', tall ? at(0, 7, 12, 1) : at(0, 3, 12, 1)), b('left-title', 'body', tall ? at(0, 4, 12, 1) : at(0, 4, 6, 1)), b('left', 'list', tall ? at(0, 5, 12, 2) : at(0, 5, 6, 6)), b('right-title', 'body', tall ? at(0, 8, 12, 1) : at(6, 4, 6, 1)), b('right', 'list', tall ? at(0, 9, 12, 3) : at(6, 5, 6, 6))],
				copy: words([['headline', 'text', c.headline], ['left-title', 'text', c['left-title']], ['left', 'items', c['left-items']], ['right-title', 'text', c['right-title']], ['right', 'items', c['right-items']]]),
			};
		},
	},
	{
		id: 'pricing-card', label: 'Pricing card', description: 'A plan: its name, the price in dots, what it includes, and a button.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'plan', required: true }, { id: 'price', required: true }, { id: 'period' }, { id: 'items' }, { id: 'cta' }], sample: { plan: 'Developer', price: '$49', period: 'a month', items: '10,000 credits | 10 concurrent requests | Email support', cta: 'Start for free' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('plan', 'headline', s === 'wide' ? at(0, 2, 7, 2) : at(0, 2, 8, 2)), b('price', 'stat', s === 'wide' ? at(0, 4, 6, 4) : at(0, 4, 8, 3)), ...(has(c, 'items') ? [b('items', 'list', s === 'wide' ? at(7, 3, 5, 6) : at(0, 7, 10, 3))] : []), ...(has(c, 'cta') ? [b('cta', 'button', at(0, 10, 5, 2))] : [])],
			copy: words([['plan', 'text', c.plan], ['price', 'value', c.price], ['price', 'label', c.period], ['items', 'items', c.items], ['cta', 'text', c.cta]]),
		}),
	},
	{
		id: 'event-card', label: 'Event card', description: 'A webinar or meetup: what kind, its title, the date, who speaks (a role, never a made-up name), and the burst.', sizes: SOCIAL, theme: 'Blue',
		copy: [{ id: 'badge' }, { id: 'headline', required: true }, { id: 'date', required: true }, { id: 'speaker' }], sample: { badge: 'Webinar', headline: 'Scraping at scale without proxies', date: 'Thursday, October 8, 2026 at 10am PT', speaker: 'With the engineering team at Acme' },
		build: (c, s) => ({
			blocks: [b('burst', 'burst', s === 'tall' ? at(3, 7, 9, 5) : at(7, 2, 5, 10)), b('logo', 'logo', at(0, 0, 4, 1)), ...(has(c, 'badge') ? [b('badge', 'badge', at(0, 2, 3, 1))] : []), b('headline', 'headline', s === 'tall' ? at(0, 3, 12, 3) : at(0, 3, 7, 4)), b('date', 'body', s === 'tall' ? at(0, 6, 10, 1) : at(0, 8, 7, 1)), ...(has(c, 'speaker') ? [b('speaker', 'body', s === 'tall' ? at(0, 7, 8, 1) : at(0, 9, 7, 1))] : [])],
			copy: words([['badge', 'text', c.badge], ['headline', 'text', c.headline], ['date', 'text', c.date], ['speaker', 'text', c.speaker]]),
		}),
	},
	{
		id: 'hiring-card', label: 'Hiring card', description: 'We are hiring: a headline, the open roles with their dot glyphs, and a button.', sizes: SOCIAL, theme: 'Paper',
		copy: [{ id: 'headline', required: true }, { id: 'roles', required: true }, { id: 'cta' }], sample: { headline: 'We are hiring', roles: 'Founding engineer | Developer advocate | Product designer', cta: 'See open roles' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('headline', 'headline', at(0, 2, 12, 3)), b('roles', 'list', s === 'wide' ? at(0, 5, 7, 5) : at(0, 5, 12, 4)), ...(has(c, 'cta') ? [b('cta', 'button', s === 'wide' ? at(0, 10, 5, 2) : at(0, 10, 6, 2))] : []), ...(s === 'wide' ? [b('burst', 'burst', at(8, 4, 4, 8))] : [])],
			copy: words([['headline', 'text', c.headline], ['roles', 'items', c.roles], ['cta', 'text', c.cta]]),
		}),
	},
	{
		id: 'screenshot', label: 'Framed screenshot', description: 'A screenshot in the site\'s window, with a headline and a line.', sizes: [...SOCIAL, 'x-banner'], theme: 'Mist',
		copy: [{ id: 'headline' }, { id: 'body' }], images: [{ id: 'screenshot', required: true }], sample: { headline: 'Every page as clean Markdown' },
		build: (c, s) => ({
			grid: s === 'strip' ? { cols: 12, rows: 6 } : undefined,
			blocks: s === 'strip'
				? [b('logo', 'logo', at(4, 0, 3, 1)), ...(has(c, 'headline') ? [b('headline', 'headline', at(4, 1, 4, 3))] : []), ...(has(c, 'body') ? [b('body', 'body', at(4, 4, 4, 1))] : []), b('screenshot', 'screenshot', at(8, 0, 4, 6))]
				: [b('logo', 'logo', at(0, 0, 4, 1)), ...(has(c, 'headline') ? [b('headline', 'headline', s === 'wide' ? at(0, 1, 12, 2) : at(0, 1, 12, 2))] : []), ...(has(c, 'body') ? [b('body', 'body', at(0, 3, 12, 1))] : []), b('screenshot', 'screenshot', s === 'wide' ? at(1, 4, 10, 8) : at(0, 4, 12, 8))],
			copy: words([['headline', 'text', c.headline], ['body', 'text', c.body]]),
		}),
	},
	{
		id: 'before-after', label: 'Before and after', description: 'Two screenshots side by side, each with its label.', sizes: SOCIAL, theme: 'Mist',
		copy: [{ id: 'headline' }, { id: 'before', required: true }, { id: 'after', required: true }], images: [{ id: 'before-shot', required: true }, { id: 'after-shot', required: true }], sample: { headline: 'From HTML to Markdown', before: 'Before', after: 'After' },
		build: (c, s) => {
			const tall = s === 'tall' || s === 'square';
			return {
				blocks: [b('logo', 'logo', at(0, 0, 4, 1)), ...(has(c, 'headline') ? [b('headline', 'headline', at(0, 1, 12, 2))] : []), b('before', 'badge', tall ? at(0, 3, 12, 1) : at(0, 3, 6, 1)), b('before-shot', 'screenshot', tall ? at(0, 4, 12, 3) : at(0, 4, 6, 8)), b('after', 'badge', tall ? at(0, 8, 12, 1) : at(6, 3, 6, 1)), b('after-shot', 'screenshot', tall ? at(0, 9, 12, 3) : at(6, 4, 6, 8))],
				copy: words([['headline', 'text', c.headline], ['before', 'text', c.before], ['after', 'text', c.after]]),
			};
		},
	},
	{
		id: 'ad', label: 'Display ad', description: 'An ad at any IAB size: the logo, a headline and a button, laid out by its shape.', sizes: ['ad-300x250', 'ad-336x280', 'ad-728x90', 'ad-300x600', 'ad-320x50', 'ad-160x600', 'ad-970x250', 'square', 'story', 'facebook'], theme: 'Blue',
		copy: [{ id: 'headline', required: true }, { id: 'cta' }], sample: { headline: 'Web data for your agents', cta: 'Start free' },
		build: (c, s) => {
			const cta = has(c, 'cta');
			const blocks = s === 'strip' || s === 'tiny'
				? [b('logo', 'logo', at(0, 0, 3, 6)), b('headline', 'headline', at(3, 0, cta ? 6 : 9, 6)), ...(cta ? [b('cta', 'button', at(9, 0, 3, 6))] : [])]
				: s === 'tall'
					? [b('logo', 'mark', at(0, 0, 12, 2)), b('headline', 'headline', at(0, 3, 12, 4)), b('burst', 'burst', at(0, 7, 12, 3)), ...(cta ? [b('cta', 'button', at(0, 10, 12, 2))] : [])]
					: [b('logo', 'logo', at(0, 0, 6, 2)), b('headline', 'headline', at(0, 3, 12, 5)), ...(cta ? [b('cta', 'button', at(0, 9, 8, 3))] : [])];
			return { grid: s === 'strip' || s === 'tiny' ? { cols: 12, rows: 6 } : undefined, blocks, copy: words([['headline', 'text', c.headline], ['cta', 'text', c.cta]]) };
		},
	},
	{
		id: 'background', label: 'Call background or wallpaper', description: 'The brand\'s dots for a video call, a desktop or a phone, the logo where nothing covers it.', sizes: ['meeting', 'desktop', 'phone-wallpaper', 'youtube', 'landscape'], theme: 'Night',
		copy: [{ id: 'headline' }], images: [{ id: 'picture' }], sample: {},
		build: (c, s) => ({
			blocks: [b('field', 'field', at(0, 0, 12, 12)), ...(s === 'tall' ? [b('picture', 'picture', at(1, 2, 10, 7))] : [b('burst', 'burst', at(8, 0, 4, 12))]), b('logo', 'logo', s === 'tall' ? at(3, 10, 6, 2) : at(0, 0, 4, 2)), ...(has(c, 'headline') ? [b('headline', 'body', s === 'tall' ? at(1, 9, 10, 1) : at(0, 2, 4, 1))] : [])],
			copy: words([['headline', 'text', c.headline]]),
		}),
	},
	{
		id: 'one-pager', label: 'One-pager', description: 'A printable page: the logo, a headline, a paragraph, points, a figure and a quote.', sizes: ['a4', 'letter'], theme: 'Paper',
		copy: [{ id: 'headline', required: true }, { id: 'body' }, { id: 'items' }, { id: 'stat' }, { id: 'stat-label' }, { id: 'quote' }, { id: 'attribution' }, { id: 'footer' }],
		sample: { headline: 'Web data for your agents', body: 'One API to scrape, search and crawl the live web, with every page returned as clean Markdown.', items: 'Scrape any page | Crawl a whole site | Search the web | Watch pages for changes', stat: '42%', 'stat-label': 'less time on setup at Acme', quote: 'We cut our setup from a week to an afternoon.', attribution: 'Head of growth, Acme', footer: 'acme.com' },
		build: (c) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('headline', 'headline', at(0, 1, 12, 2)), ...(has(c, 'body') ? [b('body', 'body', at(0, 3, 10, 1))] : []), ...(has(c, 'items') ? [b('items', 'list', at(0, 5, 6, 3))] : []), ...(has(c, 'stat') ? [b('stat', 'stat', at(7, 5, 5, 3))] : []), ...(has(c, 'quote') ? [b('quote', 'quote', at(0, 8, 12, 3))] : []), ...(has(c, 'footer') ? [b('footer', 'body', at(0, 11, 6, 1))] : [])],
			copy: words([['headline', 'text', c.headline], ['body', 'text', c.body], ['items', 'items', c.items], ['stat', 'value', c.stat], ['stat', 'label', c['stat-label']], ['quote', 'text', c.quote], ['quote', 'attribution', c.attribution], ['footer', 'text', c.footer]]),
		}),
	},
	{
		id: 'report-cover', label: 'Report cover', description: 'The cover of a report or case study: the logo, a title, a line, a date and the burst.', sizes: ['a4', 'letter', 'portrait'], theme: 'Blue',
		copy: [{ id: 'headline', required: true }, { id: 'body' }, { id: 'date' }], sample: { headline: 'The state of web data for agents', body: 'What we learned from a year of scraping.', date: '2026' },
		build: (c) => ({
			blocks: [b('burst', 'burst', at(2, 6, 10, 6)), b('logo', 'logo', at(0, 0, 4, 1)), b('headline', 'headline', at(0, 2, 11, 3)), ...(has(c, 'body') ? [b('body', 'body', at(0, 5, 9, 1))] : []), ...(has(c, 'date') ? [b('date', 'body', at(0, 11, 8, 1))] : [])],
			copy: words([['headline', 'text', c.headline], ['body', 'text', c.body], ['date', 'text', c.date]]),
		}),
	},
	{
		id: 'letterhead', label: 'Letterhead', description: 'A page for letters: the logo at the top, the address and contact lines at the foot, the rest left for the letter.', sizes: ['a4', 'letter'], theme: 'Paper',
		copy: [{ id: 'address' }, { id: 'contact' }], sample: { address: '123 Market Street, San Francisco, CA', contact: 'hello@acme.com · acme.com' },
		build: (c) => ({
			blocks: [b('logo', 'logo', at(0, 0, 3, 1)), b('rule', 'divider', at(0, 10, 12, 1)), ...(has(c, 'address') ? [b('address', 'body', at(0, 11, 6, 1))] : []), ...(has(c, 'contact') ? [b('contact', 'body', at(6, 11, 6, 1))] : [])],
			copy: words([['address', 'text', c.address], ['contact', 'text', c.contact]]),
		}),
	},
	{
		id: 'certificate', label: 'Certificate', description: 'A certificate: what for, who to, a line, the date and who signs (a role).', sizes: ['a4', 'letter', 'landscape', 'desktop'], theme: 'Paper',
		copy: [{ id: 'title', required: true }, { id: 'recipient', required: true }, { id: 'body' }, { id: 'date' }, { id: 'signed' }], sample: { title: 'Certificate of completion', recipient: 'Alex Doe', body: 'Finished the web data for agents course.', date: 'October 8, 2026', signed: 'Head of education, Acme' },
		build: (c, s) => ({
			blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('title', 'badge', at(0, 2, 6, 1)), b('recipient', 'headline', s === 'tall' ? at(0, 3, 12, 3) : at(0, 3, 12, 3)), ...(has(c, 'body') ? [b('body', 'body', at(0, 6, 10, 1))] : []), b('rule', 'divider', at(0, 9, 12, 1)), ...(has(c, 'date') ? [b('date', 'body', at(0, 10, 5, 1))] : []), ...(has(c, 'signed') ? [b('signed', 'body', at(7, 10, 5, 1))] : [])],
			copy: words([['title', 'text', c.title], ['recipient', 'text', c.recipient], ['body', 'text', c.body], ['date', 'text', c.date], ['signed', 'text', c.signed]]),
		}),
	},
	{
		id: 'business-card', label: 'Business card', description: 'A business card at print size with bleed: the logo, a name, a role and how to reach them.', sizes: ['business-card'], theme: 'Paper',
		copy: [{ id: 'name', required: true }, { id: 'role' }, { id: 'contact' }], sample: { name: 'Alex Doe', role: 'Developer advocate', contact: 'alex@acme.com' },
		build: (c) => ({
			grid: { cols: 12, rows: 6 },
			blocks: [b('logo', 'logo', at(0, 0, 6, 2)), b('name', 'headline', at(0, 2, 10, 2)), ...(has(c, 'role') ? [b('role', 'body', at(0, 4, 10, 1))] : []), ...(has(c, 'contact') ? [b('contact', 'body', at(0, 5, 10, 1))] : [])],
			copy: words([['name', 'text', c.name], ['role', 'text', c.role], ['contact', 'text', c.contact]]),
		}),
	},
	{
		id: 'name-tag', label: 'Event badge or name tag', description: 'A badge for an event: the logo, a name, a role and the event.', sizes: ['name-tag', 'event-badge'], theme: 'Blue',
		copy: [{ id: 'name', required: true }, { id: 'role' }, { id: 'event' }], sample: { name: 'Alex Doe', role: 'Engineer, Acme', event: 'Agents Summit 2026' },
		build: (c) => ({
			blocks: [b('logo', 'logo', at(0, 0, 6, 2)), b('name', 'headline', at(0, 4, 12, 4)), ...(has(c, 'role') ? [b('role', 'body', at(0, 8, 12, 2))] : []), ...(has(c, 'event') ? [b('event', 'badge', at(0, 10, 8, 2))] : [])],
			copy: words([['name', 'text', c.name], ['role', 'text', c.role], ['event', 'text', c.event]]),
		}),
	},
	{
		id: 'email-header', label: 'Email header', description: 'The top of an email: the logo, a headline and a picture in dots.', sizes: ['email'], theme: 'Paper',
		copy: [{ id: 'headline', required: true }], images: [{ id: 'picture' }], sample: { headline: 'What shipped in October' },
		build: (c) => ({ grid: { cols: 12, rows: 6 }, blocks: [b('logo', 'logo', at(0, 0, 4, 1)), b('headline', 'headline', at(0, 2, 7, 3)), b('picture', 'picture', at(8, 0, 4, 6))], copy: words([['headline', 'text', c.headline]]) }),
	},
	{
		id: 'email-signature', label: 'Email signature', description: 'A signature: the mark, a name, a role and a link.', sizes: ['email-signature'], theme: 'Paper',
		copy: [{ id: 'name', required: true }, { id: 'role' }, { id: 'contact' }], sample: { name: 'Alex Doe', role: 'Developer advocate, Acme', contact: 'acme.com' },
		build: (c) => ({
			grid: { cols: 12, rows: 3 },
			blocks: [b('mark', 'mark', at(0, 0, 2, 3)), b('name', 'body', at(3, 0, 9, 1)), ...(has(c, 'role') ? [b('role', 'body', at(3, 1, 9, 1))] : []), ...(has(c, 'contact') ? [b('contact', 'body', at(3, 2, 9, 1))] : [])],
			copy: words([['name', 'text', c.name], ['role', 'text', c.role], ['contact', 'text', c.contact]]),
		}),
	},
];

/** Print sizes the recipes use that no platform owns (300 dpi). */
export const RECIPE_SIZES: Record<string, { label: string; w: number; h: number }> = {
	'name-tag': { label: 'Name tag, 3.5 x 2.25 in', w: 1050, h: 675 },
	'event-badge': { label: 'Event badge, 4 x 3 in', w: 1200, h: 900 },
};

export const recipeOf = (id: string) => RECIPES.find((r) => r.id === id);

/** The layers a block reports: itself and its parts. */
const PARTS: Record<string, string[]> = { quote: ['mark', 'attribution'], stat: ['label'], card: ['heading', 'text', 'number'], picture: ['field'], chart: ['title'] };

/** Every block a recipe can lay out, at any shape, with the sample's words and with only the needed ones. */
export function recipeLayers(r: Recipe): TemplateInfo['layers'] {
	const every = Object.fromEntries(r.copy.map((c) => [c.id, r.sample[c.id] ?? 'x']));
	const out = new Map<string, TemplateInfo['layers'][number]['can']>();
	for (const shape of ['wide', 'strip', 'square', 'tall'] as Shape[]) for (const blk of r.build(every, shape).blocks ?? []) {
		// Words and pictures can be scaled or hidden; rules and patterns only hidden; a block's parts go with it.
		out.set(blk.id, ['divider', 'field'].includes(blk.type) ? { hide: true } : { scale: [0.5, 1.6], hide: true });
		for (const part of PARTS[blk.type] ?? []) out.set(`${blk.id}-${part}`, {});
	}
	return [...out].map(([id, can]) => ({ id, can }));
}

/** What a recipe takes, as the design core reads it. Its parts are its blocks, which can be scaled or hidden. */
export function recipeInfo(r: Recipe, layers: TemplateInfo['layers'] = recipeLayers(r)): TemplateInfo {
	return {
		id: r.id,
		kind: 'image',
		description: r.description,
		sizes: [...r.sizes, 'custom'],
		themes: palettes().map((p) => p.name),
		copy: r.copy,
		images: r.images ?? [],
		options: [],
		layers,
		grounds: Object.fromEntries(palettes().map((p) => [p.name, p.bg])),
		formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
		layouts: [r.label.toLowerCase()],
	};
}

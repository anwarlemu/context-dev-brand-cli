import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { surface, toPng, tokenColor } from '../../src/assets/canvas.js';
import { renderSlide, slidePicture } from '../../src/assets/deck.js';
import { designOf, pictureFor, renderDesign } from '../../src/assets/image.js';
import { TEMPLATES } from '../../src/assets/og.js';
import { adapter, paint } from '../../src/design/adapter.js';
import { designConformance } from './conformance.js';

const LISTS = '# Web extraction\nExtract\nCrawl Website\nWeb Search\nScrape Markdown\nScrape HTML\nScrape Images\n# Brand intelligence\nRetrieve Brand\nGet Styleguide\nGet Fonts\n# Identification\nNAICS Lookup\nSIC Lookup\nID Transaction';
const CARDS = 'Web extraction\nExtract, crawl, search and scrape any page.\n\nBrand intelligence\nRetrieve a brand and its fonts.\n\nIdentification\nNAICS and SIC lookups.';
const copy = (long: boolean) => (t: { copy: { id: string }[] }) => Object.fromEntries(t.copy.filter((c) => c.id !== 'footer').map((c) => [c.id, c.id === 'lists' ? (long ? LISTS : '# Data\nScrape\nSearch\nCrawl') : c.id === 'cards' ? CARDS : c.id === 'stat' ? '42%' : c.id === 'partner-name' ? 'Acme' : c.id === 'badge' ? 'New' : c.id === 'cta' ? 'Start building' : c.id === 'data' ? 'Scrape 42 | Crawl 31 | Search 27' : c.id === 'count' ? '3' : c.id === 'left-items' || c.id === 'right-items' ? (long ? 'Proxies to run | Breaks on layout changes | Weeks to build' : 'One | Two') : c.id === 'roles' ? 'Founding engineer | Product designer' : c.id === 'items' ? (long ? 'Scrape any page as Markdown | Crawl a whole website | Search the web | Retrieve a brand and its styleguide | Look up a company by its domain' : 'Scrape | Crawl | Search') : c.id === 'number' ? '01' : c.id === 'attribution' ? 'Head of growth, Acme' : c.id === 'url' ? 'acme.com' : c.id === 'body' ? (long ? 'Search, scrape and crawl the live web from one API' : 'One line about it') : long ? 'Everything your agents need to search, buy and reply in one place' : 'Ship your next idea today']));

// A screenshot for the templates that need a picture of their own.
const SHOT = join(mkdtempSync(join(tmpdir(), 'shot-')), 'shot.png');
{
	const s = surface(800, 500);
	s.ctx.fillStyle = tokenColor('neutral-10');
	s.ctx.fillRect(0, 0, 800, 500);
	s.ctx.fillStyle = tokenColor('brand');
	s.ctx.fillRect(40, 40, 300, 30);
	writeFileSync(SHOT, toPng(s));
}

designConformance(adapter(), {
	picture: SHOT,
	paint,
	// Merch, illustrations and video have their own test (media.test.ts).
	skip: (t) => t.kind !== 'image' && t.kind !== 'slide',
	short: copy(false),
	long: copy(true),
	async plain(doc) {
		if (doc.kind === 'slide') return renderSlide({ type: doc.template, ...doc.copy, picture: await slidePicture('.', doc.template, undefined) }).png;
		if (!(TEMPLATES as string[]).includes(doc.template)) return undefined;
		const c = doc.copy;
		const d = designOf({ template: doc.template, size: doc.size.id, set: { headline: c.headline, body: c.body, badge: c.badge, cta: c.cta, lists: c.lists, cards: c.cards, stat: c.stat, partnerName: c['partner-name'] } });
		return renderDesign(d, await pictureFor(d, '.')).png;
	},
});

import { designOf, pictureFor, renderDesign } from '../../src/assets/image.js';
import { adapter, paint } from '../../src/design/adapter.js';
import { designConformance } from './conformance.js';

const LISTS = '# Web extraction\nExtract\nCrawl Website\nWeb Search\nScrape Markdown\nScrape HTML\nScrape Images\n# Brand intelligence\nRetrieve Brand\nGet Styleguide\nGet Fonts\n# Identification\nNAICS Lookup\nSIC Lookup\nID Transaction';
const CARDS = 'Web extraction\nExtract, crawl, search and scrape any page.\n\nBrand intelligence\nRetrieve a brand and its fonts.\n\nIdentification\nNAICS and SIC lookups.';
const copy = (long: boolean) => (t: { copy: { id: string }[] }) => Object.fromEntries(t.copy.filter((c) => c.id !== 'footer').map((c) => [c.id, c.id === 'lists' ? (long ? LISTS : '# Data\nScrape\nSearch\nCrawl') : c.id === 'cards' ? CARDS : c.id === 'stat' ? '42%' : c.id === 'partner-name' ? 'Acme' : c.id === 'badge' ? 'New' : c.id === 'cta' ? 'Start building' : c.id === 'body' ? (long ? 'Search, scrape and crawl the live web from one API' : 'One line about it') : long ? 'Everything your agents need to search, buy and reply in one place' : 'Ship your next idea today']));

designConformance(adapter(), {
	paint,
	short: copy(false),
	long: copy(true),
	async plain(doc) {
		if (doc.kind !== 'image') return undefined;
		const c = doc.copy;
		const d = designOf({ template: doc.template, size: doc.size.id, set: { headline: c.headline, body: c.body, badge: c.badge, cta: c.cta, lists: c.lists, cards: c.cards, stat: c.stat, partnerName: c['partner-name'] } });
		return renderDesign(d, await pictureFor(d, '.')).png;
	},
});

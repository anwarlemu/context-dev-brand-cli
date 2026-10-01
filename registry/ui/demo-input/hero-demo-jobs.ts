export type HeroJobId = 'scrape' | 'search' | 'answers' | 'crawl' | 'map' | 'brand';

const looksLikeUrl = (value: string) => /^[^\s/]+\.[a-z]{2,}(?:[/?#]\S*)?$/i.test(value);
const normalizeBareBrandName = (value: string) => (/^[a-z0-9-]+$/i.test(value) ? `${value.toLowerCase()}.com` : null);
export type HeroInputKind = 'url' | 'query' | 'question';

export interface HeroJobOption {
	id: string;
	label: string;
	/** One line shown beside the option tabs describing what the selected option returns. */
	hint: string;
	/** Overrides the job's placeholder examples when this option needs a different kind of input. */
	examples?: readonly string[];
}

export interface HeroJob {
	id: HeroJobId;
	label: string;
	expandedLabel: string;
	/** The submit button's label while this job is selected. */
	actionLabel: string;
	tooltip: string;
	inputKind: HeroInputKind;
	/** Names the axis the options vary along, e.g. Output, Mode, Source. */
	axisLabel: string;
	/** Cycled through the animated placeholder; the first is submitted when the field is left empty. */
	examples: readonly string[];
	options: readonly HeroJobOption[];
}

export const HERO_JOBS: readonly HeroJob[] = [
	{
		id: 'scrape',
		label: 'Scrape',
		expandedLabel: 'Scrape Any Page',
		actionLabel: 'Scrape',
		tooltip: 'Scrape any URL as Markdown, HTML, images, or a screenshot',
		inputKind: 'url',
		axisLabel: 'Output',
		examples: ['https://stripe.com/pricing', 'https://github.com/vercel/next.js', 'https://docs.stripe.com/api'],
		options: [
			{ id: 'markdown', label: 'Markdown', hint: 'Clean Markdown of the page, ready to drop into a prompt.' },
			{ id: 'html', label: 'HTML', hint: 'The rendered HTML after JavaScript runs, boilerplate included.' },
			{ id: 'images', label: 'Images', hint: 'Every image on the page with its dimensions and alt text.' },
			{ id: 'screenshot', label: 'Screenshot', hint: 'A screenshot of the rendered page.' },
			{ id: 'bytes', label: 'Bytes', hint: 'Download the original file content.' },
			{ id: 'parse', label: 'Parse', hint: 'Extract fields using CSS selectors.' },
		],
	},
	{
		id: 'search',
		label: 'Search',
		expandedLabel: 'Search Web',
		actionLabel: 'Search',
		tooltip: 'Search the web or the news and get clean, ranked results',
		inputKind: 'query',
		axisLabel: 'Source',
		examples: ['latest AI research papers', 'best headless browsers for scraping', 'open source vector databases'],
		options: [
			{ id: 'web', label: 'Web', hint: 'Ranked web results with clean page content, not just links.' },
			{ id: 'news', label: 'News', hint: 'Recent news about a company, matched to the right entity.', examples: ['stripe.com', 'Anthropic', 'NVDA'] },
		],
	},
	{
		id: 'answers',
		label: 'Research',
		expandedLabel: 'Research Anything',
		actionLabel: 'Research',
		tooltip: 'Ask a research question and get a cited answer',
		inputKind: 'question',
		axisLabel: 'Mode',
		examples: ['What does Stripe charge for international cards?', "Who are Linear's main competitors?", 'Which YC companies sell web scraping APIs?'],
		options: [
			{ id: 'fast', label: 'Fast', hint: 'A cited answer in seconds from the top sources.' },
			{ id: 'ultra', label: 'Ultra', hint: 'Deeper research across more pages. Slower and more thorough.' },
		],
	},
	{
		id: 'crawl',
		label: 'Crawl',
		expandedLabel: 'Crawl Websites',
		actionLabel: 'Crawl',
		tooltip: 'Crawl a whole site and get clean Markdown for every page',
		inputKind: 'url',
		axisLabel: 'Mode',
		examples: ['docs.stripe.com', 'vercel.com/docs', 'context.dev'],
		options: [{ id: 'sync', label: 'Crawl pages', hint: 'Get Markdown from the pages of a website.' }],
	},
	{
		id: 'map',
		label: 'Map',
		expandedLabel: 'Map URLs',
		actionLabel: 'Map',
		tooltip: 'Discover a website’s URLs and page metadata',
		inputKind: 'url',
		axisLabel: 'Output',
		examples: ['stripe.com', 'linear.app', 'context.dev'],
		options: [{ id: 'sitemap', label: 'Map URLs', hint: 'Discover a website’s URLs and page metadata.' }],
	},
	{
		id: 'brand',
		label: 'Brand',
		expandedLabel: 'Brand Data',
		actionLabel: 'Get brand',
		tooltip: 'Retrieve brand data or a full style guide from any domain',
		inputKind: 'url',
		axisLabel: 'Output',
		examples: ['spotify.com', 'linear.app', 'stripe.com'],
		options: [
			{ id: 'brand', label: 'Brand data', hint: 'Logo, colors, fonts, socials and company facts in one call.' },
			{ id: 'styleguide', label: 'Style guide', hint: 'Colors, typography, spacing and component styles from the live site.' },
		],
	},
];

export const DEFAULT_HERO_JOB: HeroJobId = 'scrape';

export function getHeroJob(id: HeroJobId): HeroJob {
	return HERO_JOBS.find((job) => job.id === id) ?? HERO_JOBS[0];
}

export function getHeroOption(job: HeroJob, optionId: string | undefined): HeroJobOption {
	return job.options.find((option) => option.id === optionId) ?? job.options[0];
}

export function heroExamples(job: HeroJob, option: HeroJobOption): readonly string[] {
	return option.examples ?? job.examples;
}

export function stripProtocol(input: string): string {
	return input.replace(/^\s*https?:\/\//i, '').replace(/^\/+/, '');
}

export function cleanDomain(input: string): string {
	return stripProtocol(input).trim().split('/')[0];
}

/**
 * Turns what the visitor typed into the value we submit. URL jobs drop the scheme and forgive a
 * bare brand name ("stripe" becomes "stripe.com"); text jobs only need something to be typed.
 * Returns null when there is nothing usable, so the caller can show the field's own error.
 */
export function resolveHeroInput(job: HeroJob, raw: string): string | null {
	const trimmed = raw.trim();
	if (job.inputKind !== 'url') return trimmed || null;
	const candidate = stripProtocol(trimmed).trim();
	if (!candidate) return null;
	if (looksLikeUrl(candidate)) return candidate;
	return normalizeBareBrandName(candidate);
}

export interface HeroDestination {
	href: string;
	value: string;
}

/** Where a run goes: the action URL with the job, what was typed and the panel's choices as search params. */
export function buildHeroDestination(job: HeroJob, raw: string, action: string, choices: { option?: string; formats?: string[] } = {}): HeroDestination | null {
	const resolved = resolveHeroInput(job, raw);
	if (!resolved) return null;

	const isDomainJob = job.id === 'brand' || job.id === 'map';
	const value = isDomainJob ? cleanDomain(resolved) : resolved;
	const params = new URLSearchParams({ type: job.id });
	if (isDomainJob) params.set('domain', value);
	else if (job.inputKind === 'url') params.set('url', `https://${value}`);
	else params.set(job.id === 'answers' ? 'task' : 'query', value);
	if (choices.option) params.set('option', choices.option);
	if (choices.formats?.length) params.set('formats', choices.formats.join(','));
	const joiner = action.includes('?') ? '&' : '?';
	return { href: `${action}${joiner}${params}`, value };
}

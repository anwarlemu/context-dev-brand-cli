import { BlogGrid } from '@/components/ds/blocks/blog-grid';

export default function Example() {
	return (
		<BlogGrid
			title="Latest updates."
			posts={[
				{ title: 'How to fix HTTP errors when web scraping', slug: 'http-errors', date: 'Sep 22, 2026', excerpt: 'Why scrapers get blocked with 403, 429, 503 and 520 errors, and what to do.', href: '/blog/http-errors', motif: 'blocked' },
				{ title: 'How to set up Context.dev MCP in Cursor and Claude', slug: 'mcp-setup', date: 'Sep 21, 2026', excerpt: 'Connect Context.dev to Cursor, Claude and Claude Code in a few minutes.', href: '/blog/mcp-setup', motif: 'integration' },
				{ title: 'Best web scraping APIs for JavaScript-rendered sites', slug: 'js-rendered', date: 'Sep 21, 2026', excerpt: 'Compare scraping APIs on rendering, anti-bot handling and price.', href: '/blog/js-rendered', motif: 'pages' },
			]}
		/>
	);
}

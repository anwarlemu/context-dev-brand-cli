import { ProductGrid } from '@/components/ds/blocks/product-grid';

export default function Example() {
	return (
		<ProductGrid
			title="Give your agent access to the web."
			highlight="access to the web."
			sub="Search, scraping, people data and company data in one API."
			products={[
				{ name: 'Search', href: '/search', description: 'Search the web or the news and get ranked results with clean page content, not just links.', tags: ['Fresh sources for RAG', 'Company news', 'Agent web search'], scene: 'search' },
				{ name: 'Scrape', href: '/scrape', description: 'Turn any page or PDF into Markdown, HTML, structured fields, images, or screenshots in one request.', tags: ['Scrape to Markdown', 'Onboarding autofill', 'PDF parsing'], scene: 'extract' },
				{ name: 'Research', href: '/answers', description: 'Ask a research question and get a structured answer in your JSON shape, with the sources behind it.', tags: ['Company research', 'Entity enrichment', 'Cited answers'], scene: 'answer' },
				{ name: 'Monitor', href: '/monitors', description: 'Watch pages on a schedule and get notified when pricing, content, or pages change.', tags: ['Pricing changes', 'New pages', 'Webhook updates'], scene: 'watch' },
			]}
			more={[
				{ label: 'Crawl', href: '/crawl' },
				{ label: 'Map URLs', href: '/map' },
				{ label: 'Batches', href: '/batches' },
				{ label: 'Brand data', href: '/brand' },
				{ label: 'Style guides', href: '/styleguide' },
			]}
		/>
	);
}

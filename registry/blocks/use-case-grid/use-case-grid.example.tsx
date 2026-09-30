import { UseCaseGrid } from '@/components/ds/blocks/use-case-grid';

export default function Example() {
	return (
		<UseCaseGrid
			title="Build on what the web knows."
			highlight="what the web knows."
			sub="Connect web content to the places your product needs it: research, onboarding, enrichment, and retrieval."
			cases={[
				{ title: 'Scrape anything', description: 'Turn webpages and PDFs into Markdown, HTML, structured fields, images, and screenshots in one request.', scene: 'scrape' },
				{ title: 'Ground RAG in fresh content', description: 'Collect pages with Scrape and Crawl, and keep your retrieval index current with Monitors.', scene: 'rag' },
				{ title: 'Run deep research on demand', description: 'Resolve a domain to a typed brand profile, then research the company in your JSON shape, with sources.', scene: 'research' },
				{ title: 'Run batches at scale', description: 'Scrape thousands of URLs or crawl entire sites in one job, then collect results when it completes.', scene: 'batch' },
				{ title: 'Enrich any entity your agent sees', description: 'Connect company references and person identifiers to brand profiles and people data.', scene: 'enrich' },
				{ title: 'Autofill onboarding forms', description: 'Pre-fill company fields from a work email domain so more users finish signing up.', scene: 'autofill' },
			]}
		/>
	);
}

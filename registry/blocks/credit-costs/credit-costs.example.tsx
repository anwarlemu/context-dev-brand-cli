import { CreditCosts } from '@/components/ds/blocks/credit-costs';

export default function Example() {
	return (
		<CreditCosts
			title="API credit costs"
			highlight="credit costs"
			sub="The base cost and optional charges for each API."
			groups={[
				{ title: 'Web extraction', rows: [{ api: 'Scrape anything', description: 'HTML, Markdown, screenshots, images or CSS parsing in one request', cost: '1 credit per call' }, { api: 'Search web', description: 'Ranked results with optional page content', cost: '1 credit per 10 results' }, { api: 'Answers', description: 'Research a question and return your JSON shape', cost: '100 credits per call' }] },
				{ title: 'Brand intelligence', rows: [{ api: 'Retrieve brand', description: 'Domain, company name, email or ticker to brand data', cost: '10 credits per call' }] },
				{ title: 'People and news', rows: [{ api: 'Enrich people', description: 'Enrich a person from their name, company or profile', cost: '10 credits per call' }] },
				{ title: 'Utility', rows: [{ api: 'Parse file', description: 'Turn a file into Markdown', cost: '1 credit per page' }] },
			]}
		/>
	);
}

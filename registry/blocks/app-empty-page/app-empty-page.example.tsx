import { AppEmptyPage } from '@/components/ds/blocks/app-empty-page';

export default function Example() {
	return (
		<AppEmptyPage
			scene="batch"
			title="Scrape pages in bulk"
			body="Submit your first batch to scrape a list of URLs, or crawl a whole site, as one job you can check on later."
			primary={{ label: 'Create batch', href: '/batches/new' }}
			docs={{ label: 'Read docs', href: 'https://docs.context.dev' }}
			usage={{ label: 'Running', used: 0, limit: 1, unit: 'concurrent', upgrade: { label: 'Increase limit', href: '/pricing' } }}
		/>
	);
}

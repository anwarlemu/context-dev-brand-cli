import { AppFormPanel } from '@/components/ds/blocks/app-form-panel';

export default function Example() {
	return (
		<AppFormPanel
			code={"curl -X POST https://api.context.dev/v1/batches \\\n  -H 'Authorization: Bearer $CONTEXT_API_KEY' \\\n  -d '{\"urls\": [\"https://stripe.com\"]}'"}
			docsHref="https://docs.context.dev"
			fields={[
				{ type: 'segmented', name: 'target', label: 'Target type', options: [{ value: 'list', label: 'List of URLs', help: 'Scrape every URL you paste or upload.' }, { value: 'crawl', label: 'Crawl a site', help: 'Start at one URL and follow its links.' }] },
				{ type: 'textarea', name: 'urls', label: 'URLs', placeholder: 'https://stripe.com/pricing', mono: true, help: 'One per line. Up to 10,000.', required: 'Add at least one URL.' },
				{ type: 'switches', name: 'content', label: 'Content options', options: [{ value: 'main', label: 'Main content only', on: true }, { value: 'frames', label: 'Include frames' }] },
				{ type: 'tags', name: 'tags', label: 'Tags', placeholder: 'docs, competitor', help: 'Filter the batch list by them later. Optional.' },
			]}
			advanced={[{ type: 'number', name: 'maxPages', label: 'Max pages', defaultValue: '500', help: 'Credits are reserved for this many pages.' }]}
			cost="Reserves 500 credits, one per page"
			submitLabel="Submit batch"
		/>
	);
}

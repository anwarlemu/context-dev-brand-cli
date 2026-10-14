import { AppPageHeader } from '@/components/ds/blocks/app-page-header';


export default function Example() {
	return (
		<AppPageHeader variant="back" title="Create a batch" sub="Scrape a list of URLs, or crawl a site page by page. Set it up here or grab the API call." backHref="/batches" />
	);
}

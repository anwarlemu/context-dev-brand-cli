import { AppResultCard } from '@/components/ds/blocks/app-result-card';

export default function Example() {
	return (
		<AppResultCard
			state="ready"
			actionLabel="Scrape"
			cost="1 credit"
			endpoint="/v1/scrape"
			examples={['https://context.dev', 'https://stripe.com/pricing', 'https://news.ycombinator.com']}
		/>
	);
}

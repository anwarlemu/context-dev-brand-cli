import { RelatedProducts } from '@/components/ds/blocks/related-products';

export default function Example() {
	return (
		<RelatedProducts
			items={[
				{ title: 'Answers from the web', text: 'Research questions, get structured answers and sources.', href: '/answers' },
				{ title: 'Map domains', text: 'Discover URLs across a website before you scrape.', href: '/map' },
			]}
		/>
	);
}

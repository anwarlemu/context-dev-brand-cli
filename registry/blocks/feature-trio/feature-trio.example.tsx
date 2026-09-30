import { FeatureTrio } from '@/components/ds/blocks/feature-trio';

export default function Example() {
	return (
		<FeatureTrio
			features={[
				{ title: 'Search in your own words', text: 'Use a natural-language query or familiar search operators to find relevant pages.', scene: 'question' },
				{ title: 'Read the results', text: 'Include Markdown with each result, and check its sources before adding it to your workflow.', scene: 'sources' },
				{ title: 'Keep the search focused', text: 'Include or exclude domains, choose a country and filter by freshness.', scene: 'freshness' },
			]}
		/>
	);
}

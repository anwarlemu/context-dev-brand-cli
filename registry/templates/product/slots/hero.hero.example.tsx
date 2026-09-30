import { Hero } from '@/components/ds/blocks/hero';

export default function Example() {
	return (
		<Hero
			variant="product"
			headline="Find the right pages. Bring back the content."
			highlight="Bring back the content."
			sub="Search the live web, then get each page as Markdown in the same request."
			primaryCta={{ label: 'Get API key', href: '/signup' }}
			secondaryCta={{ label: 'Read the docs', href: 'https://docs.context.dev' }}
			media={{ type: 'code', title: 'search.ts', code: "const results = await client.web.search({ query: 'RAG pipeline with web data', numResults: 5 });" }}
		/>
	);
}

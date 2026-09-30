import { Testimonials } from '@/components/ds/blocks/testimonials';

export default function Example() {
	return (
		<Testimonials
			title="Teams ship faster with Context.dev."
			highlight="ship faster"
			quotes={[
				{ quote: 'Getting started is very simple. API docs are great and sign-up is self serve, with an API key generated immediately. Took 10 minutes to start integrating.', name: 'CPTO', role: 'Architect', href: '/customers/architect' },
				{ quote: "We're seeing much higher activation rates for our free trials and sign-ups because of it.", name: 'Founder', role: 'DocsBot', href: '/customers/docsbot' },
				{ quote: 'Context.dev preserved full page content and JSON-LD on sites where Firecrawl struggled, and let us remove much of our custom HTML parsing.', name: 'Co-founder', role: 'Zaraftis', href: '/customers/zaraftis' },
			]}
		/>
	);
}

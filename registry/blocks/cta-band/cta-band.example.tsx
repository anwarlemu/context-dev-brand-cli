import { CtaBand } from '@/components/ds/blocks/cta-band';

export default function Example() {
	return (
		<CtaBand
			title="Start building with live web context."
			highlight="live web context."
			sub="Scrape, search and research the web with one API. Bring the results straight into your product."
			offer={{ value: '1,000', label: 'free credits', note: 'Every month. No credit card required.' }}
			cta={{ label: 'Start for free', href: '/signup' }}
			docs={{ label: 'Read the docs', href: 'https://docs.context.dev' }}
		/>
	);
}

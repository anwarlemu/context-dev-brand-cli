import { Steps } from '@/components/ds/blocks/steps';

export default function Example() {
	return (
		<Steps
			title="Your first request starts here."
			highlight="Your first request"
			sub="One API key for the web data your product needs."
			action={{ label: 'Start for free', href: '/signup' }}
			steps={[
				{ number: '01', word: 'API', title: 'Get your API key', text: 'Create an account and copy your key from the dashboard.' },
				{ number: '02', word: 'SDK', title: 'Make your first request', text: 'Use the SDK or call the REST API with a URL, domain or research question.' },
				{ number: '03', word: 'URL', title: 'Use the returned data', text: 'Bring the content, source URLs and structured fields into your application.' },
			]}
		/>
	);
}

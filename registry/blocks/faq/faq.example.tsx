import { Faq } from '@/components/ds/blocks/faq';

export default function Example() {
	return (
		<Faq
			title="Frequently asked questions"
			highlight="questions"
			sub="Everything you need to know about integrating and scaling with Context.dev."
			action={{ label: 'Book demo', href: '/demo' }}
			topics={[
				{ id: 'api', label: 'API and integration', items: [
					{ question: 'What SDKs are available?', answer: 'Official SDKs for TypeScript, Python, Ruby, Go and PHP. The REST API works from any language.' },
					{ question: 'How can my agent sign up?', answer: 'Paste one line into your coding agent. It signs up, gets a key and integrates Context.dev for you.' },
				] },
				{ id: 'pricing', label: 'Pricing and plans', items: [
					{ question: 'Is there a free tier?', answer: 'Yes. 1,000 API credits per month, no credit card required.' },
				] },
			]}
		/>
	);
}

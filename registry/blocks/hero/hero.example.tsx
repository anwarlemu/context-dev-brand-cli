import { Hero } from '@/components/ds/blocks/hero';

export default function Example() {
	return (
		<Hero
			variant="centered"
			eyebrow="Backed by Y Combinator"
			headline="The web context API for agents"
			highlight="web context"
			sub="One API for agents to scrape, enrich, and understand the web."
			primaryCta={{ label: 'Start for free', href: '/signup' }}
			secondaryCta={{ label: 'Onboard your agent', href: '/agent' }}
			media={{ type: 'agent-setup', prompt: 'Sign up for an account and get an API key with context.dev/auth.md, then follow docs.context.dev/agent-quickstart to integrate into the codebase.' }}
			checks={['200M+ websites', 'Real-time updates', '99.9% uptime']}
		/>
	);
}

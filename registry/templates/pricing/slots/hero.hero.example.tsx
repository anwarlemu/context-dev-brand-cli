import { Hero } from '@/components/ds/blocks/hero';

export default function Example() {
	return (
		<Hero
			variant="centered"
			headline="Straightforward, transparent pricing"
			highlight="transparent pricing"
			sub="Start with 1,000 free credits a month. No credit card required."
			primaryCta={{ label: 'Start for free', href: '/signup' }}
			secondaryCta={{ label: 'Onboard your agent', href: '/agent' }}
		/>
	);
}

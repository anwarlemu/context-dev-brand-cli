import { TrustGrid } from '@/components/ds/blocks/trust-grid';

export default function Example() {
	return (
		<TrustGrid
			title="Security you can review."
			highlight="Security"
			items={[
				{ title: 'SOC 2 Type I and II', mark: 'compliance', description: 'Documented security controls, independently audited. Review our compliance in the trust center.', href: '/trust' },
				{ title: 'Zero data retention', mark: 'retention', description: 'Built for privacy-sensitive workloads. See how Tinfoil uses Context.dev with zero data retention.', href: '/customers/tinfoil' },
				{ title: 'Reliability, in the open', mark: 'reliability', description: 'Check service availability and incident history on our public status page, whenever you need it.', href: 'https://status.context.dev' },
			]}
			cta={{ label: 'Visit trust center', href: '/trust' }}
		/>
	);
}

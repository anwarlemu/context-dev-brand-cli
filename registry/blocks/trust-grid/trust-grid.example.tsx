import { TrustGrid } from '@/components/ds/blocks/trust-grid';

export default function Example() {
	return (
		<TrustGrid
			title="Enterprise-grade security."
			highlight="security."
			items={[
				{ title: 'SOC 2 Type 1 and Type 2', mark: 'compliance', description: 'Review our compliance status and request access to security information through the trust center.', href: '/trust', linkLabel: 'View compliance' },
				{ title: 'Security policies', mark: 'policies', description: 'Review the policies covering data handling, access control, and incident response.', href: '/trust#policies', linkLabel: 'Review policies' },
				{ title: 'Security controls', mark: 'controls', description: 'Explore published controls for encryption at rest, security monitoring, and supplier security.', href: '/trust#controls', linkLabel: 'Review controls' },
			]}
			cta={{ label: 'Visit trust center', href: '/trust' }}
		/>
	);
}

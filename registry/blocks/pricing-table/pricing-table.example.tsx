import { PricingTable } from '@/components/ds/blocks/pricing-table';

export default function Example() {
	return (
		<PricingTable
			variant="monthly"
			recommended="pro"
			note="Eligible startups and nonprofits get 50% off an annual paid plan for 12 months."
			plans={[
				{ id: 'free', name: 'Free', for: 'For testing out the API', price: '$0', period: '/month', action: { label: 'Get started', href: '/signup' }, features: ['1,000 credits per month', 'Email support'] },
				{ id: 'developer', name: 'Developer', for: 'Building your first workflow', price: '$25', period: '/month', action: { label: 'Start building', href: '/signup?plan=developer' }, features: ['10,000 credits per month', 'Email support'] },
				{ id: 'pro', name: 'Pro', for: 'Production apps with steady usage', price: '$99', period: '/month', action: { label: 'Start Pro', href: '/signup?plan=pro' }, features: ['125,000 credits per month', 'Email and Slack support'] },
				{ id: 'growth', name: 'Growth', for: 'Scaling products and teams', price: '$299', period: '/month', action: { label: 'Start Growth', href: '/signup?plan=growth' }, features: ['500,000 credits per month', 'Priority support'] },
				{ id: 'scale', name: 'Scale', for: 'High-volume products', price: '$499', period: '/month', action: { label: 'Start Scale', href: '/signup?plan=scale' }, features: ['1,000,000 credits per month', 'Priority and Slack support'] },
				{ id: 'enterprise', name: 'Enterprise', for: 'Security, procurement and custom limits', price: 'Custom', action: { label: 'Book demo', href: '/demo' }, features: ['2M+ credits per month', 'Dedicated Slack channel'] },
			]}
		/>
	);
}

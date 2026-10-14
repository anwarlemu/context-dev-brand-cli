import { AppBanner } from '@/components/ds/blocks/app-banner';

export default function Example() {
	return (
		<AppBanner
			variant="default"
			title="You’ve used 1 of 2 API keys on the Free plan."
			body="Upgrade to create up to 50 named keys, rotate them anytime, and scope each one to the APIs it needs."
			action={{ label: 'View plans', href: '/pricing' }}
		/>
	);
}

import { AppStatCards } from '@/components/ds/blocks/app-stat-cards';

export default function Example() {
	return (
		<AppStatCards
			riseIndex={3}
			stats={[
				{ label: 'Credits used today', value: '121', footer: '35 API calls' },
				{ label: 'Credits used this month', value: '372', footer: '125 API calls' },
				{ label: 'Credits remaining', value: '628', suffix: '/1K', meter: { value: 628, total: 1000 }, footer: 'Resets Nov 9', href: '/usage' },
				{ label: 'Current plan', value: 'Free', footer: '1K credits/mo · 30 req/min', href: '/pricing' },
			]}
		/>
	);
}

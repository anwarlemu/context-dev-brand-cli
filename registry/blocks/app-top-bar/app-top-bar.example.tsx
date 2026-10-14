import { AppTopBar } from '@/components/ds/blocks/app-top-bar';

export default function Example() {
	return <AppTopBar credits={{ left: 628, total: 1000, resetsOn: 'Nov 9' }} plan={{ name: 'Free', price: '$0', rateLimit: '30 req/min' }} upgradeHref="/pricing" usageHref="/usage" />;
}

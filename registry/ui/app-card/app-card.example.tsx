import { AppCard } from '@/components/ds/ui/app-card';

export default function Example() {
	return (
		<AppCard title="Credits used today" footer="Resets Nov 9">
			<p className="text-h4 text-fg">121</p>
			<p className="mt-2 text-caption text-fg-subtle">35 API calls</p>
		</AppCard>
	);
}

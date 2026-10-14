import { AppBarChart } from '@/components/ds/ui/app-bar-chart';

export default function Example() {
	return (
		<div className="flex h-56">
			<AppBarChart
				label="Calls by response status, last 7 days"
				unit="calls"
				series={[
					{ key: '200', label: '200', color: 'ok' },
					{ key: '400', label: '400', color: 'client-error' },
					{ key: '500', label: '500', color: 'server-error' },
				]}
				buckets={[
					{ label: 'Oct 1', values: { '200': 18, '400': 2, '500': 0 } },
					{ label: 'Oct 2', values: { '200': 22, '400': 1, '500': 1 } },
					{ label: 'Oct 3', values: { '200': 27, '400': 3, '500': 0 } },
					{ label: 'Oct 4', values: { '200': 31, '400': 2, '500': 2 } },
				]}
			/>
		</div>
	);
}

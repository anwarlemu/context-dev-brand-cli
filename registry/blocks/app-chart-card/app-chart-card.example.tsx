import { AppChartCard } from '@/components/ds/blocks/app-chart-card';

export default function Example() {
	return (
		<AppChartCard
			riseIndex={1}
			ranges={[{ value: '7d', label: '7D' }, { value: '30d', label: '30D' }, { value: '3m', label: '3M' }]}
			defaultRange="7d"
			breakdowns={[
				{
					value: 'status',
					label: 'Status',
					description: 'Calls by response status',
					unit: 'calls',
					series: [{ key: '2xx', label: '2xx', color: 'ok' }, { key: '4xx', label: '4xx', color: 'client-error' }, { key: '5xx', label: '5xx', color: 'server-error' }],
					buckets: {
						'7d': [{ label: 'Oct 1', values: { '2xx': 18, '4xx': 2, '5xx': 0 } }, { label: 'Oct 4', values: { '2xx': 27, '4xx': 3, '5xx': 1 } }, { label: 'Oct 7', values: { '2xx': 31, '4xx': 2, '5xx': 2 } }],
						'30d': [{ label: 'Sep 8', values: { '2xx': 120, '4xx': 9, '5xx': 2 } }, { label: 'Sep 22', values: { '2xx': 160, '4xx': 12, '5xx': 4 } }, { label: 'Oct 7', values: { '2xx': 190, '4xx': 8, '5xx': 3 } }],
					},
				},
			]}
		/>
	);
}

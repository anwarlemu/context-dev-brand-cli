import { AppDetailCard } from '@/components/ds/blocks/app-detail-card';

export default function Example() {
	return (
		<AppDetailCard
			status={{ tone: 'running', label: 'Running', running: true }}
			meta="Scrape · Markdown"
			id="batch_7f3a92c1d4"
			actions={[
				{ id: 'download', label: 'Download results', icon: 'download' },
				{ id: 'cancel', label: 'Cancel batch', icon: 'stop', hold: true },
				{ id: 'delete', label: 'Delete batch', icon: 'trash', danger: true, hold: true },
			]}
			sections={[
				{ title: 'Progress', rows: [{ label: 'Pages', value: '120 of 500' }, { label: 'Failed', value: '2' }] },
				{ title: 'Credits', rows: [{ label: 'Debited', value: '500', help: 'Reserved when the batch was submitted.' }, { label: 'Refunded', value: '0' }] },
			]}
			results={{ title: 'Results', emptyText: 'Pages show up here as they finish.', items: [{ label: 'https://stripe.com/pricing', ok: true, detail: '200' }, { label: 'https://stripe.com/blog', ok: false, detail: 'Timed out' }] }}
		/>
	);
}

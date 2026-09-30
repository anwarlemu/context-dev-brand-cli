import { Table } from '@/components/ds/ui/table';

export default function Example() {
	return <Table caption="API credit costs" columns={[{ key: 'api', label: 'API' }, { key: 'cost', label: 'Cost', align: 'right' }]} rows={[{ api: 'Scrape', cost: '1 credit per call' }]} />;
}

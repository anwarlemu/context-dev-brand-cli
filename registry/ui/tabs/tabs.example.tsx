import { Tabs } from '@/components/ds/ui/tabs';

export default function Example() {
	return <Tabs label="Benchmark metric" items={[{ id: 'success', label: 'Success rate', content: <p className="text-body">94%</p> }, { id: 'latency', label: 'Latency', content: <p className="text-body">1.2s</p> }]} />;
}

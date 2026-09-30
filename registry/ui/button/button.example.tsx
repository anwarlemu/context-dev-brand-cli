import { Button } from '@/components/ds/ui/button';

export default function Example() {
	return (
		<div className="flex gap-3">
			<Button variant="primary" href="/signup">Start for free</Button>
			<Button variant="secondary" href="/docs">Read the docs</Button>
		</div>
	);
}

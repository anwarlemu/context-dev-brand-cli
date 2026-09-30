import { Tooltip } from '@/components/ds/ui/tooltip';

export default function Example() {
	return (
		<Tooltip label="Zero data retention">
			<button type="button" className="text-body-sm text-fg-muted">ZDR</button>
		</Tooltip>
	);
}

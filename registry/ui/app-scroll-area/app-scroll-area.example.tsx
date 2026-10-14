import { AppScrollArea } from '@/components/ds/ui/app-scroll-area';

export default function Example() {
	return (
		<div className="flex h-64 flex-col">
			<AppScrollArea className="px-4">
				<p className="text-body-sm text-fg-muted">Long panel content goes here.</p>
			</AppScrollArea>
		</div>
	);
}

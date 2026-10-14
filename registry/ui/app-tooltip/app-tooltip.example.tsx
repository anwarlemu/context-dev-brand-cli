import { Search } from 'lucide-react';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';

export default function Example() {
	return (
		<AppTooltip label="Search" side="top" className="shrink-0">
			<button type="button" aria-label="Search" className="grid size-8 place-items-center rounded-control text-fg-muted outline-none transition-colors hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover">
				<Search className="size-3.5" strokeWidth={1.5} />
			</button>
		</AppTooltip>
	);
}

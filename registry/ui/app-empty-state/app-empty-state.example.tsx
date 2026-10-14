import { Plus } from 'lucide-react';
import { AppButton } from '@/components/ds/ui/app-button';
import { AppEmptyState } from '@/components/ds/ui/app-empty-state';
import { DotScene } from '@/components/ds/ui/dot-scene';

export default function Example() {
	return (
		<AppEmptyState
			media={<DotScene variant="batch" className="w-full" />}
			title="Scrape pages in bulk"
			body="Submit your first batch to scrape a list of URLs, or crawl a whole site, as one job you can check on later."
			actions={
				<>
					<AppButton variant="brand" size="sm">
						<Plus className="size-3.5" strokeWidth={1.75} />
						Create batch
					</AppButton>
					<AppButton variant="outline" size="sm">Read docs</AppButton>
				</>
			}
		/>
	);
}

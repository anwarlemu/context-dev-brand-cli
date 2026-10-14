import { Plus } from 'lucide-react';
import { AppButton } from '@/components/ds/ui/app-button';

export default function Example() {
	return (
		<AppButton variant="brand" size="sm">
			<Plus className="size-3.5" strokeWidth={1.5} />
			Create API key
		</AppButton>
	);
}

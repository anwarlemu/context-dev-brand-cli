import { X } from 'lucide-react';
import { AppIconButton } from '@/components/ds/ui/app-icon-button';

export default function Example() {
	return (
		<AppIconButton label="Close">
			<X className="size-4" strokeWidth={1.5} />
		</AppIconButton>
	);
}

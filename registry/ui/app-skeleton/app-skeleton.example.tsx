import { Skeleton } from '@/components/ds/ui/app-skeleton';

export default function Example() {
	return (
		<div className="glass-card flex flex-col gap-4 p-4">
			<Skeleton className="h-4 w-28" />
			<Skeleton className="h-44 w-full" />
		</div>
	);
}

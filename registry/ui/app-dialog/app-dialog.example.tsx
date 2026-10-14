import { AppButton } from '@/components/ds/ui/app-button';
import { AppDialog } from '@/components/ds/ui/app-dialog';

export default function Example() {
	return (
		<AppDialog
			title="Create API key"
			description="Name the key after where it'll run, and limit it to the APIs that app needs."
			onClose={() => {}}
			footer={
				<>
					<AppButton variant="ghost" size="sm">Cancel</AppButton>
					<AppButton variant="brand" size="sm">Create key</AppButton>
				</>
			}
		>
			<p className="text-body-sm text-fg-muted">Form fields go here.</p>
		</AppDialog>
	);
}

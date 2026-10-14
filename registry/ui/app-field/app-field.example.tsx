import { AppField, AppInput } from '@/components/ds/ui/app-field';

export default function Example() {
	return (
		<AppField label="Name" help="Name the key after where it will run.">
			{(id, invalid) => <AppInput id={id} invalid={invalid} placeholder="Production server" />}
		</AppField>
	);
}

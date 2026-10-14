import { SelectMenu } from '@/components/ds/ui/app-menu';

export default function Example() {
	return (
		<SelectMenu
			label="Status"
			value="all"
			options={[
				{ value: 'all', label: 'All statuses' },
				{ value: 'active', label: 'Active' },
				{ value: 'disabled', label: 'Disabled' },
			]}
			onChange={() => {}}
			align="right"
		/>
	);
}

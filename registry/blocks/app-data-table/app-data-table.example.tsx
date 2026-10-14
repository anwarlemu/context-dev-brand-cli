import { AppDataTable } from '@/components/ds/blocks/app-data-table';

export default function Example() {
	return (
		<AppDataTable
			searchPlaceholder="Search keys"
			filter={{ label: 'Statuses', options: [{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }] }}
			columns={[
				{ key: 'name', label: 'Name' },
				{ key: 'key', label: 'Key', hideBelow: 'sm' },
				{ key: 'status', label: 'Status' },
				{ key: 'usage', label: 'Credits, 30d', align: 'right', hideBelow: 'lg' },
			]}
			rows={[
				{ id: 'key_1', group: 'active', cells: { name: { title: 'Production server', sub: 'Created Sep 5, 2026' }, key: { mono: 'ctxt_secret_93••••••••' }, status: { status: 'success', label: 'Active' }, usage: 1343 } },
				{ id: 'key_2', group: 'disabled', cells: { name: { title: 'Staging', sub: 'Created Aug 12, 2026' }, key: { mono: 'ctxt_secret_4f••••••••' }, status: { status: 'neutral', label: 'Disabled' }, usage: 0 } },
			]}
			actions={[
				{ id: 'edit', label: 'Edit name and permissions', icon: 'pencil' },
				{ id: 'disable', label: 'Disable key', icon: 'pause', hold: true },
				{ id: 'delete', label: 'Delete key', icon: 'trash', danger: true, hold: true },
			]}
			emptyText="No keys match these filters."
		/>
	);
}

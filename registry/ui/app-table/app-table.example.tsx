import { ActionMenu } from '@/components/ds/ui/app-menu';
import { AppStatus } from '@/components/ds/ui/app-status';
import { AppTable, AppTableBody, AppTableCell, AppTableHead, AppTableHeader, AppTableRow } from '@/components/ds/ui/app-table';

export default function Example() {
	return (
		<AppTable>
			<AppTableHead>
				<AppTableHeader>Name</AppTableHeader>
				<AppTableHeader>Status</AppTableHeader>
				<AppTableHeader actions />
			</AppTableHead>
			<AppTableBody>
				<AppTableRow>
					<AppTableCell>Production server</AppTableCell>
					<AppTableCell>
						<AppStatus variant="success">Active</AppStatus>
					</AppTableCell>
					<AppTableCell actions>
						<ActionMenu label="Actions for Production server" actions={[{ label: 'Delete key', danger: true, holdMs: 1200, onSelect: () => {} }]} />
					</AppTableCell>
				</AppTableRow>
			</AppTableBody>
		</AppTable>
	);
}

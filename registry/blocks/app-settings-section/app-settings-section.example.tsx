import { AppSettingsSection } from '@/components/ds/blocks/app-settings-section';

export default function Example() {
	return (
		<AppSettingsSection
			title="Danger zone"
			variant="danger"
			rows={[
				{
					title: 'Delete account',
					description: 'Your account will be deactivated and removed from every organization. Its API keys will stop working.',
					action: { label: 'Delete account' },
					confirm: { title: 'Delete account?', body: 'You’ll have 7 days to change your mind before anything is removed.', holdLabel: 'Hold to delete account', keepLabel: 'Keep my account', scheduled: 'Your account will be deleted in 7 days. We emailed you the details.' },
				},
			]}
		/>
	);
}

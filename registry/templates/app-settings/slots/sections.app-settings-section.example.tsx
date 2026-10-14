import { AppSettingsSection } from '@/components/ds/blocks/app-settings-section';

export default function Example() {
	return (
		<AppSettingsSection
			title="Organization"
			rows={[
				{ title: 'Auto-join by domain', description: 'Anyone who signs up with an @agencidev.com email joins this organization as a member.', toggle: { on: false } },
				{ title: 'Zero data retention', description: 'Requests and responses are never stored. Available on Scale and Enterprise.', action: { label: 'Book a call', href: '/contact' } },
			]}
		/>
	);
}

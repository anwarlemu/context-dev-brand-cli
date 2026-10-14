import { AppPageHeader } from '@/components/ds/blocks/app-page-header';
import { AppTabs } from '@/components/ds/ui/app-tabs';

export default function Example() {
	return (
		<AppPageHeader variant="centered" title="Settings" sub="Manage your profile, organization details, subscription, billing, and referrals.">
			<AppTabs label="Settings" value="personal" options={[{ value: 'personal', label: 'Personal', href: '?tab=personal' }, { value: 'organization', label: 'Organization', href: '?tab=organization' }, { value: 'billing', label: 'Billing', href: '?tab=billing' }]} />
		</AppPageHeader>
	);
}

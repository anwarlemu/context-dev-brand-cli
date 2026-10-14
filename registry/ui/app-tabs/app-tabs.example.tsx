'use client';

import { useState } from 'react';
import { AppTabs } from '@/components/ds/ui/app-tabs';

export default function Example() {
	const [tab, setTab] = useState<'personal' | 'organization' | 'billing'>('personal');
	return (
		<AppTabs
			label="Settings sections"
			value={tab}
			onChange={setTab}
			options={[
				{ value: 'personal', label: 'Personal' },
				{ value: 'organization', label: 'Organization' },
				{ value: 'billing', label: 'Billing' },
			]}
		/>
	);
}

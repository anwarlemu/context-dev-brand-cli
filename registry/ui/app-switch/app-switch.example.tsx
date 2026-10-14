'use client';

import { useState } from 'react';
import { AppSwitch } from '@/components/ds/ui/app-switch';

export default function Example() {
	const [checked, setChecked] = useState(false);
	return <AppSwitch label="Main content only" checked={checked} onCheckedChange={setChecked} />;
}

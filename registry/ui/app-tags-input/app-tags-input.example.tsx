'use client';

import { useState } from 'react';
import { AppTagsInput } from '@/components/ds/ui/app-tags-input';

export default function Example() {
	const [tags, setTags] = useState(['context.dev', 'stripe.com']);
	return <AppTagsInput id="domains" tags={tags} onChange={setTags} placeholder="Add domains" />;
}

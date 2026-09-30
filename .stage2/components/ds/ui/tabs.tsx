'use client';

import { type ReactNode, useId, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type TabsProps = { label: string; items: { id: string; label: string; content: ReactNode }[]; defaultId?: string };

export function Tabs({ label, items, defaultId }: TabsProps) {
	const [active, setActive] = useState(defaultId ?? items[0]?.id);
	const base = useId();
	return (
		<div className="flex flex-col gap-6">
			<div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
				{items.map((item) => (
					<button
						key={item.id}
						role="tab"
						type="button"
						id={`${base}-${item.id}-tab`}
						aria-selected={active === item.id}
						aria-controls={`${base}-${item.id}-panel`}
						onClick={() => setActive(item.id)}
						className={cx('rounded-pill border px-4 py-2 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus', active === item.id ? 'border-brand text-brand' : 'border-line text-fg-muted hover:text-fg')}
					>
						{item.label}
					</button>
				))}
			</div>
			{items.map((item) => (
				<div key={item.id} role="tabpanel" id={`${base}-${item.id}-panel`} aria-labelledby={`${base}-${item.id}-tab`} hidden={active !== item.id}>
					{item.content}
				</div>
			))}
		</div>
	);
}

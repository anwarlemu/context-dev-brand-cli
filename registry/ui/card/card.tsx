import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type CardProps = { tone?: 'white' | 'blue'; padding?: 'default' | 'none'; children: ReactNode };

export function Card({ tone = 'white', padding = 'default', children }: CardProps) {
	return (
		<div className={cx('rounded-window p-1', tone === 'white' ? 'bg-tint' : 'bg-blue-80')}>
			<div className={cx('flex h-full flex-col rounded-card', tone === 'white' ? 'bg-surface text-fg' : 'bg-brand text-on-brand', padding === 'default' && 'gap-4 p-6')}>{children}</div>
		</div>
	);
}

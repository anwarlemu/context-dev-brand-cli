import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

const TONES = { brand: 'bg-tint text-brand', neutral: 'bg-surface-subtle text-fg-muted', 'on-brand': 'bg-surface text-brand', success: 'bg-surface-subtle text-success' } as const;

export function Badge({ tone = 'brand', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
	return <span className={cx('inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-caption font-medium', TONES[tone])}>{children}</span>;
}

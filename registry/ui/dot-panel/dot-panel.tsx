'use client';

import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { RING_CLEAR_ATTRIBUTE, RingBackdrop } from '@/components/ds/ui/ring-backdrop';

const TONES = {
	blue: { ring: 'bg-tint', panel: 'bg-brand', color: 'var(--ds-color-white)', opacity: 0.22 },
	white: { ring: 'bg-tint', panel: 'bg-surface', color: 'var(--ds-color-brand)', opacity: 0.25 },
} as const;

export type DotPanelProps = { tone?: keyof typeof TONES; padding?: 'default' | 'none'; children: ReactNode };

// The rings clear around the content (RING_CLEAR_ATTRIBUTE), so no ring is ever cut by it.
export function DotPanel({ tone = 'white', padding = 'default', children }: DotPanelProps) {
	const t = TONES[tone];
	return (
		<div className={cx('w-full rounded-window p-2', t.ring)}>
			<div className={cx('relative overflow-hidden rounded-window', t.panel, padding === 'default' && 'p-6 md:px-12 md:py-10')}>
				<RingBackdrop color={t.color} opacity={t.opacity} className="inset-2 rounded-window md:inset-3" />
				<div {...{ [RING_CLEAR_ATTRIBUTE]: '' }} className="relative flex w-full justify-center">{children}</div>
			</div>
		</div>
	);
}

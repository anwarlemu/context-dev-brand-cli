import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type ChipProps = { href?: string; tone?: 'default' | 'on-brand'; children: ReactNode };

export function Chip({ href, tone = 'default', children }: ChipProps) {
	const className = cx('inline-flex items-center rounded-pill border px-2.5 py-1 text-body-sm', tone === 'default' ? 'border-line-strong bg-surface text-fg-muted' : 'border-on-brand text-on-brand', href && 'transition-colors duration-150 ease-out hover:border-brand hover:text-brand');
	return href ? <a href={href} className={className}>{children}</a> : <span className={className}>{children}</span>;
}

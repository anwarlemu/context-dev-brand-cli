import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type AppCardProps = {
	/** default: a white card on the page. raised: a quieter card, or a card inside a card. interactive: a link or button card that answers hover with the glass ring. */
	variant?: 'default' | 'raised' | 'interactive';
	title?: ReactNode;
	/** One quiet action at the header's right end, such as a "Manage keys" link. */
	action?: ReactNode;
	/** A footer line under a hairline, such as a period chip or a note. */
	footer?: ReactNode;
	href?: string;
	padded?: boolean;
	className?: string;
	children: ReactNode;
};

export function AppCard({ variant = 'default', title, action, footer, href, padded = true, className, children }: AppCardProps) {
	const classes = cx(
		'flex min-w-0 flex-col rounded-window bg-surface text-left',
		variant === 'raised' ? 'shadow-raised' : 'shadow-card',
		variant === 'interactive' && 'outline-none transition-shadow duration-150 ease-out hover:shadow-glass-hover focus-visible:shadow-glass-hover',
		className,
	);
	const body = (
		<>
			{(title || action) && (
				<div className="flex min-h-12 items-center gap-3 border-b border-line-subtle px-4 py-2.5">
					<div className="min-w-0 flex-1 truncate text-body-sm text-fg">{title}</div>
					{action}
				</div>
			)}
			<div className={cx('min-h-0 flex-1', padded && 'p-4')}>{children}</div>
			{footer && <div className="flex items-center gap-2 border-t border-line-subtle px-4 py-2.5 text-caption text-fg-subtle">{footer}</div>}
		</>
	);
	if (href) return <a href={href} className={classes}>{body}</a>;
	return <div className={classes}>{body}</div>;
}

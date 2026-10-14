'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { cx } from '@/components/ds/ui/cx';

const SIZES = { sm: 'size-7', md: 'size-8' } as const;

export type AppIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
	/** Read by screen readers and shown as the tooltip. Required: an icon alone is never the only label. */
	label: string;
	size?: keyof typeof SIZES;
	/** Where the tooltip sits. */
	side?: 'top' | 'right';
	/** Holds the hover look while the menu or panel it opens is open. */
	open?: boolean;
	tooltipClassName?: string;
	children: ReactNode;
};

/** The square ghost icon button: close, row menus, search, reveal, copy. */
export function AppIconButton({ label, size = 'md', side = 'top', open, className, tooltipClassName, type = 'button', ...props }: AppIconButtonProps) {
	return (
		<AppTooltip label={label} side={side} enabled={!open} className={cx('shrink-0', tooltipClassName)}>
			<button
				type={type}
				aria-label={label}
				aria-expanded={open}
				className={cx(
					'grid shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover disabled:pointer-events-none disabled:opacity-40',
					SIZES[size],
					open && 'bg-wash/4 text-fg',
					className,
				)}
				{...props}
			/>
		</AppTooltip>
	);
}

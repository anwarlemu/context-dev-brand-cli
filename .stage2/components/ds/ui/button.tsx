import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

const VARIANTS = {
	primary: 'bg-action text-on-action border-action hover:bg-action-hover hover:border-action-hover',
	secondary: 'bg-surface text-brand border-brand hover:bg-tint',
	'on-brand': 'bg-brand text-on-brand border-on-brand hover:bg-navy-90',
	quiet: 'bg-surface text-fg border-line hover:bg-surface-subtle',
} as const;

export type ButtonProps = {
	variant?: keyof typeof VARIANTS;
	size?: 'default' | 'small';
	href?: string;
	type?: 'button' | 'submit';
	onClick?: () => void;
	disabled?: boolean;
	children: ReactNode;
};

export function Button({ variant = 'secondary', size = 'default', href, type = 'button', onClick, disabled, children }: ButtonProps) {
	const className = cx(
		'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-sans font-regular transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50',
		size === 'default' ? 'px-5 py-3 text-button' : 'px-4 py-2 text-body-sm',
		VARIANTS[variant],
	);
	if (href) return <a href={href} className={className}>{children}</a>;
	return <button type={type} onClick={onClick} disabled={disabled} className={className}>{children}</button>;
}

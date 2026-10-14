import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/components/ds/ui/cx';

const VARIANTS = {
	brand: 'bg-brand text-on-brand hover:bg-blue-90',
	primary: 'bg-action text-on-action hover:bg-action-hover',
	outline: 'border border-line-strong text-fg hover:border-fg',
	'outline-brand': 'border border-accent text-accent hover:bg-blue-10',
	ghost: 'text-fg-muted hover:bg-wash/4 hover:text-fg',
	'on-brand': 'border border-on-brand text-on-brand hover:bg-white/10',
} as const;

const SIZES = {
	sm: 'h-8 gap-1.5 px-3.5 text-body-sm',
	md: 'h-10 gap-1.5 px-4.5 text-body-sm',
} as const;

export type AppButtonVariant = keyof typeof VARIANTS;

/** Classes for anything that should look like a button, such as a Next.js Link. */
export function appButtonClassName(variant: AppButtonVariant = 'outline', size: keyof typeof SIZES = 'md') {
	return cx(
		'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-sans outline-none transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out focus-visible:shadow-ring-hover active:scale-97 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50',
		VARIANTS[variant],
		SIZES[size],
	);
}

export type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: AppButtonVariant;
	size?: keyof typeof SIZES;
};

export function AppButton({ variant, size, className, type = 'button', ...props }: AppButtonProps) {
	return <button type={type} className={cx(appButtonClassName(variant, size), className)} {...props} />;
}

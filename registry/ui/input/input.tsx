import type { InputHTMLAttributes } from 'react';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style'> & { label: string; hideLabel?: boolean };

export function Input({ label, hideLabel, id, ...props }: InputProps) {
	const inputId = id ?? props.name;
	return (
		<label htmlFor={inputId} className="flex flex-col gap-2">
			<span className={hideLabel ? 'sr-only' : 'text-body-sm text-fg-muted'}>{label}</span>
			<input id={inputId} {...props} className="w-full rounded-card border border-line bg-surface px-4 py-3 text-body text-fg placeholder:text-fg-subtle transition-colors duration-150 ease-out focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
		</label>
	);
}

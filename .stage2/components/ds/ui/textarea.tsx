import type { TextareaHTMLAttributes } from 'react';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> & { label: string; hideLabel?: boolean };

export function Textarea({ label, hideLabel, id, rows = 4, ...props }: TextareaProps) {
	const fieldId = id ?? props.name;
	return (
		<label htmlFor={fieldId} className="flex flex-col gap-2">
			<span className={hideLabel ? 'sr-only' : 'text-body-sm text-fg-muted'}>{label}</span>
			<textarea id={fieldId} rows={rows} {...props} className="w-full rounded-card border border-line bg-surface px-4 py-3 text-body text-fg placeholder:text-fg-subtle transition-colors duration-150 ease-out focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus resize-y" />
		</label>
	);
}

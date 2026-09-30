import type { SelectHTMLAttributes } from 'react';

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style' | 'children'> & { label: string; options: { value: string; label: string }[] };

export function Select({ label, options, id, ...props }: SelectProps) {
	const fieldId = id ?? props.name;
	return (
		<label htmlFor={fieldId} className="flex flex-col gap-2">
			<span className="text-body-sm text-fg-muted">{label}</span>
			<select id={fieldId} {...props} className="w-full rounded-card border border-line bg-surface px-4 py-3 text-body text-fg placeholder:text-fg-subtle transition-colors duration-150 ease-out focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus appearance-none">
				{options.map((o) => (
					<option key={o.value} value={o.value}>{o.label}</option>
				))}
			</select>
		</label>
	);
}

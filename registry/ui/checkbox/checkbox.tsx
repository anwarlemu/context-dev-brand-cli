import type { InputHTMLAttributes, ReactNode } from 'react';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'type'> & { children: ReactNode };

export function Checkbox({ children, ...props }: CheckboxProps) {
	return (
		<label className="inline-flex items-center gap-2 text-body-sm text-fg">
			<input type="checkbox" {...props} className="size-4 rounded-sm border border-line-strong accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
			{children}
		</label>
	);
}

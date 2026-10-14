'use client';

import { type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, useId } from 'react';
import { cx } from '@/components/ds/ui/cx';

const FIELD_STATES = 'outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-fg-subtle hover:border-line-strong focus:border-brand disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger';

export const APP_INPUT_CLASS = cx('h-10 w-full rounded-control border border-line bg-surface px-3.5 text-body-sm text-fg', FIELD_STATES);

export const APP_TEXTAREA_CLASS = cx('w-full resize-none rounded-control border border-line bg-surface px-3.5 py-2.5 text-body-sm text-fg', FIELD_STATES);

export type AppFieldProps = {
	label: string;
	/** A quiet line under the control, replaced by the error when there is one. */
	help?: ReactNode;
	error?: string;
	/** A quiet action beside the label, such as "Change". */
	labelAction?: ReactNode;
	/** Renders the control with the id that ties it to the label. */
	children: (id: string, invalid: boolean) => ReactNode;
};

/** Label, control and one line of help or error, 8px apart. */
export function AppField({ label, help, error, labelAction, children }: AppFieldProps) {
	const id = useId();
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline gap-2">
				<label htmlFor={id} className="text-body-sm text-fg">
					{label}
				</label>
				{labelAction}
			</div>
			{children(id, !!error)}
			{(error || help) && <p className={cx('text-caption', error ? 'text-danger' : 'text-fg-subtle')}>{error ?? help}</p>}
		</div>
	);
}

export function AppInput({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
	return <input aria-invalid={invalid || undefined} className={cx(APP_INPUT_CLASS, className)} {...props} />;
}

export function AppTextarea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
	return <textarea aria-invalid={invalid || undefined} className={cx(APP_TEXTAREA_CLASS, className)} {...props} />;
}

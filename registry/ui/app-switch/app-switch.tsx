'use client';

import { cx } from '@/components/ds/ui/cx';

export type AppSwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label: string;
	disabled?: boolean;
};

export function AppSwitch({ checked, onCheckedChange, label, disabled }: AppSwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			// The thumb sits 3/16 of a rem inside the track on every side, so it reads as held by the track. Off, a hairline gives
			// the pale track an edge; on, the brand blue needs none.
			className={cx(
				'relative inline-flex h-5 w-9 shrink-0 items-center rounded-pill outline-none transition-[background-color,box-shadow] duration-200 ease-out focus-visible:shadow-ring-hover disabled:pointer-events-none disabled:opacity-50',
				checked ? 'bg-brand' : 'bg-neutral-10 shadow-inset-hairline',
			)}
		>
			{/* A soft shadow only: a dark one turns into a gray halo against the blue. */}
			<span
				className={cx(
					'size-3.5 rounded-pill bg-white shadow-thumb transition-transform duration-200 ease-emphasized motion-reduce:transition-none',
					// In rem like the track and thumb, so the travel scales with them.
					checked ? 'translate-x-[1.1875rem]' : 'translate-x-[0.1875rem]',
				)}
			/>
		</button>
	);
}

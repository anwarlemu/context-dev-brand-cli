'use client';

import { cx } from '@/components/ds/ui/cx';
import { useHold } from './app-hold';

export const HOLD_MS = 1200;

export type AppHoldButtonProps = { label: string; onConfirm: () => void; holdMs?: number };

/** A destructive button that only fires after being held down, so a stray click can't delete anything. */
export function AppHoldButton({ label, onConfirm, holdMs = HOLD_MS }: AppHoldButtonProps) {
	const { isHolding, handlers } = useHold(holdMs, onConfirm);

	return (
		<button
			type="button"
			{...handlers}
			className="relative inline-flex h-8 shrink-0 select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-control border border-danger px-3.5 text-body-sm text-danger outline-none focus-visible:shadow-ring-hover"
		>
			{/* Fills from the left for the whole hold (linear: it is a progress bar), and snaps back in 150ms on release. */}
			<span
				aria-hidden
				className={cx('absolute inset-0 origin-left bg-danger transition-transform', isHolding ? 'scale-x-100 ease-linear' : 'scale-x-0 duration-150 ease-out')}
				style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
			/>
			<span className={cx('relative transition-colors duration-150 ease-out', isHolding && 'text-on-brand')}>{isHolding ? 'Keep holding…' : label}</span>
		</button>
	);
}

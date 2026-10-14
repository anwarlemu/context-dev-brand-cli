import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

/** Fires `onConfirm` only after the pointer or key stays down for `durationMs`, so a stray click can't do anything. */
export function useMenuHold(durationMs: number, onConfirm: () => void) {
	const [isHolding, setHolding] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	function start() {
		if (isHolding) return;
		setHolding(true);
		timeoutRef.current = setTimeout(() => {
			setHolding(false);
			onConfirm();
		}, durationMs);
	}

	function cancel() {
		clearTimeout(timeoutRef.current);
		setHolding(false);
	}

	const handlers = {
		onPointerDown: start,
		onPointerUp: cancel,
		onPointerLeave: cancel,
		onKeyDown: (event: KeyboardEvent) => {
			if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
				event.preventDefault();
				start();
			}
		},
		onKeyUp: cancel,
		onBlur: cancel,
	};

	return { isHolding, handlers };
}

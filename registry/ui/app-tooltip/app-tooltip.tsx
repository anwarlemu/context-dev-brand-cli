'use client';

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/components/ds/ui/cx';

// Where the label sits against its trigger: beside it, above it, or below it when there's no room above.
type Anchor = { x: number; y: number; placement: 'right' | 'top' | 'bottom'; warm: boolean };
// The least room kept between a label and the window's edges.
const EDGE_MARGIN = 8;
// Hovering waits a beat before the label appears, so passing over a control doesn't flash it. Once one is showing, the
// next one hovered within the warm window appears at once, so sweeping along a row of icons doesn't wait on every one.
const SHOW_DELAY_MS = 1000;
const WARM_MS = 300;
let lastHiddenAt = 0;

const PLACEMENT = {
	top: '-translate-x-1/2 -translate-y-full origin-bottom',
	bottom: '-translate-x-1/2 origin-top',
	right: '-translate-y-1/2 origin-left',
} as const;

export type AppTooltipProps = {
	label: string;
	enabled?: boolean;
	side?: 'right' | 'top';
	/** Lets a sentence-long label wrap at a readable width instead of running on one line. */
	wrap?: boolean;
	/** Classes for the wrapper, which takes the trigger's place in its parent's layout. */
	className?: string;
	children: ReactNode;
};

/** A label beside (or above) its trigger on hover or keyboard focus, portaled so clipped containers can't cut it off. */
export function AppTooltip({ label, enabled = true, side = 'right', wrap = false, className, children }: AppTooltipProps) {
	const [anchor, setAnchor] = useState<Anchor | null>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	// Once drawn, keep the label inside the window. Margins, so the nudge never fights the entrance's transform.
	useLayoutEffect(() => {
		const tooltip = tooltipRef.current;
		if (!tooltip || !anchor) return;
		tooltip.style.margin = '';
		const rect = tooltip.getBoundingClientRect();
		const dx = Math.max(0, EDGE_MARGIN - rect.left) - Math.max(0, rect.right - (window.innerWidth - EDGE_MARGIN));
		const dy = Math.max(0, EDGE_MARGIN - rect.top) - Math.max(0, rect.bottom - (window.innerHeight - EDGE_MARGIN));
		if (dx || dy) tooltip.style.margin = `${dy}px 0 0 ${dx}px`;
	}, [anchor]);
	const showTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(showTimeout.current), []);
	const isOpen = enabled && anchor !== null;

	// Any way the tooltip goes away (pointer leave, blur, click, scroll, unmount) starts the warm window.
	useEffect(() => {
		if (!isOpen) return;
		return () => {
			lastHiddenAt = performance.now();
		};
	}, [isOpen]);

	// A scroll moves the trigger out from under a fixed tooltip, so it closes rather than drifting.
	useEffect(() => {
		if (!isOpen) return;
		const close = () => setAnchor(null);
		window.addEventListener('scroll', close, true);
		return () => window.removeEventListener('scroll', close, true);
	}, [isOpen]);

	// Keyboard focus shows it at once; a pointer waits out the delay unless a tooltip just closed.
	const show = (element: HTMLElement, immediately = false) => {
		const warm = performance.now() - lastHiddenAt < WARM_MS;
		const place = () => {
			const rect = element.getBoundingClientRect();
			const fitsAbove = rect.top - 6 - 32 >= EDGE_MARGIN;
			setAnchor(
				side === 'top'
					? fitsAbove
						? { x: rect.left + rect.width / 2, y: rect.top - 6, placement: 'top', warm }
						: { x: rect.left + rect.width / 2, y: rect.bottom + 6, placement: 'bottom', warm }
					: { x: rect.right + 8, y: rect.top + rect.height / 2, placement: 'right', warm },
			);
		};
		clearTimeout(showTimeout.current);
		if (immediately || warm) place();
		else showTimeout.current = setTimeout(place, SHOW_DELAY_MS);
	};
	const hide = () => {
		clearTimeout(showTimeout.current);
		setAnchor(null);
	};

	return (
		<span
			className={cx('flex flex-col', className)}
			onPointerEnter={(event) => show(event.currentTarget)}
			onPointerLeave={hide}
			onFocus={(event) => event.currentTarget.contains(event.target) && event.target.matches(':focus-visible') && show(event.currentTarget, true)}
			onBlur={hide}
			onClick={hide}
		>
			{children}
			{isOpen &&
				createPortal(
					<div
						ref={tooltipRef}
						role="tooltip"
						className={cx(
							'pointer-events-none fixed z-50 rounded-control bg-surface px-2 py-1 text-micro text-fg shadow-tooltip',
							PLACEMENT[anchor.placement],
							// The first label of a sweep grows from its trigger; warm ones are instant.
							!anchor.warm && 'popover-in',
							wrap ? 'w-max max-w-64 text-pretty' : 'whitespace-nowrap',
						)}
						style={{ left: anchor.x, top: anchor.y }}
					>
						{label}
					</div>,
					document.body,
				)}
		</span>
	);
}

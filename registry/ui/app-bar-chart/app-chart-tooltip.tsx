'use client';

import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/components/ds/ui/cx';

export type ChartCursor = { x: number; y: number };
export type ChartTooltipRow = { key: string; label: string; dotClass?: string; value: number };

// How far the card sits from the pointer, and from the window's edges.
const CURSOR_GAP = 14;
const EDGE_GAP = 8;

const formatCount = (value: number) => value.toLocaleString('en-US');
export const formatShare = (share: number) => (share > 0 && share < 0.01 ? '<1%' : `${Math.round(share * 100)}%`);

/**
 * The one hover card every chart shares: small, pinned just off the pointer (below right, flipping where it would run
 * past the window). It moves with the pointer at once, with no easing, since it is read while moving.
 */
export function AppChartTooltip({ cursor, title, total, unit, rows = [] }: { cursor: ChartCursor; title: ReactNode; total: number; unit: string; rows?: ChartTooltipRow[] }) {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const card = ref.current;
		if (!card) return;
		const { width, height } = card.getBoundingClientRect();
		const fitsRight = cursor.x + CURSOR_GAP + width <= window.innerWidth - EDGE_GAP;
		const fitsBelow = cursor.y + CURSOR_GAP + height <= window.innerHeight - EDGE_GAP;
		card.style.left = `${Math.max(EDGE_GAP, fitsRight ? cursor.x + CURSOR_GAP : cursor.x - CURSOR_GAP - width)}px`;
		card.style.top = `${Math.max(EDGE_GAP, fitsBelow ? cursor.y + CURSOR_GAP : cursor.y - CURSOR_GAP - height)}px`;
	});
	const shown = rows.filter((row) => row.value > 0);

	return createPortal(
		<div ref={ref} role="tooltip" className="pointer-events-none fixed top-0 left-0 z-50 w-max min-w-40 rounded-control bg-surface px-2.5 py-2 text-caption shadow-floating">
			<div className="flex items-baseline justify-between gap-5">
				<span className="font-medium text-fg">{title}</span>
				<span className="text-fg-muted">
					<span className="font-medium text-fg tabular-nums">{formatCount(total)}</span> {total === 1 ? unit.replace(/s$/, '') : unit}
				</span>
			</div>
			{shown.length > 0 && (
				<ul className="mt-1.5 flex flex-col gap-1 border-t border-line-subtle pt-1.5">
					{shown.map((row) => (
						<li key={row.key} className="flex items-center gap-2">
							<span className={cx('size-1.5 shrink-0 rounded-pill', row.dotClass ?? 'bg-brand')} aria-hidden />
							<span className="flex-1 text-fg-muted">{row.label}</span>
							<span className="font-medium tabular-nums">{formatCount(row.value)}</span>
							<span className="w-8 text-right text-fg-subtle tabular-nums">{formatShare(total === 0 ? 0 : row.value / total)}</span>
						</li>
					))}
				</ul>
			)}
		</div>,
		document.body,
	);
}

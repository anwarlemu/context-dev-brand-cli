"use client";

'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type ReactNode } from 'react';

// The dot window from the product stories (extract-story-scenes.ts), drawn around live content: blue dots on a 10px
// grid, a solid title bar with three hollow window buttons, and a one-dot outline.
export const DOT_WINDOW_PITCH = 10;
const DOT_RADIUS = 3.2;
const RING_STROKE = 1;
const TITLE_BAR_ROWS = 4;
const BUTTON_ROW = 2;
const BUTTON_COLUMNS = [2, 4, 6];

const circle = (cx: number, cy: number, r: number) => `M${(cx + r).toFixed(2)} ${cy.toFixed(2)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0`;

function useSize<T extends Element>() {
	const ref = useRef<T>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		// The border box, not contentRect: the window pads its content, and the dots run along the padded outer edge.
		const observer = new ResizeObserver(([entry]) => {
			const [box] = entry.borderBoxSize;
			setSize({ width: box.inlineSize, height: box.blockSize });
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return [ref, size] as const;
}

// Whole dots only: the grid stretches its spacing a little so the last dot lands on the edge instead of being cut.
function gridOf(length: number) {
	const count = Math.max(1, Math.floor(length / DOT_WINDOW_PITCH));
	const step = length / count;
	return { count, at: (index: number) => (index + 0.5) * step };
}

function dotWindowPaths(width: number, height: number) {
	let filled = '';
	let hollow = '';
	if (width <= 0 || height <= 0) return { filled, hollow };
	const columns = gridOf(width);
	const rows = gridOf(height);
	for (let row = 0; row < rows.count; row++) {
		for (let column = 0; column < columns.count; column++) {
			const inTitleBar = row < TITLE_BAR_ROWS;
			const onEdge = column === 0 || column === columns.count - 1 || row === rows.count - 1;
			if (!inTitleBar && !onEdge) continue;
			const isButton = row === BUTTON_ROW && BUTTON_COLUMNS.includes(column);
			if (isButton) hollow += circle(columns.at(column), rows.at(row), DOT_RADIUS - RING_STROKE / 2);
			else filled += circle(columns.at(column), rows.at(row), DOT_RADIUS);
		}
	}
	return { filled, hollow };
}

/** Live content framed as a dot window. The content sits inside the outline, below the title bar. */
export function DotWindow({ children, className }: { children: ReactNode; className?: string }) {
	const [ref, { width, height }] = useSize<HTMLDivElement>();
	const { filled, hollow } = dotWindowPaths(width, height);
	return (
		<div ref={ref} className={cn('relative', className)} style={{ paddingTop: (TITLE_BAR_ROWS + 1) * DOT_WINDOW_PITCH, paddingInline: 2 * DOT_WINDOW_PITCH, paddingBottom: 2 * DOT_WINDOW_PITCH }}>
			<svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full text-brand">
				<path d={filled} fill="currentColor" />
				<path d={hollow} fill="none" stroke="currentColor" strokeWidth={RING_STROKE} />
			</svg>
			<div className="relative">{children}</div>
		</div>
	);
}

/**
 * A row of dots on the window's grid: hollow, with the stretch between `from` and `to` (px from the row's left edge)
 * filled, or all of it filled when `full`. Each dot eases between hollow and filled, so a moving range sweeps along.
 */
export function DotRule({ from = 0, to = -1, full = false, className }: { from?: number; to?: number; full?: boolean; className?: string }) {
	const [ref, { width }] = useSize<SVGSVGElement>();
	const columns = gridOf(width);
	const dots = width > 0 ? Array.from({ length: columns.count }, (_, index) => columns.at(index)) : [];
	return (
		<svg ref={ref} aria-hidden="true" className={cn('block h-[10px] w-full text-brand', className)}>
			{dots.map((cx) => {
				const isFilled = full || (cx >= from && cx <= to);
				return <circle key={cx} cx={cx} cy={DOT_WINDOW_PITCH / 2} r={DOT_RADIUS - RING_STROKE / 2} strokeWidth={RING_STROKE} stroke="currentColor" fill="currentColor" className="transition-[fill-opacity] duration-200 ease-out motion-reduce:transition-none" style={{ fillOpacity: isFilled ? 1 : 0 }} />;
			})}
		</svg>
	);
}

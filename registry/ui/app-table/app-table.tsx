'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ds/ui/app-skeleton';
import { cx } from '@/components/ds/ui/cx';

/** The card and the table. The card doesn't clip, so row menus can open past its edge; the header rounds its own corners instead. */
export function AppTable({ className, children }: { className?: string; children: ReactNode }) {
	return (
		<div className={cx('rounded-window bg-surface shadow-card', className)}>
			<table className="w-full text-left text-body-sm max-sm:table-fixed">{children}</table>
		</div>
	);
}

/** The gray header row, a step darker than a hovered row so the two never read as the same thing. */
export function AppTableHead({ children }: { children: ReactNode }) {
	return (
		<thead className="text-caption text-fg-subtle">
			<tr className="[&>th]:bg-neutral-10/40 [&>th:first-child]:rounded-tl-window [&>th:last-child]:rounded-tr-window">{children}</tr>
		</thead>
	);
}

/** A header cell. Pass `actions` for the narrow, unlabeled column that holds each row's menu. */
export function AppTableHeader({ actions = false, className, children }: { actions?: boolean; className?: string; children?: ReactNode }) {
	if (actions) return <th className={cx('w-12 px-2 py-2.5', className)} aria-label="Actions" />;
	return <th className={cx('px-4 py-2.5 font-regular', className)}>{children}</th>;
}

export function AppTableBody({ children }: { children: ReactNode }) {
	return <tbody className="divide-y divide-line-subtle">{children}</tbody>;
}

export function AppTableRow({ onClick, selected = false, children }: { onClick?: () => void; selected?: boolean; children: ReactNode }) {
	return (
		<tr
			onClick={onClick}
			aria-selected={selected || undefined}
			className={cx('transition-colors duration-150 ease-out', selected ? 'bg-blue-10/60' : onClick && 'cursor-pointer hover:bg-neutral-5/60')}
		>
			{children}
		</tr>
	);
}

/** A body cell. `actions` holds the row's ActionMenu and stops its clicks from opening the row. */
export function AppTableCell({ actions = false, className, children }: { actions?: boolean; className?: string; children?: ReactNode }) {
	if (actions)
		return (
			<td className={cx('px-2 py-1.5', className)} onClick={(event) => event.stopPropagation()}>
				{children}
			</td>
		);
	return <td className={cx('px-4 py-3', className)}>{children}</td>;
}

/** One quiet sentence when nothing matches: say what was filtered, not that something went wrong. */
export function AppTableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
	return (
		<tr>
			<td colSpan={colSpan} className="px-4 py-12 text-center text-fg-subtle">
				{children}
			</td>
		</tr>
	);
}

/** Skeleton rows at the real row height, as many as the page will show. */
export function AppTableLoading({ rows, columns }: { rows: number; columns: number }) {
	return (
		<>
			{Array.from({ length: rows }, (_, row) => (
				<tr key={row}>
					{Array.from({ length: columns }, (_, column) => (
						<td key={column} className="px-4 py-3">
							<Skeleton className={cx('h-4', column === 0 ? 'w-40' : 'w-20')} />
						</td>
					))}
				</tr>
			))}
		</>
	);
}

const PAGE_BUTTON = 'flex h-8 items-center gap-1 rounded-control px-3 text-fg-muted outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover disabled:pointer-events-none disabled:opacity-40';

/** Under the table: the range shown on the left, then Previous and Next as ghost buttons. */
export function AppTablePagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void }) {
	const first = total === 0 ? 0 : page * pageSize + 1;
	const last = Math.min(total, (page + 1) * pageSize);
	return (
		<nav aria-label="Pagination" className="mt-3 flex items-center gap-1 text-body-sm">
			<span className="mr-auto text-fg-subtle tabular-nums">
				{first.toLocaleString('en-US')}–{last.toLocaleString('en-US')} of {total.toLocaleString('en-US')}
			</span>
			<button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)} className={PAGE_BUTTON}>
				<ChevronLeft className="size-3.5" strokeWidth={1.5} />
				Previous
			</button>
			<button type="button" disabled={last >= total} onClick={() => onPageChange(page + 1)} className={PAGE_BUTTON}>
				Next
				<ChevronRight className="size-3.5" strokeWidth={1.5} />
			</button>
		</nav>
	);
}

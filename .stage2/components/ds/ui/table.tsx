import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type TableProps = { caption: string; columns: { key: string; label: string; align?: 'left' | 'right' }[]; rows: Record<string, ReactNode>[] };

export function Table({ caption, columns, rows }: TableProps) {
	return (
		<div className="overflow-x-auto rounded-window bg-tint p-1">
			<table className="w-full border-collapse rounded-card bg-surface text-body-sm">
				<caption className="sr-only">{caption}</caption>
				<thead>
					<tr className="border-b border-line">
						{columns.map((c) => (
							<th key={c.key} scope="col" className={cx('px-4 py-3 font-medium text-fg-muted', c.align === 'right' ? 'text-right' : 'text-left')}>{c.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr key={i} className="border-b border-line-subtle last:border-b-0">
							{columns.map((c) => (
								<td key={c.key} className={cx('px-4 py-3 text-fg tabular-nums', c.align === 'right' ? 'text-right' : 'text-left')}>{row[c.key]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

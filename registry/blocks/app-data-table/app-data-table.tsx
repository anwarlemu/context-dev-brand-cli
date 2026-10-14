'use client';

import { Eye, KeyRound, Pause, Pencil, Play, RotateCw, Search, Square, Trash2, UserMinus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { ActionMenu, SelectMenu } from '@/components/ds/ui/app-menu';
import { AppStatus, type AppStatusTone } from '@/components/ds/ui/app-status';
import { AppTable, AppTableBody, AppTableCell, AppTableEmpty, AppTableHead, AppTableHeader, AppTableLoading, AppTablePagination, AppTableRow } from '@/components/ds/ui/app-table';
import { AppTabs } from '@/components/ds/ui/app-tabs';
import { cx } from '@/components/ds/ui/cx';

const ICONS = { eye: Eye, key: KeyRound, pause: Pause, pencil: Pencil, play: Play, resend: RotateCw, stop: Square, trash: Trash2, remove: UserMinus, revoke: X } as const;
export type AppDataTableIcon = keyof typeof ICONS;

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' } as const;

export type AppDataTableColumn = { key: string; label: string; align?: 'left' | 'right'; hideBelow?: keyof typeof HIDE };
/** A cell: plain text, a title with a quiet second line, a mono value, or a status (dot and word). */
export type AppDataTableCell = string | number | { title: string; sub?: string } | { mono: string } | { status: AppStatusTone; label: string };
export type AppDataTableRow = { id: string; href?: string; group?: string; cells: Record<string, AppDataTableCell> };
export type AppDataTableAction = { id: string; label: string; icon?: AppDataTableIcon; danger?: boolean; hold?: boolean; href?: string };

export type AppDataTableProps = {
	columns: AppDataTableColumn[];
	rows: AppDataTableRow[];
	searchPlaceholder?: string;
	/** Status tabs over the table, with counts. `value` matches a row's `group`; "all" shows every row. */
	tabs?: Array<{ value: string; label: string }>;
	/** One ghost filter at the right, matching a row's `group`. Use tabs or a filter, not both. */
	filter?: { label: string; options: Array<{ value: string; label: string }> };
	actions?: AppDataTableAction[];
	emptyText?: string;
	pageSize?: number;
	selectedId?: string;
	loading?: boolean;
	/** For client callers. Without it, a held or clicked action just closes the menu. */
	onAction?: (actionId: string, rowId: string) => void;
};

function text(cell: AppDataTableCell | undefined) {
	if (cell === undefined) return '';
	if (typeof cell !== 'object') return String(cell);
	return 'title' in cell ? `${cell.title} ${cell.sub ?? ''}` : 'mono' in cell ? cell.mono : cell.label;
}

function Cell({ cell }: { cell: AppDataTableCell | undefined }) {
	if (cell === undefined) return null;
	if (typeof cell !== 'object') return <span className={typeof cell === 'number' ? 'tabular-nums' : undefined}>{typeof cell === 'number' ? cell.toLocaleString('en-US') : cell}</span>;
	if ('title' in cell)
		return (
			<>
				<span className="block truncate">{cell.title}</span>
				{cell.sub && <span className="block truncate text-caption text-fg-subtle">{cell.sub}</span>}
			</>
		);
	if ('mono' in cell) return <span className="block truncate font-mono text-caption text-fg-muted">{cell.mono}</span>;
	return <AppStatus variant={cell.status}>{cell.label}</AppStatus>;
}

export function AppDataTable({ columns, rows, searchPlaceholder = 'Search', tabs, filter, actions, emptyText = 'Nothing matches these filters.', pageSize = 10, selectedId, loading = false, onAction }: AppDataTableProps) {
	const [query, setQuery] = useState('');
	const [group, setGroup] = useState('all');
	const [page, setPage] = useState(0);
	const visible = useMemo(() => {
		const q = query.trim().toLowerCase();
		return rows.filter((row) => (group === 'all' || row.group === group) && (!q || columns.some((c) => text(row.cells[c.key]).toLowerCase().includes(q))));
	}, [rows, columns, query, group]);
	const shown = visible.slice(page * pageSize, (page + 1) * pageSize);
	const colSpan = columns.length + (actions?.length ? 1 : 0);
	const pick = (value: string) => {
		setGroup(value);
		setPage(0);
	};

	return (
		<AppBlock block="app-data-table" className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<label className="flex h-8 w-64 max-w-full items-center gap-2 rounded-control border border-line px-3 transition-[border-color,box-shadow] duration-150 ease-out hover:border-line-strong focus-within:border-brand">
					<Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setPage(0);
						}}
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-fg-subtle"
					/>
				</label>
				{tabs && <AppTabs label="Filter" size="sm" value={group} onChange={pick} options={tabs.map((t) => ({ ...t, count: t.value === 'all' ? rows.length : rows.filter((r) => r.group === t.value).length }))} />}
				{filter && <SelectMenu label={filter.label} value={group} align="right" onChange={pick} options={[{ value: 'all', label: `All ${filter.label.toLowerCase()}` }, ...filter.options]} />}
			</div>
			<div>
				<AppTable>
					<AppTableHead>
						{columns.map((c) => (
							<AppTableHeader key={c.key} className={cx(c.align === 'right' && 'text-right', c.hideBelow && HIDE[c.hideBelow])}>
								{c.label}
							</AppTableHeader>
						))}
						{actions?.length ? <AppTableHeader actions /> : null}
					</AppTableHead>
					<AppTableBody>
						{loading ? (
							<AppTableLoading rows={Math.min(pageSize, 3)} columns={colSpan} />
						) : shown.length === 0 ? (
							<AppTableEmpty colSpan={colSpan}>{query ? `No results match “${query}”.` : emptyText}</AppTableEmpty>
						) : (
							shown.map((row) => (
								<AppTableRow key={row.id} selected={row.id === selectedId} onClick={row.href ? () => window.location.assign(row.href!) : undefined}>
									{columns.map((c) => (
										<AppTableCell key={c.key} className={cx('max-w-0', c.align === 'right' && 'text-right', c.hideBelow && HIDE[c.hideBelow])}>
											<Cell cell={row.cells[c.key]} />
										</AppTableCell>
									))}
									{actions?.length ? (
										<AppTableCell actions>
											<ActionMenu
												label="Row actions"
												actions={actions.map((a) => ({
													label: a.label,
													icon: a.icon ? ICONS[a.icon] : undefined,
													danger: a.danger,
													holdMs: a.hold ? 1500 : undefined,
													onSelect: () => (a.href ? window.location.assign(a.href.replace(':id', row.id)) : onAction?.(a.id, row.id)),
												}))}
											/>
										</AppTableCell>
									) : null}
								</AppTableRow>
							))
						)}
					</AppTableBody>
				</AppTable>
				{!loading && visible.length > pageSize && <AppTablePagination page={page} pageSize={pageSize} total={visible.length} onPageChange={setPage} />}
			</div>
		</AppBlock>
	);
}

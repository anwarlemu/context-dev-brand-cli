'use client';

import { ChevronLeft, ChevronRight, Download, MoreHorizontal, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppCopyButton } from '@/components/ds/ui/app-copy-button';
import { ActionMenu } from '@/components/ds/ui/app-menu';
import { AppSpinner, AppStatus, type AppStatusTone } from '@/components/ds/ui/app-status';
import { cx } from '@/components/ds/ui/cx';

const ICONS = { download: Download, stop: Square, trash: Trash2 } as const;

export type AppDetailRow = { label: string; value: string; help?: string; stacked?: boolean; mono?: boolean; tone?: 'muted' | 'subtle' | 'success' | 'accent' };
export type AppDetailSection = { title: string; rows: AppDetailRow[] };
export type AppDetailResult = { label: string; ok: boolean; detail: string };

export type AppDetailCardProps = {
	status: { tone: AppStatusTone; label: string; running?: boolean };
	meta: string;
	id: string;
	actions?: Array<{ id: string; label: string; icon?: keyof typeof ICONS; danger?: boolean; hold?: boolean }>;
	sections: AppDetailSection[];
	results?: { title: string; items: AppDetailResult[]; emptyText: string; pageSize?: number };
	onAction?: (actionId: string) => void;
};

const TONE = { muted: 'text-fg-muted', subtle: 'text-fg-subtle', success: 'text-success', accent: 'text-accent' } as const;
const PAGER = 'grid size-6 place-items-center rounded-control-sm outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover disabled:pointer-events-none disabled:opacity-40';

export function AppDetailCard({ status, meta, id, actions, sections, results, onAction }: AppDetailCardProps) {
	const [page, setPage] = useState(0);
	const size = results?.pageSize ?? 10;
	const items = results?.items ?? [];
	const shown = items.slice(page * size, (page + 1) * size);

	return (
		<AppBlock block="app-detail-card" className="rounded-window bg-surface shadow-card">
			<div className="px-5 pt-5">
				<div className="flex items-center gap-2">
					<AppStatus variant={status.tone} appearance="boxed">
						{status.label}
					</AppStatus>
					{status.running && <AppSpinner />}
					<span className="text-body-sm text-fg-muted">{meta}</span>
					{actions?.length ? (
						<div className="ml-auto">
							<ActionMenu
								label="Actions"
								icon={MoreHorizontal}
								actions={actions.map((a) => ({ label: a.label, icon: a.icon ? ICONS[a.icon] : undefined, danger: a.danger, holdMs: a.hold ? 1500 : undefined, onSelect: () => onAction?.(a.id) }))}
							/>
						</div>
					) : null}
				</div>
				<div className="mt-2 flex items-center gap-1">
					<code className="truncate font-mono text-caption text-fg-subtle">{id}</code>
					<AppCopyButton value={id} label="Copy ID" />
				</div>
			</div>
			<div className="flex flex-col gap-6 px-5 pt-6 pb-5">
				{sections.map((section) => (
					<section key={section.title}>
						<h4 className="px-1 text-caption text-fg-subtle">{section.title}</h4>
						<dl className="mt-2 divide-y divide-line-subtle rounded-window bg-neutral-5">
							{section.rows.map((row) => (
								<div key={row.label} className="px-3.5 py-3 text-body-sm">
									<div className={row.stacked ? 'flex flex-col gap-2' : 'flex items-baseline justify-between gap-4'}>
										<dt className="text-fg">{row.label}</dt>
										<dd className={cx(TONE[row.tone ?? 'muted'], !row.stacked && 'text-right tabular-nums', row.mono && 'font-mono text-caption')}>{row.value}</dd>
									</div>
									{row.help && <p className="mt-1.5 text-caption text-fg-subtle">{row.help}</p>}
								</div>
							))}
						</dl>
					</section>
				))}
				{results && (
					<section>
						<div className="flex items-center px-1">
							<h4 className="text-caption text-fg-subtle">{results.title}</h4>
							{items.length > size && (
								<div className="ml-auto flex items-center gap-1 text-caption text-fg-subtle">
									<span className="tabular-nums">
										{page * size + 1}–{Math.min(items.length, (page + 1) * size)} of {items.length.toLocaleString('en-US')}
									</span>
									<button type="button" aria-label="Previous" disabled={page === 0} onClick={() => setPage(page - 1)} className={PAGER}>
										<ChevronLeft className="size-3.5" strokeWidth={1.5} />
									</button>
									<button type="button" aria-label="Next" disabled={(page + 1) * size >= items.length} onClick={() => setPage(page + 1)} className={PAGER}>
										<ChevronRight className="size-3.5" strokeWidth={1.5} />
									</button>
								</div>
							)}
						</div>
						<ul className="mt-2 divide-y divide-line-subtle rounded-window bg-neutral-5">
							{shown.length === 0 ? (
								<li className="px-3.5 py-6 text-center text-body-sm text-fg-subtle">{results.emptyText}</li>
							) : (
								shown.map((item) => (
									<li key={item.label} className="flex items-center gap-3 px-3.5 py-2.5 text-body-sm">
										<span aria-hidden className={cx('size-1.5 shrink-0 rounded-pill', item.ok ? 'bg-success' : 'bg-alert-strong')} />
										<span className="min-w-0 flex-1 truncate font-mono text-caption text-fg-muted">{item.label}</span>
										<span className={cx('text-caption', item.ok ? 'text-fg-subtle' : 'text-danger')}>{item.detail}</span>
									</li>
								))
							)}
						</ul>
					</section>
				)}
			</div>
		</AppBlock>
	);
}

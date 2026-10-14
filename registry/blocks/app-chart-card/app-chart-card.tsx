'use client';

import { BarChart3, Check, ChevronDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppBarChart, type ChartBucket, type ChartSeries } from '@/components/ds/ui/app-bar-chart';
import { AppBlock } from '@/components/ds/ui/app-block';
import { MENU_LIST_CLASS, MENU_ROW_CLASS, MENU_SURFACE_CLASS } from '@/components/ds/ui/app-menu';
import { useMenuDismiss } from '@/components/ds/ui/app-menu-dismiss';
import { AppTabs } from '@/components/ds/ui/app-tabs';

export type AppChartBreakdown = {
	value: string;
	label: string;
	description?: string;
	unit: string;
	series: ChartSeries[];
	/** Buckets for each range, keyed by the range's value. */
	buckets: Record<string, ChartBucket[]>;
};

export type AppChartCardProps = {
	breakdowns: AppChartBreakdown[];
	ranges: Array<{ value: string; label: string }>;
	defaultRange?: string;
	riseIndex?: number;
	className?: string;
};

/** The overview's usage card: the breakdown picker is the title, the range switch sits at the right, the chart fills the rest. */
export function AppChartCard({ breakdowns, ranges, defaultRange, riseIndex, className }: AppChartCardProps) {
	const [breakdownValue, setBreakdown] = useState(breakdowns[0]?.value ?? '');
	const [range, setRange] = useState(defaultRange ?? ranges[0]?.value ?? '');
	const [isOpen, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useMenuDismiss(ref, isOpen, close);
	const breakdown = breakdowns.find((b) => b.value === breakdownValue) ?? breakdowns[0];

	return (
		<AppBlock block="app-chart-card" riseIndex={riseIndex} className={cx('flex min-h-0', className)}>
			<section className="flex h-64 min-w-0 flex-1 flex-col rounded-window bg-surface p-2 shadow-card">
				<div className="mb-3 flex items-center gap-3">
					{/* The title doubles as the breakdown menu: no border, a soft wash on hover or while open. */}
					<div ref={ref} className="relative">
						<button type="button" onClick={() => setOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="listbox" className={cx('flex h-8 items-center gap-2 rounded-control pr-2 pl-1.5 outline-none transition-colors duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover', isOpen && 'bg-wash/4')}>
							<BarChart3 className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
							<span className="text-body-sm leading-none">{breakdown.label}</span>
							<ChevronDown className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
						</button>
						{isOpen && (
							<ul role="listbox" aria-label="Breakdown" className={cx('popover-in absolute top-full left-0 z-30 mt-1.5 w-72 origin-top-left', MENU_SURFACE_CLASS, MENU_LIST_CLASS)}>
								{breakdowns.map((option) => (
									<li key={option.value}>
										<button type="button" role="option" aria-selected={option.value === breakdown.value} onClick={() => { setBreakdown(option.value); close(); }} className={cx(MENU_ROW_CLASS, 'hover:bg-wash/4', option.value === breakdown.value && 'bg-wash/3')}>
											<span className="min-w-0 flex-1">
												<span className="block text-body-sm text-fg">{option.label}</span>
												{option.description && <span className="block truncate text-caption text-fg-subtle">{option.description}</span>}
											</span>
											<Check className={cx('size-3.5 shrink-0 text-accent', option.value !== breakdown.value && 'invisible')} strokeWidth={1.75} />
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="ml-auto">
						<AppTabs kind="radio" size="sm" label="Range" value={range} options={ranges} onChange={setRange} />
					</div>
				</div>
				<AppBarChart key={breakdown.value} label={`${breakdown.label}, ${ranges.find((r) => r.value === range)?.label ?? ''}`} unit={breakdown.unit} series={breakdown.series} buckets={breakdown.buckets[range] ?? []} />
			</section>
		</AppBlock>
	);
}

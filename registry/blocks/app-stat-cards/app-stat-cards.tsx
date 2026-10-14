import { ArrowUpRight } from 'lucide-react';
import { cx } from '@/components/ds/ui/cx';
import { AppBlock } from '@/components/ds/ui/app-block';

const METER_DOTS = 20;

export type AppStat = {
	label: string;
	value: string;
	/** Beside the figure, smaller: "/1K". */
	suffix?: string;
	footer?: string;
	/** Makes the whole card a link, with an arrow by the label. */
	href?: string;
	/** A 20-dot meter under the figure: the share left, brand filled. */
	meter?: { value: number; total: number };
};

function Meter({ value, total }: { value: number; total: number }) {
	const filled = value <= 0 ? 0 : Math.max(1, Math.round((value / total) * METER_DOTS));
	return (
		<span className="flex justify-between" aria-hidden>
			{Array.from({ length: METER_DOTS }, (_, i) => <span key={i} className={cx('size-1 rounded-pill', i < filled ? 'bg-brand' : 'bg-blue-10')} />)}
		</span>
	);
}

/** Small cards of figures, two by two. A card that leads somewhere is the link. */
export function AppStatCards({ stats, riseIndex }: { stats: AppStat[]; riseIndex?: number }) {
	return (
		<AppBlock block="app-stat-cards" riseIndex={riseIndex}>
			<ul className="grid h-full gap-3 @md:grid-cols-2">
				{stats.map((stat) => {
					const body = (
						<>
							<span className="flex items-center gap-2">
								<span className={cx('flex-1 truncate text-caption text-fg-muted', stat.href && 'decoration-fg/25 underline-offset-4 group-hover:underline')}>{stat.label}</span>
								{stat.href && <ArrowUpRight className="size-3.5 shrink-0 text-fg-subtle transition-[translate,color] duration-150 ease-emphasized group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-fg" strokeWidth={1.5} />}
							</span>
							<span className="flex items-baseline gap-1 leading-none font-medium tabular-nums">
								<span className="text-h4 text-fg">{stat.value}</span>
								{stat.suffix && <span className="text-caption font-regular text-fg-subtle">{stat.suffix}</span>}
							</span>
							{stat.meter && <Meter {...stat.meter} />}
							{stat.footer && <span className="truncate text-caption text-fg-subtle">{stat.footer}</span>}
						</>
					);
					const card = 'group flex h-full min-w-0 flex-1 flex-col justify-between gap-3 rounded-window bg-surface p-3.5 text-left shadow-card';
					return (
						<li key={stat.label} className="flex min-w-0">
							{stat.href ? (
								<a href={stat.href} className={cx(card, 'outline-none transition-shadow duration-150 ease-out hover:shadow-glass-hover focus-visible:shadow-glass-hover')}>
									{body}
								</a>
							) : (
								<div className={card}>{body}</div>
							)}
						</li>
					);
				})}
			</ul>
		</AppBlock>
	);
}

'use client';

import { CalendarClock, Gauge, Info, Menu } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppBlock } from '@/components/ds/ui/app-block';
import { appButtonClassName } from '@/components/ds/ui/app-button';
import { AppDotGlyph, GEM_GLYPH } from '@/components/ds/ui/app-dot-glyph';
import { useMenuDismiss } from '@/components/ds/ui/app-menu-dismiss';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { setNavOpen } from '@/components/ds/blocks/app-shell-store';

// What's left as a row of dots, the same meter as the overview's credits card.
const METER_DOTS = 20;
const formatCount = (n: number) => n.toLocaleString('en-US');
const formatCompact = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1000 ? `${n / 1000}K` : String(n));

export type AppTopBarProps = {
	credits: { left: number; total: number; resetsOn: string };
	plan: { name: string; price: string; rateLimit: string };
	upgradeHref: string;
	usageHref: string;
};

/** The bar above every page: the menu button where the sidebar is a drawer, and the credits left. Pages head themselves. */
export function AppTopBar({ credits, plan, upgradeHref, usageHref }: AppTopBarProps) {
	const [isOpen, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useMenuDismiss(ref, isOpen, close);
	const filled = credits.left <= 0 ? 0 : Math.max(1, Math.round((credits.left / credits.total) * METER_DOTS));

	return (
		<AppBlock block="app-top-bar">
			<header className="flex h-14 shrink-0 items-center gap-4 px-3 md:h-20 md:pr-4.5 md:pl-5">
				<button type="button" onClick={() => setNavOpen(true)} aria-label="Open navigation" className="-ml-0.5 mr-1 grid size-9 shrink-0 place-items-center rounded-control text-fg-muted outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover md:hidden">
					<Menu className="size-4.5" strokeWidth={1.5} />
				</button>
				<div ref={ref} className="relative ml-auto">
					<button type="button" onClick={() => setOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="dialog" className={cx('flex h-8 items-center gap-1.5 rounded-control px-2.5 text-body-sm font-medium outline-none transition-colors duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover', isOpen && 'bg-wash/4')}>
						<AppDotGlyph rows={GEM_GLYPH} motion="sweep" className="size-4 shrink-0 text-accent" />
						<span className="text-fg-muted">
							<span className="text-fg tabular-nums">{formatCount(credits.left)}</span> credits
						</span>
					</button>
					{isOpen && (
						<div role="dialog" aria-label="Plan and credits" className="glass-frame popover-in absolute top-full right-0 z-40 mt-1.5 w-80 origin-top-right">
							<div className="flex flex-col gap-1.5 rounded-control bg-surface p-0.5">
								<div className="flex items-center gap-3 rounded-control bg-surface-subtle px-3 py-2.5">
									<AppDotGlyph rows={GEM_GLYPH} className="size-8 shrink-0 text-accent" />
									<div className="min-w-0">
										<p className="text-body-sm font-medium">{plan.name}</p>
										<p className="text-body-sm">
											{plan.price} <span className="text-fg-muted">/month</span>
										</p>
										<p className="mt-0.5 text-caption text-fg-subtle">Resets on {credits.resetsOn}</p>
									</div>
								</div>
								<div className="rounded-control border border-line px-3 py-2.5">
									<p className="text-caption text-fg-muted">Credits remaining</p>
									<p className="mt-2 flex items-baseline gap-1 leading-none font-medium tabular-nums">
										<span className="text-h4 text-fg">{formatCount(credits.left)}</span>
										<span className="text-caption font-regular text-fg-subtle">/{formatCompact(credits.total)}</span>
									</p>
									<span className="mt-2.5 flex justify-between" aria-hidden>
										{Array.from({ length: METER_DOTS }, (_, index) => (
											<span key={index} className={cx('size-1 rounded-pill', index < filled ? 'bg-brand' : 'bg-blue-10')} />
										))}
									</span>
								</div>
								<div className="flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2 text-body-sm text-fg-muted">
									<CalendarClock className="size-4 shrink-0" strokeWidth={1.5} />
									<span className="flex-1">
										Refresh <span className="font-medium text-fg">{credits.resetsOn}</span> with <span className="font-medium text-fg">{formatCompact(credits.total)}</span> credits
									</span>
									<AppTooltip label="Unused credits don’t roll over to the next month." side="top" wrap>
										<Info className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
									</AppTooltip>
								</div>
								<div className="flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2 text-body-sm text-fg-muted">
									<Gauge className="size-4 shrink-0" strokeWidth={1.5} />
									<span className="flex-1">Rate limit</span>
									<span className="font-medium text-fg">{plan.rateLimit}</span>
								</div>
								<a href={upgradeHref} onClick={close} className={cx(appButtonClassName('brand', 'sm'), 'w-full')}>
									Upgrade plan
								</a>
								<a href={usageHref} onClick={close} className={cx(appButtonClassName('outline', 'sm'), 'w-full')}>
									<Gauge className="size-3.5" strokeWidth={1.5} />
									View usage
								</a>
							</div>
						</div>
					)}
				</div>
			</header>
		</AppBlock>
	);
}

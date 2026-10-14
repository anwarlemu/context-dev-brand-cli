'use client';

import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type AppOverviewTemplateProps = {
	header?: ReactNode;
	lead?: ReactNode;
	chart?: ReactNode;
	aside?: ReactNode;
	stats?: ReactNode;
};

// The cards rise once, 50ms apart; after that the page is marked entered so cards that mount later simply appear.
const ENTRANCE_MS = 1200;

function Rise({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
	return (
		<div className={cx('rise-in grid', className)} style={{ '--rise-index': index } as CSSProperties}>
			{children}
		</div>
	);
}

export function AppOverviewTemplate({ header, lead, chart, aside, stats }: AppOverviewTemplateProps) {
	const [entered, setEntered] = useState(false);
	useEffect(() => {
		const timeout = setTimeout(() => setEntered(true), ENTRANCE_MS);
		return () => clearTimeout(timeout);
	}, []);
	return (
		<div data-ds-template="app-overview" className="@container scrollbar-thin scrollbar-stable flex-1 overflow-y-auto fade-in">
			<div data-entered={entered || undefined} className="page-column flex min-h-full flex-col gap-3 px-4 pt-2 pb-8 @2xl:px-8">
				<div className="mb-3">{header}</div>
				{lead && (
					<Rise index={0} className="mb-3">
						{lead}
					</Rise>
				)}
				<div className="grid gap-3 @4xl:grid-cols-2">
					<Rise index={1} className="min-h-0">
						{chart}
					</Rise>
					{aside && (
						<Rise index={2} className="min-h-0 @4xl:row-span-2">
							{aside}
						</Rise>
					)}
					<Rise index={3}>{stats}</Rise>
				</div>
			</div>
		</div>
	);
}

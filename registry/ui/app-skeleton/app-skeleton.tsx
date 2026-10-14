'use client';

import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

/** One gray block with a shine sliding across it. Size and round it to the thing it stands in for. */
export function Skeleton({ className }: { className?: string }) {
	return <div aria-hidden className={cx('skeleton rounded-control-sm', className)} />;
}

export type LoadingGateProps = {
	isLoading: boolean;
	/** The page's skeleton: the same column, the same blocks at the same sizes, so nothing moves when the data arrives. */
	skeleton: ReactNode;
	/** For pages whose cards rise in on their own (rise-in): the page only fades, so the two entrances don't stack. */
	fadeOnly?: boolean;
	children: ReactNode;
};

/** Shows the skeleton while loading, then the page, fading (and rising 4px) in. */
export function LoadingGate({ isLoading, skeleton, fadeOnly = false, children }: LoadingGateProps) {
	if (isLoading)
		return (
			<div className="flex min-w-0 flex-1" role="status" aria-label="Loading">
				{skeleton}
			</div>
		);
	return <div className={cx('flex min-w-0 flex-1', fadeOnly ? 'fade-in' : 'content-in')}>{children}</div>;
}

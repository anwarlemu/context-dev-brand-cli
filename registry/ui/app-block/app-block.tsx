import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type AppBlockProps = {
	block: string;
	/** The block's place in a page's first-visit entrance, 50ms apart. Omit to skip the entrance. */
	riseIndex?: number;
	className?: string;
	children: ReactNode;
};

/** The root of every product block: names the block for the checks and review, and opts into the staggered entrance. */
export function AppBlock({ block, riseIndex, className, children }: AppBlockProps) {
	return (
		<div data-ds-block={block} className={cx(riseIndex !== undefined && 'rise-in', className)} style={riseIndex !== undefined ? ({ '--rise-index': riseIndex } as React.CSSProperties) : undefined}>
			{children}
		</div>
	);
}

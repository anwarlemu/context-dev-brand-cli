import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

const SURFACES = {
	white: 'bg-surface text-fg',
	blue: 'bg-brand text-on-brand',
	black: 'bg-surface-inverse text-fg-inverse',
} as const;

// Lines and nodes are opaque so a node that straddles two sections never shows the line through it.
const RULERS = {
	white: { line: 'bg-line', node: 'bg-line-strong' },
	blue: { line: 'bg-blue-70', node: 'bg-blue-40' },
	black: { line: 'bg-neutral-80', node: 'bg-neutral-60' },
} as const;

type Surface = keyof typeof SURFACES;

const NODE = 'absolute size-2 rounded-full';

/** The column's edges as hairlines, a full-bleed rule along the top, and a solid node where they cross. */
export function SectionEdges({ surface = 'white', top = true }: { surface?: Surface; top?: boolean }) {
	const tone = RULERS[surface];
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex justify-center">
			<div className="relative h-full w-full max-w-6xl">
				<div className={cx('absolute inset-y-0 left-0 w-px -translate-x-1/2', tone.line)} />
				<div className={cx('absolute inset-y-0 right-0 w-px translate-x-1/2', tone.line)} />
				{top ? (
					<>
						<div className={cx('absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 -translate-y-1/2', tone.line)} />
						<span className={cx(NODE, tone.node, 'left-0 top-0 -translate-x-1/2 -translate-y-1/2')} />
						<span className={cx(NODE, tone.node, 'right-0 top-0 translate-x-1/2 -translate-y-1/2')} />
					</>
				) : null}
			</div>
		</div>
	);
}

/** A full-bleed rule between a section's heading and its content, with a node on each column edge. */
export function SectionRule({ surface = 'white' }: { surface?: Surface }) {
	const tone = RULERS[surface];
	return (
		<div aria-hidden="true" className="pointer-events-none relative z-10 my-10 h-px md:my-12">
			<div className={cx('absolute left-1/2 top-0 h-px w-screen -translate-x-1/2', tone.line)} />
			<span className={cx(NODE, tone.node, '-left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 md:-left-10')} />
			<span className={cx(NODE, tone.node, '-right-6 top-1/2 translate-x-1/2 -translate-y-1/2 md:-right-10')} />
		</div>
	);
}

export type SectionProps = {
	block: string;
	surface?: Surface;
	spacing?: 'default' | 'tight' | 'none';
	divider?: boolean;
	heading?: ReactNode;
	id?: string;
	children: ReactNode;
};

export function Section({ block, surface = 'white', spacing = 'default', divider = true, heading, id, children }: SectionProps) {
	const pad = spacing === 'default' ? 'py-16 md:py-24' : spacing === 'tight' ? 'py-8 md:py-10' : '';
	return (
		<section data-ds-block={block} id={id} className={cx('relative', SURFACES[surface])}>
			<SectionEdges surface={surface} top={divider} />
			<div className={cx('relative mx-auto w-full max-w-6xl px-6 md:px-10', heading ? 'pb-16 pt-16 md:pb-24 md:pt-20' : pad)}>
				{heading ? (
					<>
						{heading}
						<SectionRule surface={surface} />
					</>
				) : null}
				{children}
			</div>
		</section>
	);
}

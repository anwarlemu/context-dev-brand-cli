import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

const SURFACES = {
	white: 'bg-surface text-fg',
	blue: 'bg-brand text-on-brand',
	black: 'bg-surface-inverse text-fg-inverse',
} as const;

export type SectionProps = {
	block: string;
	surface?: keyof typeof SURFACES;
	spacing?: 'default' | 'tight' | 'none';
	divider?: boolean;
	id?: string;
	children: ReactNode;
};

export function Section({ block, surface = 'white', spacing = 'default', divider = true, id, children }: SectionProps) {
	return (
		<section data-ds-block={block} id={id} className={cx(SURFACES[surface], divider && 'border-b border-line')}>
			<div className={cx('mx-auto w-full max-w-6xl border-x border-line px-6 md:px-10', spacing === 'default' && 'py-16 md:py-24', spacing === 'tight' && 'py-8 md:py-10')}>{children}</div>
		</section>
	);
}

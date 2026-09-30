import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type SectionHeadingProps = {
	title: string;
	highlight?: string;
	sub?: string;
	align?: 'left' | 'center';
	level?: 'h1' | 'h2';
	size?: 'display' | 'h1' | 'h2';
	action?: ReactNode;
	tone?: 'default' | 'on-brand' | 'inverse';
};

export function Highlighted({ text, highlight, className }: { text: string; highlight?: string; className: string }) {
	const at = highlight ? text.indexOf(highlight) : -1;
	if (!highlight || at < 0) return <>{text}</>;
	return (
		<>
			{text.slice(0, at)}
			<span className={className}>{highlight}</span>
			{text.slice(at + highlight.length)}
		</>
	);
}

export function SectionHeading({ title, highlight, sub, align = 'left', level = 'h2', size = 'h2', action, tone = 'default' }: SectionHeadingProps) {
	const Tag = level;
	const accent = tone === 'default' ? 'text-brand' : tone === 'inverse' ? 'text-blue-60' : 'text-on-brand';
	const subTone = tone === 'default' ? 'text-fg-muted' : tone === 'inverse' ? 'text-neutral-30' : 'text-on-brand';
	const sizeClass = size === 'display' ? 'text-h1 md:text-display' : size === 'h1' ? 'text-h2 md:text-h1' : 'text-h3 md:text-h2';
	return (
		<div className={cx('flex flex-col gap-6', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between')}>
			<div className={cx('flex max-w-2xl flex-col gap-4', align === 'center' && 'items-center')}>
				<Tag className={cx(sizeClass, 'text-balance')}>
					<Highlighted text={title} highlight={highlight} className={accent} />
				</Tag>
				{sub ? <p className={cx('text-body-lg text-pretty', subTone)}>{sub}</p> : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

'use client';

import { type ReactNode, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { useTabGlide } from './app-tab-glide';

/** An option with `href` is a link (a tab that changes the route, like ?tab=billing), so a server page can render it. */
export type AppTabOption<T extends string> = { value: T; label: ReactNode; count?: number; href?: string };

export type AppTabsProps<T extends string> = {
	value: T;
	options: Array<AppTabOption<T>>;
	/** Optional: without it the tabs keep their own selection, or follow their option hrefs. */
	onChange?: (value: T) => void;
	label: string;
	size?: 'sm' | 'md';
	/** `tabs` switches views; `radio` picks a value inside a form or a chart. Only the semantics differ. */
	kind?: 'tabs' | 'radio';
	className?: string;
};

const PILL_SURFACE = 'bg-wash/6';

/** Plain labels, with one soft gray pill, no border, that glides to the selected option on a spring. */
export function AppTabs<T extends string>({ value: controlled, options, onChange, label, size = 'md', kind = 'tabs', className }: AppTabsProps<T>) {
	const [own, setOwn] = useState(controlled);
	const value = onChange ? controlled : own;
	const pillRef = useRef<HTMLSpanElement>(null);
	const isPillPlaced = useTabGlide(pillRef, value);
	const isRadio = kind === 'radio';
	const roundClass = size === 'sm' ? 'rounded-control-sm' : 'rounded-control';

	return (
		<div role={isRadio ? 'radiogroup' : 'tablist'} aria-label={label} className={cx('relative isolate inline-flex w-fit items-center', size === 'sm' ? 'gap-0.5' : 'gap-1', className)}>
			<span ref={pillRef} aria-hidden className={cx('pointer-events-none absolute top-0 left-0 -z-10', roundClass, PILL_SURFACE, !isPillPlaced && 'invisible')} />
			{options.map((option) => {
				const isSelected = option.value === value;
				const Tag = option.href ? 'a' : 'button';
				return (
					<Tag
						key={option.value}
						{...(option.href ? { href: option.href } : { type: 'button' as const })}
						role={isRadio ? 'radio' : 'tab'}
						aria-checked={isRadio ? isSelected : undefined}
						aria-selected={isRadio ? undefined : isSelected}
						data-tab-id={option.value}
						onClick={() => (onChange ? onChange(option.value) : setOwn(option.value))}
						className={cx(
							'flex items-center gap-1.5 whitespace-nowrap outline-none duration-200 ease-out focus-visible:shadow-ring-hover motion-reduce:transition-none',
							roundClass,
							size === 'sm' ? 'h-7 px-3 text-caption' : 'h-9 px-4 text-body-sm',
							// Only the text answers a hover, so nothing fades over the pill gliding in beneath.
							isSelected ? 'text-fg transition-[color]' : 'text-fg-subtle transition-colors hover:text-fg',
							// Until the pill lands, the selected option draws the surface itself so the first paint matches.
							isSelected && !isPillPlaced && PILL_SURFACE,
						)}
					>
						{option.label}
						{option.count !== undefined && <span className={cx('tabular-nums transition-colors', isSelected ? 'text-fg-muted' : 'text-fg-subtle')}>{option.count}</span>}
					</Tag>
				);
			})}
		</div>
	);
}

export type AppSegmentedControlProps<T extends string> = Omit<AppTabsProps<T>, 'kind' | 'className'> & { label: string };

/** A single choice inside a form: the tabs' look with radio semantics. */
export function AppSegmentedControl<T extends string>(props: AppSegmentedControlProps<T>) {
	return <AppTabs kind="radio" {...props} />;
}

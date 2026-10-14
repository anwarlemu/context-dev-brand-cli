'use client';

import { ChevronDown, ChevronsUpDown, RotateCcw, X } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { setParametersOpen, useParametersOpen } from '@/components/ds/blocks/app-parameters-store';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppIconButton } from '@/components/ds/ui/app-icon-button';
import { AppSwitch } from '@/components/ds/ui/app-switch';
import { cx } from '@/components/ds/ui/cx';

export type AppParameter = {
	name: string;
	label: string;
	description?: string;
	control: 'switch' | 'select' | 'number' | 'text';
	value: string | boolean;
	options?: Array<{ value: string; label: string }>;
	placeholder?: string;
	mono?: boolean;
};

export type AppParametersPanelProps = {
	/** The output-format toggles at the top. At least one stays selected. */
	formats?: { options: string[]; selected: string[] };
	groups: Array<{ title: string; params: AppParameter[] }>;
	onChange?: (values: Record<string, string | boolean | string[]>) => void;
	onClose?: () => void;
	className?: string;
};

// Filled gray, no border, so the controls read as part of the gray group box.
const FIELD = 'rounded-control bg-wash/5 outline-none transition-colors duration-150 ease-out hover:bg-wash/7 focus-visible:shadow-ring-hover';

export function AppParametersPanel({ formats, groups, onChange, onClose, className }: AppParametersPanelProps) {
	const defaults = Object.fromEntries([...groups.flatMap((g) => g.params.map((p) => [p.name, p.value])), ['formats', formats?.selected ?? []]]) as Record<string, string | boolean | string[]>;
	const [values, setValues] = useState(defaults);
	const open = useParametersOpen();
	const setOpen = setParametersOpen;
	const [edges, setEdges] = useState({ above: false, below: false });
	const scroller = useRef<HTMLDivElement>(null);
	const changed = Object.keys(defaults).filter((k) => JSON.stringify(values[k]) !== JSON.stringify(defaults[k])).length;
	const set = (name: string, value: string | boolean | string[]) => {
		const next = { ...values, [name]: value };
		setValues(next);
		onChange?.(next);
	};

	useLayoutEffect(() => {
		const el = scroller.current;
		if (!el) return;
		const measure = () => setEdges({ above: el.scrollTop > 1, below: el.scrollTop + el.clientHeight < el.scrollHeight - 1 });
		measure();
		el.addEventListener('scroll', measure, { passive: true });
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => (el.removeEventListener('scroll', measure), observer.disconnect());
	}, [open]);

	// It appears and goes at once, with no transition: it docks beside the page and takes no room from it.
	if (!open) return null;
	const selected = values.formats as string[];

	return (
		<AppBlock block="app-parameters-panel" className={cx('relative flex max-h-full min-h-80 w-80 flex-col overflow-hidden rounded-window bg-surface shadow-card', className)}>
			<div className="mt-2 flex h-8 shrink-0 items-center gap-1.5 pr-2.5 pl-7">
				<h2 className="text-body">Parameters</h2>
				{changed > 0 && <span className="grid size-4 place-items-center rounded-pill bg-brand text-micro text-on-brand tabular-nums">{changed}</span>}
				<div className="ml-auto flex items-center gap-1">
					{changed > 0 && (
						<button type="button" onClick={() => (setValues(defaults), onChange?.(defaults))} className="flex h-6 items-center gap-1.5 rounded-control-sm px-2.5 text-caption text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover">
							<RotateCcw className="size-3.5" strokeWidth={1.5} />
							Reset
						</button>
					)}
					<AppIconButton label="Close" size="sm" onClick={() => (setOpen(false), onClose?.())}>
						<X className="size-3.5" strokeWidth={1.5} />
					</AppIconButton>
				</div>
			</div>
			<div ref={scroller} className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-1 pb-4 [scrollbar-width:none]">
				{formats && (
					<section>
						<h3 className="mb-2 flex items-baseline gap-2 px-3 text-caption font-medium text-fg-muted">
							Output formats <span className="font-regular text-fg-subtle tabular-nums">{selected.length} selected</span>
						</h3>
						<div className="grid grid-cols-3 gap-1.5">
							{formats.options.map((format) => {
								const on = selected.includes(format);
								return (
									<button key={format} type="button" aria-pressed={on} onClick={() => !(on && selected.length === 1) && set('formats', on ? selected.filter((f) => f !== format) : [...selected, format])} className={cx('h-8 rounded-control-sm border text-body-sm outline-none transition-colors duration-150 ease-out focus-visible:shadow-ring-hover', on ? 'border-brand bg-blue-10/60 text-accent' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg')}>
										{format}
									</button>
								);
							})}
						</div>
					</section>
				)}
				{groups.map((group) => (
					<section key={group.title}>
						<h3 className="mb-2 px-3 text-caption font-medium text-fg-muted">{group.title}</h3>
						<div className="divide-y divide-line overflow-hidden rounded-window bg-neutral-5">
							{group.params.map((p) => (
								<div key={p.name} className="p-3">
									<div className="flex items-center justify-between gap-4">
										<span className="text-body-sm">{p.label}</span>
										{p.control === 'switch' && <AppSwitch label={p.label} checked={values[p.name] as boolean} onCheckedChange={(v) => set(p.name, v)} />}
										{p.control === 'select' && (
											<span className="relative">
												<select value={values[p.name] as string} onChange={(e) => set(p.name, e.target.value)} aria-label={p.label} className={cx(FIELD, 'h-8 appearance-none pr-8 pl-3 text-body-sm')}>
													{p.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
												</select>
												<ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-subtle" strokeWidth={1.5} />
											</span>
										)}
										{p.control === 'number' && <input inputMode="numeric" aria-label={p.label} value={values[p.name] as string} placeholder={p.placeholder} onChange={(e) => set(p.name, e.target.value.replace(/\D/g, ''))} className={cx(FIELD, 'h-8 w-28 shrink-0 px-3 text-body-sm tabular-nums placeholder:text-fg-subtle')} />}
									</div>
									{p.description && <p className="mt-0.5 text-body-sm leading-normal text-fg-muted">{p.description}</p>}
									{p.control === 'text' && <input aria-label={p.label} value={values[p.name] as string} placeholder={p.placeholder} onChange={(e) => set(p.name, e.target.value)} className={cx(FIELD, 'mt-2 h-9 w-full px-3 placeholder:text-fg-subtle', p.mono ? 'font-mono text-caption' : 'text-body-sm')} />}
								</div>
							))}
						</div>
					</section>
				))}
			</div>
			<div aria-hidden className={cx('pointer-events-none absolute inset-x-0 top-10 h-5 bg-linear-to-b from-surface to-transparent transition-opacity duration-200 ease-out', !edges.above && 'opacity-0')} />
			<div aria-hidden className={cx('pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface to-transparent transition-opacity duration-200 ease-out', !edges.below && 'opacity-0')} />
			<button type="button" tabIndex={edges.below ? 0 : -1} onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: 'smooth' })} className={cx('absolute bottom-2 left-1/2 flex h-6 -translate-x-1/2 items-center gap-1 rounded-pill bg-surface pr-2 pl-2.5 text-caption text-fg-muted shadow-card outline-none transition-[opacity,color,scale] duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover active:scale-97', !edges.below && 'pointer-events-none opacity-0')}>
				More
				<ChevronDown className="size-3.5" strokeWidth={1.5} />
			</button>
		</AppBlock>
	);
}

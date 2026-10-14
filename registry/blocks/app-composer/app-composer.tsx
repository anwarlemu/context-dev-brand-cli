'use client';

import { Globe, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { type FormEvent, useLayoutEffect, useState } from 'react';
import { setParametersOpen, useParametersOpen } from './app-parameters-store';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppButton } from '@/components/ds/ui/app-button';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { cx } from '@/components/ds/ui/cx';

/** The price beside the action, in a softer chip with a hairline edge, so the two never read as one string. */
export function AppCostBadge({ cost, perCall = true }: { cost: string; perCall?: boolean }) {
	return (
		<span className="flex h-5 items-center rounded-pill bg-white/15 px-2 text-caption text-on-brand/90 tabular-nums ring-1 ring-white/20 ring-inset">
			{cost}
			{perCall && <span className="hidden sm:inline">&nbsp;per call</span>}
		</span>
	);
}

/** The run button: the page's one filled button, so what a run costs is always in view. */
export function AppRunButton({ label, cost, perCall, running = false, className }: { label: string; cost: string; perCall?: boolean; running?: boolean; className?: string }) {
	return (
		<AppButton type="submit" variant="brand" size="sm" disabled={running} className={cx('gap-2 pr-1.5', className)}>
			{running && <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" strokeWidth={1.75} />}
			{label}
			<AppCostBadge cost={cost} perCall={perCall} />
		</AppButton>
	);
}

export type AppComposerProps = {
	placeholder: string;
	icon?: 'globe' | 'search';
	actionLabel: string;
	/** "1 credit", "5 credits", "up to 50 credits". */
	cost: string;
	perCall?: boolean;
	defaultValue?: string;
	/** How many parameters differ from their defaults; a count badge on the Parameters toggle. */
	changedCount?: number;
	parametersOpen?: boolean;
	running?: boolean;
	onRun?: (value: string) => void;
	onToggleParameters?: (open: boolean) => void;
};

export function AppComposer({ placeholder, icon = 'globe', actionLabel, cost, perCall = true, defaultValue = '', changedCount = 0, parametersOpen = true, running = false, onRun, onToggleParameters }: AppComposerProps) {
	const [value, setValue] = useState(defaultValue);
	const open = useParametersOpen();
	useLayoutEffect(() => setParametersOpen(parametersOpen), [parametersOpen]);
	const setOpen = setParametersOpen;
	const Icon = icon === 'globe' ? Globe : Search;
	function submit(event: FormEvent) {
		event.preventDefault();
		if (!running) onRun?.(value.trim() || placeholder);
	}
	return (
		<AppBlock block="app-composer">
			<form onSubmit={submit}>
				<label className="flex h-12 cursor-text items-center gap-3 rounded-control border border-transparent bg-surface pr-2 pl-4 shadow-card transition-[border-color,box-shadow] duration-150 ease-out hover:shadow-glass-hover has-[input:focus]:border-brand has-[input:focus]:shadow-ring-hover">
					<Icon className="size-4 shrink-0 text-fg-subtle" strokeWidth={1.5} />
					<input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-fg-subtle" />
					<span className="flex shrink-0 items-center gap-2">
						<AppTooltip label="Parameters · ⇧P" side="top">
							<button
								type="button"
								aria-pressed={open}
								aria-keyshortcuts="Shift+P"
								onClick={() => {
									setOpen(!open);
									onToggleParameters?.(!open);
								}}
								className={cx('flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-body-sm outline-none transition-colors duration-150 ease-out focus-visible:shadow-ring-hover', open ? 'bg-wash/5 text-fg' : 'text-fg-muted hover:bg-wash/4 hover:text-fg')}
							>
								<SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
								<span className="max-sm:hidden">Parameters</span>
								{changedCount > 0 && <span className="grid size-4 place-items-center rounded-pill bg-brand text-micro text-on-brand tabular-nums">{changedCount}</span>}
							</button>
						</AppTooltip>
						<AppRunButton label={actionLabel} cost={cost} perCall={perCall} running={running} />
					</span>
				</label>
			</form>
		</AppBlock>
	);
}

'use client';

import { Check, ChevronsUpDown, type LucideIcon, MoreVertical } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { useMenuDismiss } from '@/components/ds/ui/app-menu-dismiss';
import { useMenuHold } from '@/components/ds/ui/app-menu-hold';

// Every dropdown's anatomy: one panel with the shell's corners, 6px of padding so a hovered row's wash comes close to the
// edge, roomy rows 10px in from the sides, labels on the rows' grid, separators edge to edge. The panel sits 6px off its trigger.
export const MENU_SURFACE_CLASS = 'rounded-shell bg-surface p-1.5 shadow-floating';
export const MENU_ROW_CLASS = 'relative flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left outline-none transition-colors duration-150 ease-out focus-visible:bg-wash/4';
export const MENU_LABEL_CLASS = 'px-2.5 pt-1 pb-1.5 text-caption text-fg-subtle';
export const MENU_SEPARATOR_CLASS = '-mx-1.5 my-1 h-px bg-line-subtle';
// Rows stack 2px apart, so a hovered row's wash never runs straight into the selected one beside it.
export const MENU_LIST_CLASS = 'flex flex-col gap-0.5';

const MENU_PANEL_CLASS = cx('popover-in absolute z-30', MENU_SURFACE_CLASS);

function useMenu() {
	const [isOpen, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	useMenuDismiss(containerRef, isOpen, close);
	return { isOpen, setOpen, close, containerRef };
}

export type SelectOption<T extends string> = { value: T; label: string; description?: string };

export type SelectMenuProps<T extends string> = {
	label: string;
	value: T;
	options: Array<SelectOption<T>>;
	onChange: (value: T) => void;
	icon?: LucideIcon;
	align?: 'left' | 'right';
	/** ghost: a bordered toolbar filter. field: beside form inputs. chip: a small gray pill, for a card's footer. */
	appearance?: 'ghost' | 'field' | 'chip';
	opens?: 'down' | 'up';
	/** A shorter field, for dense panels. */
	compact?: boolean;
	/** How far the list sits from the button; lg lets a button near a card's edge open clear of that edge. */
	gap?: 'sm' | 'lg';
	className?: string;
};

/** A single-choice dropdown. */
export function SelectMenu<T extends string>({ label, value, options, onChange, icon: Icon, align = 'left', appearance = 'ghost', opens = 'down', compact = false, gap = 'sm', className }: SelectMenuProps<T>) {
	const { isOpen, setOpen, close, containerRef } = useMenu();
	const selected = options.find((option) => option.value === value);
	const hasDescriptions = options.some((option) => option.description);

	return (
		<div ref={containerRef} className={cx('relative', className)}>
			<button
				type="button"
				onClick={() => setOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-label={selected ? `${label}: ${selected.label}` : label}
				className={cx(
					'flex items-center gap-1.5 whitespace-nowrap outline-none transition-colors duration-150 ease-out focus-visible:shadow-ring-hover',
					appearance === 'chip' && cx('h-7 rounded-control-sm px-2.5 text-caption hover:bg-wash/6 hover:text-fg', isOpen ? 'bg-wash/6 text-fg' : 'bg-wash/4 text-fg-muted'),
					appearance === 'ghost' && cx('h-8 rounded-control border px-3 text-body-sm text-fg-muted hover:border-line-strong hover:text-fg', isOpen ? 'border-line-strong text-fg' : 'border-line'),
					appearance === 'field' && cx('w-full rounded-control border bg-surface text-fg hover:border-line-strong', compact ? 'h-7 px-2.5 text-caption' : 'h-10 px-3.5 text-body-sm', isOpen ? 'border-accent' : 'border-line'),
				)}
			>
				{Icon && <Icon className="size-3.5 text-fg-subtle" strokeWidth={1.5} />}
				<span className={cx(appearance === 'field' && 'flex-1 text-left')}>{selected?.label}</span>
				<ChevronsUpDown className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
			</button>

			{isOpen && (
				<div
					className={cx(
						MENU_PANEL_CLASS,
						opens === 'up' ? (gap === 'lg' ? 'bottom-full mb-4' : 'bottom-full mb-1.5') : gap === 'lg' ? 'top-full mt-4' : 'top-full mt-1.5',
						align === 'right' ? 'right-0' : 'left-0',
						opens === 'up' ? (align === 'right' ? 'origin-bottom-right' : 'origin-bottom-left') : align === 'right' ? 'origin-top-right' : 'origin-top-left',
						hasDescriptions ? 'w-80' : appearance === 'chip' ? 'min-w-40' : 'min-w-52',
					)}
				>
					<ul role="listbox" aria-label={label} className={cx('scrollbar-thin max-h-80 overflow-y-auto', MENU_LIST_CLASS)}>
						{options.map((option) => {
							const isSelected = option.value === value;
							return (
								<li key={option.value}>
									<button
										type="button"
										role="option"
										aria-selected={isSelected}
										onClick={() => {
											onChange(option.value);
											close();
										}}
										className={cx(MENU_ROW_CLASS, 'items-start text-body-sm hover:bg-wash/4', isSelected ? 'text-fg' : 'text-fg-muted')}
									>
										<span className="min-w-0 flex-1">
											<span className="block">{option.label}</span>
											{option.description && <span className="mt-0.5 block text-caption text-fg-subtle">{option.description}</span>}
										</span>
										<Check className={cx('mt-0.5 size-3.5 shrink-0 text-accent', !isSelected && 'invisible')} strokeWidth={1.75} />
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

export type MenuAction = {
	label: string;
	icon?: LucideIcon;
	onSelect: () => void;
	danger?: boolean;
	disabled?: boolean;
	/** Fires only after being held this long, with the duration shown as a hint. For destructive actions. */
	holdMs?: number;
};

const MENU_ITEM_CLASS = cx(MENU_ROW_CLASS, 'overflow-hidden text-body-sm whitespace-nowrap disabled:pointer-events-none disabled:opacity-40');
const itemTone = (danger?: boolean) => (danger ? 'text-danger hover:bg-danger/6' : 'text-fg-muted hover:bg-wash/4 hover:text-fg');

/** The overflow menu at the end of a table row. */
export function ActionMenu({ label, actions, icon: Icon = MoreVertical }: { label: string; actions: MenuAction[]; icon?: LucideIcon }) {
	const { isOpen, setOpen, close, containerRef } = useMenu();
	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label={label}
				className={cx('grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover', isOpen && 'bg-wash/4 text-fg')}
			>
				<Icon className="size-4" strokeWidth={1.5} />
			</button>

			{isOpen && (
				<div className={cx(MENU_PANEL_CLASS, 'top-full right-0 mt-1.5 min-w-48 origin-top-right')}>
					<div role="menu" className={MENU_LIST_CLASS}>
						{actions.map((action) =>
							action.holdMs ? (
								<HoldMenuItem key={action.label} action={action} holdMs={action.holdMs} close={close} />
							) : (
								<button
									key={action.label}
									type="button"
									role="menuitem"
									disabled={action.disabled}
									onClick={() => {
										close();
										action.onSelect();
									}}
									className={cx(MENU_ITEM_CLASS, itemTone(action.danger))}
								>
									{action.icon && <action.icon className="size-3.5" strokeWidth={1.5} />}
									{action.label}
								</button>
							),
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function HoldMenuItem({ action, holdMs, close }: { action: MenuAction; holdMs: number; close: () => void }) {
	const { isHolding, handlers } = useMenuHold(holdMs, () => {
		close();
		action.onSelect();
	});
	const Icon = action.icon;
	return (
		<button type="button" role="menuitem" disabled={action.disabled} {...handlers} className={cx(MENU_ITEM_CLASS, 'select-none', itemTone(action.danger))}>
			{/* The fill sweeps across for the whole hold (linear: it is a timer), and snaps back fast on release. */}
			<span
				aria-hidden
				className={cx('absolute inset-0 origin-left transition-transform', action.danger ? 'bg-danger/12' : 'bg-wash/6', isHolding ? 'scale-x-100 ease-linear' : 'scale-x-0 duration-150 ease-out')}
				style={isHolding ? { transitionDuration: `${holdMs}ms` } : undefined}
			/>
			{Icon && <Icon className="relative size-3.5" strokeWidth={1.5} />}
			<span className="relative flex-1">{isHolding ? 'Keep holding…' : action.label}</span>
			<span className="relative ml-4 text-caption text-fg-subtle">Hold {holdMs / 1000}s</span>
		</button>
	);
}

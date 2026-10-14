'use client';

import { useState } from 'react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppButton, appButtonClassName } from '@/components/ds/ui/app-button';
import { AppDialog } from '@/components/ds/ui/app-dialog';
import { AppField, AppInput } from '@/components/ds/ui/app-field';
import { AppHoldButton } from '@/components/ds/ui/app-hold-button';
import { AppSwitch } from '@/components/ds/ui/app-switch';
import { cx } from '@/components/ds/ui/cx';

export type AppSettingsRow = {
	title?: string;
	description: string;
	/** A few words that lead the description in fg, for a status ("Not enabled."). */
	lead?: string;
	/** Dims the text, for a row whose action is not available on this plan. */
	muted?: boolean;
	action?: { label: string; variant?: 'outline' | 'outline-brand' | 'brand'; href?: string; disabled?: boolean };
	toggle?: { on?: boolean };
	/** Danger rows: the dialog the filled danger button opens, confirmed by holding. */
	confirm?: { title: string; body: string; holdLabel: string; keepLabel?: string; scheduled: string };
};

export type AppSettingsSectionProps = {
	title: string;
	variant?: 'default' | 'danger';
	rows: AppSettingsRow[];
	/** For client callers: a toggle changed or a deletion was confirmed or cancelled. */
	onChange?: (rowIndex: number, value: boolean) => void;
};

function Row({ row, danger, onChange }: { row: AppSettingsRow; danger: boolean; onChange?: (value: boolean) => void }) {
	const [on, setOn] = useState(!!row.toggle?.on);
	const [confirming, setConfirming] = useState(false);
	const [scheduled, setScheduled] = useState(false);
	return (
		<div className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
			<div className={cx('min-w-0 flex-1', row.muted && 'opacity-50')}>
				{row.title && <p className="text-body-sm">{row.title}</p>}
				<p className={cx('text-body-sm text-fg-muted', row.title && 'mt-1')}>
					{scheduled && row.confirm ? (
						<>
							<span className="text-danger">Deletion scheduled.</span> {row.confirm.scheduled}
						</>
					) : (
						<>
							{row.lead && <span className="text-fg">{row.lead} </span>}
							{row.description}
						</>
					)}
				</p>
			</div>
			{row.toggle && (
				<AppSwitch
					label={row.title ?? row.description}
					checked={on}
					onCheckedChange={(value) => {
						setOn(value);
						onChange?.(value);
					}}
				/>
			)}
			{row.action && danger && row.confirm ? (
				scheduled ? (
					<AppButton size="sm" onClick={() => (setScheduled(false), onChange?.(false))}>Cancel deletion</AppButton>
				) : (
					<button type="button" onClick={() => setConfirming(true)} className="inline-flex h-9 shrink-0 items-center rounded-control bg-danger px-4 text-body-sm text-on-brand outline-none transition-[background-color,box-shadow,scale] duration-150 ease-out hover:bg-danger/90 focus-visible:shadow-ring-hover active:scale-97 motion-reduce:active:scale-100">
						{row.action.label}
					</button>
				)
			) : row.action?.href ? (
				<a href={row.action.href} className={appButtonClassName(row.action.variant ?? 'outline', 'sm')}>{row.action.label}</a>
			) : row.action ? (
				<AppButton variant={row.action.variant ?? 'outline'} size="sm" disabled={row.action.disabled}>{row.action.label}</AppButton>
			) : null}
			{confirming && row.confirm && (
				<AppDialog
					title={row.confirm.title}
					description={row.description}
					onClose={() => setConfirming(false)}
					footer={
						<>
							<AppButton variant="ghost" size="sm" onClick={() => setConfirming(false)}>{row.confirm.keepLabel ?? 'Cancel'}</AppButton>
							<AppHoldButton label={row.confirm.holdLabel} holdMs={1500} onConfirm={() => (setConfirming(false), setScheduled(true), onChange?.(true))} />
						</>
					}
				>
					<p className="text-body-sm text-fg-muted">{row.confirm.body}</p>
				</AppDialog>
			)}
		</div>
	);
}

export function AppSettingsSection({ title, variant = 'default', rows, onChange }: AppSettingsSectionProps) {
	return (
		<AppBlock block="app-settings-section" className="flex flex-col gap-2">
			<h3 className="px-1 text-body-sm text-fg-subtle">{title}</h3>
			<div className="divide-y divide-line-subtle rounded-window bg-surface px-5 shadow-card">
				{rows.map((row, index) => (
					<Row key={row.title ?? row.description} row={row} danger={variant === 'danger'} onChange={(value) => onChange?.(index, value)} />
				))}
			</div>
		</AppBlock>
	);
}

/** The labeled form card on a settings tab (Personal, Organization): inputs 20px apart in one white card. */
export function AppSettingsForm({ fields }: { fields: Array<{ label: string; name: string; value: string; readOnly?: boolean; type?: string; help?: string }> }) {
	return (
		<section className="flex flex-col gap-5 rounded-window bg-surface p-5 shadow-card">
			{fields.map((f) => (
				<AppField key={f.name} label={f.label} help={f.help}>
					{(id) => <AppInput id={id} name={f.name} type={f.type ?? 'text'} defaultValue={f.value} readOnly={f.readOnly} className={cx(f.readOnly && 'text-fg-muted')} />}
				</AppField>
			))}
		</section>
	);
}

'use client';

import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { AppCodeCard } from '@/components/ds/blocks/app-code-card';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppButton } from '@/components/ds/ui/app-button';
import { AppField, AppInput, AppTextarea } from '@/components/ds/ui/app-field';
import { SelectMenu } from '@/components/ds/ui/app-menu';
import { AppSwitch } from '@/components/ds/ui/app-switch';
import { AppTabs } from '@/components/ds/ui/app-tabs';
import { AppTagsInput } from '@/components/ds/ui/app-tags-input';
import { cx } from '@/components/ds/ui/cx';

type Option = { value: string; label: string; help?: string };
export type AppFormField =
	| { type: 'text' | 'textarea' | 'number'; name: string; label: string; help?: string; placeholder?: string; mono?: boolean; required?: string; defaultValue?: string }
	| { type: 'segmented' | 'select'; name: string; label: string; help?: string; options: Option[]; defaultValue?: string }
	| { type: 'switches'; name: string; label: string; help?: string; options: Array<{ value: string; label: string; on?: boolean }> }
	| { type: 'tags'; name: string; label: string; help?: string; placeholder?: string };

type Values = Record<string, string | string[]>;

export type AppFormPanelProps = {
	fields: AppFormField[];
	/** Fields behind the Advanced disclosure, two columns on wide screens. */
	advanced?: AppFormField[];
	/** The same thing as an API call, shown on the "Create with code" tab. Omit to drop the mode bar. */
	code?: string;
	docsHref?: string;
	/** What submitting spends, said before the click: "Reserves 500 credits, one per page". */
	cost?: string;
	submitLabel: string;
	/** A URL the form posts to. */
	action?: string;
	onSubmit?: (values: Values) => void;
};

function initial(fields: AppFormField[]): Values {
	const values: Values = {};
	for (const f of fields) {
		if (f.type === 'switches') values[f.name] = f.options.filter((o) => o.on).map((o) => o.value);
		else if (f.type === 'tags') values[f.name] = [];
		else values[f.name] = f.defaultValue ?? (f.type === 'segmented' || f.type === 'select' ? f.options[0].value : '');
	}
	return values;
}

export function AppFormPanel({ fields, advanced = [], code, docsHref, cost, submitLabel, action, onSubmit }: AppFormPanelProps) {
	const [mode, setMode] = useState<'ui' | 'code'>('ui');
	const [values, setValues] = useState<Values>(() => initial([...fields, ...advanced]));
	const [tried, setTried] = useState(false);
	const [open, setOpen] = useState(false);
	const submitting = useRef(false);
	const set = (name: string, value: string | string[]) => setValues((v) => ({ ...v, [name]: value }));
	const errorOf = (f: AppFormField) => (tried && 'required' in f && f.required && !String(values[f.name] ?? '').trim() ? f.required : undefined);

	function submit(event: FormEvent<HTMLFormElement>) {
		setTried(true);
		const invalid = [...fields, ...advanced].some((f) => 'required' in f && f.required && !String(values[f.name] ?? '').trim());
		// A second click lands before navigation finishes; without the guard it submits, and charges for, a second job.
		if (invalid || submitting.current) return event.preventDefault();
		submitting.current = true;
		if (onSubmit || !action) {
			event.preventDefault();
			onSubmit?.(values);
			submitting.current = false;
		}
	}

	const render = (f: AppFormField) => {
		const value = values[f.name];
		const help = f.type === 'segmented' ? (f.options.find((o) => o.value === value)?.help ?? f.help) : f.help;
		return (
			<AppField key={f.name} label={f.label} help={help} error={errorOf(f)}>
				{(id, invalid) => {
					if (f.type === 'textarea') return <AppTextarea id={id} name={f.name} rows={6} invalid={invalid} placeholder={f.placeholder} value={value as string} onChange={(e) => set(f.name, e.target.value)} className={cx('resize-y', f.mono && 'font-mono text-caption')} />;
					if (f.type === 'text' || f.type === 'number')
						return <AppInput id={id} name={f.name} invalid={invalid} placeholder={f.placeholder} inputMode={f.type === 'number' ? 'numeric' : undefined} value={value as string} onChange={(e) => set(f.name, f.type === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value)} className={cx(f.type === 'number' && 'tabular-nums', f.mono && 'font-mono text-caption')} />;
					if (f.type === 'segmented') return <AppTabs kind="radio" label={f.label} value={value as string} options={f.options} onChange={(v) => set(f.name, v)} />;
					if (f.type === 'select') return <SelectMenu label={f.label} appearance="field" value={value as string} options={f.options} onChange={(v) => set(f.name, v)} />;
					if (f.type === 'tags') return <AppTagsInput id={id} tags={value as string[]} placeholder={f.placeholder ?? ''} onChange={(tags) => set(f.name, tags)} />;
					if (f.type !== 'switches') return null;
					return (
						<div id={id} className="divide-y divide-line-subtle rounded-control border border-line">
							{f.options.map((o) => (
								<div key={o.value} className="flex items-center justify-between px-3.5 py-2.5">
									<span className="text-body-sm">{o.label}</span>
									<AppSwitch label={o.label} checked={(value as string[]).includes(o.value)} onCheckedChange={(on) => set(f.name, on ? [...(value as string[]), o.value] : (value as string[]).filter((x) => x !== o.value))} />
								</div>
							))}
						</div>
					);
				}}
			</AppField>
		);
	};

	return (
		<AppBlock block="app-form-panel" className="flex flex-col">
			{code !== undefined && (
				<div className="flex items-center justify-between border-b border-line pb-3">
					<AppTabs label="Mode" value={mode} onChange={setMode} options={[{ value: 'ui', label: 'Create in the dashboard' }, { value: 'code', label: 'Create with code' }]} />
					{docsHref && (
						<a href={docsHref} className="flex shrink-0 items-center gap-1.5 rounded-control text-body-sm text-fg-subtle outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover">
							<BookOpen className="size-4" strokeWidth={1.5} />
							<span className="max-sm:hidden">Read the docs</span>
						</a>
					)}
				</div>
			)}
			{mode === 'code' && code !== undefined ? (
				<div className="mt-6 flex flex-col gap-3">
					<p className="text-body-sm text-fg-muted">The same request as an API call.</p>
					<AppCodeCard snippets={{ cURL: code }} />
				</div>
			) : (
				<form action={action} method="post" onSubmit={submit} noValidate className="mt-6 flex flex-col gap-7">
					{Object.entries(values).filter(([, v]) => Array.isArray(v)).map(([name, v]) => (v as string[]).map((x) => <input key={`${name}-${x}`} type="hidden" name={name} value={x} />))}
					{fields.map(render)}
					{advanced.length > 0 && (
						<div>
							<button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-control text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover">
								<ChevronRight className={cx('size-4 transition-transform duration-200 ease-out', open && 'rotate-90')} strokeWidth={1.5} />
								Advanced options
							</button>
							{open && <div className="mt-5 grid gap-5 sm:grid-cols-2">{advanced.map(render)}</div>}
						</div>
					)}
					<div className="flex items-center gap-4 border-t border-line pt-6">
						{cost && <p className="text-body-sm text-fg-muted">{cost}</p>}
						<AppButton type="submit" variant="brand" size="md" className="ml-auto">
							{submitLabel}
							<ArrowRight className="size-4" strokeWidth={1.5} />
						</AppButton>
					</div>
				</form>
			)}
		</AppBlock>
	);
}

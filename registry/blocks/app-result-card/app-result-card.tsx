'use client';

import { CircleAlert, Clock, Files, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AppRunButton } from '@/components/ds/blocks/app-composer';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppTabs } from '@/components/ds/ui/app-tabs';
import { cx } from '@/components/ds/ui/cx';

export type AppResultCardProps = {
	state: 'ready' | 'running' | 'result' | 'error';
	/** The verb: "Scrape", "Search". Ready reads "Ready to scrape". */
	actionLabel: string;
	cost: string;
	endpoint: string;
	/** Inputs to try from the ready state. */
	examples?: string[];
	result?: { status: number; formats: number; credits: number; time: string; source: string; preview?: string; json: string };
	error?: { status: number; message: string };
	history?: Array<{ input: string; status: number; duration: string; time: string }>;
	onRun?: (input?: string) => void;
};

const statusTone = (code: number) => (code < 300 ? { text: 'text-success', dot: 'bg-success' } : code < 500 ? { text: 'text-alert-strong', dot: 'bg-alert-strong' } : { text: 'text-danger', dot: 'bg-danger' });
const STATUS_TEXT: Record<number, string> = { 200: 'OK', 202: 'Accepted', 400: 'Bad request', 401: 'Key disabled', 402: 'Usage exceeded', 404: 'Not found', 429: 'Rate limited', 500: 'Server error' };

function Dot({ code }: { code: number }) {
	return <span aria-hidden className={cx('size-1.5 shrink-0 rounded-pill', statusTone(code).dot)} />;
}

export function AppResultCard({ state, actionLabel, cost, endpoint, examples = [], result, error, history = [], onRun }: AppResultCardProps) {
	const done = state === 'result' || state === 'error';
	const [tab, setTab] = useState(done ? 'preview' : 'result');
	const code = state === 'result' ? result?.status : state === 'error' ? error?.status : undefined;
	const options = done ? [{ value: 'preview', label: 'Preview' }, { value: 'json', label: 'JSON' }, { value: 'history', label: 'History' }] : [{ value: 'result', label: 'Result' }, { value: 'history', label: 'History' }];
	const verb = actionLabel.toLowerCase();

	const body = () => {
		if (tab === 'history')
			return history.length === 0 ? (
				<div className="flex flex-col items-center px-8 py-12 text-center">
					<h3 className="text-h5">No calls yet</h3>
					<p className="mt-2 max-w-sm text-body-sm text-fg-muted">Every call you run this session lands here, so you can open any of them again.</p>
				</div>
			) : (
				<ul className="divide-y divide-line-subtle">
					{history.map((h) => (
						<li key={`${h.input}-${h.time}`} className="flex h-11 items-center gap-3 px-4 text-body-sm">
							<Dot code={h.status} />
							<span className="min-w-0 flex-1 truncate font-mono text-caption">{h.input}</span>
							<span className="w-10 text-right text-caption text-fg-muted tabular-nums">{h.status}</span>
							<span className="hidden w-12 text-right text-caption text-fg-subtle tabular-nums sm:inline">{h.duration}</span>
							<span className="w-20 text-right text-caption text-fg-subtle">{h.time}</span>
						</li>
					))}
				</ul>
			);
		if (state === 'running')
			return (
				<div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
					<div className="flex gap-1.5" aria-hidden>
						{[0, 1, 2, 3, 4].map((i) => <span key={i} className="size-2 animate-pulse rounded-pill bg-brand motion-reduce:animate-none" style={{ animationDelay: `${i * 120}ms` }} />)}
					</div>
					<p role="status" className="text-body-sm text-fg-muted">Calling <span className="font-mono text-caption">{endpoint}</span></p>
				</div>
			);
		if (state === 'error' && error)
			return (
				<div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
					<span className="grid size-10 place-items-center rounded-control bg-danger/8 text-danger"><CircleAlert className="size-5" strokeWidth={1.5} /></span>
					<h3 className="text-h5">The call failed with {error.status}</h3>
					<p className="max-w-sm text-body-sm text-fg-muted">{error.message}</p>
				</div>
			);
		if (state === 'result' && result)
			return (
				<div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
					<div className="flex shrink-0 items-center rounded-control border border-line-subtle px-1 py-2.5">
						{[{ icon: Files, value: result.formats, label: 'Formats' }, { icon: Sparkles, value: result.credits, label: 'Credits' }, { icon: Clock, value: result.time, label: 'Time' }].map((s) => (
							<div key={s.label} className="flex flex-col gap-1 border-r border-line-subtle px-4 last-of-type:border-r-0">
								<span className="flex items-center gap-1.5 text-body-sm font-medium tabular-nums"><s.icon className="size-3.5 text-fg-muted" strokeWidth={1.5} />{s.value}</span>
								<span className="text-caption text-fg-subtle">{s.label}</span>
							</div>
						))}
						<span className="ml-auto truncate px-4 text-caption text-fg-subtle">{result.source}</span>
					</div>
					<pre className={cx('scrollbar-thin min-h-0 flex-1 overflow-y-auto rounded-control border border-line-subtle px-4 py-3 wrap-anywhere whitespace-pre-wrap', tab === 'json' ? 'font-mono text-caption leading-relaxed' : 'font-sans text-body-sm leading-relaxed text-fg-muted')}>{tab === 'json' || !result.preview ? result.json : result.preview}</pre>
				</div>
			);
		return (
			<form onSubmit={(e) => (e.preventDefault(), onRun?.())} className="flex flex-col items-center justify-center gap-3 px-8 py-8 text-center">
				<h3 className="text-h5">Ready to {verb}</h3>
				<p className="max-w-sm text-body-sm text-balance text-fg-muted">Hit {actionLabel} and what comes back shows up here, as a preview and in full as JSON.</p>
				{examples.length > 0 && (
					<p className="max-w-md text-caption text-balance text-fg-subtle">
						Try{' '}
						{examples.map((ex, i) => (
							<span key={ex}>
								<button type="button" onClick={() => onRun?.(ex)} className="rounded-sm text-accent outline-none hover:underline focus-visible:shadow-ring-hover">{ex.replace(/^https?:\/\//, '')}</button>
								{i < examples.length - 2 ? ', ' : i === examples.length - 2 ? (examples.length > 2 ? ', or ' : ' or ') : ''}
							</span>
						))}
					</p>
				)}
				<AppRunButton label={actionLabel} cost={cost} className="mt-1" />
			</form>
		);
	};

	return (
		<AppBlock block="app-result-card" className="flex min-w-0 flex-col gap-2">
			<div className="flex h-8 shrink-0 items-center gap-1 px-1">
				<AppTabs label="Result view" size="sm" value={tab} onChange={setTab} options={options} />
				{code !== undefined && (
					<span className={cx('ml-auto flex shrink-0 items-center gap-1.5 text-caption', statusTone(code).text)}>
						<Dot code={code} />
						{code} {STATUS_TEXT[code] ?? ''}
					</span>
				)}
			</div>
			<div key={tab} className="fade-in flex min-w-0 flex-col overflow-hidden rounded-window bg-surface shadow-card motion-reduce:animate-none">{body()}</div>
		</AppBlock>
	);
}

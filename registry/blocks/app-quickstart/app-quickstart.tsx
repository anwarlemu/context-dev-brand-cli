'use client';

import { ArrowUpRight, Check, Copy, Eye, EyeOff, KeyRound } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppBlock } from '@/components/ds/ui/app-block';
import { AppButton } from '@/components/ds/ui/app-button';
import { useCopy } from '@/components/ds/ui/app-copy-button';
import { AppScrollArea } from '@/components/ds/ui/app-scroll-area';
import { maskSecret, SecretText } from '@/components/ds/ui/app-secret-field';
import { AppTabs } from '@/components/ds/ui/app-tabs';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';

const VISIBLE = 14;
// Icon and word cross-fade in one grid cell, so the pill never changes width between Copy and Copied.
const SWAP = 'col-start-1 row-start-1 transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none';

function CopyPill({ value, label = 'Copy' }: { value: string; label?: string }) {
	const { hasCopied, copy } = useCopy();
	return (
		<button
			type="button"
			onClick={() => copy(value)}
			aria-label={hasCopied ? 'Copied' : label}
			className={cx(
				'flex h-7 shrink-0 items-center gap-1.5 rounded-control-sm border bg-surface px-2.5 text-caption outline-none transition-[color,border-color,scale] duration-150 ease-out focus-visible:shadow-ring-hover active:scale-97 motion-reduce:active:scale-100',
				hasCopied ? 'border-success/40 text-success' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
			)}
		>
			<span className="grid">
				<Copy className={cx(SWAP, 'size-3.5', hasCopied && 'scale-50 opacity-0')} strokeWidth={1.5} />
				<Check className={cx(SWAP, 'size-3.5', !hasCopied && 'scale-50 opacity-0')} strokeWidth={1.75} />
			</span>
			<PillWords copied={hasCopied} />
		</button>
	);
}

// Both words stay in the cell, the hidden one transparent, so the pill keeps the wider word's width.
function PillWords({ copied }: { copied: boolean }) {
	return (
		<span className="grid text-left">
			<span className={cx(SWAP, copied && 'opacity-0')}>Copy</span>
			<span className={cx(SWAP, !copied && 'opacity-0')}>Copied</span>
		</span>
	);
}

function Step({ number, title, aside, children }: { number: number; title: string; aside?: ReactNode; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-2">
			<div className="flex min-h-7 items-center gap-2">
				<span className="grid size-5 shrink-0 place-items-center rounded-control-sm border border-line text-micro text-fg-muted tabular-nums">{number}</span>
				<h4 className="flex-1 text-body-sm">{title}</h4>
				{aside}
			</div>
			{children}
		</section>
	);
}

export type AppQuickstartProps = {
	apiKey: { name: string; secret: string } | null;
	manageHref: string;
	/** Setup snippets by method; `{{key}}` is shown masked and copied as the real key. */
	snippets: Array<{ value: string; label: string; code: string }>;
	prompts: Array<{ value: string; label: string; text: string }>;
	riseIndex?: number;
};

/** The shortest way from signing up to a working call, in numbered steps: the key, the agent setup, one prompt. */
export function AppQuickstart({ apiKey, manageHref, snippets, prompts, riseIndex }: AppQuickstartProps) {
	const [isRevealed, setRevealed] = useState(false);
	const [method, setMethod] = useState(snippets[0]?.value ?? '');
	const [promptKind, setPromptKind] = useState(prompts[0]?.value ?? '');
	const secret = apiKey?.secret ?? 'YOUR_API_KEY';
	const masked = apiKey ? maskSecret(apiKey.secret, VISIBLE) : secret;
	const prompt = prompts.find((p) => p.value === promptKind);
	const { hasCopied, copy } = useCopy();

	return (
		<AppBlock block="app-quickstart" riseIndex={riseIndex} className="flex min-h-0">
			<section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-window bg-surface p-3 shadow-card">
				<div className="mb-2 flex items-center gap-2.5">
					<span className="grid size-7 shrink-0 place-items-center rounded-control-sm border border-line text-accent">
						<KeyRound className="size-4" strokeWidth={1.5} />
					</span>
					<h3 className="flex-1 text-body-sm">Quickstart</h3>
					<a href={manageHref} className="group flex h-6 items-center gap-1 rounded-control text-caption text-fg-muted decoration-fg/25 underline-offset-4 outline-none transition-colors duration-150 hover:text-fg hover:underline focus-visible:shadow-ring-hover">
						Manage keys
						<ArrowUpRight className="size-3.5 transition-[translate] duration-150 ease-emphasized group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={1.5} />
					</a>
				</div>
				{/* Reaches 4px past the content on each side, so a hovered control's glass ring isn't clipped. */}
				<div className="-mx-1 flex min-h-0 flex-1 flex-col border-t border-line-subtle">
					<AppScrollArea className="flex flex-col gap-4 px-1 pt-3 pb-1">
						<Step number={1} title="Copy your API key">
							{apiKey ? (
								<div className="flex h-10 items-center gap-1 rounded-control border border-line pr-1 pl-3">
									<SecretText secret={apiKey.secret} masked={masked} isRevealed={isRevealed} className="font-mono text-caption text-fg-muted" />
									<AppTooltip label={isRevealed ? 'Hide' : 'Show'} side="top" className="shrink-0">
										<button type="button" onClick={() => setRevealed((r) => !r)} aria-label={`${isRevealed ? 'Hide' : 'Show'} ${apiKey.name}`} className="grid size-7 place-items-center rounded-control-sm text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash/5 hover:text-fg focus-visible:shadow-ring-hover">
											{isRevealed ? <EyeOff className="size-3.5" strokeWidth={1.5} /> : <Eye className="size-3.5" strokeWidth={1.5} />}
										</button>
									</AppTooltip>
									<CopyPill value={apiKey.secret} label={`Copy ${apiKey.name}`} />
								</div>
							) : (
								<p className="rounded-control border border-dashed border-line-strong px-3 py-2.5 text-caption text-fg-muted">
									Every key is disabled.{' '}
									<a href={manageHref} className="text-accent hover:underline">
										Create or enable one
									</a>{' '}
									to get started.
								</p>
							)}
						</Step>
						<Step number={2} title="Onboard your agent">
							<div className="rounded-control border border-line">
								<div className="flex h-10 items-center gap-2 border-b border-line-subtle pr-1 pl-1.5">
									<AppTabs size="sm" label="Setup method" value={method} options={snippets.map(({ value, label }) => ({ value, label }))} onChange={setMethod} />
									<span className="ml-auto">
										<CopyPill value={(snippets.find((s) => s.value === method)?.code ?? '').replaceAll('{{key}}', secret)} />
									</span>
								</div>
								{/* Every snippet sits in the same cell, so the box keeps the tallest one's height across tabs. */}
								<div className="grid overflow-hidden rounded-b-control bg-surface-subtle">
									{snippets.map((snippet) => (
										<pre
											key={snippet.value}
											inert={snippet.value !== method}
											className={cx(
												'col-start-1 row-start-1 px-3 py-2.5 font-mono text-micro whitespace-pre-wrap text-fg-muted transition-[opacity,translate] ease-out motion-reduce:transition-none',
												snippet.value === method ? 'translate-y-0 opacity-100 duration-300' : 'pointer-events-none translate-y-1 opacity-0 duration-150',
											)}
										>
											{snippet.code.replaceAll('{{key}}', masked)}
										</pre>
									))}
								</div>
							</div>
						</Step>
						<Step number={3} title="Prompt">
							<div className="overflow-hidden rounded-control border border-line bg-surface">
								<div className="flex items-center gap-2 border-b border-line-subtle p-1">
									<AppTabs kind="radio" size="sm" label="Prompt" value={promptKind} options={prompts.map(({ value, label }) => ({ value, label }))} onChange={setPromptKind} />
									{/* The card's one filled button. */}
									<AppButton variant="primary" size="sm" className="ml-auto h-7 px-2.5" onClick={() => copy((prompt?.text ?? '').replaceAll('{{key}}', secret))}>
										{hasCopied ? <Check className="size-3.5" strokeWidth={1.75} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
										{hasCopied ? 'Copied' : 'Copy'}
									</AppButton>
								</div>
								<div className="grid px-3 py-2.5">
									{prompts.map((p) => (
										<p key={p.value} className={cx('col-start-1 row-start-1 text-body-sm text-pretty text-fg transition-opacity duration-150 ease-out', p.value !== promptKind && 'pointer-events-none opacity-0')}>
											{p.text.replaceAll('{{key}}', masked)}
										</p>
									))}
								</div>
							</div>
						</Step>
					</AppScrollArea>
				</div>
			</section>
		</AppBlock>
	);
}

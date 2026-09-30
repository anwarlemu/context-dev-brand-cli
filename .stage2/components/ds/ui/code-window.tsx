'use client';

import { useState } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type CodeWindowProps = { title: string; code: string; tabs?: string[]; activeTab?: string; copyable?: boolean; tone?: 'dark' | 'light' };

export function CodeWindow({ title, code, tabs, activeTab, copyable = true, tone = 'dark' }: CodeWindowProps) {
	const [copied, setCopied] = useState(false);
	const dark = tone === 'dark';
	return (
		<div className={cx('overflow-hidden rounded-window border', dark ? 'border-neutral-80 bg-surface-inverse text-fg-inverse' : 'border-line bg-surface text-fg')}>
			<div className={cx('flex items-center gap-3 border-b px-4 py-3', dark ? 'border-neutral-80' : 'border-line')}>
				<span aria-hidden className="flex gap-1.5">
					<span className="size-2 rounded-full bg-brand" />
					<span className={cx('size-2 rounded-full border', dark ? 'border-neutral-60' : 'border-line-strong')} />
					<span className={cx('size-2 rounded-full border', dark ? 'border-neutral-60' : 'border-line-strong')} />
				</span>
				{tabs?.length ? (
					<div className="flex gap-1">
						{tabs.map((tab) => (
							<span key={tab} className={cx('rounded-pill px-2.5 py-0.5 text-caption', tab === activeTab ? (dark ? 'bg-neutral-80 text-fg-inverse' : 'bg-tint text-brand') : dark ? 'text-neutral-40' : 'text-fg-muted')}>{tab}</span>
						))}
					</div>
				) : (
					<span className={cx('text-caption', dark ? 'text-neutral-40' : 'text-fg-muted')}>{title}</span>
				)}
				{copyable ? (
					<button
						type="button"
						onClick={() => navigator.clipboard.writeText(code).then(() => setCopied(true))}
						className={cx('ml-auto rounded-pill border px-2.5 py-0.5 text-caption transition-colors duration-150 ease-out', dark ? 'border-neutral-60 text-neutral-30 hover:text-fg-inverse' : 'border-brand text-brand hover:bg-tint')}
					>
						{copied ? 'Copied' : 'Copy'}
					</button>
				) : null}
			</div>
			<pre className={cx('p-5 font-mono text-body-sm', dark ? 'overflow-x-auto' : 'whitespace-pre-wrap break-words')}><code>{code}</code></pre>
		</div>
	);
}

'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { AppCopyButton } from '@/components/ds/ui/app-copy-button';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { cx } from '@/components/ds/ui/cx';

const MASK = '••••••••••••';

export function maskSecret(secret: string, visibleChars: number) {
	return `${secret.slice(0, visibleChars)}${MASK}`;
}

/** The secret's text, always as wide as its masked form: revealed, the full value truncates into that same space. */
export function SecretText({ secret, masked, isRevealed, className }: { secret: string; masked: string; isRevealed: boolean; className?: string }) {
	return (
		<code className={cx('relative min-w-0 flex-1', className)}>
			<span className={cx('block truncate', isRevealed && 'invisible')} aria-hidden={isRevealed}>
				{masked}
			</span>
			{isRevealed && <span className="absolute inset-0 truncate">{secret}</span>}
		</code>
	);
}

export type AppSecretFieldProps = {
	secret: string;
	/** How many leading characters stay readable while masked, such as the key's prefix. */
	visibleChars: number;
	/** What the secret is, for the buttons' labels ("API key"). */
	label: string;
	className?: string;
};

export function AppSecretField({ secret, visibleChars, label, className }: AppSecretFieldProps) {
	const [isRevealed, setRevealed] = useState(false);
	return (
		<div className={cx('flex h-9 min-w-0 items-center gap-1 rounded-control bg-surface-subtle pr-1 pl-3 shadow-inset-hairline', className)}>
			<SecretText secret={secret} masked={maskSecret(secret, visibleChars)} isRevealed={isRevealed} className="font-mono text-caption text-fg-muted" />
			<AppTooltip label={isRevealed ? 'Hide' : 'Show'} side="top" className="shrink-0">
				<button
					type="button"
					onClick={() => setRevealed((revealed) => !revealed)}
					aria-label={isRevealed ? `Hide ${label}` : `Show ${label}`}
					className="grid size-7 shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash/5 hover:text-fg focus-visible:shadow-ring-hover"
				>
					{isRevealed ? <EyeOff className="size-3.5" strokeWidth={1.5} /> : <Eye className="size-3.5" strokeWidth={1.5} />}
				</button>
			</AppTooltip>
			<AppCopyButton value={secret} label={`Copy ${label}`} />
		</div>
	);
}

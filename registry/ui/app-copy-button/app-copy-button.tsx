'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { cx } from '@/components/ds/ui/cx';

const COPIED_FEEDBACK_MS = 1500;

/** Copies text and reports `hasCopied` for 1.5s. A failed write (no permission) shows nothing rather than a false check. */
export function useCopy() {
	const [hasCopied, setHasCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const copy = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		setHasCopied(true);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setHasCopied(false), COPIED_FEEDBACK_MS);
	}, []);

	return { hasCopied, copy };
}

export type AppCopyButtonProps = { value: string; label?: string; className?: string };

export function AppCopyButton({ value, label = 'Copy', className }: AppCopyButtonProps) {
	const { hasCopied, copy } = useCopy();
	return (
		<AppTooltip label={hasCopied ? 'Copied' : label} side="top" className="shrink-0">
			<button
				type="button"
				onClick={() => copy(value)}
				aria-label={hasCopied ? 'Copied' : label}
				className={cx(
					'grid size-7 shrink-0 place-items-center rounded-control outline-none transition-colors duration-150 ease-out hover:bg-wash/5 focus-visible:shadow-ring-hover',
					hasCopied ? 'text-success' : 'text-fg-subtle hover:text-fg',
					className,
				)}
			>
				{hasCopied ? <Check className="size-3.5" strokeWidth={1.75} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
			</button>
		</AppTooltip>
	);
}

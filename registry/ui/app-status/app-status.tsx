import { Loader } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

const TONES = {
	success: { text: 'text-success', dot: 'bg-success', halo: 'bg-success/10' },
	running: { text: 'text-accent', dot: 'bg-brand', halo: 'bg-blue-10' },
	neutral: { text: 'text-fg-subtle', dot: 'bg-neutral-30', halo: 'bg-surface-subtle' },
	warning: { text: 'text-warning', dot: 'bg-alert', halo: 'bg-alert-soft/40' },
	danger: { text: 'text-danger', dot: 'bg-alert-strong', halo: 'bg-alert-soft/40' },
} as const;

export type AppStatusTone = keyof typeof TONES;

export type AppStatusProps = {
	variant?: AppStatusTone;
	/** dot: a dot and the label in the tone (table cells). label: the uppercase mono label (list rows). boxed: that label outlined (detail headers). code: an outlined pill with a dot, for HTTP codes. halo: a dot in a soft ring, before a row's title. */
	appearance?: 'dot' | 'label' | 'boxed' | 'code' | 'halo';
	children?: ReactNode;
	className?: string;
};

export function AppStatus({ variant = 'neutral', appearance = 'dot', children, className }: AppStatusProps) {
	const tone = TONES[variant];
	if (appearance === 'halo')
		return (
			<span aria-hidden className={cx('grid size-6 shrink-0 place-items-center rounded-pill', tone.halo, className)}>
				<span className={cx('size-2 rounded-pill', tone.dot)} />
			</span>
		);
	if (appearance === 'code')
		return (
			<span className={cx('flex h-5 shrink-0 items-center gap-1.5 rounded-control-sm border border-line px-2 text-caption text-fg-muted tabular-nums', className)}>
				<span aria-hidden className={cx('size-1.5 rounded-pill', tone.dot)} />
				{children}
			</span>
		);
	if (appearance === 'label' || appearance === 'boxed')
		return <span className={cx('font-mono text-micro uppercase', tone.text, appearance === 'boxed' && 'rounded-control-sm border border-line px-1.5 py-0.5', className)}>{children}</span>;
	return (
		<span className={cx('flex items-center gap-1.5', tone.text, className)}>
			<span aria-hidden className={cx('size-1.5 rounded-pill', tone.dot)} />
			{children}
		</span>
	);
}

/** Beside a running job's count. Constant motion, so linear; it stops turning with reduced motion. */
export function AppSpinner({ className }: { className?: string }) {
	return <Loader aria-hidden strokeWidth={1.75} className={cx('size-3.5 animate-spin text-accent motion-reduce:animate-none', className)} />;
}

/** A job's progress: done in brand, failed in alert, on a neutral track. Each segment scales on transform. */
export function AppProgressBar({ done, failed = 0, total }: { done: number; failed?: number; total: number }) {
	const share = (value: number) => (total === 0 ? 0 : value / total);
	return (
		<div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done + failed} className="relative h-1.5 w-full overflow-hidden rounded-pill bg-neutral-10">
			<span className="absolute inset-0 origin-left bg-brand transition-transform duration-500 ease-linear" style={{ transform: `scaleX(${share(done)})` }} />
			<span className="absolute inset-0 origin-left bg-alert transition-transform duration-500 ease-linear" style={{ transform: `translateX(${share(done) * 100}%) scaleX(${share(failed)})` }} />
		</div>
	);
}

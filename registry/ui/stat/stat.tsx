import { cx } from '@/components/ds/ui/cx';

export function Stat({ value, label, tone = 'default' }: { value: string; label: string; tone?: 'default' | 'on-brand' }) {
	return (
		<div className="flex flex-col gap-3">
			<span className={cx('font-data text-stat', tone === 'default' ? 'text-brand' : 'text-on-brand')}>{value}</span>
			<span className={cx('max-w-xs text-body-lg', tone === 'default' ? 'text-fg-muted' : 'text-on-brand')}>{label}</span>
		</div>
	);
}

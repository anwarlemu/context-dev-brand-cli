import { cx } from '@/components/ds/ui/cx';

export default function Example({ active }: { active: boolean }) {
	return <span className={cx('text-body', active && 'text-brand')}>Search</span>;
}

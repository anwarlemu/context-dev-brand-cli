import { cx } from '@/components/ds/ui/cx';

export type DotGridProps = {
	pattern?: string[];
	cols?: number;
	rows?: number;
	solid?: Array<[number, number]>;
	tone?: 'on-white' | 'on-brand' | 'on-black';
	size?: 'sm' | 'md' | 'lg';
	label?: string;
};

const SIZES = { sm: 'size-2 gap-2', md: 'size-3 gap-3', lg: 'size-5 gap-5' } as const;
const TONES = {
	'on-white': { hollow: 'border border-brand', solid: 'bg-brand' },
	'on-brand': { hollow: 'border border-on-brand', solid: 'bg-white' },
	'on-black': { hollow: 'border border-blue-60', solid: 'bg-brand' },
} as const;

export function DotGrid({ pattern, cols = 12, rows = 8, solid = [], tone = 'on-white', size = 'md', label }: DotGridProps) {
	const grid = pattern ?? Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (solid.some(([sr, sc]) => sr === r && sc === c) ? 'x' : 'o')).join(''));
	const width = Math.max(...grid.map((row) => row.length));
	const [dot, gap] = SIZES[size].split(' ');
	return (
		<div role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cx('grid w-max', gap)} style={{ gridTemplateColumns: `repeat(${width}, min-content)` }}>
			{grid.flatMap((row, r) =>
				Array.from({ length: width }, (_, c) => {
					const ch = row[c] ?? ' ';
					return <span key={`${r}-${c}`} className={cx(dot, 'rounded-full', ch === 'x' ? TONES[tone].solid : ch === 'o' ? TONES[tone].hollow : 'invisible')} />;
				}),
			)}
		</div>
	);
}

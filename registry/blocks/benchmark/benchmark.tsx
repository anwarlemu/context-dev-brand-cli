import { BENCHMARKS, type BenchmarkData } from '@/components/ds/ui/benchmark-data';
import { BenchmarkPanel } from '@/components/ds/ui/benchmark-chart';
import { BenchmarkComparison } from '@/components/ds/ui/benchmark-comparison';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type BenchmarkProps = { title: string; highlight?: string; sub?: string; data?: BenchmarkData; sourceLabel: string; sourceHref: string };

// Sample figures never reach production: until the data is verified, production shows the sourced feature table.
const showsCharts = (data: BenchmarkData) => data.status === 'verified' || process.env.NODE_ENV !== 'production';

export function Benchmark({ title, highlight, sub, data = BENCHMARKS, sourceLabel, sourceHref }: BenchmarkProps) {
	const charts = showsCharts(data);
	return (
		<Section block="benchmark">
			<div className="flex flex-col gap-10">
				<SectionHeading title={title} highlight={highlight} sub={sub} action={charts ? undefined : <a href={sourceHref} className="text-body-sm font-medium text-brand/85 underline-offset-4 hover:text-brand hover:underline">{sourceLabel}</a>} />
				{charts ? <BenchmarkPanel data={data} sourceHref={sourceHref} sourceLabel={sourceLabel} /> : <BenchmarkComparison />}
			</div>
		</Section>
	);
}

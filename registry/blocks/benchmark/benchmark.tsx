import { DotGrid } from '@/components/ds/ui/dot-grid';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';
import { Tabs } from '@/components/ds/ui/tabs';

type Metric = { id: string; label: string; unit: string; higherIsBetter: boolean; groups: { name: string; values: { provider: string; value: number }[] }[] };

export type BenchmarkProps = { title: string; highlight?: string; sub?: string; ours: string; metrics: Metric[]; sourceLabel: string; sourceHref: string };

const ROWS = 10;

function column(value: number, max: number, ours: boolean) {
	const filled = Math.max(1, Math.round((value / max) * ROWS));
	return Array.from({ length: ROWS }, (_, r) => (ROWS - r <= filled ? (ours ? 'x' : 'o') : ' ')).join('');
}

export function Benchmark({ title, highlight, sub, ours, metrics, sourceLabel, sourceHref }: BenchmarkProps) {
	return (
		<Section block="benchmark">
			<div className="flex flex-col gap-12">
				<SectionHeading title={title} highlight={highlight} sub={sub} />
				<Tabs
					label="Benchmark metric"
					items={metrics.map((m) => {
						const max = Math.max(...m.groups.flatMap((g) => g.values.map((v) => v.value)));
						return {
							id: m.id,
							label: m.label,
							content: (
								<div className="grid gap-8 md:grid-cols-3">
									{m.groups.map((g) => (
										<figure key={g.name} className="flex flex-col items-center gap-4 rounded-card border border-line p-6">
											<div className="flex items-end gap-3">
												{g.values.map((v) => {
													const rows = column(v.value, max, v.provider === ours).split('');
													return (
														<div key={v.provider} className="flex flex-col items-center gap-2">
															<span className={v.provider === ours ? 'text-body-sm font-medium text-brand' : 'text-body-sm text-fg-muted'}>{v.value}{m.unit}</span>
															<DotGrid pattern={rows} size="sm" label={`${v.provider} ${v.value}${m.unit}`} />
															<span className="text-caption text-fg-muted">{v.provider}</span>
														</div>
													);
												})}
											</div>
											<figcaption className="text-caption text-fg-muted">{g.name}</figcaption>
										</figure>
									))}
								</div>
							),
						};
					})}
				/>
				<a href={sourceHref} className="self-start text-body-sm text-brand underline-offset-4 hover:underline">{sourceLabel}</a>
			</div>
		</Section>
	);
}

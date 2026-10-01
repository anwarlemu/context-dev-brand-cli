import { CodeWindow } from '@/components/ds/ui/code-window';
import { DotPanel } from '@/components/ds/ui/dot-panel';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';
import { Tabs } from '@/components/ds/ui/tabs';

export type CodeShowcaseProps = {
	title: string;
	highlight?: string;
	sub?: string;
	items: { id: string; label: string; description: string; code: string }[];
};

export function CodeShowcase({ title, highlight, sub, items }: CodeShowcaseProps) {
	return (
		<Section block="code-showcase">
			<div className="flex flex-col gap-12">
				<SectionHeading title={title} highlight={highlight} sub={sub} />
				<div className="rounded-window bg-tint p-1">
					<div className="rounded-card bg-surface p-6">
						<Tabs
							label="Example requests"
							items={items.slice(0, 6).map((item) => ({
								id: item.id,
								label: item.label,
								content: (
									<div className="grid items-center gap-6 md:grid-cols-3">
										<p className="text-body text-fg-muted">{item.description}</p>
										<div className="md:col-span-2">
											<DotPanel tone="white">
												<div className="w-full max-w-3xl">
													<CodeWindow title={item.label} code={item.code} tone="dark" />
												</div>
											</DotPanel>
										</div>
									</div>
								),
							}))}
						/>
					</div>
				</div>
			</div>
		</Section>
	);
}

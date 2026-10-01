import { backdropStyle } from '@/components/ds/ui/blog-cover-art';
import { Card } from '@/components/ds/ui/card';
import { DotScene, type DotSceneName } from '@/components/ds/ui/dot-scene';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type UseCaseGridProps = {
	title: string;
	highlight?: string;
	sub?: string;
	cases: { title: string; description: string; scene: DotSceneName }[];
};

export function UseCaseGrid({ title, highlight, sub, cases }: UseCaseGridProps) {
	return (
		<Section block="use-case-grid" heading={<SectionHeading title={title} highlight={highlight} sub={sub} />}>
			<div className="flex flex-col gap-12">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{cases.slice(0, 6).map((c) => (
						<Card key={c.title}>
							<h3 className="text-h4">{c.title}</h3>
							<p className="text-body text-fg-muted">{c.description}</p>
							<div className="relative mt-auto overflow-hidden rounded-card border border-line p-6">
								<div aria-hidden className="absolute inset-2" style={backdropStyle('paper')} />
								<DotScene variant={c.scene} className="relative mx-auto w-full max-w-sm" />
							</div>
						</Card>
					))}
				</div>
			</div>
		</Section>
	);
}

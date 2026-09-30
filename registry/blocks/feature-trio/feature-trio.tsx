import { DotScene, type DotSceneName } from '@/components/ds/ui/dot-scene';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type FeatureTrioProps = {
	title?: string;
	highlight?: string;
	sub?: string;
	features: { title: string; text: string; scene: DotSceneName }[];
};

export function FeatureTrio({ title, highlight, sub, features }: FeatureTrioProps) {
	return (
		<Section block="feature-trio">
			<div className="flex flex-col gap-10">
				{title ? <SectionHeading title={title} highlight={highlight} sub={sub} /> : null}
				<div className="grid gap-10 md:grid-cols-3">
					{features.slice(0, 3).map((feature) => (
						<div key={feature.title} className="flex flex-col gap-3">
							<div className="rounded-window bg-tint p-1">
								<div className="flex items-center justify-center rounded-card bg-surface p-6">
									<DotScene variant={feature.scene} className="w-full" />
								</div>
							</div>
							<h3 className="text-h5">{feature.title}</h3>
							<p className="text-body text-fg-muted">{feature.text}</p>
						</div>
					))}
				</div>
			</div>
		</Section>
	);
}

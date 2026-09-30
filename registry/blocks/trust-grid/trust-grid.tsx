import { Button } from '@/components/ds/ui/button';
import { Card } from '@/components/ds/ui/card';
import { TrustMark } from '@/components/ds/ui/trust-mark';
import type { TrustMarkId } from '@/components/ds/ui/trust-marks';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type TrustGridProps = {
	title: string;
	highlight?: string;
	items: { title: string; description: string; mark: TrustMarkId; href?: string }[];
	cta: { label: string; href: string };
};

export function TrustGrid({ title, highlight, items, cta }: TrustGridProps) {
	return (
		<Section block="trust-grid">
			<div className="flex flex-col gap-12">
				<SectionHeading title={title} highlight={highlight} action={<Button variant="secondary" href={cta.href}>{cta.label}</Button>} />
				<div className="grid gap-4 md:grid-cols-3">
					{items.slice(0, 3).map((item) => (
						<Card key={item.title}>
							<div className="size-16 text-brand"><TrustMark mark={item.mark} /></div>
							<h3 className="text-h5">{item.title}</h3>
							<p className="text-body text-fg-muted">{item.description}</p>
							{item.href ? <a href={item.href} className="mt-auto text-body-sm text-brand underline-offset-4 hover:underline">Learn more</a> : null}
						</Card>
					))}
				</div>
			</div>
		</Section>
	);
}

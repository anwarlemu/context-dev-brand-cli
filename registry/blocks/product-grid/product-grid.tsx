import { backdropStyle } from '@/components/ds/ui/blog-cover-art';
import { Button } from '@/components/ds/ui/button';
import { Card } from '@/components/ds/ui/card';
import { Chip } from '@/components/ds/ui/chip';
import { DotScene, type DotSceneName } from '@/components/ds/ui/dot-scene';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type ProductGridProps = {
	title: string;
	highlight?: string;
	sub?: string;
	products: { name: string; href: string; description: string; tags: string[]; scene: DotSceneName }[];
	more?: { label: string; href: string }[];
};

export function ProductGrid({ title, highlight, sub, products, more = [] }: ProductGridProps) {
	return (
		<Section block="product-grid" heading={<SectionHeading title={title} highlight={highlight} sub={sub} />}>
			<div className="flex flex-col gap-12">
				<div className="grid gap-4 md:grid-cols-2">
					{products.slice(0, 4).map((p) => (
						<Card key={p.name}>
							<div className="flex items-start justify-between gap-4">
								<h3 className="text-h4">{p.name}</h3>
								<Button variant="secondary" size="small" href={p.href}>Explore</Button>
							</div>
							<p className="text-body text-fg-muted">{p.description}</p>
							<div className="flex flex-wrap gap-2">
								{p.tags.slice(0, 3).map((tag) => (
									<Chip key={tag}>{tag}</Chip>
								))}
							</div>
							<div className="relative mt-auto overflow-hidden rounded-card border border-line p-6">
								<div aria-hidden className="absolute inset-2" style={backdropStyle('paper')} />
								<DotScene variant={p.scene} className="relative mx-auto w-full max-w-sm" />
							</div>
						</Card>
					))}
				</div>
				{more.length ? (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-body-sm text-fg-muted">Also in the API</span>
						{more.map((m) => (
							<Chip key={m.label} href={m.href}>{m.label}</Chip>
						))}
					</div>
				) : null}
			</div>
		</Section>
	);
}

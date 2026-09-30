import { Card } from '@/components/ds/ui/card';
import { Section } from '@/components/ds/ui/section';

export type RelatedProductsProps = { items: { title: string; text: string; href: string }[] };

export function RelatedProducts({ items }: RelatedProductsProps) {
	return (
		<Section block="related-products" spacing="tight">
			<div className="grid gap-4 md:grid-cols-2">
				{items.slice(0, 2).map((item) => (
					<a key={item.href} href={item.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
						<Card>
							<div className="flex items-center justify-between gap-4">
								<h3 className="text-h5 transition-colors duration-150 ease-out group-hover:text-brand">{item.title}</h3>
								<span aria-hidden className="size-2.5 rounded-full border border-brand group-hover:bg-brand" />
							</div>
							<p className="text-body text-fg-muted">{item.text}</p>
						</Card>
					</a>
				))}
			</div>
		</Section>
	);
}

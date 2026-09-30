import { Badge } from '@/components/ds/ui/badge';
import { Button } from '@/components/ds/ui/button';
import { cx } from '@/components/ds/ui/cx';
import { Section } from '@/components/ds/ui/section';

export type PricingPlan = {
	id: string;
	name: string;
	for: string;
	price: string;
	period?: string;
	action: { label: string; href: string };
	features: string[];
};

export type PricingTableProps = { variant?: 'monthly'; plans: PricingPlan[]; recommended?: string; note?: string };

export function PricingTable({ plans, recommended, note }: PricingTableProps) {
	return (
		<Section block="pricing-table">
			<div className="flex flex-col gap-6">
				<div className="rounded-window bg-tint p-1">
					<div className="grid overflow-hidden rounded-card bg-surface md:grid-cols-3 lg:grid-cols-6">
						{plans.map((plan) => {
							const featured = plan.id === recommended;
							return (
								<div key={plan.id} className={cx('flex flex-col gap-4 border-b border-line p-5 lg:border-b-0 lg:border-r lg:last:border-r-0', featured && 'bg-tint')}>
									<div className="flex items-center justify-between gap-2">
										<h3 className="text-h5">{plan.name}</h3>
										{featured ? <Badge tone="brand">Popular</Badge> : null}
									</div>
									<p className="min-h-10 text-body-sm text-fg-muted">{plan.for}</p>
									<p className="flex items-baseline gap-1">
										<span className="text-h3">{plan.price}</span>
										{plan.period ? <span className="text-body-sm text-fg-muted">{plan.period}</span> : null}
									</p>
									<Button variant={featured ? 'primary' : 'secondary'} size="small" href={plan.action.href}>{plan.action.label}</Button>
									<ul className="flex flex-col gap-2 border-t border-line pt-4">
										{plan.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-body-sm text-fg">
												<span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
												{feature}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
				{note ? <p className="text-body-sm text-fg-muted">{note}</p> : null}
			</div>
		</Section>
	);
}

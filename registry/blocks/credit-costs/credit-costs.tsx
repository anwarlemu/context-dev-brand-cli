import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';
import { Table } from '@/components/ds/ui/table';

export type CreditCostsProps = {
	title: string;
	highlight?: string;
	sub?: string;
	groups: { title: string; rows: { api: string; description: string; cost: string }[] }[];
};

export function CreditCosts({ title, highlight, sub, groups }: CreditCostsProps) {
	return (
		<Section block="credit-costs" heading={<SectionHeading title={title} highlight={highlight} sub={sub} />}>
			<div className="flex flex-col gap-10">
				<div className="flex flex-col gap-6">
					{groups.map((group) => (
						<div key={group.title} className="flex flex-col gap-3">
							<h3 className="text-h5">{group.title}</h3>
							<Table
								caption={`${group.title} credit costs`}
								columns={[{ key: 'api', label: 'API' }, { key: 'description', label: 'What it does' }, { key: 'cost', label: 'Cost', align: 'right' }]}
								rows={group.rows.map((r) => ({ api: r.api, description: <span className="text-fg-muted">{r.description}</span>, cost: r.cost }))}
							/>
						</div>
					))}
				</div>
			</div>
		</Section>
	);
}

import { Button } from '@/components/ds/ui/button';
import { CreditsDotNumber } from '@/components/ds/ui/credits-dot-number';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type StepsProps = {
	title: string;
	highlight?: string;
	sub?: string;
	action?: { label: string; href: string };
	steps: { number: string; word: string; title: string; text: string }[];
};

export function Steps({ title, highlight, sub, action, steps }: StepsProps) {
	return (
		<Section block="steps">
			<div className="grid gap-12 md:grid-cols-2">
				<div className="flex flex-col items-start gap-6">
					<SectionHeading title={title} highlight={highlight} sub={sub} />
					{action ? <Button variant="secondary" href={action.href}>{action.label}</Button> : null}
				</div>
				<ol className="flex flex-col gap-4">
					{steps.slice(0, 3).map((step) => (
						<li key={step.number} className="flex items-center gap-5">
							<span className="shrink-0 rounded-window bg-tint p-1">
								<span className="flex size-20 items-center justify-center rounded-card bg-surface text-brand">
									<CreditsDotNumber value={step.number} morphTo={step.word} sideColumns={0} className="w-3/4" />
									<span className="sr-only">{step.number}</span>
								</span>
							</span>
							<div className="flex flex-col gap-1">
								<h3 className="text-h5">{step.title}</h3>
								<p className="text-body text-fg-muted">{step.text}</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</Section>
	);
}

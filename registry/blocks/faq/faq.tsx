import { Accordion } from '@/components/ds/ui/accordion';
import { Button } from '@/components/ds/ui/button';
import { FaqDemoInvite } from '@/components/ds/ui/faq-demo-invite';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';
import { Tabs } from '@/components/ds/ui/tabs';

export type FaqProps = {
	title: string;
	highlight?: string;
	sub?: string;
	action?: { label: string; href: string };
	topics: { id: string; label: string; items: { question: string; answer: string }[] }[];
	demo?: boolean;
};

export function Faq({ title, highlight, sub, action, topics, demo = true }: FaqProps) {
	return (
		<Section block="faq">
			<div className="grid gap-12 md:grid-cols-5">
				<div className="flex flex-col items-start gap-6 md:col-span-2">
					<SectionHeading title={title} highlight={highlight} sub={sub} />
					{action ? <Button variant="secondary" href={action.href}>{action.label}</Button> : null}
					{demo ? <FaqDemoInvite className="mt-auto w-full" /> : null}
				</div>
				<div className="md:col-span-3">
					{topics.length > 1 ? (
						<Tabs label="Question topics" items={topics.map((t) => ({ id: t.id, label: t.label, content: <Accordion items={t.items} /> }))} />
					) : (
						<Accordion items={topics[0]?.items ?? []} />
					)}
				</div>
			</div>
		</Section>
	);
}

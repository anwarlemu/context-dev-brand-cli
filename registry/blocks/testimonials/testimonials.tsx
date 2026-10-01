import { Button } from '@/components/ds/ui/button';
import { Card } from '@/components/ds/ui/card';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type TestimonialsProps = {
	title: string;
	highlight?: string;
	quotes: { quote: string; name: string; role: string; href?: string }[];
};

export function Testimonials({ title, highlight, quotes }: TestimonialsProps) {
	return (
		<Section block="testimonials" heading={<SectionHeading title={title} highlight={highlight} />}>
			<div className="flex flex-col gap-12">
				<div className="grid gap-4 md:grid-cols-3">
					{quotes.slice(0, 3).map((q) => (
						<Card key={q.name}>
							<blockquote className="text-body text-fg">{q.quote}</blockquote>
							<p className="text-body-sm text-fg-muted">{q.name}, {q.role}</p>
							{q.href ? <div className="mt-auto"><Button variant="secondary" size="small" href={q.href}>Read the case study</Button></div> : null}
						</Card>
					))}
				</div>
			</div>
		</Section>
	);
}

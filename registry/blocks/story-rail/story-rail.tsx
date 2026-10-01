import { Button } from '@/components/ds/ui/button';
import { Card } from '@/components/ds/ui/card';
import { CustomerLogoDots } from '@/components/ds/ui/customer-logo-dots';
import { DotGrid } from '@/components/ds/ui/dot-grid';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type StoryRailProps = {
	title: string;
	highlight?: string;
	sub?: string;
	action?: { label: string; href: string };
	stories: { company: string; date: string; summary: string; href: string; art: string[]; logoSrc?: string }[];
};

export function StoryRail({ title, highlight, sub, action, stories }: StoryRailProps) {
	return (
		<Section block="story-rail" heading={<SectionHeading title={title} highlight={highlight} sub={sub} align="center" action={action ? <Button variant="secondary" href={action.href}>{action.label}</Button> : undefined} />}>
			<div className="flex flex-col gap-10">
				<div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:-mx-10 md:px-10">
					{stories.map((story) => (
						<div key={story.company} className="w-72 shrink-0 snap-start md:w-80">
							<Card tone="blue">
								{story.logoSrc ? (
									<div className="relative h-40"><CustomerLogoDots src={story.logoSrc} className="absolute inset-0" /></div>
								) : (
									<div className="flex justify-center py-4"><DotGrid pattern={story.art} tone="on-brand" size="sm" /></div>
								)}
								<p className="text-caption text-on-brand">{story.date}</p>
								<h3 className="text-h4">{story.company}</h3>
								<p className="line-clamp-4 text-body-sm text-on-brand">{story.summary}</p>
								<div className="mt-auto pt-2"><Button variant="on-brand" size="small" href={story.href}>Read their story</Button></div>
							</Card>
						</div>
					))}
				</div>
			</div>
		</Section>
	);
}

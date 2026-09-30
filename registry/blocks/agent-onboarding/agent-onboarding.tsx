import { Badge } from '@/components/ds/ui/badge';
import { Button } from '@/components/ds/ui/button';
import { Card } from '@/components/ds/ui/card';
import { CodeWindow } from '@/components/ds/ui/code-window';
import { backdropStyle } from '@/components/ds/ui/blog-cover-art';
import { DotScene } from '@/components/ds/ui/dot-scene';
import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export type AgentOnboardingProps = {
	title: string;
	highlight?: string;
	sub?: string;
	manual: { title: string; steps: string[]; cta: { label: string; href: string } };
	agent: { title: string; body: string; prompt: string; cta: { label: string; href: string } };
};

export function AgentOnboarding({ title, highlight, sub, manual, agent }: AgentOnboardingProps) {
	return (
		<Section block="agent-onboarding">
			<div className="flex flex-col gap-12">
				<SectionHeading title={title} highlight={highlight} sub={sub} />
				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<div className="relative flex justify-center p-4">
							<div aria-hidden className="absolute inset-0" style={backdropStyle('paper')} />
							<DotScene variant="setup" className="relative mx-auto w-64" />
						</div>
						<h3 className="text-h4">{manual.title}</h3>
						<ol className="flex flex-col gap-2 text-body text-fg-muted">
							{manual.steps.slice(0, 4).map((step, i) => (
								<li key={step}>{i + 1}. {step}</li>
							))}
						</ol>
						<div className="mt-auto"><Button variant="secondary" href={manual.cta.href}>{manual.cta.label}</Button></div>
					</Card>
					<Card tone="blue">
						<CodeWindow title="agent setup" code={agent.prompt} tone="light" />
						<div className="flex items-center gap-3">
							<h3 className="text-h4">{agent.title}</h3>
							<Badge tone="on-brand">Recommended</Badge>
						</div>
						<p className="text-body">{agent.body}</p>
						<div className="mt-auto"><Button variant="on-brand" href={agent.cta.href}>{agent.cta.label}</Button></div>
					</Card>
				</div>
			</div>
		</Section>
	);
}

import { Section } from '@/components/ds/ui/section';
import { SectionHeading } from '@/components/ds/ui/section-heading';

export default function Example() {
	return (
		<Section block="example" heading={<SectionHeading title="Build on what the web knows." highlight="what the web knows." />}>
			<p className="text-body text-fg-muted">Content sits under the ruled heading.</p>
		</Section>
	);
}

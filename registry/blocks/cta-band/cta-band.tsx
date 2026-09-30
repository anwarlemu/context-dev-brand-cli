import { Button } from '@/components/ds/ui/button';
import { CreditsDotNumber } from '@/components/ds/ui/credits-dot-number';
import { HeroDotField } from '@/components/ds/ui/hero-dot-field';
import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import { Section } from '@/components/ds/ui/section';
import { Highlighted } from '@/components/ds/ui/section-heading';

export type CtaBandProps = {
	title: string;
	highlight?: string;
	sub: string;
	offer: { value: string; label: string; note: string };
	cta: { label: string; href: string };
	docs?: { label: string; href: string };
};

const hole = (kind: 'text' | 'box') => ({ [HERO_PATTERN_HOLE_ATTRIBUTE]: kind });
const CORNERS = ['left-0 top-0', 'right-0 top-0', 'left-0 bottom-0', 'right-0 bottom-0'];

export function CtaBand({ title, highlight, sub, offer, cta, docs }: CtaBandProps) {
	return (
		<Section block="cta-band">
			<div className="rounded-window bg-tint p-1">
				<div className="relative grid gap-8 overflow-hidden rounded-card bg-surface p-6 md:p-8 lg:grid-cols-5 lg:items-center lg:gap-12 lg:p-12">
					<HeroDotField className="text-brand" />
					{CORNERS.map((corner) => (
						<span key={corner} aria-hidden {...hole('box')} className={`absolute size-1 ${corner}`} />
					))}
					<div className="relative flex flex-col gap-4 lg:col-span-3">
						<h2 className="text-h3 text-balance md:text-h2">
							<span {...hole('text')}><Highlighted text={title} highlight={highlight} className="text-brand" /></span>
						</h2>
						<p className="max-w-md text-body-lg text-fg-muted">
							<span {...hole('text')}>{sub}</span>
						</p>
					</div>
					<div className="relative lg:col-span-2">
						<div className="rounded-window bg-tint p-1">
							<div {...hole('box')} className="flex flex-col items-center gap-4 rounded-card bg-surface p-6">
								<p className="flex w-full flex-col items-center text-center">
									<span className="sr-only">{offer.value}</span>
									<CreditsDotNumber value={offer.value} className="w-full max-w-xs" />
									<span className="mt-2 text-h5">{offer.label}</span>
								</p>
								<p className="text-center text-body-sm text-fg-muted">{offer.note}</p>
								<Button variant="secondary" href={cta.href}>{cta.label}</Button>
								{docs ? <a href={docs.href} className="text-center text-body-sm text-fg-muted hover:text-brand">{docs.label}</a> : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Section>
	);
}

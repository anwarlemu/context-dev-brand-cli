import { Button } from '@/components/ds/ui/button';
import { CodeWindow } from '@/components/ds/ui/code-window';
import { cx } from '@/components/ds/ui/cx';
import { HeroDotField } from '@/components/ds/ui/hero-dot-field';
import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import { HeroStatMorphs } from '@/components/ds/ui/hero-stat-morphs';
import { RingBackdrop } from '@/components/ds/ui/ring-backdrop';
import { Section } from '@/components/ds/ui/section';
import { Highlighted } from '@/components/ds/ui/section-heading';

export type HeroProps = {
	variant?: 'centered' | 'product';
	eyebrow?: string;
	headline: string;
	highlight?: string;
	sub: string;
	primaryCta: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
	media?: { type: 'agent-setup'; prompt: string } | { type: 'code'; title: string; code: string } | { type: 'none' };
	checks?: string[];
	stats?: boolean;
};

const hole = (kind: 'text' | 'box' | 'snug-box') => ({ [HERO_PATTERN_HOLE_ATTRIBUTE]: kind });

export function Hero({ variant = 'centered', eyebrow, headline, highlight, sub, primaryCta, secondaryCta, media = { type: 'none' }, checks = [], stats = false }: HeroProps) {
	const centered = variant === 'centered';
	return (
		<Section block="hero">
			<div className={cx('relative isolate flex flex-col gap-10', centered ? 'items-center py-8 text-center' : 'md:flex-row md:items-center md:justify-between')}>
				{centered ? <HeroDotField fine lively logoMark className="-z-10 text-brand" /> : null}
				{centered && stats ? <HeroStatMorphs /> : null}
				<div className={cx('relative flex max-w-3xl flex-col gap-6', centered && 'items-center')}>
					{eyebrow ? <p {...hole('text')} className="text-body-sm text-fg-muted">{eyebrow}</p> : null}
					<h1 {...hole('text')} className="text-h2 text-balance md:text-h1 lg:text-display">
						<Highlighted text={headline} highlight={highlight} className="text-brand" />
					</h1>
					<p {...hole('text')} className="max-w-xl text-body-lg text-fg-muted text-pretty">{sub}</p>
					<div {...hole('snug-box')} className="flex flex-wrap items-center gap-3">
						<Button variant="primary" href={primaryCta.href}>{primaryCta.label}</Button>
						{secondaryCta ? <Button variant="secondary" href={secondaryCta.href}>{secondaryCta.label}</Button> : null}
					</div>
					{checks.length ? (
						<ul {...hole('snug-box')} className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-fg-muted">
							{checks.slice(0, 3).map((check) => (
								<li key={check} className="flex items-center gap-2"><span aria-hidden className="size-2 rounded-full bg-brand" />{check}</li>
							))}
						</ul>
					) : null}
				</div>
				{media.type !== 'none' ? (
					<div {...hole('box')} className={cx('relative w-full', centered ? 'max-w-2xl' : 'md:max-w-md')}>
						<div className="relative rounded-window bg-brand p-3">
							<RingBackdrop color="var(--ds-color-white)" opacity={0.22} className="inset-1 rounded-window" />
							<div className="relative">
								{media.type === 'agent-setup' ? <CodeWindow title="agent setup" code={media.prompt} tone="light" /> : <CodeWindow title={media.title} code={media.code} tone="dark" />}
							</div>
						</div>
					</div>
				) : null}
			</div>
		</Section>
	);
}

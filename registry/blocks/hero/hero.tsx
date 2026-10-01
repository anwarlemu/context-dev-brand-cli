import { Button } from '@/components/ds/ui/button';
import { CodeWindow } from '@/components/ds/ui/code-window';
import { cx } from '@/components/ds/ui/cx';
import { DemoInput } from '@/components/ds/ui/demo-input';
import { DotPanel } from '@/components/ds/ui/dot-panel';
import { HeroDotField } from '@/components/ds/ui/hero-dot-field';
import { HERO_PATTERN_HOLE_ATTRIBUTE } from '@/components/ds/ui/hero-pattern-hole';
import { HeroStatMorphs } from '@/components/ds/ui/hero-stat-morphs';
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
	media?: { type: 'demo'; action?: string } | { type: 'agent-setup'; prompt: string } | { type: 'code'; title: string; code: string } | { type: 'none' };
	checks?: string[];
	stats?: boolean;
};

const hole = (kind: 'text' | 'box' | 'snug-box') => ({ [HERO_PATTERN_HOLE_ATTRIBUTE]: kind });

function Checks({ items }: { items: string[] }) {
	return (
		<ul {...hole('snug-box')} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-body-sm text-fg-muted">
			{items.slice(0, 3).map((item) => (
				<li key={item} className="flex items-center gap-2">
					<svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
						<rect width="16" height="16" rx="5" className="fill-brand" />
						<path d="M4.75 8.25 7 10.5l4.25-4.75" fill="none" className="stroke-white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{item}
				</li>
			))}
		</ul>
	);
}

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
					{checks.length > 0 && media.type !== 'demo' ? <Checks items={checks} /> : null}
				</div>
				{media.type !== 'none' ? (
					<div {...hole('box')} className={cx('relative flex w-full flex-col items-center gap-5', centered ? (media.type === 'demo' ? 'max-w-4xl' : 'max-w-2xl') : 'md:max-w-md')}>
						<DotPanel tone="blue" padding={media.type === 'demo' ? 'default' : 'none'}>
							{media.type === 'demo' ? <DemoInput action={media.action} /> : null}
							{media.type === 'agent-setup' ? <div className="w-full p-3"><CodeWindow title="agent setup" code={media.prompt} tone="light" /></div> : null}
							{media.type === 'code' ? <div className="w-full p-3"><CodeWindow title={media.title} code={media.code} tone="dark" /></div> : null}
						</DotPanel>
						{checks.length > 0 && media.type === 'demo' ? <Checks items={checks} /> : null}
					</div>
				) : null}
			</div>
		</Section>
	);
}

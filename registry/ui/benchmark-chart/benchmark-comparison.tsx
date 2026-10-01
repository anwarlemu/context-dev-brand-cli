'use client';

import { cx as cn } from '@/components/ds/ui/cx';
import { domAnimation, LazyMotion, useInView, useReducedMotion } from 'motion/react';
import * as m from 'motion/react-m';
import { useRef } from 'react';

function Check({ className, ...props }: { className?: string; 'aria-label'?: string }) {
	return (
		<svg viewBox="0 0 16 16" fill="none" role="img" className={className} {...props}>
			<path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const GRID_TEMPLATE = 'grid-cols-[minmax(11rem,1.6fr)_repeat(4,minmax(6.5rem,1fr))]';

type Support = boolean | string;

const COMPETITORS = [
	{ key: 'firecrawl', name: 'Firecrawl', href: '/compare/the-top-firecrawl-alternative' },
	{ key: 'exa', name: 'Exa', href: '/compare/the-top-exa-alternative' },
	{ key: 'tavily', name: 'Tavily', href: '/compare/the-top-tavily-alternative' },
] as const;

type CompetitorKey = (typeof COMPETITORS)[number]['key'];

// Mirrors the per-competitor tables in sections/alternatives so the homepage never claims more than those pages do.
const COMPARISON_ROWS: { feature: string; context: Support; competitors: Record<CompetitorKey, Support> }[] = [
	{ feature: 'Any URL to clean Markdown', context: true, competitors: { firecrawl: true, exa: true, tavily: true } },
	{ feature: 'Bot detection bypass', context: 'Included', competitors: { firecrawl: 'Extra credits', exa: false, tavily: false } },
	{ feature: 'Automatic proxy escalation', context: 'Included', competitors: { firecrawl: 'Up to 5x credits', exa: false, tavily: false } },
	{ feature: 'Full-site crawl with filters', context: true, competitors: { firecrawl: true, exa: false, tavily: true } },
	{ feature: 'URL discovery (Map)', context: true, competitors: { firecrawl: true, exa: false, tavily: false } },
	{ feature: 'Raw HTML and screenshots', context: true, competitors: { firecrawl: true, exa: false, tavily: false } },
	{ feature: 'Brand lookup by domain, email, or ticker', context: true, competitors: { firecrawl: false, exa: false, tavily: false } },
];

function SupportCell({ value, isContext = false }: { value: Support; isContext?: boolean }) {
	if (typeof value === 'string') {
		return <span className={cn('text-body-sm', isContext ? 'font-medium text-brand' : 'text-fg-muted')}>{value}</span>;
	}
	if (value) {
		return <Check aria-label="Yes" className={cn('size-4', isContext ? 'text-brand' : 'text-neutral-60')} />;
	}
	return (
		<span className="text-body-sm text-fg-subtle">
			<span aria-hidden="true" className="inline-block size-2 rounded-full border border-neutral-30" />
			<span className="sr-only">No</span>
		</span>
	);
}

function ComparisonGrid() {
	const gridRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(gridRef, { once: true, amount: 0.3 });
	const prefersReducedMotion = useReducedMotion() ?? false;

	return (
		<div className="overflow-x-auto rounded-card border border-line bg-surface text-fg [scrollbar-width:none]">
			<div ref={gridRef} role="table" aria-label="Context compared with Firecrawl, Exa, and Tavily" className="relative min-w-[40rem]">
				<div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-surface-subtle" />
				<div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 grid px-5', GRID_TEMPLATE)}>
					<span />
					<span className="bg-tint" />
				</div>

				<div role="row" className={cn('relative grid h-14 items-center border-b border-line px-5', GRID_TEMPLATE)}>
					<span role="columnheader" className="text-caption text-neutral-60">
						Feature
					</span>
					<span role="columnheader" className="text-center text-body-sm font-medium text-brand">
						Context
					</span>
					{COMPETITORS.map((competitor) => (
						<a key={competitor.key} role="columnheader" href={competitor.href} className="justify-self-center rounded-card text-body-sm text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
							{competitor.name}
						</a>
					))}
				</div>

				{COMPARISON_ROWS.map((row, index) => (
					<m.div
						key={row.feature}
						role="row"
						initial={prefersReducedMotion ? false : { opacity: 0 }}
						animate={isInView ? { opacity: 1 } : undefined}
						transition={{ duration: 0.4, delay: 0.1 + index * 0.05, ease: REVEAL_EASE }}
						className={cn('relative grid h-12 items-center border-b border-line px-5 last:border-b-0', GRID_TEMPLATE)}
					>
						<span role="rowheader" className="pr-4 text-body-sm text-fg">
							{row.feature}
						</span>
						<span role="cell" className="flex justify-center">
							<SupportCell value={row.context} isContext />
						</span>
						{COMPETITORS.map((competitor) => (
							<span key={competitor.key} role="cell" className="flex justify-center text-center">
								<SupportCell value={row.competitors[competitor.key]} />
							</span>
						))}
					</m.div>
				))}
			</div>
		</div>
	);
}

/** Feature-by-feature comparison, sourced from the alternatives pages. Shown instead of the charts until the figures are verified. */
export function BenchmarkComparison() {
	return (
		<LazyMotion features={domAnimation}>
			<ComparisonGrid />
		</LazyMotion>
	);
}

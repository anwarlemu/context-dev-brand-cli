// The homepage benchmark: Context against Firecrawl, Exa, and Parallel.
//
// SAMPLE DATA. These numbers are placeholders for layout only; no benchmark has been run. While `status`
// is 'sample', production builds render the feature table instead of the charts (see CompetitorComparison),
// so they can never ship. Replace every figure with real results, then set
// `status: 'verified'`.

export type ProviderKey = 'context' | 'firecrawl' | 'exa' | 'parallel';

// Competitor marks are each company's own, from its website (public/benchmarks), shown to identify it in the comparison.
// Context uses its logo component instead.
export const PROVIDERS: { key: ProviderKey; name: string; logo?: string }[] = [
	{ key: 'context', name: 'Context' },
	{ key: 'firecrawl', name: 'Firecrawl', logo: '/benchmarks/firecrawl.svg' },
	{ key: 'exa', name: 'Exa', logo: '/benchmarks/exa.svg' },
	{ key: 'parallel', name: 'Parallel', logo: '/benchmarks/parallel.svg' },
];

export const BENCHMARKS = {
	status: 'sample' as 'sample' | 'verified',
	// Share of pages returned with usable content, by kind of page (percent).
	successRate: {
		groups: ['Bot-protected', 'JS-rendered', 'Long-tail'],
		values: {
			context: [94, 97, 92],
			firecrawl: [78, 93, 88],
			exa: [41, 71, 84],
			parallel: [62, 88, 90],
		} satisfies Record<ProviderKey, number[]>,
	},
	// Median time to content for a protected page, in seconds.
	latency: { context: 1.1, firecrawl: 3.9, exa: 1.4, parallel: 5.6 } satisfies Record<ProviderKey, number>,
	// Overall success rate against cost per 1,000 pages.
	costVsSuccess: {
		context: { cost: 0.79, success: 94 },
		firecrawl: { cost: 4.95, success: 86 },
		exa: { cost: 1, success: 65 },
		parallel: { cost: 1.5, success: 80 },
	} satisfies Record<ProviderKey, { cost: number; success: number }>,
};

export type BenchmarkData = typeof BENCHMARKS;

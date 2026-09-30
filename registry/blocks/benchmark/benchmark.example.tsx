import { Benchmark } from '@/components/ds/blocks/benchmark';

export default function Example() {
	return (
		<Benchmark
			title="Cheaper, better, faster, stronger at any scale."
			highlight="at any scale."
			sub="Accuracy and speed per token, from sub-second search to constant monitoring."
			ours="Context"
			metrics={[
				{ id: 'success', label: 'Success rate', unit: '%', higherIsBetter: true, groups: [
					{ name: 'Bot-protected', values: [{ provider: 'Context', value: 94 }, { provider: 'Firecrawl', value: 78 }, { provider: 'Exa', value: 41 }, { provider: 'Parallel', value: 62 }] },
					{ name: 'JS-rendered', values: [{ provider: 'Context', value: 97 }, { provider: 'Firecrawl', value: 93 }, { provider: 'Exa', value: 71 }, { provider: 'Parallel', value: 88 }] },
					{ name: 'Long-tail', values: [{ provider: 'Context', value: 92 }, { provider: 'Firecrawl', value: 88 }, { provider: 'Exa', value: 84 }, { provider: 'Parallel', value: 90 }] },
				] },
			]}
			sourceLabel="See full comparisons"
			sourceHref="/compare"
		/>
	);
}

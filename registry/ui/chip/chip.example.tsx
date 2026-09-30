import { Chip } from '@/components/ds/ui/chip';

export default function Example() {
	return (
		<div className="flex flex-wrap gap-2">
			<Chip>Fresh sources for RAG</Chip>
			<Chip href="/crawl">Crawl</Chip>
		</div>
	);
}

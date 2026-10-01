import { CodeWindow } from '@/components/ds/ui/code-window';
import { DotPanel } from '@/components/ds/ui/dot-panel';

export default function Example() {
	return (
		<DotPanel tone="white">
			<CodeWindow title="scrape.ts" code="const page = await client.web.scrape({ url: 'https://linear.app' });" />
		</DotPanel>
	);
}

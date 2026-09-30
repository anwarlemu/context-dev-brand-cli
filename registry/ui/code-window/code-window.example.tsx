import { CodeWindow } from '@/components/ds/ui/code-window';

export default function Example() {
	return <CodeWindow title="scrape.ts" code={`const page = await client.web.scrape({ url: 'https://linear.app' });`} tone="dark" />;
}

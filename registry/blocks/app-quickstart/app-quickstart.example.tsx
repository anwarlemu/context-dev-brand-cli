import { AppQuickstart } from '@/components/ds/blocks/app-quickstart';

export default function Example() {
	return (
		<AppQuickstart
			riseIndex={2}
			apiKey={{ name: 'Default', secret: 'ctxt_secret_93c3f0a1b2c4d5e6f7' }}
			manageHref="/api-keys"
			snippets={[
				{ value: 'mcp', label: 'MCP', code: 'claude mcp add --transport http context https://mcp.context.dev --header "Authorization: Bearer {{key}}"' },
				{ value: 'cli', label: 'CLI', code: 'npx context-dev login --key {{key}}' },
			]}
			prompts={[
				{ value: 'agent', label: 'Add to agent', text: 'Add Context.dev to your tools with the API key {{key}}, then scrape context.dev to check it works.' },
				{ value: 'app', label: 'Build into app', text: 'Install the Context.dev SDK, read the key from CONTEXT_API_KEY, and make one scrape call.' },
			]}
		/>
	);
}

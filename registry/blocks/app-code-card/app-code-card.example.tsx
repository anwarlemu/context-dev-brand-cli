import { AppCodeCard } from '@/components/ds/blocks/app-code-card';

export default function Example() {
	return (
		<AppCodeCard
			snippets={{
				cURL: "curl --request POST 'https://api.context.dev/v1/web/scrape' \\\n  --header 'Authorization: Bearer ctxt_secret_93c3••••' \\\n  --header 'Content-Type: application/json' \\\n  --data '{\n    \"url\": \"https://context.dev\",\n    \"formats\": [\"markdown\"]\n  }'",
				TypeScript: "import { Context } from '@context-dev/sdk';\n\nconst context = new Context();\nconst page = await context.scrape({ url: 'https://context.dev' });",
			}}
			agents={['Claude Code', 'Cursor', 'Codex']}
		/>
	);
}

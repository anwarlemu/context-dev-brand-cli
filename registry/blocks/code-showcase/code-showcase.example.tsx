import { CodeShowcase } from '@/components/ds/blocks/code-showcase';

export default function Example() {
	return (
		<CodeShowcase
			title="One API. Your next feature."
			highlight="One API."
			sub="Start with a request that fits your workflow. Use the returned data directly in your application."
			items={[
				{ id: 'scrape', label: 'Scrape anything', description: 'Get Markdown, HTML, screenshots, images, or structured fields from any URL.', code: "import ContextDev from 'context.dev';\n\nconst client = new ContextDev({ apiKey: 'YOUR_API_KEY' });\n\nconst page = await client.web.scrape({\n  url: 'https://linear.app',\n  formats: { markdown: true, screenshot: true },\n});\n\nconsole.log(page.markdown.data);" },
				{ id: 'answers', label: 'Answers from the web', description: 'Ask a research question and get a structured answer with source URLs.', code: "const answer = await client.web.answers({\n  task: 'What does Linear sell?',\n  json_format: { product: '', pricing: '' },\n});\n\nconsole.log(answer.json_content);" },
			]}
		/>
	);
}

import { Footer } from '@/components/ds/blocks/footer';

export default function Example() {
	return (
		<Footer
			tagline="Web data infrastructure for AI agents. Scrape anything. Get answers. Keep your data fresh."
			columns={[
				{ title: 'Product', links: [{ label: 'Scrape anything', href: '/web-scraping-api' }, { label: 'Answers from the web', href: '/answers' }, { label: 'Create monitors', href: '/monitors' }, { label: 'Pricing', href: '/pricing' }] },
				{ title: 'Developers', links: [{ label: 'Documentation', href: 'https://docs.context.dev' }, { label: 'MCP server', href: '/mcp' }, { label: 'CLI', href: '/cli' }] },
				{ title: 'Resources', links: [{ label: 'Blog', href: '/blog' }, { label: 'Customers', href: '/customers' }, { label: 'Glossary', href: '/glossary' }] },
				{ title: 'Company', links: [{ label: 'Contact', href: '/contact' }, { label: 'Trust center', href: '/trust' }] },
			]}
			legal={[{ label: 'Terms', href: '/terms' }, { label: 'DPA', href: '/dpa' }, { label: 'Privacy', href: '/privacy' }]}
			compliance="SOC 1 and SOC 2 compliant"
			status={{ label: 'All systems operational', href: 'https://status.context.dev' }}
			copyright="© 2026 Context.dev"
		/>
	);
}

import { PricingTemplate } from '@/components/ds/templates/pricing';
import { Nav } from '@/components/ds/blocks/nav';
import { Hero } from '@/components/ds/blocks/hero';
import { PricingTable } from '@/components/ds/blocks/pricing-table';
import { CreditCosts } from '@/components/ds/blocks/credit-costs';
import { Faq } from '@/components/ds/blocks/faq';
import { CtaBand } from '@/components/ds/blocks/cta-band';
import { Footer } from '@/components/ds/blocks/footer';

export default function Page() {
	return (
		<PricingTemplate
			nav={
				<Nav
					links={[
						{ label: 'Products', href: '/products' },
						{ label: 'Use cases', href: '/use-cases' },
						{ label: 'Customers', href: '/customers' },
						{ label: 'Pricing', href: '/pricing' },
						{ label: 'Docs', href: 'https://docs.context.dev' },
					]}
					demoCta={{ label: 'Book demo', href: '/demo' }}
					primaryCta={{ label: 'Start for free', href: '/signup' }}
				/>
			}
			hero={
				<Hero
					variant="centered"
					headline="Straightforward, transparent pricing"
					highlight="transparent pricing"
					sub="Start with 1,000 free credits a month. No credit card required."
					primaryCta={{ label: 'Start for free', href: '/signup' }}
					secondaryCta={{ label: 'Book demo', href: '/demo' }}
				/>
			}
			plans={
				<PricingTable
					variant="monthly"
					recommended="pro"
					note="Eligible startups and nonprofits get 50% off an annual paid plan for 12 months."
					plans={[
						{ id: 'free', name: 'Free', for: 'For testing out the API', price: '$0', period: '/month', action: { label: 'Get started', href: '/signup' }, features: ['1,000 credits per month', 'Email support'] },
						{ id: 'developer', name: 'Developer', for: 'Building your first workflow', price: '$25', period: '/month', action: { label: 'Start building', href: '/signup?plan=developer' }, features: ['10,000 credits per month', 'Email support'] },
						{ id: 'pro', name: 'Pro', for: 'Production apps with steady usage', price: '$99', period: '/month', action: { label: 'Start Pro', href: '/signup?plan=pro' }, features: ['125,000 credits per month', 'Email and Slack support'] },
						{ id: 'growth', name: 'Growth', for: 'Scaling products and teams', price: '$299', period: '/month', action: { label: 'Start Growth', href: '/signup?plan=growth' }, features: ['500,000 credits per month', 'Priority support'] },
						{ id: 'scale', name: 'Scale', for: 'High-volume products', price: '$499', period: '/month', action: { label: 'Start Scale', href: '/signup?plan=scale' }, features: ['1,000,000 credits per month', 'Priority and Slack support'] },
						{ id: 'enterprise', name: 'Enterprise', for: 'Security, procurement and custom limits', price: 'Custom', action: { label: 'Book demo', href: '/demo' }, features: ['2M+ credits per month', 'Dedicated Slack channel'] },
					]}
				/>
			}
			costs={
				<CreditCosts
					title="API credit costs"
					highlight="credit costs"
					sub="The base cost and optional charges for each API."
					groups={[
						{ title: 'Web extraction', rows: [{ api: 'Scrape anything', description: 'HTML, Markdown, screenshots, images or CSS parsing in one request', cost: '1 credit per call' }, { api: 'Search web', description: 'Ranked results with optional page content', cost: '1 credit per 10 results' }, { api: 'Answers', description: 'Research a question and return your JSON shape', cost: '100 credits per call' }] },
						{ title: 'Brand intelligence', rows: [{ api: 'Retrieve brand', description: 'Domain, company name, email or ticker to brand data', cost: '10 credits per call' }] },
						{ title: 'People and news', rows: [{ api: 'Enrich people', description: 'Enrich a person from their name, company or profile', cost: '10 credits per call' }] },
						{ title: 'Utility', rows: [{ api: 'Parse file', description: 'Turn a file into Markdown', cost: '1 credit per page' }] },
					]}
				/>
			}
			faq={
				<Faq
					title="Frequently asked questions"
					highlight="questions"
					sub="Everything you need to know about integrating and scaling with Context.dev."
					action={{ label: 'Book demo', href: '/demo' }}
					topics={[
						{ id: 'api', label: 'API and integration', items: [
							{ question: 'What SDKs are available?', answer: 'Official SDKs for TypeScript, Python, Ruby, Go and PHP. The REST API works from any language.' },
							{ question: 'How can my agent sign up?', answer: 'Paste one line into your coding agent. It signs up, gets a key and integrates Context.dev for you.' },
						] },
						{ id: 'pricing', label: 'Pricing and plans', items: [
							{ question: 'Is there a free tier?', answer: 'Yes. 1,000 API credits per month, no credit card required.' },
							{ question: 'What is a credit?', answer: 'Every API call costs a fixed number of credits, like 1 per scrape or 10 per brand lookup. The table above lists each cost.' },
							{ question: 'Do startups and nonprofits get a discount?', answer: 'Yes. Eligible startups and nonprofits get 50% off an annual paid plan for 12 months.' },
							{ question: 'What if I need more than 1,000,000 credits?', answer: 'Enterprise starts at 2M credits a month with custom limits and a dedicated Slack channel. Book a demo to set it up.' },
						] },
					]}
				/>
			}
			cta={
				<CtaBand
					title="Start building with live web context."
					highlight="live web context."
					sub="Scrape, search and research the web with one API. Bring the results straight into your product."
					offer={{ value: '1,000', label: 'free credits', note: 'Every month. No credit card required.' }}
					cta={{ label: 'Start for free', href: '/signup' }}
					docs={{ label: 'Read the docs', href: 'https://docs.context.dev' }}
				/>
			}
			footer={
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
			}
		/>
	);
}

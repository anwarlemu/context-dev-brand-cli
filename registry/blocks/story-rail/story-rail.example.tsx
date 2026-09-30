import { StoryRail } from '@/components/ds/blocks/story-rail';

export default function Example() {
	return (
		<StoryRail
			title="How customers shipped with Context.dev"
			highlight="How customers shipped"
			sub="From early startups to large companies, teams ship web data features in days."
			action={{ label: 'See all customers', href: '/customers' }}
			stories={[
				{ company: 'Mastra', date: 'Sep 12', summary: 'Mastra built an onboarding MVP in an hour, prefilling names and company details for each user.', href: '/customers/mastra', art: ['ooxxoo', 'oxxxxo', 'oxxxxo', 'ooxxoo'] },
				{ company: 'Tinfoil', date: 'Sep 11', summary: 'Tinfoil moved to Context.dev for zero data retention and added scraping to its private search agent.', href: '/customers/tinfoil', art: ['oooxoo', 'ooxxxo', 'oxxxxx', 'oooooo'] },
				{ company: 'Squad', date: 'Sep 9', summary: 'Squad gave its agents webpage scraping, screenshots and structured extraction in five minutes.', href: '/customers/squad', art: ['oxxoxx', 'oxxoxx', 'oooooo', 'oxxoxx'] },
			]}
		/>
	);
}

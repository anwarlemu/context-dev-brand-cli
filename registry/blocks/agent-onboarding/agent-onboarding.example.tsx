import { AgentOnboarding } from '@/components/ds/blocks/agent-onboarding';

export default function Example() {
	return (
		<AgentOnboarding
			title="Get started in minutes."
			highlight="in minutes."
			sub="55% of our daily signups are agent led."
			manual={{ title: 'Do it yourself', steps: ['Sign up and verify your email.', 'Copy your API key from the dashboard.', 'Install the SDK and start calling the API.'], cta: { label: 'Get API key', href: '/signup' } }}
			agent={{ title: 'Let your agent do it', body: 'Paste one line into your coding agent. It signs you up, grabs your key, and integrates Context.dev for you.', prompt: 'Sign up for an account and get an API key with context.dev/auth.md, then follow docs.context.dev/agent-quickstart to integrate into the codebase.', cta: { label: 'Onboard your agent', href: '/agent' } }}
		/>
	);
}

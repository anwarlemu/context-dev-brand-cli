import { AppSidebar } from '@/components/ds/blocks/app-sidebar';

export default function Example() {
	return (
		<AppSidebar
			workspace={{ name: 'Agencidev', plan: 'Free', createHref: '/settings?tab=organization' }}
			groups={[
				{ items: [{ title: 'Overview', href: '/', icon: 'layout-grid' }] },
				{ label: 'Products', items: [{ title: 'Data APIs', href: '/playground/scrape', icon: 'boxes' }, { title: 'Monitors', href: '/monitors', icon: 'radar' }, { title: 'Batches', href: '/batches', icon: 'layers' }] },
				{ label: 'Workspace', items: [{ title: 'API keys', href: '/api-keys', icon: 'key-round' }, { title: 'Usage', href: '/usage', icon: 'chart-column' }, { title: 'Team', href: '/team', icon: 'users' }] },
			]}
			footer={[{ title: 'Help', href: '/help', icon: 'circle-help' }, { title: 'Documentation', href: 'https://docs.context.dev', icon: 'code' }]}
			user={{ name: 'Ian Gerado', email: 'ian@agencidev.com', links: [[{ label: 'Settings', href: '/settings' }, { label: 'Changelog', href: '/changelog' }]], logoutHref: '/logout' }}
		/>
	);
}

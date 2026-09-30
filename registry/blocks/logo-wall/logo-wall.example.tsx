import { LogoWall } from '@/components/ds/blocks/logo-wall';

export default function Example() {
	return (
		<LogoWall
			title="Powering agents and products with the world's data."
			customers={['Super.com', 'Passionfroot', 'Mintlify', 'Chatwoot', 'Similarweb', 'Klarna', 'Ferndesk', 'DocsBot', 'daily.dev', 'Vizzy', 'Comp AI', 'Squad']}
			cta={{ label: 'Read customer stories', href: '/customers' }}
		/>
	);
}

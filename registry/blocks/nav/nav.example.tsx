import { Nav } from '@/components/ds/blocks/nav';

export default function Example() {
	return (
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
	);
}

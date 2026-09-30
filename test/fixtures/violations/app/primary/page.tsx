import { CreditCosts } from '@/components/ds/blocks/credit-costs';
import { CtaBand } from '@/components/ds/blocks/cta-band';
import { Faq } from '@/components/ds/blocks/faq';
import { Footer } from '@/components/ds/blocks/footer';
import { Hero } from '@/components/ds/blocks/hero';
import { Nav } from '@/components/ds/blocks/nav';
import { PricingTable } from '@/components/ds/blocks/pricing-table';
import { PricingTemplate } from '@/components/ds/templates/pricing';
import { Button } from '@/components/ds/ui/button';

export default function Page() {
	return (
		<PricingTemplate
			nav={<Nav />}
			hero={<Hero primaryCta={{ label: 'Start for free', href: '/signup' }} />}
			plans={<PricingTable />}
			costs={<CreditCosts />}
			faq={<Faq action={<Button variant="primary" href="/demo">Book demo</Button>} />}
			cta={<CtaBand />}
			footer={<Footer />}
		/>
	);
}

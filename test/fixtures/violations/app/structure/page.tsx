import { CreditCosts } from '@/components/ds/blocks/credit-costs';
import { CtaBand } from '@/components/ds/blocks/cta-band';
import { Faq } from '@/components/ds/blocks/faq';
import { Footer } from '@/components/ds/blocks/footer';
import { Hero } from '@/components/ds/blocks/hero';
import { LogoWall } from '@/components/ds/blocks/logo-wall';
import { Nav } from '@/components/ds/blocks/nav';
import { PricingTemplate } from '@/components/ds/templates/pricing';

export default function Page() {
	return <PricingTemplate nav={<Nav />} hero={<Hero />} plans={<LogoWall />} costs={<CreditCosts />} faq={<Faq />} cta={<CtaBand />} footer={<Footer />} />;
}

import type { ReactNode } from 'react';
import { PageGuides } from '@/components/ds/ui/page-guides';

export type PricingTemplateProps = {
	nav?: ReactNode;
	hero?: ReactNode;
	plans?: ReactNode;
	costs?: ReactNode;
	faq?: ReactNode;
	cta?: ReactNode;
	footer?: ReactNode;
};

export function PricingTemplate({ nav, hero, plans, costs, faq, cta, footer }: PricingTemplateProps) {
	return (
		<div data-ds-template="pricing" className="relative min-h-screen overflow-x-clip bg-surface font-sans text-fg">
			<PageGuides />
			{nav}
			<main>
				{hero}
				{plans}
				{costs}
				{faq}
				{cta}
			</main>
			{footer}
		</div>
	);
}

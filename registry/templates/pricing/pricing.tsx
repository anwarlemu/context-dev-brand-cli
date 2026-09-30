import type { ReactNode } from 'react';

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
		<div data-ds-template="pricing" className="min-h-screen bg-surface font-sans text-fg">
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

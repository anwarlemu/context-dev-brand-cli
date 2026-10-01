import type { ReactNode } from 'react';
import { PageGuides } from '@/components/ds/ui/page-guides';

export type ProductTemplateProps = {
	nav?: ReactNode;
	hero?: ReactNode;
	proof?: ReactNode;
	features?: ReactNode;
	showcase?: ReactNode;
	steps?: ReactNode;
	faq?: ReactNode;
	related?: ReactNode;
	cta?: ReactNode;
	footer?: ReactNode;
};

export function ProductTemplate({ nav, hero, proof, features, showcase, steps, faq, related, cta, footer }: ProductTemplateProps) {
	return (
		<div data-ds-template="product" className="relative min-h-screen overflow-x-clip bg-surface font-sans text-fg">
			<PageGuides />
			{nav}
			<main>
				{hero}
				{proof}
				{features}
				{showcase}
				{steps}
				{faq}
				{related}
				{cta}
			</main>
			{footer}
		</div>
	);
}

import type { ReactNode } from 'react';

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
		<div data-ds-template="product" className="min-h-screen bg-surface font-sans text-fg">
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

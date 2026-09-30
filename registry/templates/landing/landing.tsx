import type { ReactNode } from 'react';

export type LandingTemplateProps = {
	announcement?: ReactNode;
	nav?: ReactNode;
	hero?: ReactNode;
	proof?: ReactNode;
	products?: ReactNode;
	benchmark?: ReactNode;
	onboarding?: ReactNode;
	showcase?: ReactNode;
	use_cases?: ReactNode;
	trust?: ReactNode;
	testimonials?: ReactNode;
	stories?: ReactNode;
	updates?: ReactNode;
	steps?: ReactNode;
	faq?: ReactNode;
	cta?: ReactNode;
	footer?: ReactNode;
};

export function LandingTemplate({ announcement, nav, hero, proof, products, benchmark, onboarding, showcase, use_cases, trust, testimonials, stories, updates, steps, faq, cta, footer }: LandingTemplateProps) {
	return (
		<div data-ds-template="landing" className="min-h-screen bg-surface font-sans text-fg">
			{announcement}
			{nav}
			<main>
				{hero}
				{proof}
				{products}
				{benchmark}
				{onboarding}
				{showcase}
				{use_cases}
				{trust}
				{testimonials}
				{stories}
				{updates}
				{steps}
				{faq}
				{cta}
			</main>
			{footer}
		</div>
	);
}

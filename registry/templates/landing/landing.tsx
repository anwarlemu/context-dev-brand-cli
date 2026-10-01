import type { ReactNode } from 'react';
import { PageGuides } from '@/components/ds/ui/page-guides';

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
		<div data-ds-template="landing" className="relative min-h-screen overflow-x-clip bg-surface font-sans text-fg">
			<PageGuides />
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

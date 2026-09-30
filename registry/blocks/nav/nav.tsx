import { Button } from '@/components/ds/ui/button';
import { Logo } from '@/components/ds/ui/logo';
import { Section } from '@/components/ds/ui/section';

export type NavProps = {
	links: { label: string; href: string }[];
	demoCta?: { label: string; href: string };
	primaryCta: { label: string; href: string };
};

export function Nav({ links, demoCta, primaryCta }: NavProps) {
	return (
		<Section block="nav" spacing="tight">
			<nav aria-label="Main" className="flex items-center justify-between gap-6">
				<a href="/" aria-label="Home" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
					<Logo variant="horizontal" tone="blue-black" height={24} />
				</a>
				<ul className="hidden items-center gap-6 md:flex">
					{links.map((link) => (
						<li key={link.href}>
							<a href={link.href} className="text-body-sm text-fg-muted transition-colors duration-150 ease-out hover:text-fg">{link.label}</a>
						</li>
					))}
				</ul>
				<div className="hidden items-center gap-2 md:flex">
					{demoCta ? <Button variant="quiet" size="small" href={demoCta.href}>{demoCta.label}</Button> : null}
					<Button variant="primary" size="small" href={primaryCta.href}>{primaryCta.label}</Button>
				</div>
				<details className="group md:hidden">
					<summary className="list-none rounded-pill border border-line px-4 py-2 text-body-sm text-fg">Menu</summary>
					<div className="absolute inset-x-0 mt-3 border-y border-line bg-surface px-6 py-6">
						<ul className="flex flex-col gap-4">
							{links.map((link) => (
								<li key={link.href}>
									<a href={link.href} className="text-body text-fg">{link.label}</a>
								</li>
							))}
						</ul>
						<div className="mt-6 flex flex-col gap-2">
							{demoCta ? <Button variant="quiet" href={demoCta.href}>{demoCta.label}</Button> : null}
							<Button variant="primary" href={primaryCta.href}>{primaryCta.label}</Button>
						</div>
					</div>
				</details>
			</nav>
		</Section>
	);
}

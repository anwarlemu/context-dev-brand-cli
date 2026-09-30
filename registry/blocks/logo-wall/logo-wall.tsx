import { Button } from '@/components/ds/ui/button';
import { Section } from '@/components/ds/ui/section';

export type LogoWallProps = { title: string; customers: string[]; cta?: { label: string; href: string } };

export function LogoWall({ title, customers, cta }: LogoWallProps) {
	return (
		<Section block="logo-wall">
			<div className="flex flex-col items-center gap-10">
				<h2 className="text-center text-body-lg text-fg-muted">{title}</h2>
				<ul className="grid w-full grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
					{customers.slice(0, 12).map((name) => (
						<li key={name} className="text-center text-h5 text-fg-subtle">{name}</li>
					))}
				</ul>
				{cta ? <Button variant="secondary" href={cta.href}>{cta.label}</Button> : null}
			</div>
		</Section>
	);
}

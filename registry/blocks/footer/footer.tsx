import { FooterWatermark } from '@/components/ds/ui/footer-watermark';
import { Logo } from '@/components/ds/ui/logo';
import { Section } from '@/components/ds/ui/section';

export type FooterProps = {
	tagline: string;
	columns: { title: string; links: { label: string; href: string }[] }[];
	legal: { label: string; href: string }[];
	compliance?: string;
	status?: { label: string; href: string };
	copyright: string;
};

export function Footer({ tagline, columns, legal, compliance, status, copyright }: FooterProps) {
	return (
		<Section block="footer" surface="black" divider={false}>
			<div className="flex flex-col gap-12">
				<div className="flex flex-col justify-between gap-6 md:flex-row">
					<div className="flex flex-col gap-4">
						<Logo variant="horizontal" tone="white" height={24} />
						<p className="max-w-sm text-body-sm text-neutral-30">{tagline}</p>
					</div>
					<div className="flex flex-col gap-2 text-body-sm text-neutral-30 md:items-end">
						{compliance ? <p>{compliance}</p> : null}
						{status ? <a href={status.href} className="flex items-center gap-2 hover:text-fg-inverse"><span aria-hidden className="size-2 rounded-full bg-success" />{status.label}</a> : null}
					</div>
				</div>
				<nav aria-label="Footer" className="grid grid-cols-2 gap-8 border-t border-neutral-80 pt-10 md:grid-cols-4">
					{columns.slice(0, 4).map((col) => (
						<div key={col.title} className="flex flex-col gap-3">
							<h2 className="text-body-sm font-medium text-fg-inverse">{col.title}</h2>
							<ul className="flex flex-col gap-2">
								{col.links.map((link) => (
									<li key={link.href}><a href={link.href} className="text-body-sm text-neutral-30 transition-colors duration-150 ease-out hover:text-fg-inverse">{link.label}</a></li>
								))}
							</ul>
						</div>
					))}
				</nav>
				<div className="flex flex-col justify-between gap-4 border-t border-neutral-80 pt-6 text-body-sm text-neutral-30 md:flex-row">
					<p>{copyright}</p>
					<ul className="flex gap-4">
						{legal.map((link) => (
							<li key={link.href}><a href={link.href} className="hover:text-fg-inverse">{link.label}</a></li>
						))}
					</ul>
				</div>
				<div className="relative h-44 overflow-hidden select-none md:h-80"><FooterWatermark /></div>
			</div>
		</Section>
	);
}

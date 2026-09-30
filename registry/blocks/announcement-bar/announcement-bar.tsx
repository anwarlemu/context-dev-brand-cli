import { AnnouncementDotStrip } from '@/components/ds/ui/announcement-dot-strip';
import { Section } from '@/components/ds/ui/section';

export type AnnouncementBarProps = { text: string; linkLabel: string; href: string };

export function AnnouncementBar({ text, linkLabel, href }: AnnouncementBarProps) {
	return (
		<Section block="announcement-bar" surface="blue" spacing="tight">
			<div className="relative isolate">
				<AnnouncementDotStrip />
				<p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-body-sm">
					<span>{text}</span>
					<a href={href} className="underline underline-offset-4 transition-opacity duration-150 ease-out hover:opacity-80">{linkLabel}</a>
				</p>
			</div>
		</Section>
	);
}

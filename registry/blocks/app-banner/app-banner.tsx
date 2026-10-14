import { ArrowRight } from 'lucide-react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { appButtonClassName } from '@/components/ds/ui/app-button';

export type AppBannerProps = {
	/** default: a plain note with an outline action. upsell: a limit, its action outlined in brand. */
	variant?: 'default' | 'upsell';
	title: string;
	body?: string;
	action: { label: string; href: string };
};

/** One card-wide note above a list: what limit applies and the one way past it. */
export function AppBanner({ variant = 'default', title, body, action }: AppBannerProps) {
	return (
		<AppBlock block="app-banner">
			<section className="flex items-center gap-6 rounded-window bg-surface px-5 py-4 shadow-card max-sm:flex-col max-sm:items-start max-sm:gap-3">
				<div className="min-w-0 flex-1">
					<p className="text-body-sm text-fg">{title}</p>
					{body && <p className="mt-1 text-body-sm text-fg-muted">{body}</p>}
				</div>
				<a href={action.href} className={appButtonClassName(variant === 'upsell' ? 'outline-brand' : 'outline', 'sm')}>
					{action.label}
					<ArrowRight className="size-3.5" strokeWidth={1.5} />
				</a>
			</section>
		</AppBlock>
	);
}

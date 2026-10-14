import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';

export type AppEmptyStateProps = {
	/** page: a section with nothing made yet, centered in the page column. inline: inside a card, before a first run. */
	variant?: 'page' | 'inline';
	/** The fine-dot illustration, usually a DotScene from dot-story. */
	media?: ReactNode;
	title: string;
	body: ReactNode;
	/** One brand action, plus at most one outline action. */
	actions?: ReactNode;
	/** One quiet line under the actions: a limit, a few inputs to try. */
	footnote?: ReactNode;
	className?: string;
};

export function AppEmptyState({ variant = 'page', media, title, body, actions, footnote, className }: AppEmptyStateProps) {
	if (variant === 'inline')
		return (
			<div className={cx('flex flex-1 flex-col items-center justify-center gap-3 px-8 py-8 text-center', className)}>
				{media && <div className="w-48">{media}</div>}
				<h3 className="text-h5">{title}</h3>
				<p className="max-w-sm text-body-sm text-balance text-fg-muted">{body}</p>
				{footnote && <p className="max-w-md text-caption text-balance text-fg-subtle">{footnote}</p>}
				{actions && <div className="mt-1 flex items-center gap-2">{actions}</div>}
			</div>
		);
	return (
		<div className={cx('page-column my-auto flex flex-col items-center px-8 py-16 text-center', className)}>
			{media && <div className="w-72">{media}</div>}
			<h2 className={cx('text-h4', Boolean(media) && 'mt-8')}>{title}</h2>
			<p className="mt-1 max-w-120 text-body-sm text-balance text-fg-muted">{body}</p>
			{actions && <div className="mt-5 flex items-center gap-2">{actions}</div>}
			{footnote && <div className="mt-6 text-body-sm text-fg-muted">{footnote}</div>}
		</div>
	);
}

import type { ReactNode } from 'react';

export type AppListTemplateProps = {
	header?: ReactNode;
	banner?: ReactNode;
	content?: ReactNode;
};

/** A list page: centered header with the page's one brand action, an optional limit banner, then the table or the empty state. */
export function AppListTemplate({ header, banner, content }: AppListTemplateProps) {
	return (
		<div data-ds-template="app-list" className="@container scrollbar-thin scrollbar-stable flex-1 overflow-y-auto content-in">
			<div className="page-column flex min-h-full flex-col gap-6 px-8 pt-8 pb-10">
				{header}
				{banner}
				{content}
			</div>
		</div>
	);
}

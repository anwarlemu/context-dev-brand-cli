import type { ReactNode } from 'react';

export type AppDetailTemplateProps = {
	header?: ReactNode;
	content?: ReactNode;
};

/** A detail page: the breadcrumb header, then one card with the record's status and its sections. */
export function AppDetailTemplate({ header, content }: AppDetailTemplateProps) {
	return (
		<div data-ds-template="app-detail" className="@container scrollbar-thin scrollbar-stable flex-1 overflow-y-auto content-in">
			<div className="page-column flex flex-col gap-5 px-8 pt-8 pb-12">
				{header}
				{content}
			</div>
		</div>
	);
}

import type { ReactNode } from 'react';

export type AppFormTemplateProps = {
	header?: ReactNode;
	form?: ReactNode;
};

/** A create or edit page: back link and centered header, then the form panel with its cost line and submit. */
export function AppFormTemplate({ header, form }: AppFormTemplateProps) {
	return (
		<div data-ds-template="app-form" className="@container scrollbar-thin scrollbar-stable flex-1 overflow-y-auto content-in">
			<div className="page-column flex flex-col gap-8 px-8 pt-6 pb-12">
				{header}
				{form}
			</div>
		</div>
	);
}

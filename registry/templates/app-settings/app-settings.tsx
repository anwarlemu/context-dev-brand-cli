import type { ReactNode } from 'react';

export type AppSettingsTemplateProps = {
	header?: ReactNode;
	sections?: ReactNode;
};

/** Settings: centered header with the tabs under it, then titled sections of rows. */
export function AppSettingsTemplate({ header, sections }: AppSettingsTemplateProps) {
	return (
		<div data-ds-template="app-settings" className="@container scrollbar-thin scrollbar-stable flex-1 overflow-y-auto content-in">
			<div className="page-column flex flex-col gap-6 px-8 pt-6 pb-10">
				{header}
				{sections}
			</div>
		</div>
	);
}

import type { ReactNode } from 'react';

export type AppPlaygroundTemplateProps = {
	header?: ReactNode;
	composer?: ReactNode;
	code?: ReactNode;
	result?: ReactNode;
	panel?: ReactNode;
};

/**
 * An API's playground: the request bar, the code for the same call, and what came back, in a 400 to 600px column
 * centered beside the parameters panel. On a laptop-height window the cards shrink to fit (fit:) instead of the page
 * scrolling, and spacing tightens (short:).
 */
export function AppPlaygroundTemplate({ header, composer, code, result, panel }: AppPlaygroundTemplateProps) {
	return (
		<div data-ds-template="app-playground" className="relative flex min-w-0 flex-1 content-in">
			<div className="@container scrollbar-thin scrollbar-stable min-w-0 flex-1 overflow-y-auto">
				<div data-panel-open={panel ? '' : undefined} className="playground-column flex flex-col gap-8 pt-3 pb-10 fit:h-full fit:pb-5 short:gap-5">
					{header}
					<div className="flex flex-col gap-8 fit:min-h-0 short:gap-5">
						{composer}
						{code}
						{result}
					</div>
				</div>
			</div>
			{panel}
		</div>
	);
}

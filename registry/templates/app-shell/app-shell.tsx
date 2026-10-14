import type { ReactNode } from 'react';

export type AppShellTemplateProps = {
	sidebar?: ReactNode;
	topbar?: ReactNode;
	children?: ReactNode;
};

/** The product shell: the window edge to edge on the canvas, no frame; the sidebar, then the top bar over the page. */
export function AppShellTemplate({ sidebar, topbar, children }: AppShellTemplateProps) {
	return (
		<div data-ds-template="app-shell" className="ds-product flex h-dvh overflow-hidden bg-canvas font-sans text-fg">
			{sidebar}
			<main className="flex min-w-0 flex-1 flex-col overflow-hidden">
				{topbar}
				<div className="flex min-h-0 min-w-0 flex-1">{children}</div>
			</main>
		</div>
	);
}

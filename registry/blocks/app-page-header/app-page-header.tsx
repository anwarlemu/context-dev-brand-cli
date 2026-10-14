import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/components/ds/ui/cx';
import { AppBlock } from '@/components/ds/ui/app-block';

export type AppPageHeaderProps = {
	/** centered: title, one line, actions. back: a "Back" link above (forms). breadcrumb: parent and id above (detail pages). */
	variant?: 'centered' | 'back' | 'breadcrumb';
	title: string;
	sub?: string;
	backHref?: string;
	breadcrumb?: { label: string; href: string; current: string };
	/** The page's actions, centered under the line: at most one brand button, plus outline ones. */
	children?: ReactNode;
};

/** Every product page heads itself with this: centered, quiet, one sentence. */
export function AppPageHeader({ variant = 'centered', title, sub, backHref, breadcrumb, children }: AppPageHeaderProps) {
	return (
		<AppBlock block="app-page-header" className="flex flex-col">
			{variant === 'back' && backHref && (
				<a href={backHref} className="flex w-fit items-center gap-1.5 rounded-control text-body-sm text-fg-subtle outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover">
					<ArrowLeft className="size-4" strokeWidth={1.5} />
					Back
				</a>
			)}
			{variant === 'breadcrumb' && breadcrumb && (
				<nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-body-sm">
					<a href={breadcrumb.href} className="rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover">
						{breadcrumb.label}
					</a>
					<ChevronRight className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
					<span className="truncate font-mono text-caption">{breadcrumb.current}</span>
				</nav>
			)}
			{/* A detail page is headed by its breadcrumb: the title stays for screen readers only. */}
			<header className={cx('flex flex-col items-center text-center', variant === 'back' && 'mt-6', variant === 'breadcrumb' && 'sr-only')}>
				<h1 className="text-h4 text-fg">{title}</h1>
				{sub && <p className="mt-1 max-w-xl text-body-sm text-balance text-fg-muted">{sub}</p>}
				{children && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{children}</div>}
			</header>
		</AppBlock>
	);
}

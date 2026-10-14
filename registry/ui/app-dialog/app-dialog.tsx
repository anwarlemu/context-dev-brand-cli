'use client';

import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/components/ds/ui/cx';

const WIDTHS = { md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl', '2xl': 'max-w-6xl' } as const;

export type AppDialogProps = {
	title: string;
	description?: ReactNode;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
	/** A hairline above the footer; leave it off where the footer is a quiet line rather than the dialog's actions. */
	footerDivider?: boolean;
	/** md: forms and confirms. lg: pickers laid out in columns. xl: a row of four plan cards. 2xl: a row of five. */
	size?: keyof typeof WIDTHS;
};

export function AppDialog({ title, description, onClose, children, footer, footerDivider = true, size = 'md' }: AppDialogProps) {
	const titleId = useId();

	useEffect(() => {
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
		}
		document.addEventListener('keydown', closeOnEscape);
		return () => document.removeEventListener('keydown', closeOnEscape);
	}, [onClose]);

	// Portaled to the body, so a transformed ancestor (a card mid-animation) can't trap the fixed overlay inside it.
	return createPortal(
		<div
			// The overlay itself scrolls, so a dialog taller than the screen can be read to its end.
			className="fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-scrim px-4 pt-24 pb-6 max-md:pt-4"
			onMouseDown={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={cx('glass-frame content-in w-full', WIDTHS[size])}
				onMouseDown={(event) => event.stopPropagation()}
			>
				<div className="rounded-shell bg-surface">
					<div className="flex items-start gap-4 px-5 pt-5">
						<div className="min-w-0 flex-1">
							<h3 id={titleId} className="text-h5">
								{title}
							</h3>
							{description && <p className="mt-1.5 text-body-sm text-fg-muted">{description}</p>}
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							// Pulled up and out by its own padding, so the X's center sits on the title's line.
							className="-mt-1.5 -mr-2 grid size-8 shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash/4 hover:text-fg focus-visible:shadow-ring-hover"
						>
							<X className="size-4" strokeWidth={1.5} />
						</button>
					</div>
					<div className="p-5">{children}</div>
					{footer && <div className={cx('flex items-center justify-end gap-2 px-5', footerDivider ? 'border-t border-line-subtle py-3.5' : 'pb-5')}>{footer}</div>}
				</div>
			</div>
		</div>,
		document.body,
	);
}

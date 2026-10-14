'use client';

import { ChevronDown } from 'lucide-react';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '@/components/ds/ui/cx';

// How far the content fades out at an edge with more beyond it.
const FADE_PX = 28;
const INK = 'var(--ds-color-black)';

/**
 * A scroll area that says when there's more: no scrollbar taking room on one side (so the padding stays even), the content
 * fading out at whichever edge has more past it, and while there's more below, a small chevron that scrolls the rest into view.
 */
export function AppScrollArea({ className, children }: { className?: string; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ more: false, above: false, below: false });

	useLayoutEffect(() => {
		const area = ref.current;
		if (!area) return;
		const measure = () => {
			const more = area.scrollHeight > area.clientHeight + 1;
			const above = more && area.scrollTop > 1;
			const below = more && area.scrollTop + area.clientHeight < area.scrollHeight - 1;
			setEdges((previous) => (previous.more === more && previous.above === above && previous.below === below ? previous : { more, above, below }));
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(area);
		for (const child of Array.from(area.children)) observer.observe(child);
		area.addEventListener('scroll', measure, { passive: true });
		return () => {
			observer.disconnect();
			area.removeEventListener('scroll', measure);
		};
	}, []);

	const mask = `linear-gradient(to bottom, ${edges.above ? 'transparent' : INK}, ${INK} ${FADE_PX}px, ${INK} calc(100% - ${FADE_PX}px), ${edges.below ? 'transparent' : INK})`;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col">
			<div
				ref={ref}
				className={cx('min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}
				style={edges.more ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
			>
				{children}
			</div>
			<button
				type="button"
				tabIndex={-1}
				aria-hidden
				onClick={() => ref.current?.scrollBy({ top: ref.current.clientHeight * 0.8, behavior: 'smooth' })}
				className={cx(
					'absolute bottom-1 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-pill bg-surface text-fg-muted shadow-card transition-[opacity,translate] duration-200 ease-emphasized hover:text-fg motion-reduce:transition-opacity',
					edges.below ? 'opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
				)}
			>
				<ChevronDown className="size-3.5" strokeWidth={1.75} />
			</button>
		</div>
	);
}

'use client';

import { cx as cn } from '@/components/ds/ui/cx';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

export type HighlightBox = { x: number; y: number; width: number; height: number };

interface GlideHoverProps {
	children: ReactNode;
	className?: string;
	highlightClassName?: string;
}

// Layout offsets rather than client rects, so the box stays right while a parent panel is mid scale-in.
export function boxWithin(item: HTMLElement, container: HTMLElement): HighlightBox {
	let x = 0;
	let y = 0;
	let node: HTMLElement | null = item;
	while (node && node !== container) {
		x += node.offsetLeft;
		y += node.offsetTop;
		node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
	}
	return { x, y, width: item.offsetWidth, height: item.offsetHeight };
}

/** Slides one shared highlight to whichever descendant marked `data-glide-item` is hovered. */
export function GlideHover({ children, className, highlightClassName }: GlideHoverProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const hoveredItemRef = useRef<HTMLElement | null>(null);
	const [box, setBox] = useState<HighlightBox | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isGliding, setIsGliding] = useState(false);

	// A sibling growing (such as a tab expanding its label) moves the hovered item without any pointer event.
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(() => {
			const item = hoveredItemRef.current;
			if (item?.isConnected) setBox(boxWithin(item, container));
		});
		container.querySelectorAll('[data-glide-item]').forEach((item) => observer.observe(item));
		return () => observer.disconnect();
	}, []);

	const handlePointerOver = (event: PointerEvent<HTMLDivElement>) => {
		const container = containerRef.current;
		if (event.pointerType !== 'mouse' || !container || !(event.target instanceof Element)) return;
		const item = event.target.closest('[data-glide-item]');
		if (!(item instanceof HTMLElement) || !container.contains(item)) return;
		hoveredItemRef.current = item;
		setBox(boxWithin(item, container));
		// Appearing from hidden lands straight on the item instead of sliding in from where it last was.
		setIsGliding(isVisible);
		setIsVisible(true);
	};

	return (
		<div ref={containerRef} className={cn('relative isolate', className)} onPointerOver={handlePointerOver} onPointerLeave={() => setIsVisible(false)}>
			{box && (
				<span
					aria-hidden="true"
					className={cn(
						'pointer-events-none absolute left-0 top-0 -z-10 motion-reduce:transition-none',
						isGliding ? 'transition-[translate,width,height,opacity] duration-200 ease-emphasized' : 'transition-opacity duration-150 ease-out',
						highlightClassName
					)}
					style={{ width: box.width, height: box.height, translate: `${box.x}px ${box.y}px`, opacity: isVisible ? 1 : 0 }}
				/>
			)}
			{children}
		</div>
	);
}


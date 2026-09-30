'use client';

import type { BlogCoverMotif } from '@/components/ds/ui/blog-cover-art';
import { useHoverDotMorph, type LoadDotMorph } from '@/components/ds/ui/use-hover-dot-morph';
import { cx as cn } from '@/components/ds/ui/cx';
import { useCallback, useRef, type ReactNode } from 'react';

interface BlogCoverMorphProps {
	motif: BlogCoverMotif;
	dotColor: string;
	backgroundColor: string;
	/** The generated cover, shown whenever the morph is at rest. */
	children: ReactNode;
}

/** Morphs the cover as its card scrolls into view and while it is hovered or keyboard-focused, then hands back to the static art. */
export function BlogCoverMorph({ motif, dotColor, backgroundColor, children }: BlogCoverMorphProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const load = useCallback<LoadDotMorph>(
		async (canvas, onPlayingChange) => {
			const { createBlogCoverMorph } = await import('@/components/ds/ui/blog-cover-morph-engine');
			return createBlogCoverMorph({ canvas, motif, palette: { dots: dotColor, background: backgroundColor }, onPlayingChange });
		},
		[motif, dotColor, backgroundColor]
	);
	const isPlaying = useHoverDotMorph(canvasRef, load, { playOnView: true });

	return (
		<div className="absolute inset-0">
			<div className={cn('absolute inset-0', isPlaying && 'invisible')}>{children}</div>
			<canvas ref={canvasRef} className={cn('absolute inset-0 h-full w-full', !isPlaying && 'invisible')} />
		</div>
	);
}

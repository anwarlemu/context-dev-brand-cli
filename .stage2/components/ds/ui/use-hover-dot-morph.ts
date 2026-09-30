import type { DotMorphPlayer } from '@/components/ds/ui/dot-morph-player';
import { useEffect, useState, type RefObject } from 'react';

/** Resolves to null when the art isn't ready to morph yet, so the next hover tries again. */
export type LoadDotMorph = (canvas: HTMLCanvasElement, onPlayingChange: (isPlaying: boolean) => void) => Promise<DotMorphPlayer | null>;

/** While in view the morph loops: it plays, then rests long enough to ease fully back to the art before the next go. */
const VIEW_PLAY_MS = 2600;
const VIEW_REST_MS = 1400;

/**
 * Plays a dot morph on the canvas while the card around it is hovered or holds keyboard focus, and, with
 * `playOnView`, on a loop while the card is in view, so it also plays where there is no hover. The card is the
 * nearest link, or the nearest element marked `data-hover-morph` when the card isn't itself a link.
 * Returns whether the canvas is currently standing in for the static art.
 */
export function useHoverDotMorph(canvasRef: RefObject<HTMLCanvasElement | null>, load: LoadDotMorph, { playOnView = false }: { playOnView?: boolean } = {}) {
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		const card = canvas?.closest<HTMLElement>('[data-hover-morph], a');
		if (!canvas || !card) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let player: DotMorphPlayer | null = null;
		let isLoading = false;
		let isDisposed = false;
		let isPointerOver = false;
		let isFocused = false;
		let isPlayingForView = false;
		let viewPlayTimer = 0;

		// The morph's code only downloads once a card is first hovered; if that fails, the static art simply stays.
		const start = async () => {
			isLoading = true;
			try {
				const loaded = await load(canvas, setIsPlaying);
				if (isDisposed) {
					loaded?.destroy();
					return;
				}
				player = loaded;
				player?.setHovering(isPointerOver || isFocused || isPlayingForView);
			} catch {
				player = null;
			} finally {
				isLoading = false;
			}
		};

		const update = () => {
			const isActive = isPointerOver || isFocused || isPlayingForView;
			if (player) player.setHovering(isActive);
			else if (isActive && !isLoading) void start();
		};
		const handlePointerEnter = (event: PointerEvent) => {
			// A touch reports a hover it never really has; the tap is already on its way to the link.
			if (event.pointerType === 'touch') return;
			isPointerOver = true;
			update();
		};
		const handlePointerLeave = () => {
			isPointerOver = false;
			update();
		};
		const handleFocusIn = (event: FocusEvent) => {
			isFocused = event.target instanceof Element && event.target.matches(':focus-visible');
			update();
		};
		const handleFocusOut = () => {
			isFocused = false;
			update();
		};

		card.addEventListener('pointerenter', handlePointerEnter);
		card.addEventListener('pointerleave', handlePointerLeave);
		card.addEventListener('focusin', handleFocusIn);
		card.addEventListener('focusout', handleFocusOut);
		const resizeObserver = new ResizeObserver(() => player?.resize());
		resizeObserver.observe(canvas);
		const viewObserver = playOnView
			? new IntersectionObserver(
					([entry]) => {
						window.clearTimeout(viewPlayTimer);
						const loop = (play: boolean) => {
							isPlayingForView = play;
							update();
							viewPlayTimer = window.setTimeout(() => loop(!play), play ? VIEW_PLAY_MS : VIEW_REST_MS);
						};
						if (entry.isIntersecting) {
							loop(true);
						} else {
							isPlayingForView = false;
							update();
						}
					},
					{ threshold: 0.6 }
				)
			: null;
		viewObserver?.observe(card);

		return () => {
			isDisposed = true;
			card.removeEventListener('pointerenter', handlePointerEnter);
			card.removeEventListener('pointerleave', handlePointerLeave);
			card.removeEventListener('focusin', handleFocusIn);
			card.removeEventListener('focusout', handleFocusOut);
			resizeObserver.disconnect();
			viewObserver?.disconnect();
			window.clearTimeout(viewPlayTimer);
			player?.destroy();
			setIsPlaying(false);
		};
	}, [canvasRef, load, playOnView]);

	return isPlaying;
}

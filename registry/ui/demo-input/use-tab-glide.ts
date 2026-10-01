'use client';

import { boxWithin, type HighlightBox } from '@/components/ds/ui/glide-hover';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

// The Search browser's Motion.glide, SwiftUI's spring(response: 0.34, dampingFraction: 0.82), as the
// stiffness and damping of a unit mass: quick to arrive, with the faintest overshoot.
const RESPONSE_S = 0.34;
const DAMPING_FRACTION = 0.82;
const STIFFNESS = ((2 * Math.PI) / RESPONSE_S) ** 2;
const DAMPING = (4 * Math.PI * DAMPING_FRACTION) / RESPONSE_S;
const STEP_S = 1 / 240;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, t: number) => from + (to - from) * t;

function paintPill(pill: HTMLElement, box: HighlightBox) {
	pill.style.translate = `${box.x}px ${box.y}px`;
	pill.style.width = `${box.width}px`;
	pill.style.height = `${box.height}px`;
}

/**
 * Glides one pill between tabs, with the tabs' expanding labels on the same spring, so the pill,
 * the labels and the tabs they push aside all move as one instead of on separate curves.
 *
 * The pill sits in the row that holds the tabs, which are marked `data-tab-id`; a tab's expanding label
 * is `data-tab-suffix` (same id), whose child holds the text at its natural width. Returns whether the
 * pill has been placed; until then the active tab should draw its own background, so the server render
 * looks the same.
 */
export function useTabGlide(pillRef: RefObject<HTMLElement | null>, activeId: string, reducedMotion: boolean) {
	const [isReady, setIsReady] = useState(false);
	const motion = useRef({ activeId, progress: 1, velocity: 0, frame: 0, lastTime: 0, pillBox: null as HighlightBox | null, fromBox: null as HighlightBox | null, fromExpansion: new Map<string, number>(), expansion: new Map<string, number>() });

	// Lands the pill on the active tab, and keeps it there when the row resizes (fonts loading, viewport).
	useLayoutEffect(() => {
		const pill = pillRef.current;
		const container = pill?.parentElement;
		if (!pill || !container) return;
		const place = () => {
			const state = motion.current;
			if (state.frame) return;
			const tab = container.querySelector<HTMLElement>(`[data-tab-id="${state.activeId}"]`);
			if (!tab) return;
			state.pillBox = boxWithin(tab, container);
			paintPill(pill, state.pillBox);
		};
		place();
		setIsReady(true);
		const observer = new ResizeObserver(place);
		observer.observe(container);
		return () => observer.disconnect();
	}, [pillRef]);

	useLayoutEffect(() => {
		const state = motion.current;
		const pill = pillRef.current;
		const container = pill?.parentElement;
		if (activeId === state.activeId || !pill || !container) return;

		const suffixes = [...container.querySelectorAll<HTMLElement>('[data-tab-suffix]')];
		// Start from wherever things are now, which is mid-glide if the tabs are switched quickly.
		state.fromExpansion = new Map(suffixes.map((suffix) => [suffix.dataset.tabSuffix!, state.expansion.get(suffix.dataset.tabSuffix!) ?? (suffix.dataset.tabSuffix === state.activeId ? 1 : 0)]));
		state.fromBox = state.pillBox;
		state.activeId = activeId;
		state.progress = reducedMotion ? 1 : 0;
		state.velocity = 0;
		state.lastTime = 0;

		const tick = (now: number) => {
			// Real time even at a low frame rate; the cap only stops a leap after the tab was in the background.
			const elapsed = state.lastTime ? Math.min(0.1, (now - state.lastTime) / 1000) : 1 / 60;
			state.lastTime = now;
			for (let t = 0; t < elapsed; t += STEP_S) {
				const h = Math.min(STEP_S, elapsed - t);
				state.velocity += (-STIFFNESS * (state.progress - 1) - DAMPING * state.velocity) * h;
				state.progress += state.velocity * h;
			}
			const settled = reducedMotion || (Math.abs(state.progress - 1) < 0.001 && Math.abs(state.velocity) < 0.01);
			if (settled) state.progress = 1;

			// Labels first, so the active tab's box is read at this frame's widths.
			for (const suffix of suffixes) {
				const id = suffix.dataset.tabSuffix!;
				const target = id === activeId ? 1 : 0;
				const expansion = clamp01(mix(state.fromExpansion.get(id) ?? target, target, state.progress));
				state.expansion.set(id, expansion);
				if (settled) {
					// Hand back to the classes the server rendered.
					suffix.style.removeProperty('width');
					suffix.style.removeProperty('opacity');
				} else {
					const natural = (suffix.firstElementChild as HTMLElement | null)?.scrollWidth ?? 0;
					suffix.style.width = `${expansion * natural}px`;
					suffix.style.opacity = String(expansion);
				}
			}

			const tab = container.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
			if (tab) {
				const to = boxWithin(tab, container);
				const from = state.fromBox ?? to;
				// Unclamped, so the pill keeps the spring's slight overshoot.
				state.pillBox = { x: mix(from.x, to.x, state.progress), y: mix(from.y, to.y, state.progress), width: mix(from.width, to.width, state.progress), height: mix(from.height, to.height, state.progress) };
				paintPill(pill, state.pillBox);
			}

			state.frame = settled ? 0 : requestAnimationFrame(tick);
		};

		cancelAnimationFrame(state.frame);
		// The first step runs now, before paint, so the tabs never show a frame of the new classes' end state.
		tick(performance.now());
	}, [activeId, pillRef, reducedMotion]);

	useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

	return isReady;
}

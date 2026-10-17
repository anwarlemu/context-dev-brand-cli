"use client";

import { type RefObject, useLayoutEffect, useRef, useState } from "react";

// SwiftUI's spring(response: 0.34, dampingFraction: 0.82) as the stiffness and damping of a unit mass: quick to arrive
// with the faintest overshoot. A spring rather than a timed curve, so switching tabs mid-glide keeps its velocity.
const RESPONSE_S = 0.34;
const DAMPING_FRACTION = 0.82;
const STIFFNESS = ((2 * Math.PI) / RESPONSE_S) ** 2;
const DAMPING = (4 * Math.PI * DAMPING_FRACTION) / RESPONSE_S;
const STEP_S = 1 / 240;

type Box = { x: number; y: number; width: number; height: number };

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

// In the container's own pixels: screen boxes divided by its scale, so the pill lands on its tab inside a scaled
// ancestor too (a dialog mid pop-in, a preview drawn small).
function boxWithin(element: HTMLElement, container: HTMLElement): Box {
  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const scale = container.offsetWidth ? containerRect.width / container.offsetWidth : 1;
  return { x: (rect.left - containerRect.left) / scale, y: (rect.top - containerRect.top) / scale, width: rect.width / scale, height: rect.height / scale };
}

function paintPill(pill: HTMLElement, box: Box) {
  pill.style.translate = `${box.x}px ${box.y}px`;
  pill.style.width = `${box.width}px`;
  pill.style.height = `${box.height}px`;
}

/**
 * Glides one pill to the tab marked `data-tab-id={activeId}` inside the pill's parent. Returns whether the pill has
 * been placed; until then the active tab draws its own surface, so the first paint matches the server render. With
 * reduced motion the pill jumps.
 */
export function useTabGlide(pillRef: RefObject<HTMLElement | null>, activeId: string) {
  const [isPlaced, setPlaced] = useState(false);
  const motion = useRef({ activeId, progress: 1, velocity: 0, frame: 0, lastTime: 0, box: null as Box | null, fromBox: null as Box | null });

  // Lands the pill on the active tab, and keeps it there when the row resizes (fonts loading, viewport).
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const container = pill?.parentElement;
    if (!pill || !container) return;
    const place = () => {
      const state = motion.current;
      if (state.frame) return;
      const tab = container.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(state.activeId)}"]`);
      if (!tab) return;
      state.box = boxWithin(tab, container);
      paintPill(pill, state.box);
    };
    place();
    setPlaced(true);
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [pillRef]);

  useLayoutEffect(() => {
    const state = motion.current;
    const pill = pillRef.current;
    const container = pill?.parentElement;
    if ((activeId === state.activeId && !state.frame) || !pill || !container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Starts from wherever the pill is now, which is mid-glide when tabs are switched quickly.
    state.fromBox = state.box;
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

      const tab = container.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(activeId)}"]`);
      if (tab) {
        const to = boxWithin(tab, container);
        const from = state.fromBox ?? to;
        // Unclamped, so the pill keeps the spring's slight overshoot.
        state.box = {
          x: mix(from.x, to.x, state.progress),
          y: mix(from.y, to.y, state.progress),
          width: mix(from.width, to.width, state.progress),
          height: mix(from.height, to.height, state.progress),
        };
        paintPill(pill, state.box);
      }
      if (settled) {
        state.frame = 0;
        return;
      }
      state.frame = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(state.frame);
    // The first step runs before paint, so the row never shows a frame of the new tab without its pill.
    tick(performance.now());
    return () => cancelAnimationFrame(state.frame);
  }, [activeId, pillRef]);

  return isPlaced;
}

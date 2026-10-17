"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The redesign's tab glide: one pill that springs to the picked option (SwiftUI's spring, response 0.34s and damping
// 0.82: quick to arrive with the faintest overshoot), starting from wherever it is, so quick switches never jump.
// Until the pill is placed, the picked option draws its own surface, so the first paint matches the server render.
// Reduced motion lands it at once.
const RESPONSE_S = 0.34;
const DAMPING_FRACTION = 0.82;
const STIFFNESS = ((2 * Math.PI) / RESPONSE_S) ** 2;
const DAMPING = (4 * Math.PI * DAMPING_FRACTION) / RESPONSE_S;
const STEP_S = 1 / 240;

type Box = { x: number; y: number; width: number; height: number };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// In the container's own pixels, so the pill lands on its tab inside a scaled ancestor too.
function boxWithin(el: HTMLElement, container: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  const scale = container.offsetWidth ? c.width / container.offsetWidth : 1;
  return { x: (r.left - c.left) / scale, y: (r.top - c.top) / scale, width: r.width / scale, height: r.height / scale };
}

function paint(pill: HTMLElement, box: Box) {
  pill.style.translate = `${box.x}px ${box.y}px`;
  pill.style.width = `${box.width}px`;
  pill.style.height = `${box.height}px`;
}

/** Glides the pill to the element marked data-tab-id={activeId} inside the pill's parent; returns whether it's placed. */
export function useTabGlide(pillRef: React.RefObject<HTMLElement | null>, activeId: string) {
  const [placed, setPlaced] = React.useState(false);
  const motion = React.useRef({ activeId, progress: 1, velocity: 0, frame: 0, lastTime: 0, box: null as Box | null, from: null as Box | null });

  // Lands the pill on the active tab, and keeps it there when the row resizes (fonts loading, the viewport).
  React.useLayoutEffect(() => {
    const pill = pillRef.current;
    const container = pill?.parentElement;
    if (!pill || !container) return;
    const place = () => {
      const state = motion.current;
      if (state.frame) return;
      const tab = container.querySelector<HTMLElement>(`[data-tab-id="${state.activeId}"]`);
      if (!tab) return;
      state.box = boxWithin(tab, container);
      paint(pill, state.box);
    };
    place();
    setPlaced(true);
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [pillRef]);

  React.useLayoutEffect(() => {
    const state = motion.current;
    const pill = pillRef.current;
    const container = pill?.parentElement;
    if ((activeId === state.activeId && !state.frame) || !pill || !container) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    state.from = state.box;
    state.activeId = activeId;
    state.progress = reduced ? 1 : 0;
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
      const settled = reduced || (Math.abs(state.progress - 1) < 0.001 && Math.abs(state.velocity) < 0.01);
      if (settled) state.progress = 1;
      const tab = container.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
      if (tab) {
        const to = boxWithin(tab, container);
        const from = state.from ?? to;
        // Unclamped, so the pill keeps the spring's slight overshoot.
        state.box = { x: mix(from.x, to.x, state.progress), y: mix(from.y, to.y, state.progress), width: mix(from.width, to.width, state.progress), height: mix(from.height, to.height, state.progress) };
        paint(pill, state.box);
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

  return placed;
}

export type GlideTabsOption<T extends string> = { value: T; label: React.ReactNode; ariaLabel?: string; icon?: React.ReactNode | ((selected: boolean) => React.ReactNode) };

const APPEARANCES = {
  // The overview's range picker: options side by side on a gliding soft gray pill.
  wash: { track: "gap-0.5", pill: "rounded-tag bg-wash-pill", tab: "rounded-tag", idle: "text-fg-subtle hover:text-fg" },
  // The try box's API tabs: a pale gray track, one white pill, hairlines parting the tabs at rest.
  track: { track: "rounded-control bg-neutral-5 p-0.5", pill: "rounded-tag bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.03)]", tab: "rounded-tag", idle: "text-fg-muted hover:text-fg" },
} as const;

/**
 * A row of options with one pill gliding to the picked one. `wash` is the soft gray pill (a chart's range); `track` a
 * white pill on a gray track with hairlines between the tabs at rest (choosing what a box runs). Radio semantics by
 * default; `role="tab"` for tabs over content.
 */
function GlideTabs<T extends string>({
  value,
  onValueChange,
  options,
  label,
  appearance = "wash",
  role = "radio",
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: GlideTabsOption<T>[];
  label: string;
  appearance?: keyof typeof APPEARANCES;
  role?: "radio" | "tab";
  className?: string;
}) {
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const placed = useTabGlide(pillRef, value);
  const a = APPEARANCES[appearance];
  const selectedIndex = options.findIndex((o) => o.value === value);
  return (
    <div role={role === "radio" ? "radiogroup" : "tablist"} aria-label={label} data-slot="glide-tabs" className={cn("relative isolate flex w-max shrink-0 items-center", a.track, className)}>
      <span ref={pillRef} aria-hidden className={cn("pointer-events-none absolute top-0 left-0 -z-10", a.pill, !placed && "invisible")} />
      {options.map((o, i) => {
        const selected = i === selectedIndex;
        const divider = appearance === "track" && i > 0 && i !== selectedIndex && i - 1 !== selectedIndex;
        return (
          <button
            key={o.value}
            type="button"
            role={role}
            {...(role === "radio" ? { "aria-checked": selected } : { "aria-selected": selected })}
            aria-label={o.ariaLabel}
            data-tab-id={o.value}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "relative flex h-7 items-center gap-1.5 px-2.5 text-caption whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring",
              a.tab,
              appearance === "track" && "before:absolute before:top-1/2 before:left-0 before:h-3 before:w-px before:-translate-y-1/2 before:bg-line before:transition-opacity before:duration-150",
              appearance === "track" && !divider && "before:opacity-0",
              selected ? "text-fg" : a.idle,
              selected && !placed && a.pill,
            )}
          >
            {typeof o.icon === "function" ? o.icon(selected) : o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export { GlideTabs };

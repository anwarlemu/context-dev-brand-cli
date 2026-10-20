import type { DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import { clamp01 } from '@/components/visuals/dot-engine/dot-story-cells';

const TEXT_FADE_SECONDS = 0.3;

export const NEVER = Number.POSITIVE_INFINITY;

export function revealSchedule({ columns, rows }: DotGrid, revealsAt: (column: number, row: number) => number) {
	const schedule = new Float32Array(columns * rows);
	for (let cell = 0; cell < schedule.length; cell++) schedule[cell] = revealsAt(cell % columns, Math.floor(cell / columns));
	return schedule;
}

export function paintRevealed(states: Uint8Array, revealed: Uint8Array, schedule: Float32Array, heldSeconds: number) {
	for (let cell = 0; cell < states.length; cell++) {
		if (heldSeconds >= schedule[cell]) states[cell] = revealed[cell];
	}
}

export const fadedInAt = (heldSeconds: number, startsAt: number) => clamp01((heldSeconds - startsAt) / TEXT_FADE_SECONDS);

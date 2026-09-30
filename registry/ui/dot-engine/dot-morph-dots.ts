import { paintColor } from '@/components/ds/ui/ds-color';
export interface DotGrid {
	columns: number;
	rows: number;
	pitch: number;
	dotRadius: number;
	ringStroke: number;
	/** How far around each dot the card's colour is repainted, clearing any backdrop pattern the art moves across. */
	haloRadius: number;
	/** How long a dot takes to ease most of the way to its new state; slower reads as a melt rather than a switch. */
	easeSeconds?: number;
}

export interface DotPalette {
	dots: string;
	background: string;
}

export const DOT_ABSENT = 0;
export const DOT_HOLLOW = 1;
export const DOT_FILLED = 2;

const DOT_EASE_SECONDS = 0.04;
const SETTLED_DISTANCE = 0.02;
const VISIBLE_SCALE = 0.04;

export interface DotField {
	seed: (states: Uint8Array) => void;
	/** Eases every dot toward its target state; returns whether they have all arrived. */
	advance: (targets: Uint8Array, seconds: number) => boolean;
	/** Draws in grid units, so the caller's transform decides where the grid lands. */
	draw: (context: CanvasRenderingContext2D, palette: DotPalette) => void;
}

// Each dot carries a size and a fill that ease toward their target, so a moving edge swells and drains its dots
// rather than switching them.
export function createDotField({ columns, rows, pitch, dotRadius, ringStroke, haloRadius, easeSeconds = DOT_EASE_SECONDS }: DotGrid): DotField {
	const cellCount = columns * rows;
	const scale = new Float32Array(cellCount);
	const fill = new Float32Array(cellCount);
	const centerX = (cell: number) => ((cell % columns) + 0.5) * pitch;
	const centerY = (cell: number) => (Math.floor(cell / columns) + 0.5) * pitch;

	return {
		seed(states) {
			for (let cell = 0; cell < cellCount; cell++) {
				scale[cell] = states[cell] === DOT_ABSENT ? 0 : 1;
				fill[cell] = states[cell] === DOT_FILLED ? 1 : 0;
			}
		},
		advance(targets, seconds) {
			const step = 1 - Math.exp(-seconds / easeSeconds);
			let isSettled = true;
			for (let cell = 0; cell < cellCount; cell++) {
				const targetScale = targets[cell] === DOT_ABSENT ? 0 : 1;
				// An absent dot keeps its fill while it shrinks away, so it never flashes hollow on the way out.
				const targetFill = targets[cell] === DOT_ABSENT ? fill[cell] : targets[cell] === DOT_FILLED ? 1 : 0;
				scale[cell] += (targetScale - scale[cell]) * step;
				fill[cell] += (targetFill - fill[cell]) * step;
				if (Math.abs(targetScale - scale[cell]) > SETTLED_DISTANCE || Math.abs(targetFill - fill[cell]) > SETTLED_DISTANCE) isSettled = false;
			}
			return isSettled;
		},
		draw(context, palette) {
			context.fillStyle = paintColor(context, palette.background);
			context.beginPath();
			for (let cell = 0; cell < cellCount; cell++) {
				if (scale[cell] < VISIBLE_SCALE) continue;
				const x = centerX(cell);
				const y = centerY(cell);
				const radius = haloRadius * Math.min(1, scale[cell] * 1.5);
				context.moveTo(x + radius, y);
				context.arc(x, y, radius, 0, Math.PI * 2);
			}
			context.fill();

			context.fillStyle = paintColor(context, palette.dots);
			context.beginPath();
			for (let cell = 0; cell < cellCount; cell++) {
				if (scale[cell] < VISIBLE_SCALE) continue;
				const x = centerX(cell);
				const y = centerY(cell);
				const radius = dotRadius * scale[cell];
				const hole = (dotRadius - ringStroke) * (1 - fill[cell]) * scale[cell];
				context.moveTo(x + radius, y);
				context.arc(x, y, radius, 0, Math.PI * 2);
				if (hole > 0.1) {
					context.moveTo(x + hole, y);
					context.arc(x, y, hole, 0, Math.PI * 2);
				}
			}
			context.fill('evenodd');
		},
	};
}

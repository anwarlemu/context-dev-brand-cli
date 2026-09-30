import { createDotField, type DotGrid } from '@/components/ds/ui/dot-morph-dots';

/**
 * Plays a picture in the brand dot grid as one endless loop. The story says what the grid looks like at any second;
 * the player eases the dots there, so a changing edge swells and drains its dots rather than switching them.
 */

export interface DotStoryFrame {
	states: Uint8Array;
	/** Painted in grid units under the dots. */
	paintBeneath?: (context: CanvasRenderingContext2D) => void;
	/** Painted in grid units over the dots. */
	paintAbove?: (context: CanvasRenderingContext2D) => void;
}

export interface DotStoryText {
	text: string;
	x: number;
	/** The text's baseline. */
	y: number;
	size: number;
	weight: number;
	/** Set in a lighter grey, for labels that should read as secondary. */
	muted?: boolean;
	/** Overrides the grey, as when a label is cut out of solid dots in the card's colour. */
	color?: string;
	anchor?: 'start' | 'middle' | 'end';
}

export interface DotStoryPlayer {
	setRunning: (isRunning: boolean) => void;
	resize: () => void;
	destroy: () => void;
}

/** What the page hands a story to draw with. */
export interface DotStoryStage {
	canvas: HTMLCanvasElement;
	dotColor: string;
	/** The card's own colour, repainted around the dots so a backdrop pattern never shows through the picture. */
	surfaceColor: string;
	/** The data font's family as the page resolved it, so text is set in the same Doto the rest of the brand uses. */
	fontFamily: string;
	onFirstFrame: () => void;
}

interface DotStoryPlayerOptions extends Pick<DotStoryStage, 'canvas' | 'dotColor' | 'surfaceColor' | 'onFirstFrame'> {
	grid: DotGrid;
	/** The picture the static art shows, and the second of the story it belongs to, so the canvas takes over unseen. */
	resting: { states: Uint8Array; atSeconds: number };
	frameAt: (storySeconds: number) => DotStoryFrame;
}

// A background tab hands back one huge frame gap; stepping the story across it would skip whole pictures.
const LONGEST_FRAME_SECONDS = 0.05;
const MAX_PIXEL_RATIO = 2;
// Every dot eases over 40ms, so 30 frames a second looks the same as 60 or 120 while a card full of stories repaints
// a half or a quarter as often.
const FRAME_INTERVAL_MS = 1000 / 30;
// rAF timestamps jitter by a millisecond or so; without the slack a 60Hz display would skip two frames in three.
const FRAME_SLACK_MS = 2;

// Text is set in greys rather than the dot blue: at the small sizes the pictures use, blue type washes out against the dots.
export const DOT_STORY_TEXT_COLOR = '#27272a';
export const DOT_STORY_MUTED_TEXT_COLOR = '#52525b';

export const dotStoryFont = ({ size, weight }: Pick<DotStoryText, 'size' | 'weight'>, fontFamily: string) => `${weight} ${size}px ${fontFamily}`;

export function paintDotStoryText(context: CanvasRenderingContext2D, fontFamily: string, { text, x, y, size, weight, muted = false, color, anchor = 'start' }: DotStoryText, presence = 1) {
	if (presence <= 0 || text.length === 0) return;
	context.font = dotStoryFont({ size, weight }, fontFamily);
	context.textBaseline = 'alphabetic';
	context.textAlign = anchor === 'middle' ? 'center' : anchor;
	const dotColor = context.fillStyle;
	context.fillStyle = color ?? (muted ? DOT_STORY_MUTED_TEXT_COLOR : DOT_STORY_TEXT_COLOR);
	context.globalAlpha = presence;
	context.fillText(text, x, y);
	context.globalAlpha = 1;
	context.fillStyle = dotColor;
}

/** A block cursor standing at `x` on a line of text, in the text's colour. */
export function paintDotStoryCursor(context: CanvasRenderingContext2D, x: number, { y, size }: Pick<DotStoryText, 'y' | 'size'>, presence = 1) {
	const dotColor = context.fillStyle;
	context.fillStyle = DOT_STORY_TEXT_COLOR;
	context.globalAlpha = presence;
	context.fillRect(x, y - size * 0.78, size * 0.5, size * 0.84);
	context.globalAlpha = 1;
	context.fillStyle = dotColor;
}

export function createDotStoryPlayer({ canvas, dotColor, surfaceColor, onFirstFrame, grid, resting, frameAt }: DotStoryPlayerOptions): DotStoryPlayer {
	const context = canvas.getContext('2d');
	if (!context) throw new Error('2D canvas is unavailable');
	const bleed = grid.haloRadius;
	const surfaceWidth = grid.columns * grid.pitch + bleed * 2;
	const dots = createDotField(grid);
	const palette = { dots: dotColor, background: surfaceColor };

	let isRunning = false;
	let hasDrawn = false;
	let frameRequest = 0;
	let lastFrameAt = 0;
	let storySeconds = resting.atSeconds;

	const draw = ({ paintBeneath, paintAbove }: DotStoryFrame) => {
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		const scale = canvas.width / surfaceWidth;
		context.setTransform(scale, 0, 0, scale, bleed * scale, bleed * scale);
		paintBeneath?.(context);
		dots.draw(context, palette);
		context.fillStyle = dotColor;
		paintAbove?.(context);
	};

	const resize = () => {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		const width = Math.round(canvas.clientWidth * pixelRatio);
		const height = Math.round(canvas.clientHeight * pixelRatio);
		if (canvas.width === width && canvas.height === height) return;
		canvas.width = width;
		canvas.height = height;
		if (hasDrawn) draw(frameAt(storySeconds));
	};

	const step = (now: number) => {
		if (now - lastFrameAt < FRAME_INTERVAL_MS - FRAME_SLACK_MS) {
			frameRequest = requestAnimationFrame(step);
			return;
		}
		const seconds = Math.min((now - lastFrameAt) / 1000, LONGEST_FRAME_SECONDS);
		lastFrameAt = now;
		storySeconds += seconds;
		const frame = frameAt(storySeconds);
		dots.advance(frame.states, seconds);
		draw(frame);
		frameRequest = requestAnimationFrame(step);
	};

	return {
		setRunning(next) {
			if (next === isRunning) return;
			isRunning = next;
			if (!next) {
				cancelAnimationFrame(frameRequest);
				return;
			}
			if (!hasDrawn) {
				resize();
				dots.seed(resting.states);
				draw(frameAt(storySeconds));
				hasDrawn = true;
				onFirstFrame();
			}
			lastFrameAt = performance.now();
			frameRequest = requestAnimationFrame(step);
		},
		resize,
		destroy() {
			cancelAnimationFrame(frameRequest);
			isRunning = false;
		},
	};
}

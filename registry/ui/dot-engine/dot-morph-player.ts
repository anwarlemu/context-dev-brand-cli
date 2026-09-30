import { paintColor } from '@/components/ds/ui/ds-color';
import { createDotField, type DotGrid, type DotPalette } from '@/components/ds/ui/dot-morph-dots';

const DEFAULT_MORPH_IN_SECONDS = 1.1;
const MORPH_OUT_SECONDS = 0.7;
const SPIN_UP_SECONDS = 0.45;
const REWIND_STIFFNESS = 70;
const REWIND_DAMPING = 2 * Math.sqrt(REWIND_STIFFNESS);
const REWIND_LOOKAHEAD_SECONDS = 0.2;
const RESTING_SPIN_DISTANCE = 0.004;
const RESTING_SPIN_VELOCITY = 0.02;
// A background tab hands back one huge frame gap; stepping the physics across it would fling the loop.
const LONGEST_FRAME_SECONDS = 0.05;
const MAX_PIXEL_RATIO = 2;

export interface DotMorphFrame {
	/** 0 at rest, 1 once the art has fully become its second picture. */
	morph: number;
	/** Radians travelled by whatever keeps moving while the card stays hovered. */
	spin: number;
}

export interface DotMorphSource {
	grid: DotGrid;
	/** `contain` and `cover` place the grid in the canvas the way the static art is placed in its box. */
	fit: 'contain' | 'cover';
	/** The static art's own dots: the morph starts from them and finishes on them, so swapping the two is invisible. */
	restingDots: Uint8Array;
	spinSpeed: number;
	/** The loop repeats every this many radians, so letting go never rewinds further than half of it. */
	spinPeriod: number;
	sample: (frame: DotMorphFrame) => Uint8Array;
	/**
	 * Backdrop rings the static art leaves out to keep clear of itself. They fade in with the morph, and the dots'
	 * halo clears them again wherever the art now is, so the backdrop follows the new shape instead of the old one.
	 */
	backdrop?: { cells: number[]; opacity: number };
	/** A morph with little choreography to show can arrive sooner than the default. */
	morphInSeconds?: number;
}

export interface DotMorphPlayer {
	setHovering: (isHovering: boolean) => void;
	resize: () => void;
	destroy: () => void;
}

interface DotMorphPlayerOptions {
	canvas: HTMLCanvasElement;
	palette: DotPalette;
	source: DotMorphSource;
	onPlayingChange: (isPlaying: boolean) => void;
}

export function nearestRestingSpin(spin: number, period: number) {
	return Math.round(spin / period) * period;
}

export function createDotMorphPlayer({ canvas, palette, source, onPlayingChange }: DotMorphPlayerOptions): DotMorphPlayer {
	const context = canvas.getContext('2d');
	if (!context) throw new Error('2D canvas is unavailable');
	const { grid, restingDots } = source;
	const gridWidth = grid.columns * grid.pitch;
	const gridHeight = grid.rows * grid.pitch;
	const dots = createDotField(grid);

	let isHovering = false;
	let isPlaying = false;
	let morph = 0;
	let spin = 0;
	let spinVelocity = 0;
	let restingSpin = 0;
	let frameRequest = 0;
	let lastFrameAt = 0;

	const drawBackdrop = ({ cells, opacity }: NonNullable<DotMorphSource['backdrop']>) => {
		context.globalAlpha = opacity * morph;
		context.strokeStyle = paintColor(context, palette.dots);
		context.lineWidth = grid.ringStroke;
		context.beginPath();
		const radius = grid.dotRadius - grid.ringStroke / 2;
		for (const cell of cells) {
			const x = ((cell % grid.columns) + 0.5) * grid.pitch;
			const y = (Math.floor(cell / grid.columns) + 0.5) * grid.pitch;
			context.moveTo(x + radius, y);
			context.arc(x, y, radius, 0, Math.PI * 2);
		}
		context.stroke();
		context.globalAlpha = 1;
	};

	const draw = () => {
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		const fitWidth = canvas.width / gridWidth;
		const fitHeight = canvas.height / gridHeight;
		const scale = source.fit === 'contain' ? Math.min(fitWidth, fitHeight) : Math.max(fitWidth, fitHeight);
		context.setTransform(scale, 0, 0, scale, (canvas.width - gridWidth * scale) / 2, (canvas.height - gridHeight * scale) / 2);
		if (source.backdrop && morph > 0) drawBackdrop(source.backdrop);
		dots.draw(context, palette);
	};

	const resize = () => {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		const width = Math.round(canvas.clientWidth * pixelRatio);
		const height = Math.round(canvas.clientHeight * pixelRatio);
		if (canvas.width === width && canvas.height === height) return;
		canvas.width = width;
		canvas.height = height;
		if (isPlaying) draw();
	};

	const step = (now: number) => {
		const seconds = Math.min((now - lastFrameAt) / 1000, LONGEST_FRAME_SECONDS);
		lastFrameAt = now;

		if (isHovering) {
			morph = Math.min(1, morph + seconds / (source.morphInSeconds ?? DEFAULT_MORPH_IN_SECONDS));
			spinVelocity += (source.spinSpeed - spinVelocity) * (1 - Math.exp(-seconds / SPIN_UP_SECONDS));
		} else {
			morph = Math.max(0, morph - seconds / MORPH_OUT_SECONDS);
			spinVelocity += (-REWIND_STIFFNESS * (spin - restingSpin) - REWIND_DAMPING * spinVelocity) * seconds;
		}
		spin += spinVelocity * seconds;

		const isHome = !isHovering && morph === 0 && Math.abs(spin - restingSpin) < RESTING_SPIN_DISTANCE && Math.abs(spinVelocity) < RESTING_SPIN_VELOCITY;
		const isSettled = dots.advance(isHome ? restingDots : source.sample({ morph, spin }), seconds);
		draw();

		if (isHome && isSettled) {
			isPlaying = false;
			spin = 0;
			spinVelocity = 0;
			onPlayingChange(false);
			return;
		}
		frameRequest = requestAnimationFrame(step);
	};

	return {
		setHovering(next) {
			if (next === isHovering) return;
			isHovering = next;
			if (!next) {
				restingSpin = nearestRestingSpin(spin + spinVelocity * REWIND_LOOKAHEAD_SECONDS, source.spinPeriod);
				return;
			}
			if (isPlaying) return;
			isPlaying = true;
			resize();
			dots.seed(restingDots);
			draw();
			onPlayingChange(true);
			lastFrameAt = performance.now();
			frameRequest = requestAnimationFrame(step);
		},
		resize,
		destroy() {
			cancelAnimationFrame(frameRequest);
			isPlaying = false;
		},
	};
}

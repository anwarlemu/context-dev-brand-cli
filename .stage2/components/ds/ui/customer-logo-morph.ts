import { LOGO_CELLS, LOGO_GRID, LOGO_LEFT, LOGO_TOP } from '@/components/ds/ui/customer-logo-grid';
import { createGlyphShader, glyphRestingDots, type GlyphMorph } from '@/components/ds/ui/dot-glyph-morph';
import type { DotPalette } from '@/components/ds/ui/dot-morph-dots';
import { createDotMorphPlayer, type DotMorphFrame, type DotMorphPlayer } from '@/components/ds/ui/dot-morph-player';
import type { LogoCell } from '@/components/ds/ui/logo-dot-sampling';

/** On hover a customer's logo melts into an arrow pointing up and to the right: the card is a link, and the arrow says where it goes. */

const LOGO_CENTER = (LOGO_CELLS * LOGO_GRID.pitch) / 2;
// The arrow is drawn about its own middle, as wide as its head: a short shaft tucked under a broad corner.
const ARROW_WEIGHT = 44;
const ARROW_REACH = 82;
const ARROW_TIP_INSET = 11;
const ARROW_RUN_UP = 46;
const ARROW_NUDGE = 7;
const NUDGES_PER_SECOND = 0.5;
const MORPH_IN_SECONDS = 0.75;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const phase = (morph: number, start: number, end: number) => clamp01((morph - start) / (end - start));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

function drawArrow(context: CanvasRenderingContext2D, { morph, spin }: DotMorphFrame) {
	const runUp = ARROW_RUN_UP * (1 - easeOutBack(phase(morph, 0.35, 0.95)));
	const nudge = ARROW_NUDGE * easeInOut(phase(morph, 0.85, 1)) * (1 - Math.cos(spin)) * 0.5;
	const travel = nudge - runUp;
	context.translate(LOGO_CENTER + travel, LOGO_CENTER - travel);
	context.strokeStyle = '#000';
	context.lineWidth = ARROW_WEIGHT;
	context.lineJoin = 'miter';
	context.beginPath();
	context.moveTo(-ARROW_REACH, -ARROW_REACH);
	context.lineTo(ARROW_REACH, -ARROW_REACH);
	context.lineTo(ARROW_REACH, ARROW_REACH);
	context.moveTo(-ARROW_REACH, ARROW_REACH);
	context.lineTo(ARROW_REACH - ARROW_TIP_INSET, -ARROW_REACH + ARROW_TIP_INSET);
	context.stroke();
}

interface CustomerLogoMorphOptions {
	canvas: HTMLCanvasElement;
	cells: LogoCell[];
	/** The backdrop rings left out around the logo, as grid cell indices. */
	clearedBackdrop: { cells: number[]; opacity: number };
	palette: DotPalette;
	onPlayingChange: (isPlaying: boolean) => void;
}

export function createCustomerLogoMorph({ canvas, cells, clearedBackdrop, palette, onPlayingChange }: CustomerLogoMorphOptions): DotMorphPlayer {
	const glyph: GlyphMorph = { grid: LOGO_GRID, box: { left: LOGO_LEFT, top: LOGO_TOP, cellsPerSide: LOGO_CELLS }, cells, drawTarget: drawArrow };
	return createDotMorphPlayer({
		canvas,
		palette,
		onPlayingChange,
		source: {
			grid: LOGO_GRID,
			fit: 'cover',
			restingDots: glyphRestingDots(glyph),
			spinSpeed: NUDGES_PER_SECOND * Math.PI * 2,
			spinPeriod: Math.PI * 2,
			sample: createGlyphShader(glyph),
			backdrop: clearedBackdrop,
			morphInSeconds: MORPH_IN_SECONDS,
		},
	});
}

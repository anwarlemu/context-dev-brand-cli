import { TRUST_MARK_CELLS, TRUST_MARK_DOT_RADIUS, TRUST_MARK_PITCH, TRUST_MARK_RING_STROKE, TRUST_MARK_ROWS, type TrustMarkId } from '@/components/ds/ui/trust-marks';
import { glyphCellsFromRows } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells, glyphHandover, glyphRestingDots, type GlyphMorph } from '@/components/ds/ui/dot-glyph-morph';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { createDotMorphPlayer, type DotMorphFrame, type DotMorphPlayer } from '@/components/ds/ui/dot-morph-player';

const GRID: DotGrid = { columns: TRUST_MARK_CELLS, rows: TRUST_MARK_CELLS, pitch: TRUST_MARK_PITCH, dotRadius: TRUST_MARK_DOT_RADIUS, ringStroke: TRUST_MARK_RING_STROKE, haloRadius: 0 };
const MORPH_IN_SECONDS = 0.8;

const SHIELD_PASSED = ['  ###########  ', ' #ooooooooooo# ', ' #ooooooooooo# ', ' #ooooooo   o# ', ' #oooooo  # o# ', ' #o   o  ## o# ', ' #o #   ##  o# ', ' #o ## ##  oo# ', ' #o  ###  ooo# ', '  #o  #  ooo#  ', '  #oo   oooo#  ', '   #ooooooo#   ', '    #ooooo#    ', '     #ooo#     ', '      ###      '];
const POLICY_CHECKLIST = ['   #########   ', '  #ooooooooo#  ', '  #o   ooooo#  ', '  #o  # oooo#  ', '  #o # o###o#  ', '  #o   ooooo#  ', '  #ooooooooo#  ', '  #o   ooooo#  ', '  #o  # oooo#  ', '  #o # o###o#  ', '  #o   ooooo#  ', '  #ooooooooo#  ', '  #oo#####oo#  ', '  #ooooooooo#  ', '   #########   '];
const MONITOR_FRAME = [' ############# ', '#ooooooooooooo#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#ooooooooooooo#', ' ############# '];

const MONITOR_BARS = [
	{ column: 3, height: 5 },
	{ column: 5, height: 7 },
	{ column: 7, height: 6 },
	{ column: 9, height: 8 },
	{ column: 11, height: 6 },
];
const MONITOR_BASELINE_ROW = 12;
const MONITOR_TICK_IN_CELLS = 1.2;
const MONITOR_TICKS_PER_SECOND = 0.45;

const drawRows = (rows: string[]) => {
	const cells = glyphCellsFromRows(rows);
	return (context: CanvasRenderingContext2D) => drawGlyphCells(context, cells, TRUST_MARK_PITCH);
};

const drawMonitorFrame = drawRows(MONITOR_FRAME);

function drawMonitoring(context: CanvasRenderingContext2D, { morph, spin }: DotMorphFrame) {
	drawMonitorFrame(context);
	const risen = glyphHandover(morph);
	// ds-override: offscreen luminance mask sampled into dot states, never painted
	context.fillStyle = '#000';
	MONITOR_BARS.forEach((bar, index) => {
		const height = (bar.height + MONITOR_TICK_IN_CELLS * Math.sin(spin + index * 1.1) * risen) * risen * TRUST_MARK_PITCH;
		context.fillRect(bar.column * TRUST_MARK_PITCH, MONITOR_BASELINE_ROW * TRUST_MARK_PITCH - height, TRUST_MARK_PITCH, height);
	});
}

const TARGETS: Record<TrustMarkId, { draw: GlyphMorph['drawTarget']; spinSpeed: number }> = {
	compliance: { draw: drawRows(SHIELD_PASSED), spinSpeed: 0 },
	policies: { draw: drawRows(POLICY_CHECKLIST), spinSpeed: 0 },
	controls: { draw: drawMonitoring, spinSpeed: MONITOR_TICKS_PER_SECOND * Math.PI * 2 },
};

interface TrustMarkMorphOptions {
	canvas: HTMLCanvasElement;
	mark: TrustMarkId;
	dotColor: string;
	onPlayingChange: (isPlaying: boolean) => void;
}

export function createTrustMarkMorph({ canvas, mark, dotColor, onPlayingChange }: TrustMarkMorphOptions): DotMorphPlayer {
	const target = TARGETS[mark];
	const glyph: GlyphMorph = { grid: GRID, box: { left: 0, top: 0, cellsPerSide: TRUST_MARK_CELLS }, cells: glyphCellsFromRows(TRUST_MARK_ROWS[mark]), drawTarget: target.draw };
	return createDotMorphPlayer({
		canvas,
		palette: { dots: dotColor, background: 'transparent' },
		onPlayingChange,
		source: {
			grid: GRID,
			fit: 'contain',
			restingDots: glyphRestingDots(glyph),
			spinSpeed: target.spinSpeed,
			spinPeriod: Math.PI * 2,
			sample: createGlyphShader(glyph),
			morphInSeconds: MORPH_IN_SECONDS,
		},
	});
}

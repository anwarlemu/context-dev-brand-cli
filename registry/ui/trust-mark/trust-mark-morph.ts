import { TRUST_MARK_CELLS, TRUST_MARK_DOT_RADIUS, TRUST_MARK_PITCH, TRUST_MARK_RING_STROKE, TRUST_MARK_ROWS, type TrustMarkId } from '@/components/ds/ui/trust-marks';
import { glyphCellsFromRows } from '@/components/ds/ui/dot-glyph-cells';
import { createGlyphShader, drawGlyphCells, glyphHandover, glyphRestingDots, type GlyphMorph } from '@/components/ds/ui/dot-glyph-morph';
import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { createDotMorphPlayer, type DotMorphFrame, type DotMorphPlayer } from '@/components/ds/ui/dot-morph-player';

/**
 * What each trust mark becomes on hover says what its card promises: the SOC seal becomes a shield that has passed
 * its check, the crossed-out database becomes a bin for data that is never kept, and the status pulse becomes the
 * uptime bars a status page shows, still ticking.
 *
 * At this size a solid dot barely stands out from a ring, so the marks inside each glyph are set in clear space.
 */

const GRID: DotGrid = { columns: TRUST_MARK_CELLS, rows: TRUST_MARK_CELLS, pitch: TRUST_MARK_PITCH, dotRadius: TRUST_MARK_DOT_RADIUS, ringStroke: TRUST_MARK_RING_STROKE, haloRadius: 0 };
const MORPH_IN_SECONDS = 0.8;

const SHIELD_PASSED = ['  ###########  ', ' #ooooooooooo# ', ' #ooooooooooo# ', ' #ooooooo   o# ', ' #oooooo  # o# ', ' #o   o  ## o# ', ' #o #   ##  o# ', ' #o ## ##  oo# ', ' #o  ###  ooo# ', '  #o  #  ooo#  ', '  #oo   oooo#  ', '   #ooooooo#   ', '    #ooooo#    ', '     #ooo#     ', '      ###      '];
const BIN_LID = ['               ', '     #####     ', '     #   #     ', ' ############# ', ' #ooooooooooo# ', ' ############# '];
const BIN_BODY = ['               ', '               ', '               ', '               ', '               ', '               ', '               ', '  ###########  ', '  #oo o o oo#  ', '  #oo o o oo#  ', '  #oo o o oo#  ', '  #oo o o oo#  ', '   #o o o o#   ', '   #ooooooo#   ', '    #######    '];
const STATUS_FRAME = [' ############# ', '#ooooooooooooo#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#o           o#', '#ooooooooooooo#', ' ############# '];

const LID_LIFT_IN_CELLS = 1;
const LID_LIFTS_PER_SECOND = 0.5;
const UPTIME_BARS = [
	{ column: 3, height: 5 },
	{ column: 5, height: 7 },
	{ column: 7, height: 6 },
	{ column: 9, height: 8 },
	{ column: 11, height: 6 },
];
const UPTIME_BASELINE_ROW = 12;
const UPTIME_TICK_IN_CELLS = 1.2;
const UPTIME_TICKS_PER_SECOND = 0.45;

const drawRows = (rows: string[]) => {
	const cells = glyphCellsFromRows(rows);
	return (context: CanvasRenderingContext2D) => drawGlyphCells(context, cells, TRUST_MARK_PITCH);
};

const drawBinLid = drawRows(BIN_LID);
const drawBinBody = drawRows(BIN_BODY);
const drawStatusFrame = drawRows(STATUS_FRAME);

function drawBin(context: CanvasRenderingContext2D, { morph, spin }: DotMorphFrame) {
	drawBinBody(context);
	const lift = LID_LIFT_IN_CELLS * TRUST_MARK_PITCH * glyphHandover(morph) * (1 - Math.cos(spin)) * 0.5;
	context.translate(0, -lift);
	drawBinLid(context);
}

function drawUptime(context: CanvasRenderingContext2D, { morph, spin }: DotMorphFrame) {
	drawStatusFrame(context);
	const risen = glyphHandover(morph);
	// ds-override: offscreen luminance mask sampled into dot states, never painted
	context.fillStyle = '#000';
	UPTIME_BARS.forEach((bar, index) => {
		const height = (bar.height + UPTIME_TICK_IN_CELLS * Math.sin(spin + index * 1.1) * risen) * risen * TRUST_MARK_PITCH;
		context.fillRect(bar.column * TRUST_MARK_PITCH, UPTIME_BASELINE_ROW * TRUST_MARK_PITCH - height, TRUST_MARK_PITCH, height);
	});
}

const TARGETS: Record<TrustMarkId, { draw: GlyphMorph['drawTarget']; spinSpeed: number }> = {
	compliance: { draw: drawRows(SHIELD_PASSED), spinSpeed: 0 },
	retention: { draw: drawBin, spinSpeed: LID_LIFTS_PER_SECOND * Math.PI * 2 },
	reliability: { draw: drawUptime, spinSpeed: UPTIME_TICKS_PER_SECOND * Math.PI * 2 },
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

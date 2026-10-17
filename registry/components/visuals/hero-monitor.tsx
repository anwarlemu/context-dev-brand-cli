import { DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { polygon, rectangle, ringsWithSpeckle, solid, solidWithSpeckle, stack, type DotPainter } from '@/components/visuals/dot-engine/dot-story-cells';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// The same dot grid as the stories, so a story set on the screen lines up with the monitor dot for dot.
const PITCH = 10;
const DOT_RADIUS = 3.2;
const RING_STROKE = 1;
const SCREEN_CONTENT = { columns: 58, rows: 38 };

const CASE_CORNER = 2;
const CASE = { left: 2, right: 71, top: 1, bottom: 50 };
const SCREEN = { left: 6, right: 67, top: 4, bottom: 45 };
const CONTENT = { left: 8, top: 6 };
const CONTROLS = { top: 47, bottom: 49, knobs: [64, 67], vents: { from: 9, to: 25 }, row: 48 };
const NECK = { left: 33, right: 40, top: 51, bottom: 52 };
const BASE = { left: 26, right: 47, top: 53, bottom: 55, flare: 2 };
const KEYBOARD = { left: 6, right: 67, top: 57, bottom: 62, flare: 4 };
const SPACE_BAR = { from: 22, to: 51, row: KEYBOARD.bottom - 1 };
const KEY_PITCH = 3;
const COLUMNS = 74;
const ROWS = 64;

const isWithin = ({ left, right, top, bottom }: { left: number; right: number; top: number; bottom: number }, column: number, row: number) => column >= left && column <= right && row >= top && row <= bottom;

// The tube's case, its corners taken off: a box that size with square corners reads as a window, not a monitor.
const monitorCase = polygon(
	[
		{ column: CASE.left + CASE_CORNER, row: CASE.top },
		{ column: CASE.right - CASE_CORNER, row: CASE.top },
		{ column: CASE.right, row: CASE.top + CASE_CORNER },
		{ column: CASE.right, row: CASE.bottom - CASE_CORNER },
		{ column: CASE.right - CASE_CORNER, row: CASE.bottom },
		{ column: CASE.left + CASE_CORNER, row: CASE.bottom },
		{ column: CASE.left, row: CASE.bottom - CASE_CORNER },
		{ column: CASE.left, row: CASE.top + CASE_CORNER },
	],
	solidWithSpeckle
);

const monitor: DotPainter = (column, row) => {
	if (isWithin(SCREEN, column, row)) return column === SCREEN.left || column === SCREEN.right || row === SCREEN.top || row === SCREEN.bottom ? DOT_HOLLOW : 0;
	const shell = monitorCase(column, row);
	if (shell === 0 || row < CONTROLS.top || row > CONTROLS.bottom || column <= CASE.left + 1 || column >= CASE.right - 1) return shell;
	if (row !== CONTROLS.row) return DOT_HOLLOW;
	const isVent = column >= CONTROLS.vents.from && column <= CONTROLS.vents.to && column % 2 === 1;
	return CONTROLS.knobs.includes(column) || isVent ? DOT_FILLED : DOT_HOLLOW;
};

const stand = stack(
	rectangle(NECK, solid),
	polygon(
		[
			{ column: BASE.left, row: BASE.top },
			{ column: BASE.right, row: BASE.top },
			{ column: BASE.right + BASE.flare, row: BASE.bottom },
			{ column: BASE.left - BASE.flare, row: BASE.bottom },
		],
		ringsWithSpeckle
	)
);

// Seen from the front and a little above, so it widens toward the typist; its keys are rings with gaps between them.
const keyboardDeck = polygon(
	[
		{ column: KEYBOARD.left, row: KEYBOARD.top },
		{ column: KEYBOARD.right, row: KEYBOARD.top },
		{ column: KEYBOARD.right + KEYBOARD.flare, row: KEYBOARD.bottom },
		{ column: KEYBOARD.left - KEYBOARD.flare, row: KEYBOARD.bottom },
	],
	(column, row) => {
		if (row === SPACE_BAR.row) return column >= SPACE_BAR.from && column <= SPACE_BAR.to ? DOT_FILLED : 0;
		return (column + row) % KEY_PITCH === 0 ? 0 : DOT_HOLLOW;
	}
);

const terminal = stack(monitor, stand, keyboardDeck);

// Everything the monitor covers, gaps between its keys and its dark screen included, so what runs behind it stays hidden.
const keyboardOutline = polygon(
	[
		{ column: KEYBOARD.left, row: KEYBOARD.top },
		{ column: KEYBOARD.right, row: KEYBOARD.top },
		{ column: KEYBOARD.right + KEYBOARD.flare, row: KEYBOARD.bottom },
		{ column: KEYBOARD.left - KEYBOARD.flare, row: KEYBOARD.bottom },
	],
	() => DOT_HOLLOW
);
const isCovered = (column: number, row: number) => terminal(column, row) !== 0 || isWithin(SCREEN, column, row) || keyboardOutline(column, row) !== 0;

// One rectangle per run of covered cells in a row, not one per cell: this path is inlined into every page with a hero
// monitor, twice (HTML and RSC payload), and per-cell squares made it about 75KB.
function silhouettePath() {
	const segments: string[] = [];
	for (let row = 0; row < ROWS; row++) {
		let column = 0;
		while (column < COLUMNS) {
			if (!isCovered(column, row)) {
				column++;
				continue;
			}
			const runStart = column;
			while (column < COLUMNS && isCovered(column, row)) column++;
			const runWidth = (column - runStart) * PITCH;
			segments.push(`M${runStart * PITCH} ${row * PITCH}h${runWidth}v${PITCH}h${-runWidth}z`);
		}
	}
	return segments.join('');
}

function dotsPath(filled: boolean) {
	const radius = filled ? DOT_RADIUS : DOT_RADIUS - RING_STROKE / 2;
	const segments: string[] = [];
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS; column++) {
			if (terminal(column, row) !== (filled ? DOT_FILLED : DOT_HOLLOW)) continue;
			const cx = (column + 0.5) * PITCH;
			const cy = (row + 0.5) * PITCH;
			segments.push(`M${cx - radius} ${cy}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`);
		}
	}
	return segments.join('');
}

const FILLED_PATH = dotsPath(true);
const HOLLOW_PATH = dotsPath(false);
const SILHOUETTE_PATH = silhouettePath();

const share = (cells: number, of: number) => `${(cells / of) * 100}%`;

const SCREEN_CONTENT_BOX = {
	left: share(CONTENT.left, COLUMNS),
	top: share(CONTENT.top, ROWS),
	width: share(SCREEN_CONTENT.columns, COLUMNS),
};

const CASE_BOX = {
	left: share(CASE.left, COLUMNS),
	top: share(CASE.top, ROWS),
	width: share(CASE.right + 1 - CASE.left, COLUMNS),
	height: share(CASE.bottom + 1 - CASE.top, ROWS),
};

interface HeroMonitorProps {
	/** A 58 by 38 dot story (or anything that size), set on the screen. */
	children: ReactNode;
	/** Attributes for a box over the monitor's case alone, without its stand and keyboard. */
	caseAttributes?: Record<string, string>;
	/** Drawn in that box, for anything that has to line up with the screen rather than the whole picture. */
	caseOverlay?: ReactNode;
	/** The color behind the monitor, which hides whatever runs behind it. A brand token or any CSS color. */
	surfaceColor?: string;
	className?: string;
}

/**
 * An old terminal drawn in the brand dot grid, the same one the Search story types into, with `children` (a 58 by 38
 * dot story) set on its screen. `caseAttributes` and `caseOverlay` go on a box over the monitor's case alone, without
 * its stand and keyboard, for anything that has to line up with the screen rather than the whole picture. The dots
 * take the current text color (`text-brand` by default); the monitor itself is static, so it needs no reduced motion.
 */
export function HeroMonitor({ children, caseAttributes, caseOverlay, surfaceColor = 'var(--ds-color-bg-default)', className }: HeroMonitorProps) {
	return (
		<div className={cn('relative w-full text-brand', className)} style={{ aspectRatio: `${COLUMNS} / ${ROWS}` }}>
			<svg aria-hidden="true" viewBox={`0 0 ${COLUMNS * PITCH} ${ROWS * PITCH}`} className="pointer-events-none absolute inset-0 size-full">
				<path d={SILHOUETTE_PATH} style={{ fill: surfaceColor }} />
				<path d={FILLED_PATH} fill="currentColor" />
				<path d={HOLLOW_PATH} fill="none" stroke="currentColor" strokeWidth={RING_STROKE} />
			</svg>
			<div aria-hidden="true" className="pointer-events-none absolute" style={CASE_BOX} {...caseAttributes}>
				{caseOverlay}
			</div>
			<div className="absolute" style={SCREEN_CONTENT_BOX}>
				{children}
			</div>
		</div>
	);
}

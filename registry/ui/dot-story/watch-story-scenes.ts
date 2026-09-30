import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW, type DotGrid } from '@/components/ds/ui/dot-morph-dots';
import type { StoryPicture } from '@/components/ds/ui/dot-story-beats';
import { cellsOfStates, distanceToSegment, isFilledAmongSolids, outlineCells, type Region } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * The Monitor card's pictures, in the brand dot grid: a clock that checks the page on its schedule, and the bell
 * that rings, with what changed beside it, when a check finds something.
 */

// The ring pattern behind the picture already keeps clear of it, so the dots need no halo of their own.
export const WATCH_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };

const { columns: COLUMNS, rows: ROWS, pitch: PITCH } = WATCH_STORY_GRID;
const x = (column: number) => column * PITCH;
// Doto sits a third of its size below the middle of the row it is set on.
const baselineOn = (row: number, size: number) => (row + 0.5) * PITCH + size / 3;
const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(WATCH_STORY_GRID, states) });

const CLOCK = { centre: { column: 19, row: 18.5 }, radius: 16, band: 2, ticks: 12.5, hub: 1.3, hand: { minute: 11, hour: 7, width: 0.75 } };
const HOURS = 12;
const TURN = Math.PI * 2;

const handTip = (turns: number, length: number) => ({ column: CLOCK.centre.column + length * Math.sin(turns * TURN), row: CLOCK.centre.row - length * Math.cos(turns * TURN) });

/** The clock with its minute hand `turns` of the way round; the hour hand follows a twelfth as fast. */
export function paintClock(states: Uint8Array, turns: number) {
	const minute = handTip(turns, CLOCK.hand.minute);
	const hour = handTip(turns / HOURS + 0.5, CLOCK.hand.hour);
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column < COLUMNS; column++) {
			const cell = row * COLUMNS + column;
			const fromCentre = Math.hypot(column - CLOCK.centre.column, row - CLOCK.centre.row);
			if (fromCentre > CLOCK.radius) states[cell] = DOT_ABSENT;
			else if (fromCentre > CLOCK.radius - 1) states[cell] = DOT_FILLED;
			else if (fromCentre > CLOCK.radius - 1 - CLOCK.band) states[cell] = DOT_HOLLOW;
			else {
				const hourMark = (Math.atan2(column - CLOCK.centre.column, CLOCK.centre.row - row) / TURN) * HOURS;
				const isTick = Math.abs(fromCentre - CLOCK.ticks) < 0.8 && Math.abs(hourMark - Math.round(hourMark)) < 0.17;
				const isHand = Math.min(distanceToSegment(column, row, CLOCK.centre, minute), distanceToSegment(column, row, CLOCK.centre, hour)) < CLOCK.hand.width;
				states[cell] = isTick || isHand || fromCentre < CLOCK.hub ? DOT_FILLED : DOT_ABSENT;
			}
		}
	}
	return states;
}

export const CLOCK_AT_REST = pictureOfStates(paintClock(new Uint8Array(COLUMNS * ROWS), 0));

const CHECK_LEFT = x(CLOCK.centre.column + CLOCK.radius + 4);
export const CHECKS = ['06:00', '12:00', '18:00', '00:00'].map((time, index) => ({
	time: { text: time, x: CHECK_LEFT, y: baselineOn(9 + index * 6, 20), size: 20, weight: 800 } satisfies DotStoryText,
	result: { text: index === 3 ? 'Price changed' : 'No changes', x: CHECK_LEFT, y: baselineOn(11.4 + index * 6, 13), size: 13, weight: 700, muted: index !== 3 } satisfies DotStoryText,
}));
export const SCHEDULE: DotStoryText = { text: 'every 6h', x: CHECK_LEFT, y: baselineOn(4, 13), size: 13, weight: 700, muted: true };

const BELL = { centre: 13, crown: 4, cap: 2.5, shoulder: 8, lip: 25, rim: 27, clapper: { row: 30, radius: 1.7 }, knob: 1.6, wide: 7.5, taper: 0.45, roundness: 2.2, flareFrom: 0.68, flare: 3.5, rimWidth: 11.5, shine: { from: -5, to: -4, top: 12, bottom: 21 } };
const SOUND = { row: 17, spread: 0.62, width: 0.6 };
export const BELL_EDGE = BELL.centre + BELL.rimWidth;

// A rounded crown, a body that swells quickly and a lip that flares: a straight flare read as a tree, not a bell.
const bellHalfWidth = (row: number) => {
	if (row >= BELL.lip) return BELL.rimWidth;
	if (row < BELL.shoulder) return BELL.wide * (1 - BELL.taper) * Math.sqrt(Math.max(0, 1 - ((BELL.shoulder - row) / BELL.cap) ** 2));
	const down = (row - BELL.shoulder) / (BELL.lip - BELL.shoulder);
	const dome = BELL.wide * (1 - BELL.taper * (1 - down) ** BELL.roundness);
	return dome + Math.max(0, (down - BELL.flareFrom) / (1 - BELL.flareFrom)) * BELL.flare;
};

function isInBell(column: number, row: number, swing: number) {
	if (Math.hypot(column - BELL.centre, row - BELL.crown - 1) <= BELL.knob) return true;
	// The bell hangs from its crown, so the further down, the further it swings; the clapper lags the other way.
	const across = column - BELL.centre - swing * ((row - BELL.crown) / (BELL.rim - BELL.crown));
	if (Math.hypot(across + swing * 1.6, row - BELL.clapper.row) <= BELL.clapper.radius) return true;
	return row > BELL.shoulder - BELL.cap && row <= BELL.rim && Math.abs(across) <= bellHalfWidth(row);
}

/** The bell, swung `swing` columns at its rim, with a ring of sound `sound` columns out from it (none when 0). */
export function paintBell(states: Uint8Array, swing: number, sound: number) {
	for (let row = 0; row < ROWS; row++) {
		for (let column = 0; column <= BELL_EDGE + 2; column++) {
			const cell = row * COLUMNS + column;
			if (isInBell(column, row, swing)) {
				const isEdge = !isInBell(column - 1, row, swing) || !isInBell(column + 1, row, swing) || !isInBell(column, row - 1, swing) || !isInBell(column, row + 1, swing);
				const across = column - BELL.centre;
				const isShine = across >= BELL.shine.from && across <= BELL.shine.to && row >= BELL.shine.top && row <= BELL.shine.bottom;
				states[cell] = isEdge || (!isShine && isFilledAmongSolids(column, row)) ? DOT_FILLED : DOT_HOLLOW;
				continue;
			}
			const fromBell = Math.hypot(column - BELL.centre, row - SOUND.row);
			const isAside = Math.abs(row - SOUND.row) < Math.abs(column - BELL.centre) * SOUND.spread;
			states[cell] = sound > 0 && isAside && Math.abs(fromBell - sound) < SOUND.width ? DOT_HOLLOW : DOT_ABSENT;
		}
	}
	return states;
}

export const BELL_AT_REST = pictureOfStates(paintBell(new Uint8Array(COLUMNS * ROWS), 0, 0));

export const NOTICE: Region = { left: 29, top: 4, columns: 29, rows: 30 };
const NOTICE_RULE_ROW = NOTICE.top + 9;
const SENT = { column: NOTICE.left + 3, row: NOTICE.top + 25 };
const noticeCells = [...outlineCells(NOTICE), ...Array.from({ length: NOTICE.columns - 4 }, (_, step) => ({ column: NOTICE.left + 2 + step, row: NOTICE_RULE_ROW, filled: false })), { ...SENT, filled: true }];

const withNotice = (states: Uint8Array) => {
	for (const cell of noticeCells) states[cell.row * COLUMNS + cell.column] = cell.filled ? DOT_FILLED : DOT_HOLLOW;
	return states;
};
export const paintNotice = withNotice;
export const BELL_AND_NOTICE = pictureOfStates(withNotice(paintBell(new Uint8Array(COLUMNS * ROWS), 0, 0)));

const NOTICE_LEFT = x(NOTICE.left + 3);
export const NOTICE_TEXTS: DotStoryText[] = [
	{ text: 'Change detected', x: NOTICE_LEFT, y: baselineOn(NOTICE.top + 3, 17), size: 17, weight: 800 },
	{ text: 'atlas.example/pricing', x: NOTICE_LEFT, y: baselineOn(NOTICE.top + 6, 12), size: 12, weight: 700, muted: true },
	{ text: 'Team plan', x: NOTICE_LEFT, y: baselineOn(NOTICE.top + 12.5, 14), size: 14, weight: 700, muted: true },
	{ text: '$49 -> $59', x: NOTICE_LEFT, y: baselineOn(NOTICE.top + 17, 30), size: 30, weight: 900 },
	{ text: 'per month', x: NOTICE_LEFT, y: baselineOn(NOTICE.top + 20.5, 13), size: 13, weight: 700, muted: true },
	{ text: 'Webhook sent', x: x(SENT.column + 2), y: baselineOn(SENT.row, 14), size: 14, weight: 700 },
];

/** The bell with its notice: what the picture shows before it plays, and instead of playing with reduced motion. */
export const WATCH_RESTING = { ...BELL_AND_NOTICE, texts: NOTICE_TEXTS };

import { BELL_AND_NOTICE, BELL_AT_REST, CHECKS, CLOCK_AT_REST, NOTICE, NOTICE_TEXTS, SCHEDULE, WATCH_STORY_GRID, paintBell, paintClock, paintNotice } from '@/components/ds/ui/watch-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One day of watching, played as a loop: the clock's hand goes round once, a check landing at each quarter; the
 * last check finds a change, and the clock melts into a bell that rings while the notice of what changed is
 * written out beside it.
 */

const DAY = { startsAt: 0.4, seconds: 3.2, textSeconds: 0.3 };
const RING = { swings: 3, columns: 2.2, secondsEach: 0.42, sound: { from: 13, to: 19 } };
const RINGING_SECONDS = RING.swings * RING.secondsEach;
const MELT_SECONDS = 1.1;
const NOTICE_LINE = { everySeconds: 0.35, seconds: 0.3 };

const turnsAt = (heldSeconds: number) => clamp01((heldSeconds - DAY.startsAt) / DAY.seconds);

// Each swing is smaller than the one before, and sends a ring of sound out to either side.
function ring(states: Uint8Array, heldSeconds: number) {
	const rung = heldSeconds / RINGING_SECONDS;
	if (rung >= 1) return;
	const swing = Math.round(RING.columns * (1 - rung) * Math.sin(rung * RING.swings * Math.PI * 2));
	paintBell(states, swing, RING.sound.from + ((heldSeconds / RING.secondsEach) % 1) * (RING.sound.to - RING.sound.from));
}

export function createWatchStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: WATCH_STORY_GRID,
		resting: { beat: 2, heldSeconds: 2.8 },
		beats: [
			{
				picture: CLOCK_AT_REST,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: DAY.startsAt + DAY.seconds + 0.5,
				animate: (states, heldSeconds) => void paintClock(states, turnsAt(heldSeconds)),
				write(pen, heldSeconds) {
					pen.text(SCHEDULE);
					CHECKS.forEach(({ time, result }, index) => {
						const checked = clamp01((turnsAt(heldSeconds) * DAY.seconds - ((index + 1) / CHECKS.length) * DAY.seconds + DAY.textSeconds) / DAY.textSeconds);
						pen.text(time, checked);
						pen.text(result, checked);
					});
				},
			},
			{ picture: BELL_AT_REST, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: RINGING_SECONDS, animate: ring },
			{
				picture: BELL_AND_NOTICE,
				// The notice draws itself from the bell's side outwards.
				arrival: { kind: 'builds', seconds: 0.6, order: (column) => clamp01((column - NOTICE.left) / NOTICE.columns) },
				holdSeconds: 4,
				animate(states, heldSeconds) {
					if (heldSeconds > RINGING_SECONDS) return;
					ring(states, heldSeconds);
					paintNotice(states);
				},
				write: (pen, heldSeconds) => NOTICE_TEXTS.forEach((text, index) => pen.text(text, clamp01((heldSeconds - index * NOTICE_LINE.everySeconds) / NOTICE_LINE.seconds))),
			},
		],
	});
}

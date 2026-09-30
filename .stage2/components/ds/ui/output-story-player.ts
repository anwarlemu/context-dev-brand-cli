import { BLANK_FILES, FILES, FILE_TEXTS, OUTPUT_STORY_GRID, PAGE_AT_REST, PAGE_REQUESTED, PAGE_URL, REQUEST_LABEL, SWITCH_LABELS, paintSwitches, writingOrder } from '@/components/ds/ui/output-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One request, played as a loop: under the live page a switch is thrown for each format; the page melts into three
 * blank files; and the files are written one after another, a Markdown document, the HTML and a screenshot.
 */

const SWITCHING = { startsAt: 0.5, everySeconds: 0.5, seconds: 0.25 };
const SWITCHED_AT = SWITCHING.startsAt + (SWITCH_LABELS.length - 1) * SWITCHING.everySeconds + SWITCHING.seconds;
const MELT_SECONDS = 1.1;
const WRITING_SECONDS = 1.8;
const NAMING = { everySeconds: 0.25, seconds: 0.3 };

const switchedOn = (index: number, heldSeconds: number) => easeOut(clamp01((heldSeconds - SWITCHING.startsAt - index * SWITCHING.everySeconds) / SWITCHING.seconds));

export function createOutputStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: OUTPUT_STORY_GRID,
		resting: { beat: 2, heldSeconds: 2.4 },
		beats: [
			{
				picture: PAGE_AT_REST,
				departure: PAGE_REQUESTED,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: SWITCHED_AT + 0.8,
				animate: (states, heldSeconds) =>
					void paintSwitches(
						states,
						SWITCH_LABELS.map((_, index) => switchedOn(index, heldSeconds))
					),
				write(pen, heldSeconds) {
					pen.text(PAGE_URL);
					pen.text(REQUEST_LABEL);
					SWITCH_LABELS.forEach((label, index) => {
						const on = switchedOn(index, heldSeconds);
						pen.text({ ...label, muted: true }, 1 - on);
						pen.text(label, on);
					});
				},
			},
			{ picture: BLANK_FILES, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
			{
				picture: FILES,
				arrival: { kind: 'builds', seconds: WRITING_SECONDS, order: writingOrder },
				holdSeconds: 3.6,
				write: (pen, heldSeconds) => FILE_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - index * NAMING.everySeconds) / NAMING.seconds)))),
			},
		],
	});
}

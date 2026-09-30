import { captionedBeat } from '@/components/ds/ui/story-caption';
import { CHIPS_AT_REST, COLOR_CAPTIONS, ROLE_COUNT, SPECIMEN_BOLD, SPECIMEN_LIGHT, TYPE_CAPTION, TYPE_STORY_GRID, WEIGHTS, paintChips, paintSpecimen, weightDetail } from '@/components/ds/ui/type-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One site's type and color, played as a loop: a specimen is set in each weight the site uses, light to bold, and
 * melts into the site's colors, a stack of chips pulled out one at a time as its hex value and role are read.
 */

const MELT_SECONDS = 1.1;
const WEIGHING = { startsAt: 0.7, everySeconds: 0.8 };
const READING = { startsAt: 0.3, everySeconds: 1.1, textSeconds: 0.25 };
const BOLD_AT = WEIGHING.startsAt + (WEIGHTS.length - 2) * WEIGHING.everySeconds;

const stepAt = (heldSeconds: number, { startsAt, everySeconds }: { startsAt: number; everySeconds: number }, last: number) => (heldSeconds < startsAt ? -1 : Math.min(last, Math.floor((heldSeconds - startsAt) / everySeconds)));
const weightAt = (heldSeconds: number) => stepAt(heldSeconds, WEIGHING, WEIGHTS.length - 2) + 1;

export function createTypeStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [fontLabel, fontName, fontDetail] = TYPE_CAPTION;
	return createBeatStoryPlayer(stage, {
		grid: TYPE_STORY_GRID,
		resting: { beat: 0, heldSeconds: BOLD_AT + 0.8 },
		beats: [
			{
				picture: SPECIMEN_LIGHT,
				departure: SPECIMEN_BOLD,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: BOLD_AT + 1.6,
				animate: (states, heldSeconds) => void paintSpecimen(states, WEIGHTS[weightAt(heldSeconds)].stroke),
				write(pen, heldSeconds) {
					pen.text(fontLabel);
					pen.text(fontName);
					pen.text({ ...fontDetail, text: weightDetail(weightAt(heldSeconds)) });
				},
			},
			{
				...captionedBeat({ picture: CHIPS_AT_REST, caption: COLOR_CAPTIONS[0], holdSeconds: READING.startsAt + ROLE_COUNT * READING.everySeconds }),
				// The last chip slides back in as the hold ends, so the stack melts away as it arrived.
				animate: (states, heldSeconds) => void paintChips(states, heldSeconds > READING.startsAt + ROLE_COUNT * READING.everySeconds - 0.15 ? -1 : stepAt(heldSeconds, READING, ROLE_COUNT - 1)),
				write(pen, heldSeconds) {
					const reading = stepAt(heldSeconds, READING, ROLE_COUNT - 1);
					if (reading < 0) return;
					const written = clamp01((heldSeconds - READING.startsAt - reading * READING.everySeconds) / READING.textSeconds);
					COLOR_CAPTIONS[reading].forEach((text, line) => pen.text(text, line === 0 ? 1 : written));
				},
			},
		],
	});
}

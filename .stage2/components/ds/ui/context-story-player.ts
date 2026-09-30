import { BUILDING_DARK, BUILDING_LIT, CAPTIONS, CONTEXT_STORY_GRID, FIELD_COUNT, FLOORS, NETWORK_LINKED, NETWORK_UNLINKED, NODE_COUNT, PROFILE_EMPTY, PROFILE_FILLED, paintBuilding, paintNetwork, paintProfile } from '@/components/ds/ui/context-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One company's context, played as a loop: its building lights up floor by floor, melts into its social links,
 * found one after another, and those melt into a profile card whose fields fill in from the top.
 */

const LIGHTING = { startsAt: 0.4, everySeconds: 0.25 };
const LINKING = { startsAt: 0.5, everySeconds: 0.5 };
const FILLING = { startsAt: 0.4, everySeconds: 0.3 };

const stepsAt = (heldSeconds: number, { startsAt, everySeconds }: { startsAt: number; everySeconds: number }, most: number) => (heldSeconds < startsAt ? 0 : Math.min(most, Math.floor((heldSeconds - startsAt) / everySeconds) + 1));
const doneAt = ({ startsAt, everySeconds }: { startsAt: number; everySeconds: number }, steps: number) => startsAt + (steps - 1) * everySeconds;

export function createContextStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: CONTEXT_STORY_GRID,
		resting: { beat: 2, heldSeconds: doneAt(FILLING, FIELD_COUNT) + 1 },
		beats: [
			captionedBeat({ picture: BUILDING_DARK, departure: BUILDING_LIT, caption: CAPTIONS.company, holdSeconds: doneAt(LIGHTING, FLOORS) + 1.4, isTyped: true, animate: (states, heldSeconds) => void paintBuilding(states, stepsAt(heldSeconds, LIGHTING, FLOORS)) }),
			captionedBeat({
				picture: NETWORK_UNLINKED,
				departure: NETWORK_LINKED,
				caption: CAPTIONS.socials,
				holdSeconds: doneAt(LINKING, NODE_COUNT - 1) + 1.6,
				isTyped: true,
				// The company's own profile is there from the start; the others are found from it.
				animate: (states, heldSeconds) => void paintNetwork(states, 1 + stepsAt(heldSeconds, LINKING, NODE_COUNT - 1)),
			}),
			captionedBeat({ picture: PROFILE_EMPTY, departure: PROFILE_FILLED, caption: CAPTIONS.profile, holdSeconds: doneAt(FILLING, FIELD_COUNT) + 2.8, isTyped: true, animate: (states, heldSeconds) => void paintProfile(states, stepsAt(heldSeconds, FILLING, FIELD_COUNT)) }),
		],
	});
}

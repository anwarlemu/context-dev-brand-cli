import { CHOSEN_COUNT, DOMAIN, FOUND_COUNT, PAPER_MAP, SITE_CHOSEN, SITE_FOUND, SITE_MAP_STORY_GRID, TREE_LABELS, chosenCountText, paintChosen } from '@/components/ds/ui/site-map-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One mapping, played as a loop: a domain is typed under a folded paper map; the map melts into the site itself, a
 * tree of its sections and their pages; then the pages to scrape are picked, one after another.
 */

const MELT_SECONDS = 1.1;
const TYPING = { startsAt: 0.4, charactersPerSecond: 9 };
const TYPED_AT = TYPING.startsAt + typingSeconds(DOMAIN, TYPING.charactersPerSecond);
const CHOOSING = { startsAt: 1.1, everySeconds: 0.4 };
const CHOSEN_AT = CHOOSING.startsAt + (CHOSEN_COUNT - 1) * CHOOSING.everySeconds;
const LABEL_FADE_SECONDS = 0.3;

const chosenAt = (heldSeconds: number) => (heldSeconds < CHOOSING.startsAt ? 0 : Math.min(CHOSEN_COUNT, Math.floor((heldSeconds - CHOOSING.startsAt) / CHOOSING.everySeconds) + 1));

export function createSiteMapStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SITE_MAP_STORY_GRID,
		resting: { beat: 1, heldSeconds: CHOSEN_AT + 1 },
		beats: [
			{ picture: PAPER_MAP, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: TYPED_AT + 1, write: (pen, heldSeconds) => pen.type(DOMAIN, heldSeconds, { ...TYPING, cursorLingers: Infinity }) },
			{
				picture: SITE_FOUND,
				departure: SITE_CHOSEN,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: CHOSEN_AT + 3.2,
				animate: (states, heldSeconds) => void paintChosen(states, chosenAt(heldSeconds)),
				write(pen, heldSeconds) {
					TREE_LABELS.forEach((label) => pen.text(label));
					pen.text(FOUND_COUNT);
					pen.text(chosenCountText(Math.max(1, chosenAt(heldSeconds))), clamp01((heldSeconds - CHOOSING.startsAt) / LABEL_FADE_SECONDS));
				},
			},
		],
	});
}

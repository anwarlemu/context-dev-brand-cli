import { BANNER_FILLED, BANNER_INSIDE, BANNER_OPEN, BANNER_ORIGIN, EMPTY, FAQ_DEMO_STORY_GRID, FLIGHT_COLUMNS, PLANE_AT_REST, QUESTION, bannerShare, paintFlight } from '@/components/ds/ui/faq-demo-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * The invitation, played as a loop: a banner sweeps in and asks its question, then melts into a paper plane, which
 * draws back and flies off to the top right.
 */

const TYPING = { startsAt: 0.3, charactersPerSecond: 12 };
const ASKED_AT = TYPING.startsAt + typingSeconds(QUESTION, TYPING.charactersPerSecond);
const MELT_SECONDS = 1.1;
const FLIGHT = { startsAt: 0.45, seconds: 1.6, drawBack: 1.4 };
// The plane has already left when the loop comes round, so the banner arrives on an empty grid rather than on the
// plane's resting picture.
const CLEARED_SECONDS = 0.5;

// Eases in from a step backwards, so the plane draws back before it goes.
const launch = (t: number) => t * t * ((FLIGHT.drawBack + 1) * t - FLIGHT.drawBack);

export function createFaqDemoStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const bannerInside = new Path2D(BANNER_INSIDE);
	return createBeatStoryPlayer(stage, {
		grid: FAQ_DEMO_STORY_GRID,
		resting: { beat: 2, heldSeconds: ASKED_AT },
		beats: [
			{ picture: EMPTY, arrival: { kind: 'builds', seconds: 0, order: () => 0 }, holdSeconds: CLEARED_SECONDS },
			{ picture: BANNER_FILLED, arrival: { kind: 'waves', seconds: 0.9, origin: BANNER_ORIGIN }, holdSeconds: 0.15 },
			{
				picture: BANNER_OPEN,
				arrival: { kind: 'builds', seconds: 0.5, order: bannerShare },
				holdSeconds: ASKED_AT + 1.5,
				write: (pen, heldSeconds) => pen.type(QUESTION, heldSeconds, { ...TYPING, cursorLingers: Infinity }),
				clears: (context) => context.fill(bannerInside),
			},
			{ picture: BANNER_FILLED, arrival: { kind: 'builds', seconds: 0.4, order: bannerShare }, holdSeconds: 0.1 },
			{
				picture: PLANE_AT_REST,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: FLIGHT.startsAt + FLIGHT.seconds,
				animate(states, heldSeconds) {
					if (heldSeconds < FLIGHT.startsAt) return;
					paintFlight(states, FLIGHT_COLUMNS * launch(clamp01((heldSeconds - FLIGHT.startsAt) / FLIGHT.seconds)));
				},
			},
		],
	});
}

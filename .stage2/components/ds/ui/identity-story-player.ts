import { CAPTIONS, CHART_ARRIVES_DRAWN, CHART_DRAWN, CHART_STARTED, DOMAIN_GLOBE, ENVELOPE_PICTURE, IDENTITY_STORY_GRID, NAME_BADGE, SEAL_TICKED, SEAL_UNTICKED, paintChart, paintSeal } from '@/components/ds/ui/identity-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One lookup, played as a loop: the four identifiers a brand can be found by melt into one another, a domain's
 * globe, an email's envelope, a name badge and a ticker's chart drawing its line; then the chart melts into a seal,
 * and its tick is cut as the brand they all resolve to is named.
 */

const IDENTIFIER_HOLD_SECONDS = 1.7;
const DRAWING = { startsAt: 0.2, seconds: 1 };
const TICKING = { startsAt: 0.3, seconds: 0.5 };

export function createIdentityStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: IDENTITY_STORY_GRID,
		resting: { beat: 4, heldSeconds: 2 },
		beats: [
			captionedBeat({ picture: DOMAIN_GLOBE, caption: CAPTIONS.domain, holdSeconds: IDENTIFIER_HOLD_SECONDS, isTyped: true }),
			captionedBeat({ picture: ENVELOPE_PICTURE, caption: CAPTIONS.email, holdSeconds: IDENTIFIER_HOLD_SECONDS, isTyped: true }),
			captionedBeat({ picture: NAME_BADGE, caption: CAPTIONS.name, holdSeconds: IDENTIFIER_HOLD_SECONDS, isTyped: true }),
			captionedBeat({
				picture: CHART_STARTED,
				departure: CHART_DRAWN,
				caption: CAPTIONS.ticker,
				holdSeconds: IDENTIFIER_HOLD_SECONDS + 0.3,
				isTyped: true,
				animate: (states, heldSeconds) => void paintChart(states, CHART_ARRIVES_DRAWN + (1 - CHART_ARRIVES_DRAWN) * easeOut(clamp01((heldSeconds - DRAWING.startsAt) / DRAWING.seconds))),
			}),
			captionedBeat({
				picture: SEAL_UNTICKED,
				departure: SEAL_TICKED,
				caption: CAPTIONS.brand,
				holdSeconds: 3.4,
				animate: (states, heldSeconds) => void paintSeal(states, clamp01((heldSeconds - TICKING.startsAt) / TICKING.seconds)),
			}),
		],
	});
}

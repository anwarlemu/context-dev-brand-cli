import { CAPTIONS, DOMAIN_ALONE, DOMAIN_WITH_SUBDOMAINS, LINK_LIMIT_SLOTS, MAX_LINKS, METER_AT_LIMIT, METER_EMPTY, SCOPE_STORY_GRID, SUBDOMAIN_COUNT, paintDomains, paintMeter } from '@/components/ds/ui/scope-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One request's scope, played as a loop: subdomains are switched on and the domain takes each of them in; it melts
 * into a meter that fills with links, slot by slot, and stops at the limit.
 */

const MELT_SECONDS = 1.1;
const TYPING = { startsAt: 0.3, charactersPerSecond: 12 };
const INCLUDING = { afterTypingSeconds: 0.3, everySeconds: 0.45 };
const FILLING = { startsAt: 0.3, everySeconds: 0.16 };
const DETAIL_FADE_SECONDS = 0.3;

const stepsAt = (heldSeconds: number, startsAt: number, everySeconds: number, most: number) => (heldSeconds < startsAt ? 0 : Math.min(most, Math.floor((heldSeconds - startsAt) / everySeconds) + 1));

export function createScopeStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [subdomainsLabel, subdomainsValue, subdomainsDetail] = CAPTIONS.subdomains;
	const [limitLabel, limitValue, limitDetail] = CAPTIONS.limit;
	const includingAt = TYPING.startsAt + typingSeconds(subdomainsValue, TYPING.charactersPerSecond) + INCLUDING.afterTypingSeconds;
	const includedAt = includingAt + (SUBDOMAIN_COUNT - 1) * INCLUDING.everySeconds;
	const limitReachedAt = FILLING.startsAt + (LINK_LIMIT_SLOTS - 1) * FILLING.everySeconds;
	const linksAt = (heldSeconds: number) => stepsAt(heldSeconds, FILLING.startsAt, FILLING.everySeconds, LINK_LIMIT_SLOTS);
	return createBeatStoryPlayer(stage, {
		grid: SCOPE_STORY_GRID,
		resting: { beat: 1, heldSeconds: limitReachedAt + 1 },
		beats: [
			{
				picture: DOMAIN_ALONE,
				departure: DOMAIN_WITH_SUBDOMAINS,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: includedAt + 1.8,
				animate: (states, heldSeconds) => void paintDomains(states, stepsAt(heldSeconds, includingAt, INCLUDING.everySeconds, SUBDOMAIN_COUNT)),
				write(pen, heldSeconds) {
					pen.text(subdomainsLabel);
					pen.type(subdomainsValue, heldSeconds, TYPING);
					pen.text(subdomainsDetail, clamp01((heldSeconds - includingAt) / DETAIL_FADE_SECONDS));
				},
			},
			{
				picture: METER_EMPTY,
				departure: METER_AT_LIMIT,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: limitReachedAt + 2.6,
				animate: (states, heldSeconds) => void paintMeter(states, linksAt(heldSeconds)),
				write(pen, heldSeconds) {
					pen.text(limitLabel);
					pen.text({ ...limitValue, text: String(Math.round((linksAt(heldSeconds) / LINK_LIMIT_SLOTS) * MAX_LINKS)) });
					pen.text(limitDetail, clamp01((heldSeconds - limitReachedAt) / DETAIL_FADE_SECONDS));
				},
			},
		],
	});
}

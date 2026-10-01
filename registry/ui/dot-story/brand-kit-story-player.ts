import { BRAND_KIT_GRID, DOMAIN, DOMAIN_FIELD, KIT_BOX, KIT_LABEL, KIT_PACKED, KIT_TEXTS, KIT_UNPACKED, unpackingOrder } from '@/components/ds/ui/brand-kit-story-scenes';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import { clamp01 } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One brand kit, played as a loop: a domain is typed; its field melts into the kit, a box tied with a band; and the
 * box melts into its contents, four tiles unpacked from the left and named one after another.
 */

const MELT_SECONDS = 1.1;
const FIELD_WIPE_SECONDS = 0.45;
const TYPING = { startsAt: 0.4, charactersPerSecond: 9 };
const UNPACKING_SECONDS = 1.2;
const NAMING = { everySeconds: 0.25, seconds: 0.3 };

export function createBrandKitStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: BRAND_KIT_GRID,
		resting: { beat: 5, heldSeconds: 2.4 },
		beats: [
			{ picture: DOMAIN_FIELD.filled, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.1 },
			{
				picture: DOMAIN_FIELD.empty,
				arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: DOMAIN_FIELD.along },
				holdSeconds: TYPING.startsAt + typingSeconds(DOMAIN, TYPING.charactersPerSecond) + 0.8,
				write: (pen, heldSeconds) => pen.type(DOMAIN, heldSeconds, { ...TYPING, cursorLingers: Infinity }),
			},
			{ picture: DOMAIN_FIELD.filled, arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: DOMAIN_FIELD.along }, holdSeconds: 0.1 },
			{ picture: KIT_BOX, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 1.8, write: (pen) => pen.text(KIT_LABEL) },
			{ picture: KIT_PACKED, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
			{
				picture: KIT_UNPACKED,
				arrival: { kind: 'builds', seconds: UNPACKING_SECONDS, order: unpackingOrder },
				holdSeconds: 3.6,
				write: (pen, heldSeconds) => KIT_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, clamp01((heldSeconds - index * NAMING.everySeconds) / NAMING.seconds)))),
			},
			{ picture: KIT_PACKED, arrival: { kind: 'builds', seconds: 0.5, order: unpackingOrder }, holdSeconds: 0.1 },
		],
	});
}

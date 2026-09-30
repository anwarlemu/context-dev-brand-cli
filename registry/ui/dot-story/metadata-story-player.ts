import { CARDS_ENRICHED, CARDS_FOUND, CARD_TEXTS, ENRICHED_COUNT, METADATA_STORY_GRID, TAG_CAPTION, TAG_PICTURE, enrichedStatus, paintEnriched } from '@/components/ds/ui/metadata-story-scenes';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import { clamp01, easeOut } from '@/components/ds/ui/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * One map's metadata, played as a loop: a tag melts into three mapped URLs, each with a block of rings where its
 * metadata will go; the first two clear and gain a title and description, and the newest stays pending.
 */

const MELT_SECONDS = 1.1;
const DETAIL = { at: 0.5, fadeSeconds: 0.3 };
const ENRICHING = { startsAt: 0.9, everySeconds: 0.9, seconds: 0.4, textAfterSeconds: 0.25, textSeconds: 0.3 };
const ENRICHED_AT = ENRICHING.startsAt + (ENRICHED_COUNT - 1) * ENRICHING.everySeconds + ENRICHING.seconds;

const enrichesAt = (card: number) => (card < ENRICHED_COUNT ? ENRICHING.startsAt + card * ENRICHING.everySeconds : Infinity);

export function createMetadataStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [tagLabel, tagValue, tagDetail] = TAG_CAPTION;
	return createBeatStoryPlayer(stage, {
		grid: METADATA_STORY_GRID,
		resting: { beat: 1, heldSeconds: ENRICHED_AT + 1 },
		beats: [
			{
				picture: TAG_PICTURE,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: 2.4,
				write(pen, heldSeconds) {
					pen.text(tagLabel);
					pen.text(tagValue);
					pen.text(tagDetail, clamp01((heldSeconds - DETAIL.at) / DETAIL.fadeSeconds));
				},
			},
			{
				picture: CARDS_FOUND,
				departure: CARDS_ENRICHED,
				arrival: { kind: 'melts', seconds: MELT_SECONDS },
				holdSeconds: ENRICHED_AT + 3.2,
				animate: (states, heldSeconds) =>
					void paintEnriched(
						states,
						CARD_TEXTS.map((_, card) => easeOut(clamp01((heldSeconds - enrichesAt(card)) / ENRICHING.seconds)))
					),
				write(pen, heldSeconds) {
					CARD_TEXTS.forEach(({ url, status, title, description }, card) => {
						const written = clamp01((heldSeconds - enrichesAt(card) - ENRICHING.textAfterSeconds) / ENRICHING.textSeconds);
						pen.text(url);
						pen.text(status, 1 - written);
						pen.text(enrichedStatus(status), written);
						pen.text(title, written);
						pen.text(description, written);
					});
				},
			},
		],
	});
}

import {
	CONFIDENT_SEGMENTS,
	EXTRACT_CAPTION,
	METER_SEGMENTS,
	MONITOR_WAYS_GRID,
	NEW_PAGE_PICTURE,
	PAGE_CAPTIONS,
	PAGE_CHANGED,
	PAGE_UNCHANGED,
	PROMPT_FIELD,
	PROMPT_FILLED,
	PROMPT_TEXT,
	RECORD_SCORED,
	RECORD_UNSCORED,
	SITEMAP_AFTER,
	SITEMAP_BEFORE,
	SITEMAP_CAPTIONS,
	TEXT_DIFF,
	alongPrompt,
	paintRecord,
	paintSitemapList,
	paintWatchedPage,
} from '@/components/ds/ui/monitor-ways-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer, typingSeconds } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

const MELT_SECONDS = 1.1;

// The page is scraped twice; the second scrape finds the line changed as its scan passes it.
const SCRAPES = { startsAt: 0.4, seconds: 1.1, times: 2, changeSeenAt: 0.55 };

/** A page monitor, played as a loop: the page is re-scraped until a line of it changes, then melts into that line's diff. */
export function createPageMonitorStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const scrapesAt = (heldSeconds: number) => (heldSeconds - SCRAPES.startsAt) / SCRAPES.seconds;
	return createBeatStoryPlayer(stage, {
		grid: MONITOR_WAYS_GRID,
		resting: { beat: 1, heldSeconds: 2 },
		beats: [
			captionedBeat({
				picture: PAGE_UNCHANGED,
				departure: PAGE_CHANGED,
				caption: PAGE_CAPTIONS.watching,
				holdSeconds: SCRAPES.startsAt + SCRAPES.seconds * SCRAPES.times + 0.7,
				isTyped: true,
				animate(states, heldSeconds) {
					const scrapes = scrapesAt(heldSeconds);
					paintWatchedPage(states, scrapes >= 0 && scrapes < SCRAPES.times ? scrapes % 1 : 0, scrapes >= SCRAPES.times - 1 + SCRAPES.changeSeenAt);
				},
			}),
			captionedBeat({ picture: TEXT_DIFF, caption: PAGE_CAPTIONS.changed, holdSeconds: 3 }),
		],
	});
}

const LISTING = { removedAt: 1, addedAt: 1.7 };

/** A sitemap monitor, played as a loop: its list of URLs loses one and gains one, then melts into the new page. */
export function createSitemapMonitorStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: MONITOR_WAYS_GRID,
		resting: { beat: 0, heldSeconds: LISTING.addedAt + 1 },
		beats: [
			{
				...captionedBeat({ picture: SITEMAP_BEFORE, departure: SITEMAP_AFTER, caption: SITEMAP_CAPTIONS.watching, holdSeconds: LISTING.addedAt + 2, animate: (states, heldSeconds) => void paintSitemapList(states, heldSeconds >= LISTING.removedAt, heldSeconds >= LISTING.addedAt) }),
				write: (pen, heldSeconds) => (heldSeconds >= LISTING.addedAt ? SITEMAP_CAPTIONS.changed : SITEMAP_CAPTIONS.watching).forEach((text) => pen.text(text)),
			},
			captionedBeat({ picture: NEW_PAGE_PICTURE, caption: SITEMAP_CAPTIONS.added, holdSeconds: 2.6, isTyped: true }),
		],
	});
}

const PROMPT_TYPING = { startsAt: 0.4, charactersPerSecond: 11 };
const SCORING = { startsAt: 0.5, everySeconds: 0.12 };
const FIELD_WIPE_SECONDS = 0.45;

/** An extract monitor, played as a loop: what to watch is typed in plain words, and melts into the record read from the page, scored. */
export function createExtractMonitorStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	const [label, score, detail] = EXTRACT_CAPTION;
	const scoredAt = (heldSeconds: number) => (heldSeconds < SCORING.startsAt ? 0 : Math.min(CONFIDENT_SEGMENTS, Math.floor((heldSeconds - SCORING.startsAt) / SCORING.everySeconds) + 1));
	return createBeatStoryPlayer(stage, {
		grid: MONITOR_WAYS_GRID,
		resting: { beat: 3, heldSeconds: SCORING.startsAt + CONFIDENT_SEGMENTS * SCORING.everySeconds + 0.8 },
		beats: [
			{ picture: PROMPT_FILLED, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.1 },
			{
				picture: PROMPT_FIELD,
				arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: alongPrompt },
				holdSeconds: PROMPT_TYPING.startsAt + typingSeconds(PROMPT_TEXT, PROMPT_TYPING.charactersPerSecond) + 0.9,
				write: (pen, heldSeconds) => pen.type(PROMPT_TEXT, heldSeconds, { ...PROMPT_TYPING, cursorLingers: Infinity }),
			},
			{ picture: PROMPT_FILLED, arrival: { kind: 'builds', seconds: FIELD_WIPE_SECONDS, order: alongPrompt }, holdSeconds: 0.1 },
			{
				...captionedBeat({ picture: RECORD_UNSCORED, departure: RECORD_SCORED, caption: EXTRACT_CAPTION, holdSeconds: SCORING.startsAt + CONFIDENT_SEGMENTS * SCORING.everySeconds + 2.8, animate: (states, heldSeconds) => void paintRecord(states, scoredAt(heldSeconds)) }),
				write(pen, heldSeconds) {
					pen.text(label);
					pen.text({ ...score, text: (scoredAt(heldSeconds) / METER_SEGMENTS).toFixed(2) });
					pen.text(detail);
				},
			},
		],
	});
}

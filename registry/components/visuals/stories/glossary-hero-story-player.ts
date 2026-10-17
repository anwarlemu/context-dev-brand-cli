import { BOOK_CAPTION, BOOK_LINE_COUNT, BOOK_UNREAD, ENTRIES, ENTRY_CAPTIONS, TERMS, paintBook, paintEntry } from '@/components/visuals/stories/glossary-hero-story-scenes';
import { HERO_STORY_GRID, stepAt } from '@/components/visuals/stories/hero-story-kit';
import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

/**
 * The glossary, played as a loop: a line of the open book is read at a time, then the book melts into a single
 * entry, and one term after another is looked up on it.
 */

const READING = { startsAt: 0.4, everySeconds: 0.2 };
const READ_AT = READING.startsAt + BOOK_LINE_COUNT * READING.everySeconds;
const LOOKING_UP = { startsAt: 0, everySeconds: 1.5 };
const TYPING = { startsAfter: 0.15, charactersPerSecond: 14 };
const lastTerm = TERMS.length - 1;

// Past the last line nothing is being read, so the book leaves as it arrived.
const readingAt = (heldSeconds: number) => {
	const line = stepAt(heldSeconds, READING, BOOK_LINE_COUNT);
	return line === BOOK_LINE_COUNT ? -1 : line;
};

export function createGlossaryHeroStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: HERO_STORY_GRID,
		resting: { beat: 0, heldSeconds: READ_AT + 0.5 },
		beats: [
			captionedBeat({ picture: BOOK_UNREAD, caption: BOOK_CAPTION, holdSeconds: READ_AT + 1.2, isTyped: true, animate: (states, heldSeconds) => void paintBook(states, readingAt(heldSeconds)) }),
			{
				...captionedBeat({ picture: ENTRIES[0], departure: ENTRIES[lastTerm], caption: ENTRY_CAPTIONS[0], holdSeconds: TERMS.length * LOOKING_UP.everySeconds + 0.6, animate: (states, heldSeconds) => void paintEntry(states, stepAt(heldSeconds, LOOKING_UP, lastTerm)) }),
				write(pen, heldSeconds) {
					const term = stepAt(heldSeconds, LOOKING_UP, lastTerm);
					const [label, word, detail] = ENTRY_CAPTIONS[term];
					pen.text(label);
					pen.type(word, heldSeconds, { startsAt: term * LOOKING_UP.everySeconds + TYPING.startsAfter, charactersPerSecond: TYPING.charactersPerSecond });
					pen.text(detail);
				},
			},
		],
	});
}

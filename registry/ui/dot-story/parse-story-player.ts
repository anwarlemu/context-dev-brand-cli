import { CAPTIONS, MARKDOWN_FILE, PARSE_STORY_GRID, PDF, paintOcr } from '@/components/ds/ui/parse-story-scenes';
import { captionedBeat } from '@/components/ds/ui/story-caption';
import { createBeatStoryPlayer } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/ds/ui/dot-story-player';

/** One parse, played as a loop: a bar of OCR reads down an uploaded PDF twice, and the PDF melts into Markdown. */

const OCR = { startsAt: 0.5, seconds: 1.1, times: 2 };

export function createParseStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: PARSE_STORY_GRID,
		resting: { beat: 1, heldSeconds: 2 },
		beats: [
			captionedBeat({
				picture: PDF,
				caption: CAPTIONS.upload,
				holdSeconds: OCR.startsAt + OCR.seconds * OCR.times + 0.5,
				animate(states, heldSeconds) {
					const reads = (heldSeconds - OCR.startsAt) / OCR.seconds;
					if (reads >= 0 && reads < OCR.times) paintOcr(states, reads % 1);
				},
			}),
			captionedBeat({ picture: MARKDOWN_FILE, caption: CAPTIONS.parsed, holdSeconds: 3.2, isTyped: true }),
		],
	});
}

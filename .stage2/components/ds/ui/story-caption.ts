import type { DotGrid } from '@/components/ds/ui/dot-morph-dots';
import { typingSeconds, type StoryBeat } from '@/components/ds/ui/dot-story-beats';
import type { DotStoryText } from '@/components/ds/ui/dot-story-player';

const LABEL = { row: 12.5, size: 14 };
const VALUE = { row: 17, size: 34 };
const DETAIL = { row: 21.5, size: 14 };

/** The three lines set beside a story's picture: a quiet label, the word or figure that matters, and a line of detail. */
export function storyCaption({ pitch }: DotGrid, leftColumn: number, label: string, value: string, detail: string): DotStoryText[] {
	const x = leftColumn * pitch;
	// Doto sits a third of its size below the middle of the row it is set on.
	const baselineOn = (row: number, size: number) => (row + 0.5) * pitch + size / 3;
	return [
		{ text: label, x, y: baselineOn(LABEL.row, LABEL.size), size: LABEL.size, weight: 700, muted: true },
		{ text: value, x, y: baselineOn(VALUE.row, VALUE.size), size: VALUE.size, weight: 900 },
		{ text: detail, x, y: baselineOn(DETAIL.row, DETAIL.size), size: DETAIL.size, weight: 700, muted: true },
	];
}

const MELT_SECONDS = 1.1;
const TYPING = { startsAt: 0.15, charactersPerSecond: 14 };
const DETAIL_FADE_SECONDS = 0.3;

interface CaptionedBeat extends Pick<StoryBeat, 'picture' | 'holdSeconds' | 'animate' | 'departure'> {
	caption: DotStoryText[];
	/** Types the caption's value rather than fading it in; its detail follows once it is typed. */
	isTyped?: boolean;
}

/** A beat that melts in and holds with its caption beside it. */
export function captionedBeat({ caption: [label, value, detail], isTyped = false, ...beat }: CaptionedBeat): StoryBeat {
	const detailAt = isTyped ? TYPING.startsAt + typingSeconds(value, TYPING.charactersPerSecond) : TYPING.startsAt;
	return {
		...beat,
		arrival: { kind: 'melts', seconds: MELT_SECONDS },
		write(pen, heldSeconds) {
			pen.text(label);
			if (isTyped) pen.type(value, heldSeconds, TYPING);
			else pen.text(value);
			pen.text(detail, Math.min(1, Math.max(0, (heldSeconds - detailAt) / DETAIL_FADE_SECONDS)));
		},
	};
}

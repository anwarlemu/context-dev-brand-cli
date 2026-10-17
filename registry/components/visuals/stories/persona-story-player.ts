import { captionedBeat } from '@/components/visuals/dot-engine/story-caption';
import { DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import { cellIndexIn, clamp01, hasRippleReached } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';
import type { PersonaGlyphName } from '@/components/visuals/stories/persona-glyphs';
import { PERSONA_STORY_GRID, PICTURE_CENTER, WINDOW_EMPTY, WINDOW_FETCHED, paintWindow, personaCaption, personaPictures, type PersonaStoryCaptions, type PersonaStoryPhase } from '@/components/visuals/stories/persona-story-scenes';

/**
 * One team's story, played as a loop: what it builds stands, then crumbles to rings as the challenge gets to it; it
 * melts into the window the request is answered in, which fills as the content comes in; and that melts into what
 * the API gives the team, which holds before it all starts again.
 */

const CRUMBLE = { startsAt: 0.9, seconds: 1.2 };
const FETCH = { startsAt: 0.5, seconds: 1.6 };
const HOLD = { challenge: CRUMBLE.startsAt + CRUMBLE.seconds + 1.1, solution: FETCH.startsAt + FETCH.seconds + 1, impact: 3.2 };
// The glyphs are mostly lines two dots wide, which a melt thins to almost nothing halfway through; a wave from the
// middle of the picture swaps them in whole.
const GLYPH_ARRIVAL = { kind: 'waves', seconds: 0.9, origin: PICTURE_CENTER } as const;

const cellIndex = cellIndexIn(PERSONA_STORY_GRID);

// The dots crumble in no visible order, the way the brand's dot shader speckles its imagery.
function crumbleOrder(column: number, row: number) {
	const hash = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
	return hash - Math.floor(hash);
}

const BEAT_PHASES: PersonaStoryPhase[] = ['challenge', 'solution', 'impact'];

export function createPersonaStoryPlayer(stage: DotStoryStage, name: PersonaGlyphName, captions: PersonaStoryCaptions, onPhase?: (phase: PersonaStoryPhase) => void): DotStoryPlayer {
	const { built, broken, outcome } = personaPictures(name);
	const standing = built.cells.filter((cell) => cell.filled);

	const crumble = (states: Uint8Array, heldSeconds: number) => {
		const crumbled = clamp01((heldSeconds - CRUMBLE.startsAt) / CRUMBLE.seconds);
		for (const cell of standing) {
			if (hasRippleReached(crumbleOrder(cell.column, cell.row), crumbled)) states[cellIndex(cell)] = DOT_HOLLOW;
		}
	};

	return createBeatStoryPlayer(stage, {
		grid: PERSONA_STORY_GRID,
		resting: { beat: 2, heldSeconds: 1 },
		onBeat: (beat) => onPhase?.(BEAT_PHASES[beat]),
		beats: [
			{ ...captionedBeat({ picture: built, departure: broken, caption: personaCaption('challenge', captions.challenge), holdSeconds: HOLD.challenge, animate: crumble }), arrival: GLYPH_ARRIVAL },
			captionedBeat({ picture: WINDOW_EMPTY, departure: WINDOW_FETCHED, caption: personaCaption('solution', captions.solution), holdSeconds: HOLD.solution, isTyped: true, animate: (states, heldSeconds) => void paintWindow(states, clamp01((heldSeconds - FETCH.startsAt) / FETCH.seconds)) }),
			{ ...captionedBeat({ picture: outcome, caption: personaCaption('impact', captions.impact), holdSeconds: HOLD.impact }), arrival: GLYPH_ARRIVAL },
		],
	});
}

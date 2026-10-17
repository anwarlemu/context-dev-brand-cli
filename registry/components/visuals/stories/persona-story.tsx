'use client';

import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';
import type { PersonaGlyphName } from '@/components/visuals/stories/persona-glyphs';
import { PERSONA_STORY_GRID, personaResting, type PersonaStoryCaptions, type PersonaStoryPhase } from '@/components/visuals/stories/persona-story-scenes';
import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * A persona card's story: what the team builds crumbles under its challenge, a request is answered, and the team has
 * what the API gives it. With reduced motion it shows the outcome. `onPhase` hears which of the three is playing.
 */
export function PersonaStory({ name, captions, onPhase, className }: { name: PersonaGlyphName; captions: PersonaStoryCaptions; onPhase?: (phase: PersonaStoryPhase) => void; className?: string }) {
	const resting = useMemo(() => personaResting(name, captions), [name, captions]);
	// Read through a ref, so a new callback each render doesn't reload the story.
	const onPhaseRef = useRef(onPhase);
	useEffect(() => {
		onPhaseRef.current = onPhase;
	}, [onPhase]);
	const load = useCallback<LoadDotStory>(
		async (stage) => {
			const { createPersonaStoryPlayer } = await import('@/components/visuals/stories/persona-story-player');
			return createPersonaStoryPlayer(stage, name, captions, (phase) => onPhaseRef.current?.(phase));
		},
		[name, captions]
	);
	return <DotStory grid={PERSONA_STORY_GRID} resting={resting} load={load} className={className} />;
}

'use client';

import { AUTOFILL_RESTING, AUTOFILL_STORY_GRID } from '@/components/ds/ui/autofill-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/ds/ui/dot-story';

const loadAutofillStory: LoadDotStory = async (stage) => {
	const { createAutofillStoryPlayer } = await import('@/components/ds/ui/autofill-story-player');
	return createAutofillStoryPlayer(stage);
};

/**
 * The "Autofill onboarding forms" card's picture: a domain is typed, a pointer clicks Auto-fill, and the signup form
 * fills itself field by field. With reduced motion it shows the form filled.
 */
export function AutofillStory({ className }: { className?: string }) {
	return <DotStory grid={AUTOFILL_STORY_GRID} resting={AUTOFILL_RESTING} load={loadAutofillStory} className={className} />;
}

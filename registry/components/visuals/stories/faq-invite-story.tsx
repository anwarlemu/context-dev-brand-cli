'use client';

import { FAQ_INVITE_RESTING, FAQ_INVITE_STORY_GRID } from '@/components/visuals/stories/faq-invite-story-scenes';
import { DotStory, type LoadDotStory } from '@/components/visuals/dot-engine/dot-story';

const loadFaqInviteStory: LoadDotStory = async (stage) => {
	const { createFaqInviteStoryPlayer } = await import('@/components/visuals/stories/faq-invite-story-player');
	return createFaqInviteStoryPlayer(stage);
};

/**
 * The picture under the FAQ intro: a banner asks for questions and becomes a paper plane that flies from the bottom left
 * off to the top right. With reduced motion it shows the banner.
 */
export function FaqInviteStory({ className }: { className?: string }) {
	return <DotStory grid={FAQ_INVITE_STORY_GRID} resting={FAQ_INVITE_RESTING} load={loadFaqInviteStory} className={className} />;
}

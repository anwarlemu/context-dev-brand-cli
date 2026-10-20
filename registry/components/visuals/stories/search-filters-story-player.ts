import { CALENDAR_ONLY, DAY_COLUMNS, FILTERED, FILTER_GROUPS, FILTER_TEXTS, FRESHNESS_LABEL, FRESHNESS_VALUE, LAST_WEEK_PICKED, LAST_WEEK_ROW, SEARCH_FILTERS_STORY_GRID } from '@/components/visuals/stories/search-filters-story-scenes';
import { NEVER, fadedInAt, paintRevealed, revealSchedule } from '@/components/visuals/stories/story-reveal';
import { createBeatStoryPlayer } from '@/components/visuals/dot-engine/dot-story-beats';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

const CLEAR_SECONDS = 0.8;
const TYPING = { startsAt: 0.4, charactersPerSecond: 14 };
const PICK = { startsAt: 0.5, everyDaySeconds: 0.12 };
const FILTERS = { startsAt: PICK.startsAt + DAY_COLUMNS.length * PICK.everyDaySeconds + 0.5, everyGroupSeconds: 0.5, textDelay: 0.1 };
const HOLD_SECONDS = FILTERS.startsAt + FILTER_GROUPS.length * FILTERS.everyGroupSeconds + 2.4;

const { columns } = SEARCH_FILTERS_STORY_GRID;
const groupStartsAt = (index: number) => FILTERS.startsAt + index * FILTERS.everyGroupSeconds;

const PICKED_AT = revealSchedule(SEARCH_FILTERS_STORY_GRID, (column, row) => {
	const day = DAY_COLUMNS.indexOf(column);
	return row === LAST_WEEK_ROW && day >= 0 ? PICK.startsAt + day * PICK.everyDaySeconds : NEVER;
});

const FILTERED_AT = revealSchedule(SEARCH_FILTERS_STORY_GRID, (_, row) => {
	const group = FILTER_GROUPS.findIndex(({ top, bottom }) => row >= top && row <= bottom);
	return group < 0 ? NEVER : groupStartsAt(group);
});

export function createSearchFiltersStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: SEARCH_FILTERS_STORY_GRID,
		resting: { beat: 0, heldSeconds: HOLD_SECONDS },
		beats: [
			{
				picture: CALENDAR_ONLY,
				departure: FILTERED,
				arrival: { kind: 'builds', seconds: CLEAR_SECONDS, order: (column) => 1 - column / columns },
				holdSeconds: HOLD_SECONDS,
				animate(states, heldSeconds) {
					paintRevealed(states, LAST_WEEK_PICKED.states, PICKED_AT, heldSeconds);
					paintRevealed(states, FILTERED.states, FILTERED_AT, heldSeconds);
				},
				write(pen, heldSeconds) {
					pen.text(FRESHNESS_LABEL);
					pen.type(FRESHNESS_VALUE, heldSeconds, TYPING);
					FILTER_TEXTS.forEach((texts, index) => texts.forEach((text) => pen.text(text, fadedInAt(heldSeconds, groupStartsAt(index) + FILTERS.textDelay))));
				},
			},
		],
	});
}

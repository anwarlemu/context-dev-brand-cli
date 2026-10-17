import { storyCaption } from '@/components/visuals/dot-engine/story-caption';
import type { DotGrid } from '@/components/visuals/dot-engine/dot-morph-dots';
import type { StoryPicture } from '@/components/visuals/dot-engine/dot-story-beats';
import { cellsOfStates } from '@/components/visuals/dot-engine/dot-story-cells';

/** What the page-hero stories share: the hero monitor's 58 by 38 screen, and the caption column beside each picture. */

// The monitor's screen has no backdrop pattern to clear, so the dots need no halo of their own.
export const HERO_STORY_GRID: DotGrid = { columns: 58, rows: 38, pitch: 10, dotRadius: 3.2, ringStroke: 1, haloRadius: 0 };
const CAPTION_COLUMN = 34;

export const blankScreen = () => new Uint8Array(HERO_STORY_GRID.columns * HERO_STORY_GRID.rows);
export const pictureOfStates = (states: Uint8Array): StoryPicture => ({ states, cells: cellsOfStates(HERO_STORY_GRID, states) });
export const between = (value: number, from: number, to: number) => value >= from && value <= to;
export const cellAt = (column: number, row: number) => row * HERO_STORY_GRID.columns + column;
export const heroCaption = (label: string, value: string, detail: string) => storyCaption(HERO_STORY_GRID, CAPTION_COLUMN, label, value, detail);

/** Which step of a run a hold has reached: -1 before it starts, then 0 up to `last`. */
export const stepAt = (heldSeconds: number, { startsAt, everySeconds }: { startsAt: number; everySeconds: number }, last: number) => (heldSeconds < startsAt ? -1 : Math.min(last, Math.floor((heldSeconds - startsAt) / everySeconds)));

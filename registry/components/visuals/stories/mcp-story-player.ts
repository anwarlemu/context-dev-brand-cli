import { ANSWERED, ASKED, ASSISTANT_LABEL, CABLE, CONNECTION_TEXTS, CONNECTOR, MCP_STORY_GRID, PLUGGED_IN, PROMPT, QUESTION_BUBBLE, REPLY_LINES, UNPLUGGED } from '@/components/visuals/stories/mcp-story-scenes';
import { NEVER, fadedInAt, paintRevealed, revealSchedule } from '@/components/visuals/stories/story-reveal';
import { DOT_FILLED, DOT_HOLLOW } from '@/components/visuals/dot-engine/dot-morph-dots';
import { createBeatStoryPlayer, typingSeconds } from '@/components/visuals/dot-engine/dot-story-beats';
import { isInDotBox } from '@/components/visuals/dot-engine/dot-story-cells';
import type { DotStoryPlayer, DotStoryStage } from '@/components/visuals/dot-engine/dot-story-player';

const CLEAR_SECONDS = 0.8;
const PLUG = { startsAt: 0.3, secondsPerColumn: 0.05 };
const CONNECTED_AT = PLUG.startsAt + (CABLE.right - CABLE.left) * PLUG.secondsPerColumn;
const TYPING = { startsAt: CONNECTED_AT + 0.4, charactersPerSecond: 14, cursorLingers: 0.2 };
const SENT_AT = TYPING.startsAt + typingSeconds(PROMPT, TYPING.charactersPerSecond) + 0.3;
const PULSE = { outAt: SENT_AT + 0.3, backAt: SENT_AT + 1.3, seconds: 0.8 };
const REPLY = { startsAt: PULSE.backAt + PULSE.seconds + 0.2, everyLineSeconds: 0.2, secondsPerColumn: 0.02 };
const HOLD_SECONDS = REPLY.startsAt + REPLY_LINES.length * REPLY.everyLineSeconds + 2.6;

const { columns } = MCP_STORY_GRID;

const PLUGGED_IN_AT = revealSchedule(MCP_STORY_GRID, (column, row) => (isInDotBox(CONNECTOR, column, row) ? PLUG.startsAt + (column - CABLE.left) * PLUG.secondsPerColumn : NEVER));

const ASKED_AT = revealSchedule(MCP_STORY_GRID, (column, row) => {
	const bubble = QUESTION_BUBBLE.find((line) => line.row === row && column >= line.left && column <= line.right);
	return bubble ? SENT_AT + (bubble.right - column) * REPLY.secondsPerColumn : NEVER;
});

const ANSWERED_AT = revealSchedule(MCP_STORY_GRID, (column, row) => {
	const line = REPLY_LINES.findIndex((candidate) => candidate.row === row && column >= candidate.left && column <= candidate.right);
	return line < 0 ? NEVER : REPLY.startsAt + line * REPLY.everyLineSeconds + (column - REPLY_LINES[line].left) * REPLY.secondsPerColumn;
});

function pulseAlongCable(heldSeconds: number) {
	const outward = (heldSeconds - PULSE.outAt) / PULSE.seconds;
	if (outward >= 0 && outward < 1) return outward;
	const back = (heldSeconds - PULSE.backAt) / PULSE.seconds;
	if (back >= 0 && back < 1) return 1 - back;
	return null;
}

function paintPulse(states: Uint8Array, heldSeconds: number) {
	const along = pulseAlongCable(heldSeconds);
	if (along === null) return;
	const column = Math.round(CABLE.left + along * (CABLE.right - CABLE.left));
	const cell = CABLE.row * columns + column;
	if (states[cell] === DOT_HOLLOW) states[cell] = DOT_FILLED;
}

export function createMcpStoryPlayer(stage: DotStoryStage): DotStoryPlayer {
	return createBeatStoryPlayer(stage, {
		grid: MCP_STORY_GRID,
		resting: { beat: 0, heldSeconds: HOLD_SECONDS },
		beats: [
			{
				picture: UNPLUGGED,
				departure: ANSWERED,
				arrival: { kind: 'builds', seconds: CLEAR_SECONDS, order: (column) => column / columns },
				holdSeconds: HOLD_SECONDS,
				animate(states, heldSeconds) {
					paintRevealed(states, PLUGGED_IN.states, PLUGGED_IN_AT, heldSeconds);
					paintRevealed(states, ASKED.states, ASKED_AT, heldSeconds);
					paintRevealed(states, ANSWERED.states, ANSWERED_AT, heldSeconds);
					paintPulse(states, heldSeconds);
				},
				write(pen, heldSeconds) {
					pen.text(ASSISTANT_LABEL);
					CONNECTION_TEXTS.forEach((text) => pen.text(text, fadedInAt(heldSeconds, CONNECTED_AT)));
					if (heldSeconds < SENT_AT) pen.type(PROMPT, heldSeconds, TYPING);
					else pen.text(PROMPT, 1 - fadedInAt(heldSeconds, SENT_AT));
				},
			},
		],
	});
}

import { BOX_RIM_ROW, CLOSED_BOX, CLOSED_ENVELOPE, ENVELOPE_FLAP_ROW, OPEN_BOX, OPEN_ENVELOPE, SETUP_STORY_GRID, TERMINAL_BLANK, TERMINAL_BOUNDS, TERMINAL_SCREEN, TERMINAL_TITLE_ROW, TERMINAL_WINDOW, type SetupScene } from '@/components/ds/ui/setup-story-scenes';
import { createGlyphShader, drawGlyphCells } from '@/components/ds/ui/dot-glyph-morph';
import { DOT_STORY_MUTED_TEXT_COLOR, DOT_STORY_TEXT_COLOR, createDotStoryPlayer, type DotStoryPlayer, type DotStoryStage } from '@/components/ds/ui/dot-story-player';

/**
 * Plays the setup story as one loop. A picture that changes in place (the envelope and the box opening, the terminal's
 * screen wiping) ripples out from its hinge, the way a flap lifts; a picture that becomes something else melts into it.
 */

interface Opening {
	kind: 'opens';
	seconds: number;
	hingeRow: number;
}

interface Melting {
	kind: 'melts';
	seconds: number;
}

interface Beat {
	scene: SetupScene;
	arrival: Opening | Melting;
	holdSeconds: number;
}

const OPEN_SECONDS = 0.7;
const WIPE_SECONDS = 0.5;
const MELT_SECONDS = 1.1;

const BEATS: Beat[] = [
	{ scene: CLOSED_ENVELOPE, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 1.2 },
	{ scene: OPEN_ENVELOPE, arrival: { kind: 'opens', seconds: OPEN_SECONDS, hingeRow: ENVELOPE_FLAP_ROW }, holdSeconds: 1.5 },
	{ scene: TERMINAL_BLANK, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 0.2 },
	{ scene: TERMINAL_WINDOW, arrival: { kind: 'opens', seconds: WIPE_SECONDS, hingeRow: TERMINAL_TITLE_ROW }, holdSeconds: 3.2 },
	{ scene: TERMINAL_BLANK, arrival: { kind: 'opens', seconds: WIPE_SECONDS, hingeRow: TERMINAL_TITLE_ROW }, holdSeconds: 0.1 },
	{ scene: CLOSED_BOX, arrival: { kind: 'melts', seconds: MELT_SECONDS }, holdSeconds: 1 },
	{ scene: OPEN_BOX, arrival: { kind: 'opens', seconds: OPEN_SECONDS, hingeRow: BOX_RIM_ROW }, holdSeconds: 1.8 },
];
const TERMINAL_BEAT = BEATS.findIndex((beat) => beat.scene === TERMINAL_WINDOW);
const LOOP_SECONDS = BEATS.reduce((total, beat) => total + beat.arrival.seconds + beat.holdSeconds, 0);

// The last dot to open flips this far into the arrival, leaving the rest for it to settle.
const RIPPLE_SHARE = 0.7;

const KEY_LABEL = 'API KEY';
const API_KEY = 'ctx_9f2a7c4e1b8d';
const LABEL_FONT_SIZE = 20;
const KEY_FONT_SIZE = 26;
const TEXT_FADE_SECONDS = 0.25;
const TYPING_STARTS_AFTER_SECONDS = 0.35;
const CHARACTERS_PER_SECOND = 14;
const CURSOR_BLINKS_PER_SECOND = 1.4;
const CURSOR_GAP = 3;

interface Moment {
	beat: number;
	/** 0 to 1 while the beat's picture arrives; 1 once it holds. */
	arrival: number;
	heldSeconds: number;
}

function momentAt(storySeconds: number): Moment {
	let remaining = storySeconds % LOOP_SECONDS;
	for (let beat = 0; beat < BEATS.length; beat++) {
		const { arrival, holdSeconds } = BEATS[beat];
		if (remaining < arrival.seconds) return { beat, arrival: remaining / arrival.seconds, heldSeconds: 0 };
		remaining -= arrival.seconds;
		if (remaining < holdSeconds) return { beat, arrival: 1, heldSeconds: remaining };
		remaining -= holdSeconds;
	}
	return { beat: 0, arrival: 0, heldSeconds: 0 };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const previousBeat = (beat: number) => BEATS[(beat + BEATS.length - 1) % BEATS.length];

export function createSetupStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const { columns, rows, pitch } = SETUP_STORY_GRID;
	const opening = new Uint8Array(columns * rows);
	const farthestRow = (hingeRow: number) => Math.max(hingeRow, rows - 1 - hingeRow);

	const melts = BEATS.map((beat, index) =>
		beat.arrival.kind === 'melts'
			? createGlyphShader({
					grid: SETUP_STORY_GRID,
					box: { left: 0, top: 0, cellsPerSide: Math.max(columns, rows) },
					cells: previousBeat(index).scene.cells,
					drawTarget: (target) => drawGlyphCells(target, beat.scene.cells, pitch),
				})
			: null
	);

	const labelFont = `700 ${LABEL_FONT_SIZE}px ${fontFamily}`;
	const keyFont = `900 ${KEY_FONT_SIZE}px ${fontFamily}`;
	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before the terminal first shows.
	void document.fonts.load(labelFont, KEY_LABEL);
	void document.fonts.load(keyFont, API_KEY);

	const statesAt = ({ beat, arrival }: Moment) => {
		const { scene, arrival: style } = BEATS[beat];
		if (arrival >= 1) return scene.states;
		if (style.kind === 'melts') return melts[beat]!({ morph: arrival, spin: 0 });

		const before = previousBeat(beat).scene.states;
		const reach = (arrival / RIPPLE_SHARE) * farthestRow(style.hingeRow);
		for (let cell = 0; cell < opening.length; cell++) {
			const distance = Math.abs(Math.floor(cell / columns) - style.hingeRow);
			opening[cell] = distance <= reach ? scene.states[cell] : before[cell];
		}
		return opening;
	};

	// The clear screen has no dots in it to carry a halo, so the backdrop is painted out from under it in one piece.
	const isScreenClearAt = ({ beat, arrival }: Moment) => beat === TERMINAL_BEAT || (beat === (TERMINAL_BEAT + 1) % BEATS.length && arrival < 1);

	const clearScreen = (context: CanvasRenderingContext2D) => {
		context.fillStyle = surfaceColor;
		context.fillRect(TERMINAL_BOUNDS.left * pitch, TERMINAL_BOUNDS.top * pitch, (TERMINAL_BOUNDS.right - TERMINAL_BOUNDS.left + 1) * pitch, (TERMINAL_BOUNDS.bottom - TERMINAL_BOUNDS.top + 1) * pitch);
	};

	// The key is only there while the screen is clear: it types itself once the screen has wiped and leaves as it refills.
	const textPresenceAt = ({ beat, arrival, heldSeconds }: Moment) => {
		if (beat === TERMINAL_BEAT) return arrival < 1 ? 0 : clamp01(heldSeconds / TEXT_FADE_SECONDS);
		if (beat === (TERMINAL_BEAT + 1) % BEATS.length && arrival < 1) return 1 - clamp01((arrival * BEATS[beat].arrival.seconds) / TEXT_FADE_SECONDS);
		return 0;
	};

	const drawKey = (context: CanvasRenderingContext2D, moment: Moment, presence: number) => {
		const left = TERMINAL_SCREEN.left * pitch;
		const width = (TERMINAL_SCREEN.right + 1) * pitch - left;
		const top = TERMINAL_SCREEN.top * pitch;
		const height = (TERMINAL_SCREEN.bottom + 1) * pitch - top;
		const isLeaving = moment.beat !== TERMINAL_BEAT;
		const typedSeconds = isLeaving ? Infinity : moment.heldSeconds - TYPING_STARTS_AFTER_SECONDS;
		const typed = API_KEY.slice(0, Math.max(0, Math.min(API_KEY.length, Math.floor(typedSeconds * CHARACTERS_PER_SECOND))));
		const isTyping = typed.length < API_KEY.length;

		context.fillStyle = DOT_STORY_MUTED_TEXT_COLOR;
		context.textBaseline = 'middle';
		context.textAlign = 'left';

		context.font = labelFont;
		context.globalAlpha = presence;
		context.fillText(KEY_LABEL, left, top + height * 0.3);
		context.fillStyle = DOT_STORY_TEXT_COLOR;

		context.font = keyFont;
		const fullWidth = context.measureText(API_KEY).width + CURSOR_GAP + KEY_FONT_SIZE * 0.5;
		const fit = Math.min(1, width / fullWidth);
		context.save();
		context.translate(left, top + height * 0.62);
		context.scale(fit, fit);
		context.globalAlpha = presence;
		context.fillText(typed, 0, 0);
		const isCursorLit = isTyping || Math.floor(typedSeconds * CURSOR_BLINKS_PER_SECOND * 2) % 2 === 0;
		if (isCursorLit && !isLeaving) context.fillRect(context.measureText(typed).width + CURSOR_GAP, -KEY_FONT_SIZE * 0.42, KEY_FONT_SIZE * 0.5, KEY_FONT_SIZE * 0.84);
		context.restore();
		context.globalAlpha = 1;
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: SETUP_STORY_GRID,
		// The closed envelope at rest is the picture the static art shows.
		resting: { states: CLOSED_ENVELOPE.states, atSeconds: BEATS[0].arrival.seconds },
		frameAt(storySeconds) {
			const moment = momentAt(storySeconds);
			const presence = textPresenceAt(moment);
			return {
				states: statesAt(moment),
				paintBeneath: isScreenClearAt(moment) ? clearScreen : undefined,
				paintAbove: presence > 0 ? (context) => drawKey(context, moment, presence) : undefined,
			};
		},
	});
}

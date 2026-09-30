import { AUTOFILL_RESTING, AUTOFILL_RESTING_STATES, AUTOFILL_STORY_GRID, BUTTON, BUTTON_LABEL, BUTTON_PRESSED_CELLS, DOMAIN_TEXT, EMPTY_FIELD_CELLS, FORM_FIELDS, FORM_TITLE, FRAME_CELLS, filledCountText, type FormField } from '@/components/ds/ui/autofill-story-scenes';
import { DOT_FILLED } from '@/components/ds/ui/dot-morph-dots';
import { cellIndexIn, cellState, cellStates, clamp01, hasRippleReached } from '@/components/ds/ui/dot-story-cells';
import { createDotStoryPlayer, dotStoryFont, paintDotStoryCursor, paintDotStoryText, type DotStoryPlayer, type DotStoryStage, type DotStoryText } from '@/components/ds/ui/dot-story-player';

/**
 * One signup, played as a loop: the domain is typed, a pointer comes up and clicks Auto-fill, and the form fills
 * itself field by field, each input's border inking in as its value is typed and its tick lighting when it is done.
 * Then the form clears for the next signup.
 */

const DOMAIN_TYPING = { startsAt: 0.4, charactersPerSecond: 11 };
const DOMAIN_TYPED_AT = DOMAIN_TYPING.startsAt + DOMAIN_TEXT.text.length / DOMAIN_TYPING.charactersPerSecond;
const POINTER = { appearsAt: DOMAIN_TYPED_AT - 0.3, fadeSeconds: 0.25, travelsAt: DOMAIN_TYPED_AT, travelSeconds: 0.75 };
const CLICK = { at: POINTER.travelsAt + POINTER.travelSeconds + 0.1, pressSeconds: 0.18, heldSeconds: 0.35, pressedScale: 0.82 };
const POINTER_LEAVES = { at: CLICK.at + CLICK.heldSeconds + 0.1, seconds: 0.45 };
const FIELD = { firstAt: CLICK.at + 0.3, borderSeconds: 0.3, typingDelay: 0.15, charactersPerSecond: 34, tickDelay: 0.1, tickSeconds: 0.2 };

const fieldSchedule = FORM_FIELDS.reduce<{ startsAt: number; typingAt: number; typedAt: number; tickAt: number }[]>((schedule, field) => {
	const previous = schedule[schedule.length - 1];
	const startsAt = previous ? previous.typedAt + 0.05 : FIELD.firstAt;
	const typingAt = startsAt + FIELD.typingDelay;
	const typedAt = typingAt + field.value.text.length / FIELD.charactersPerSecond;
	return [...schedule, { startsAt, typingAt, typedAt, tickAt: typedAt + FIELD.tickDelay }];
}, []);

const FILLED_AT = fieldSchedule[fieldSchedule.length - 1].tickAt + FIELD.tickSeconds;
// Every field is filled and the pointer is long gone: the picture the static art shows.
const RESTING_AT_SECONDS = FILLED_AT + 0.3;
const CLEAR = { startsAt: FILLED_AT + 2.4, seconds: 0.4 };
const LOOP_SECONDS = CLEAR.startsAt + CLEAR.seconds + 0.4;
const CURSOR_GAP = 3;
const CURSOR_LINGERS_SECONDS = 0.3;

const { columns, rows, pitch } = AUTOFILL_STORY_GRID;
const cellIndex = cellIndexIn(AUTOFILL_STORY_GRID);
const FRAME_STATES = cellStates(AUTOFILL_STORY_GRID, FRAME_CELLS);
const EMPTY_STATES = cellStates(AUTOFILL_STORY_GRID, [...FRAME_CELLS, ...EMPTY_FIELD_CELLS]);
const INPUT_LEFT = FORM_FIELDS[0].border[0].column;
const INPUT_COLUMNS = FORM_FIELDS[0].border[FORM_FIELDS[0].border.length - 1].column - INPUT_LEFT + 1;

// The pointer's outline in grid units, measured from its tip.
const POINTER_OUTLINE = [
	[0, 0],
	[0, 17],
	[4.5, 13],
	[7.5, 20],
	[10.5, 18.8],
	[7.5, 12.2],
	[13, 12.2],
] as const;
const POINTER_STROKE = 2;
const POINTER_OUTLINE_WIDTH = 1.2;
// Drawn larger than a real cursor, so the dots inside it are big enough to read as the brand pattern.
const POINTER_SIZE = 1.4;
const POINTER_BOUNDS = { width: 13, height: 20 };
const POINTER_DOTS = { pitch: 2.8, radius: 1 };
const POINTER_FROM = { x: 34 * pitch, y: 27 * pitch };
const POINTER_TO = { x: (BUTTON.left + BUTTON.columns / 2) * pitch, y: (BUTTON.top + BUTTON.rows / 2 + 0.3) * pitch };
const POINTER_AWAY = { x: POINTER_TO.x + 3 * pitch, y: POINTER_TO.y + 6 * pitch };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const between = (from: { x: number; y: number }, to: { x: number; y: number }, t: number) => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });

export function createAutofillStoryPlayer({ canvas, dotColor, surfaceColor, fontFamily, onFirstFrame }: DotStoryStage): DotStoryPlayer {
	const states = new Uint8Array(columns * rows);

	// The canvas draws with whatever is loaded at the time, so the fonts are asked for before any text is typed.
	for (const text of AUTOFILL_RESTING.texts) void document.fonts.load(dotStoryFont(text, fontFamily), text.text);

	const isButtonPressed = (seconds: number) => seconds >= CLICK.at && seconds < CLICK.at + CLICK.heldSeconds;

	const paintField = (field: FormField, index: number, seconds: number) => {
		const { startsAt, tickAt } = fieldSchedule[index];
		const inked = (seconds - startsAt) / FIELD.borderSeconds;
		for (const cell of field.border) {
			if (hasRippleReached((cell.column - INPUT_LEFT) / INPUT_COLUMNS, inked)) states[cellIndex(cell)] = DOT_FILLED;
		}
		if (seconds >= fieldSchedule[index].typingAt) for (const cell of field.mark) states[cellIndex(cell)] = cellState(cell);
		const ticked = (seconds - tickAt) / FIELD.tickSeconds;
		field.tick.forEach((cell, step) => {
			if (hasRippleReached(step / field.tick.length, ticked)) states[cellIndex(cell)] = DOT_FILLED;
		});
	};

	const statesAt = (seconds: number) => {
		if (seconds >= CLEAR.startsAt) return EMPTY_STATES;
		states.set(EMPTY_STATES);
		if (isButtonPressed(seconds)) for (const cell of BUTTON_PRESSED_CELLS) states[cellIndex(cell)] = DOT_FILLED;
		FORM_FIELDS.forEach((field, index) => paintField(field, index, seconds));
		for (const cell of FRAME_CELLS) states[cellIndex(cell)] = FRAME_STATES[cellIndex(cell)];
		return states;
	};

	const typedFor = (text: DotStoryText, secondsTyping: number, charactersPerSecond: number): DotStoryText => ({ ...text, text: text.text.slice(0, Math.max(0, Math.floor(secondsTyping * charactersPerSecond))) });

	const paintTypingCursor = (context: CanvasRenderingContext2D, typed: DotStoryText, presence: number) => {
		context.font = dotStoryFont(typed, fontFamily);
		paintDotStoryCursor(context, typed.x + context.measureText(typed.text).width + CURSOR_GAP, typed, presence);
	};

	const paintText = (context: CanvasRenderingContext2D, seconds: number) => {
		const presence = 1 - clamp01((seconds - CLEAR.startsAt) / CLEAR.seconds);
		paintDotStoryText(context, fontFamily, FORM_TITLE);

		const domain = typedFor(DOMAIN_TEXT, seconds - DOMAIN_TYPING.startsAt, DOMAIN_TYPING.charactersPerSecond);
		paintDotStoryText(context, fontFamily, domain, presence);
		if (seconds >= DOMAIN_TYPING.startsAt && seconds < DOMAIN_TYPED_AT + CURSOR_LINGERS_SECONDS) paintTypingCursor(context, domain, 1);

		// Pressed, the button is solid dots, so its label is cut out of them in the card's colour.
		paintDotStoryText(context, fontFamily, isButtonPressed(seconds) ? { ...BUTTON_LABEL, color: surfaceColor } : BUTTON_LABEL);

		let filledCount = 0;
		FORM_FIELDS.forEach((field, index) => {
			const { typingAt, typedAt, tickAt } = fieldSchedule[index];
			paintDotStoryText(context, fontFamily, field.label);
			const value = typedFor(field.value, seconds - typingAt, FIELD.charactersPerSecond);
			paintDotStoryText(context, fontFamily, value, presence);
			const nextStartsAt = fieldSchedule[index + 1]?.startsAt ?? typedAt + CURSOR_LINGERS_SECONDS;
			if (seconds >= typingAt && seconds < nextStartsAt) paintTypingCursor(context, value, 1);
			if (seconds >= tickAt + FIELD.tickSeconds && seconds < CLEAR.startsAt) filledCount++;
		});
		paintDotStoryText(context, fontFamily, filledCountText(filledCount));
	};

	const pointerAt = (seconds: number) => {
		if (seconds < POINTER.appearsAt || seconds >= POINTER_LEAVES.at + POINTER_LEAVES.seconds) return null;
		if (seconds >= POINTER_LEAVES.at) {
			const left = (seconds - POINTER_LEAVES.at) / POINTER_LEAVES.seconds;
			return { ...between(POINTER_TO, POINTER_AWAY, easeInOut(left)), opacity: 1 - left, scale: 1 };
		}
		const travelled = easeInOut(clamp01((seconds - POINTER.travelsAt) / POINTER.travelSeconds));
		const pressed = Math.sin(Math.PI * clamp01((seconds - CLICK.at) / CLICK.pressSeconds));
		return { ...between(POINTER_FROM, POINTER_TO, travelled), opacity: clamp01((seconds - POINTER.appearsAt) / POINTER.fadeSeconds), scale: 1 - (1 - CLICK.pressedScale) * pressed };
	};

	const paintPointer = (context: CanvasRenderingContext2D, seconds: number) => {
		const pointer = pointerAt(seconds);
		if (!pointer) return;
		context.save();
		context.translate(pointer.x, pointer.y);
		context.scale(pointer.scale * POINTER_SIZE, pointer.scale * POINTER_SIZE);
		context.globalAlpha = pointer.opacity;
		const outline = new Path2D();
		POINTER_OUTLINE.forEach(([pointX, pointY], index) => (index === 0 ? outline.moveTo(pointX, pointY) : outline.lineTo(pointX, pointY)));
		outline.closePath();
		context.lineJoin = 'round';
		context.lineWidth = POINTER_STROKE * 2;
		context.strokeStyle = surfaceColor;
		context.stroke(outline);
		context.fillStyle = surfaceColor;
		context.fill(outline);

		// The pointer is filled with the brand dot pattern rather than solid, so it reads as part of the picture.
		context.save();
		context.clip(outline);
		context.fillStyle = dotColor;
		context.beginPath();
		for (let y = POINTER_DOTS.pitch / 2; y < POINTER_BOUNDS.height; y += POINTER_DOTS.pitch) {
			for (let x = POINTER_DOTS.pitch / 2; x < POINTER_BOUNDS.width; x += POINTER_DOTS.pitch) {
				context.moveTo(x + POINTER_DOTS.radius, y);
				context.arc(x, y, POINTER_DOTS.radius, 0, Math.PI * 2);
			}
		}
		context.fill();
		context.restore();

		context.lineWidth = POINTER_OUTLINE_WIDTH;
		context.strokeStyle = dotColor;
		context.stroke(outline);
		context.restore();
	};

	return createDotStoryPlayer({
		canvas,
		dotColor,
		surfaceColor,
		onFirstFrame,
		grid: AUTOFILL_STORY_GRID,
		resting: { states: AUTOFILL_RESTING_STATES, atSeconds: RESTING_AT_SECONDS },
		frameAt(storySeconds) {
			const seconds = storySeconds % LOOP_SECONDS;
			return {
				states: statesAt(seconds),
				paintAbove(context) {
					paintText(context, seconds);
					paintPointer(context, seconds);
				},
			};
		},
	});
}

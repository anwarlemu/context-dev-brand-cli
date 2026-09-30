// ds-override: grayscale luminance art drawn offscreen and sampled into dot states; these values are never painted
import type { BlogCoverMotif } from '@/components/ds/ui/blog-cover-art';
import type { DotMorphFrame } from '@/components/ds/ui/dot-morph-player';

/**
 * The hover choreography for each blog cover. At `morph` 0 a scene draws the same shaded illustration that
 * scripts/generate-blog-cover-dots.mjs rasterizes (keep the two in step), and by `morph` 1 it has become its
 * second picture. `spin` drives whatever keeps moving while the card stays hovered.
 *
 * Shapes on the goo layer are blurred and re-cut by the dot shader, so they melt into each other as they meet;
 * the crisp layer is for line work that must survive that.
 */

type Context = CanvasRenderingContext2D;

export interface CoverLayers {
	goo: Context;
	crisp: Context;
}

export interface CoverScene {
	spinSpeed: number;
	spinPeriod: number;
	/** Blur, in cover units, that fuses the goo layer's shapes. */
	gooSigma: (morph: number) => number;
	draw: (layers: CoverLayers, frame: DotMorphFrame) => void;
}

const TAU = Math.PI * 2;
const CENTER_X = 400;
const CENTER_Y = 300;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const phase = (morph: number, start: number, end: number) => clamp01((morph - start) / (end - start));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
const swell = (morph: number, start: number, end: number) => Math.sin(Math.PI * phase(morph, start, end));
const grey = (from: number, to: number, amount: number) => {
	const level = Math.round(lerp(from, to, amount));
	return `rgb(${level},${level},${level})`;
};

function linearFill(context: Context, x0: number, y0: number, x1: number, y1: number, from: string, to: string) {
	const gradient = context.createLinearGradient(x0, y0, x1, y1);
	gradient.addColorStop(0, from);
	gradient.addColorStop(1, to);
	return gradient;
}

function sphereFill(context: Context, x: number, y: number, radius: number, light = '#d9d9d9', dark = '#050505') {
	const gradient = context.createRadialGradient(x - radius * 0.3, y - radius * 0.4, 0, x - radius * 0.3, y - radius * 0.4, radius * 1.6);
	gradient.addColorStop(0, light);
	gradient.addColorStop(0.55, '#6b6b6b');
	gradient.addColorStop(1, dark);
	return gradient;
}

function fillCircle(context: Context, x: number, y: number, radius: number, fill: string | CanvasGradient) {
	context.fillStyle = fill;
	context.beginPath();
	context.arc(x, y, radius, 0, TAU);
	context.fill();
}

const REQUEST_COUNT = 8;
const REQUEST_RADIUS = 42;
const REQUEST_ORBIT = { x: 250, y: 215 };
// The opened shackle reaches up into the ring, so the ring widens and the padlock steps back to let the requests pass.
const OPEN_ORBIT = { x: 278, y: 242 };
const OPEN_REQUEST_RADIUS = 36;
const OPEN_PADLOCK_SCALE = 0.86;
const PADLOCK_CENTER_Y = 365;
const BLOCKED_REQUESTS = new Set([1, 4, 7]);
// Requests bunch up where the ring passes this angle, close enough to fuse, then string out again.
const JAM_ANGLE = Math.PI * 0.2;
const JAM_DEPTH = 0.55;

const blocked: CoverScene = {
	spinSpeed: 0.5,
	spinPeriod: TAU / REQUEST_COUNT,
	gooSigma: (morph) => 15 * easeInOut(phase(morph, 0.15, 0.7)),
	draw({ goo, crisp }, { morph, spin }) {
		const jam = easeInOut(phase(morph, 0.15, 0.7));
		const release = easeInOut(phase(morph, 0, 0.5));
		const blockedMark = 1 - phase(morph, 0, 0.25);
		for (let request = 0; request < REQUEST_COUNT; request++) {
			const lap = (request / REQUEST_COUNT) * TAU - Math.PI / 2 + spin;
			const crowding = (1 - Math.cos(lap - JAM_ANGLE + Math.PI)) / 2;
			const angle = lap + JAM_DEPTH * jam * Math.sin(lap - JAM_ANGLE + Math.PI);
			const x = CENTER_X + Math.cos(angle) * lerp(REQUEST_ORBIT.x, OPEN_ORBIT.x, release);
			const y = CENTER_Y + Math.sin(angle) * lerp(REQUEST_ORBIT.y, OPEN_ORBIT.y, release);
			const radius = lerp(REQUEST_RADIUS, OPEN_REQUEST_RADIUS, release) * (1 + 0.3 * jam * crowding);
			// Let through, a request darkens from a pale, mostly hollow ball into a solid one.
			fillCircle(goo, x, y, radius, sphereFill(goo, x, y, radius, grey(0xf0, 0x8c, release), grey(0x4a, 0, release)));
			if (!BLOCKED_REQUESTS.has(request) || blockedMark === 0) continue;
			goo.globalAlpha = blockedMark;
			goo.strokeStyle = '#000';
			goo.lineWidth = 12;
			goo.beginPath();
			goo.moveTo(x - 24, y - 24);
			goo.lineTo(x + 24, y + 24);
			goo.moveTo(x + 24, y - 24);
			goo.lineTo(x - 24, y + 24);
			goo.stroke();
			goo.globalAlpha = 1;
		}

		const lift = 30 * easeOutBack(phase(morph, 0.2, 0.55));
		const swing = 0.42 * easeOutBack(phase(morph, 0.4, 0.85));
		const stepBack = lerp(1, OPEN_PADLOCK_SCALE, release);
		crisp.save();
		crisp.translate(CENTER_X, PADLOCK_CENTER_Y);
		crisp.scale(stepBack, stepBack);
		crisp.translate(-CENTER_X, -PADLOCK_CENTER_Y);

		crisp.save();
		crisp.translate(470, 290 - lift);
		crisp.rotate(swing);
		crisp.translate(-470, -290);
		crisp.strokeStyle = linearFill(crisp, 0, 160, 0, 290, '#1a1a1a', '#8a8a8a');
		crisp.lineWidth = 30;
		crisp.beginPath();
		crisp.moveTo(330, 290);
		crisp.lineTo(330, 230);
		crisp.arc(CENTER_X, 230, 70, Math.PI, 0);
		// The hinge leg grows by the lift, so it stays seated in the body while the free leg comes out.
		crisp.lineTo(470, 290 + lift);
		crisp.stroke();
		crisp.restore();

		crisp.fillStyle = linearFill(crisp, 0, 280, 0, 450, '#1a1a1a', '#8a8a8a');
		crisp.beginPath();
		crisp.roundRect(290, 280, 220, 170, 18);
		crisp.fill();

		crisp.save();
		crisp.translate(CENTER_X, 345);
		crisp.rotate((Math.PI / 2) * easeInOut(phase(morph, 0, 0.3)));
		fillCircle(crisp, 0, 0, 24, '#fff');
		crisp.fillRect(-10, 5, 20, 56);
		crisp.restore();
		crisp.restore();
	},
};

const ORBITS = [
	{ x: 330, y: 210 },
	{ x: 200, y: 128 },
];
const ORBIT_DASH = [16, 14];
const ORBIT_DASH_TRAVEL = (30 * 6) / TAU;

interface Planet {
	x: number;
	y: number;
	radius: number;
	orbit: number;
	laps: number;
}

const PLANETS: Planet[] = [
	{ x: 582, y: 246, radius: 34, orbit: 1, laps: 2 },
	{ x: 112, y: 352, radius: 48, orbit: 0, laps: 1 },
	{ x: 640, y: 468, radius: 26, orbit: 0, laps: 1 },
];

const BRAIN_LOBES = [
	{ x: 30, y: -56, radius: 32 },
	{ x: 76, y: -44, radius: 32 },
	{ x: 100, y: -2, radius: 30 },
	{ x: 84, y: 42, radius: 30 },
	{ x: 38, y: 58, radius: 30 },
];
const BRAIN_FISSURE = 6;
const BRAIN_FOLD_WIDTH = 12;
const THINKING_PLANET_RADIUS = 26;

function drawBrainHalf(context: Context, side: 1 | -1) {
	context.save();
	context.scale(side, 1);
	context.beginPath();
	context.rect(BRAIN_FISSURE, -110, 160, 220);
	context.clip();
	context.fillStyle = '#000';
	context.beginPath();
	context.ellipse(48, 0, 60, 62, 0, 0, TAU);
	for (const lobe of BRAIN_LOBES) {
		context.moveTo(lobe.x + lobe.radius, lobe.y);
		context.arc(lobe.x, lobe.y, lobe.radius, 0, TAU);
	}
	context.fill();

	context.globalCompositeOperation = 'destination-out';
	context.lineWidth = BRAIN_FOLD_WIDTH;
	context.lineCap = 'round';
	context.beginPath();
	context.moveTo(BRAIN_FISSURE, -14);
	context.bezierCurveTo(34, -18, 54, -34, 52, -60);
	context.moveTo(124, 20);
	context.bezierCurveTo(92, 14, 68, 26, 62, 54);
	context.stroke();
	context.restore();
}

const trends: CoverScene = {
	spinSpeed: 0.45,
	spinPeriod: TAU,
	gooSigma: (morph) => 15 * swell(morph, 0.05, 0.9),
	draw({ goo, crisp }, { morph, spin }) {
		crisp.strokeStyle = '#9a9a9a';
		crisp.lineWidth = 7;
		crisp.setLineDash(ORBIT_DASH);
		ORBITS.forEach((orbit, index) => {
			crisp.lineDashOffset = -spin * ORBIT_DASH_TRAVEL * (index + 1);
			crisp.beginPath();
			crisp.ellipse(CENTER_X, CENTER_Y, orbit.x, orbit.y, 0, 0, TAU);
			crisp.stroke();
		});
		crisp.setLineDash([]);

		const think = easeInOut(phase(morph, 0.1, 0.75));
		goo.globalAlpha = 1 - think;
		fillCircle(goo, CENTER_X, CENTER_Y, 82, sphereFill(goo, CENTER_X, CENTER_Y, 82, '#8c8c8c', '#000'));
		goo.globalAlpha = think;
		goo.save();
		goo.translate(CENTER_X, CENTER_Y);
		const grow = lerp(0.7, 1, easeOutBack(phase(morph, 0.2, 0.9)));
		goo.scale(grow, grow);
		drawBrainHalf(goo, 1);
		drawBrainHalf(goo, -1);
		goo.restore();
		goo.globalAlpha = 1;

		// The generated cover sets two planets a little off their orbit line; they settle onto it as they start to travel.
		const settle = easeInOut(phase(morph, 0, 0.5));
		for (const planet of PLANETS) {
			const orbit = ORBITS[planet.orbit];
			const restX = (planet.x - CENTER_X) / orbit.x;
			const restY = (planet.y - CENTER_Y) / orbit.y;
			const reach = lerp(Math.hypot(restX, restY), 1, settle);
			const angle = Math.atan2(restY, restX) + spin * planet.laps;
			const x = CENTER_X + Math.cos(angle) * orbit.x * reach;
			const y = CENTER_Y + Math.sin(angle) * orbit.y * reach;
			const radius = planet.orbit === 1 ? lerp(planet.radius, THINKING_PLANET_RADIUS, settle) : planet.radius;
			fillCircle(goo, x, y, radius, sphereFill(goo, x, y, radius));
		}
	},
};

interface TextLine {
	y: number;
	width: number;
	height: number;
}

function drawPage(context: Context, width: number, height: number, border: number, inset: number, lines: TextLine[]) {
	const left = -width / 2;
	const top = -height / 2;
	context.fillStyle = linearFill(context, left, top, -left, -top, '#ffffff', '#d0d0d0');
	context.fillRect(left, top, width, height);
	context.fillStyle = '#000';
	for (const line of lines) context.fillRect(left + inset, top + line.y, line.width, line.height);
	context.strokeStyle = '#000';
	context.lineWidth = border;
	context.strokeRect(left, top, width, height);
}

const smallPageLines = (widths: number[]): TextLine[] => widths.map((width, index) => ({ y: 40 + index * 40, width, height: 20 }));

const SMALL_PAGES = [
	{ x: 163, y: 310, rotate: -5, lines: smallPageLines([96, 114, 78, 108, 88]) },
	{ x: 400, y: 285, rotate: 0, lines: smallPageLines([114, 82, 114, 100, 70]) },
	{ x: 637, y: 310, rotate: 5, lines: smallPageLines([104, 80, 114, 74, 100]) },
];

const BIG_PAGE_LINES: TextLine[] = [
	{ y: 48, width: 150, height: 30 },
	{ y: 110, width: 230, height: 20 },
	{ y: 152, width: 196, height: 20 },
	{ y: 194, width: 230, height: 20 },
	{ y: 236, width: 168, height: 20 },
	{ y: 278, width: 214, height: 20 },
	{ y: 320, width: 186, height: 20 },
	{ y: 362, width: 120, height: 20 },
];

// The outer pages stop this far short of the centre, so the three fuse into one wide mass rather than a single stack.
const GATHERED_SPREAD = 0.3;

const pages: CoverScene = {
	spinSpeed: 1.5,
	spinPeriod: TAU,
	gooSigma: (morph) => 18 * swell(morph, 0.05, 0.95),
	draw({ goo }, { morph, spin }) {
		const gather = easeInOut(phase(morph, 0, 0.6));
		const bind = easeInOut(phase(morph, 0.3, 0.75));

		goo.globalAlpha = 1 - bind;
		for (const page of SMALL_PAGES) {
			goo.save();
			goo.translate(lerp(page.x, lerp(CENTER_X, page.x, GATHERED_SPREAD), gather), lerp(page.y, CENTER_Y, gather));
			goo.rotate((lerp(page.rotate, 0, gather) * Math.PI) / 180);
			drawPage(goo, 170, 250, 12, 28, page.lines);
			goo.restore();
		}

		const writing = easeInOut(phase(morph, 0.8, 1));
		const size = lerp(0.6, 1, easeOutBack(phase(morph, 0.35, 0.95)));
		goo.globalAlpha = bind;
		goo.save();
		goo.translate(CENTER_X, CENTER_Y);
		goo.scale(size, size);
		drawPage(
			goo,
			310,
			430,
			14,
			40,
			BIG_PAGE_LINES.map((line, index) => (index === 0 ? line : { ...line, width: line.width * (1 + 0.14 * writing * Math.sin(spin + index * 1.3)) }))
		);
		goo.restore();
		goo.globalAlpha = 1;
	},
};

const ICON_SIZE = 24;
const ICON_SCALE = 12.5;
const LOGO_SCALE = 10.5;
const LOGO_CENTER = { x: 30.06, y: 30.37 };
const LOGO_SQUARE = { x: 23.41, y: 15.93, width: 27.67, height: 27.83, radius: 1.47 };
const LOGO_CIRCLE = { x: 17.63, y: 36.46, radius: 8.34 };
const LOGO_CUTOUT = { x: 31.71, y: 35.41, radius: 8.34 };

function drawIcon(context: Context, icon: Path2D, x: number, y: number, scale: number, rotate: number, from: string, to: string) {
	context.save();
	context.translate(x, y);
	context.rotate(rotate);
	context.scale(scale, scale);
	context.translate(-ICON_SIZE / 2, -ICON_SIZE / 2);
	context.fillStyle = linearFill(context, 0, 0, ICON_SIZE, ICON_SIZE, from, to);
	context.fill(icon);
	context.restore();
}

function integration(cursor: Path2D, claude: Path2D): CoverScene {
	return {
		spinSpeed: 0,
		spinPeriod: TAU,
		gooSigma: (morph) => 20 * swell(morph, 0.05, 1),
		draw({ goo }, { morph }) {
			const meet = easeInOut(phase(morph, 0, 0.55));
			const combine = easeInOut(phase(morph, 0.3, 0.7));
			const shrink = lerp(ICON_SCALE, ICON_SCALE * 0.72, meet);
			goo.globalAlpha = 1 - combine;
			drawIcon(goo, cursor, lerp(260, 350, meet), CENTER_Y, shrink, meet * 1.05, '#000', '#7a7a7a');
			drawIcon(goo, claude, lerp(540, 450, meet), CENTER_Y, shrink, -meet * 1.57, '#8a8a8a', '#000');

			const size = LOGO_SCALE * lerp(0.7, 1, easeOutBack(phase(morph, 0.35, 0.85)));
			const emerge = easeInOut(phase(morph, 0.55, 1));
			goo.globalAlpha = combine;
			goo.save();
			goo.translate(CENTER_X, CENTER_Y);
			goo.scale(size, size);
			goo.translate(-LOGO_CENTER.x, -LOGO_CENTER.y);
			goo.fillStyle = linearFill(goo, LOGO_SQUARE.x, LOGO_SQUARE.y, LOGO_SQUARE.x + LOGO_SQUARE.width, LOGO_SQUARE.y + LOGO_SQUARE.height, '#2a2a2a', '#000');
			goo.beginPath();
			goo.roundRect(LOGO_SQUARE.x, LOGO_SQUARE.y, LOGO_SQUARE.width, LOGO_SQUARE.height, LOGO_SQUARE.radius);
			goo.moveTo(LOGO_CUTOUT.x + LOGO_CUTOUT.radius, LOGO_CUTOUT.y);
			goo.arc(LOGO_CUTOUT.x, LOGO_CUTOUT.y, LOGO_CUTOUT.radius, 0, TAU);
			goo.fill('evenodd');
			// The circle starts out plugging the square's cut-out and slides free of it, so the mark pulls apart from one mass.
			const circleX = lerp(LOGO_CUTOUT.x, LOGO_CIRCLE.x, emerge);
			const circleY = lerp(LOGO_CUTOUT.y, LOGO_CIRCLE.y, emerge);
			fillCircle(goo, circleX, circleY, LOGO_CIRCLE.radius, '#000');
			goo.restore();
			goo.globalAlpha = 1;
		},
	};
}

const TILE = { width: 164, height: 150 };
const TILE_ORIGIN = { x: 122, y: 124 };
const TILE_STEP = { x: 198, y: 184 };
const TILE_GROWTH = 0.22;
const PICTURE = { x: 122, y: 124, width: 560, height: 334 };
const BORDER_DASH_TRAVEL = (28 * 4) / TAU;

function drawTile(context: Context, index: number) {
	context.fillStyle = linearFill(context, 0, 0, 0, TILE.height, '#ffffff', '#d6d6d6');
	context.fillRect(0, 0, TILE.width, TILE.height);
	if (index !== 1 && index !== 5) {
		context.fillStyle = linearFill(context, 0, 70, 0, 136, '#1e1e1e', '#6e6e6e');
		context.beginPath();
		context.moveTo(14, 136);
		context.lineTo(62, 70);
		context.lineTo(94, 108);
		context.lineTo(116, 84);
		context.lineTo(150, 136);
		context.closePath();
		context.fill();
	}
	const sun = index % 2 ? 16 : 24;
	fillCircle(context, 118, 42, sun, sphereFill(context, 118, 42, sun, '#9a9a9a', '#000'));
	context.strokeStyle = '#000';
	context.lineWidth = 10;
	context.strokeRect(0, 0, TILE.width, TILE.height);
}

const images: CoverScene = {
	spinSpeed: 0.7,
	spinPeriod: TAU,
	gooSigma: (morph) => 16 * swell(morph, 0.05, 0.9),
	draw({ goo, crisp }, { morph, spin }) {
		crisp.strokeStyle = '#000';
		crisp.lineWidth = 7;
		crisp.setLineDash([14, 14]);
		crisp.lineDashOffset = -spin * BORDER_DASH_TRAVEL;
		crisp.strokeRect(92, 96, 616, 408);
		crisp.setLineDash([]);

		const develop = easeInOut(phase(morph, 0.2, 0.75));
		const growth = 1 + TILE_GROWTH * easeInOut(phase(morph, 0, 0.5));
		goo.globalAlpha = 1 - develop;
		for (let index = 0; index < 6; index++) {
			const x = TILE_ORIGIN.x + Math.floor(index / 2) * TILE_STEP.x + TILE.width / 2;
			const y = TILE_ORIGIN.y + (index % 2) * TILE_STEP.y + TILE.height / 2;
			goo.save();
			goo.translate(x, y);
			goo.scale(growth, growth);
			goo.translate(-TILE.width / 2, -TILE.height / 2);
			drawTile(goo, index);
			goo.restore();
		}

		const daylight = easeInOut(phase(morph, 0.7, 1));
		goo.globalAlpha = develop;
		goo.save();
		goo.translate(PICTURE.x, PICTURE.y);
		goo.fillStyle = linearFill(goo, 0, 0, 0, PICTURE.height, '#ffffff', '#d6d6d6');
		goo.fillRect(0, 0, PICTURE.width, PICTURE.height);
		const sunX = 420 + 60 * daylight * Math.sin(spin);
		const sunY = 96 - 34 * daylight * (1 - Math.cos(spin)) * 0.5;
		fillCircle(goo, sunX, sunY, 50, sphereFill(goo, sunX, sunY, 50, '#5a5a5a', '#000'));
		goo.fillStyle = linearFill(goo, 0, 130, 0, 320, '#1e1e1e', '#6e6e6e');
		goo.beginPath();
		goo.moveTo(20, 320);
		goo.lineTo(150, 150);
		goo.lineTo(226, 236);
		goo.lineTo(306, 130);
		goo.lineTo(400, 250);
		goo.lineTo(452, 196);
		goo.lineTo(540, 320);
		goo.closePath();
		goo.fill();
		goo.strokeStyle = '#000';
		goo.lineWidth = 12;
		goo.strokeRect(0, 0, PICTURE.width, PICTURE.height);
		goo.restore();
		goo.globalAlpha = 1;
	},
};

const SOURCE_LINES = [170, 140, 176, 120, 160, 96, 150];
const RECORD_ROWS = [150, 238, 326, 414];
const RECORD_HEIGHT = 64;
const EMPHASIZED_RECORD = 1;
const RECORD_STEP = TAU / RECORD_ROWS.length;

// How strongly a row is the one being read, as the highlight walks down the table and wraps round.
function emphasis(row: number, spin: number, reading: number) {
	const position = EMPHASIZED_RECORD + (spin / RECORD_STEP) * reading;
	const wrapped = (((row - position) % RECORD_ROWS.length) + RECORD_ROWS.length) % RECORD_ROWS.length;
	const distance = Math.min(wrapped, RECORD_ROWS.length - wrapped);
	return clamp01(1 - distance);
}

const extract: CoverScene = {
	spinSpeed: 1.2,
	spinPeriod: TAU,
	gooSigma: (morph) => 16 * swell(morph, 0.1, 0.9),
	draw({ goo, crisp }, { morph, spin }) {
		const arrow = 1 - phase(morph, 0, 0.2);
		if (arrow > 0) {
			crisp.globalAlpha = arrow;
			crisp.strokeStyle = '#000';
			crisp.lineWidth = 10;
			crisp.setLineDash([14, 10]);
			crisp.beginPath();
			crisp.moveTo(380, 300);
			crisp.lineTo(440, 300);
			crisp.stroke();
			crisp.setLineDash([]);
			crisp.beginPath();
			crisp.moveTo(430, 280);
			crisp.lineTo(454, 300);
			crisp.lineTo(430, 320);
			crisp.stroke();
			crisp.globalAlpha = 1;
		}

		const feed = easeInOut(phase(morph, 0.05, 0.6));
		const absorb = easeInOut(phase(morph, 0.3, 0.65));
		if (absorb < 1) {
			const shrink = lerp(1, 0.8, feed);
			goo.globalAlpha = 1 - absorb;
			goo.save();
			goo.translate(lerp(235, 400, feed), CENTER_Y);
			goo.scale(shrink, shrink);
			goo.translate(-125, -190);
			goo.fillStyle = linearFill(goo, 0, 0, 250, 380, '#ffffff', '#cfcfcf');
			goo.fillRect(0, 0, 250, 380);
			SOURCE_LINES.forEach((width, index) => {
				goo.fillStyle = index === 3 ? '#000' : '#333';
				goo.fillRect(36, 40 + index * 46, width, 14);
			});
			goo.strokeStyle = '#000';
			goo.lineWidth = 10;
			goo.strokeRect(0, 0, 250, 380);
			goo.restore();
			goo.globalAlpha = 1;
		}

		const widen = easeInOut(phase(morph, 0.3, 0.85));
		const reading = easeInOut(phase(morph, 0.8, 1));
		const left = lerp(470, 150, widen);
		const width = lerp(240, 500, widen);
		const key = lerp(72, 124, widen);
		RECORD_ROWS.forEach((top, row) => {
			const weight = emphasis(row, spin, reading);
			goo.fillStyle = linearFill(goo, left, top, left + width, top + RECORD_HEIGHT, '#ffffff', '#cfcfcf');
			goo.fillRect(left, top, width, RECORD_HEIGHT);
			goo.fillStyle = grey(0x55, 0, weight);
			goo.fillRect(left, top, key, RECORD_HEIGHT);
			const value = lerp(80, 110, weight) * lerp(1, 1.5, widen);
			goo.fillStyle = '#111';
			goo.fillRect(left + key + 24, top + 26, value, 12);
			if (widen > 0) {
				goo.globalAlpha = widen;
				goo.fillRect(left + key + 24 + value + 22, top + 26, lerp(70, 96, 1 - weight), 12);
				goo.globalAlpha = 1;
			}
			goo.strokeStyle = '#000';
			goo.lineWidth = 8;
			goo.strokeRect(left, top, width, RECORD_HEIGHT);
		});
	},
};

async function iconPath(file: string) {
	const response = await fetch(file);
	if (!response.ok) throw new Error(`Could not load ${file}`);
	const path = (await response.text()).match(/ d="([^"]+)"/)?.[1];
	if (!path) throw new Error(`${file} has no path`);
	return new Path2D(path);
}

export async function loadCoverScene(motif: BlogCoverMotif): Promise<CoverScene> {
	switch (motif) {
		case 'blocked':
			return blocked;
		case 'trends':
			return trends;
		case 'pages':
			return pages;
		case 'images':
			return images;
		case 'extract':
			return extract;
		case 'integration': {
			const [cursor, claude] = await Promise.all([iconPath('/agent-providers/cursor.svg'), iconPath('/agent-providers/claude.svg')]);
			return integration(cursor, claude);
		}
	}
}

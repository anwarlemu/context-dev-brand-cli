import { DOT_ABSENT, DOT_FILLED, DOT_HOLLOW } from '@/components/ds/ui/dot-morph-dots';
import { sampleLogoCells } from '@/components/ds/ui/logo-dot-sampling';

export const STAT_GRID = { columns: 44, rows: 20 };

// Each cell is read from a small block of pixels, so a stroke that half-covers a cell still lands as a dot.
const SUPERSAMPLE = 4;
const STROKE_COVERAGE = 0.34;
const FILL_COVERAGE = 0.5;

/**
 * Icons in a 24-unit box, as SVG path data, drawn as dot outlines. Filling their insides with rings read as a grey
 * texture at this dot size and buried the inner strokes (an envelope's flap, a page's lines).
 */
interface IconArt {
	outline: string[];
	solid?: string[];
}

const rect = (x: number, y: number, width: number, height: number, radius: number) =>
	`M${x + radius} ${y}h${width - 2 * radius}a${radius} ${radius} 0 0 1 ${radius} ${radius}v${height - 2 * radius}a${radius} ${radius} 0 0 1 -${radius} ${radius}h-${width - 2 * radius}a${radius} ${radius} 0 0 1 -${radius} -${radius}v-${height - 2 * radius}a${radius} ${radius} 0 0 1 ${radius} -${radius}z`;
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;

export const STAT_ICONS = {
	envelope: { outline: [rect(2, 4, 20, 16, 2), 'M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'] },
	code: { outline: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6', 'M14 4l-4 16'] },
	lightning: { outline: [], solid: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'] },
	search: { outline: [circle(11, 11, 8), 'M21 21l-4.3-4.3'] },
	document: { outline: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M16 13H8', 'M16 17H8', 'M10 9H8'] },
	chat: { outline: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'] },
} satisfies Record<string, IconArt>;

/**
 * Hand-placed dot art, one string per grid row: `#` a solid dot, `o` a ring, `.` no dot. Some shapes only read with
 * their rings placed by hand (a bezel's inner edge, a keyboard's keys), which no stroke sampling gets right at 20 rows.
 */
const STAT_DOT_ART = {
	monitor: [
		'..######################..',
		'.###oooooooooooooooooo###.',
		'.##o..................o##.',
		'.##o.#................o##.',
		'.##o..#.#o#o#o#.......o##.',
		'.##o.#................o##.',
		'.##o..................o##.',
		'.##o.o#o#o#o.##.......o##.',
		'.##o..................o##.',
		'.##oooooooooooooooooooo##.',
		'.##oo#oo#oo#oo#oo#oo#oo##.',
		'..######################..',
		'..........######..........',
		'......##############......',
		'..........................',
		'.....################.....',
		'....#o.o.o.o.o.o.o.o.#....',
		'...##.o.o.o.o.o.o.o.o##...',
		'.##o.o.o.o.o.o.o.o.o.o.##.',
		'##########################',
	],
	pdf: [
		'############.....',
		'#...........##...',
		'#.#######...###..',
		'#.#######...####.',
		'#...........#####',
		'#.############..#',
		'#...............#',
		'#.############..#',
		'#...............#',
		'#.######..#####.#',
		'#.######........#',
		'#.######..####..#',
		'#.##o#o#..oooo..#',
		'#...............#',
		'#.####.####.###.#',
		'#.oooo.oooo.ooo.#',
		'#.oooo.oooo.ooo.#',
		'#.oooo.oooo.ooo.#',
		'#...............#',
		'#################',
	],
} satisfies Record<string, string[]>;
export type StatIcon = keyof typeof STAT_ICONS | keyof typeof STAT_DOT_ART;

const ICON_UNITS = 24;
const ICON_STROKE = 2.1;
const ICON_RING_STROKE = ICON_STROKE + 1.6;

function blankStates() {
	return new Uint8Array(STAT_GRID.columns * STAT_GRID.rows).fill(DOT_ABSENT);
}

function createRaster() {
	const canvas = document.createElement('canvas');
	canvas.width = STAT_GRID.columns * SUPERSAMPLE;
	canvas.height = STAT_GRID.rows * SUPERSAMPLE;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) throw new Error('2D canvas is unavailable');
	return context;
}

function coverage(context: CanvasRenderingContext2D) {
	const { data } = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	const cells = new Float32Array(STAT_GRID.columns * STAT_GRID.rows);
	for (let row = 0; row < STAT_GRID.rows; row++) {
		for (let column = 0; column < STAT_GRID.columns; column++) {
			let alpha = 0;
			for (let y = 0; y < SUPERSAMPLE; y++) {
				for (let x = 0; x < SUPERSAMPLE; x++) alpha += data[((row * SUPERSAMPLE + y) * context.canvas.width + column * SUPERSAMPLE + x) * 4 + 3];
			}
			cells[row * STAT_GRID.columns + column] = alpha / (255 * SUPERSAMPLE * SUPERSAMPLE);
		}
	}
	return cells;
}

function iconCoverage(art: IconArt, lineWidth: number) {
	const context = createRaster();
	const scale = (STAT_GRID.rows * SUPERSAMPLE) / ICON_UNITS;
	const offsetX = (context.canvas.width - ICON_UNITS * scale) / 2;
	context.setTransform(scale, 0, 0, scale, offsetX, 0);
	context.lineWidth = lineWidth;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	for (const path of art.outline) context.stroke(new Path2D(path));
	for (const path of art.solid ?? []) {
		context.fill(new Path2D(path));
		if (lineWidth > ICON_STROKE) context.stroke(new Path2D(path));
	}
	return coverage(context);
}

/** Strokes land as solid dots with a band of rings alongside, the two-tone line the brand's dot art is drawn in. */
function dotArtStates(art: string[]) {
	const states = blankStates();
	const top = Math.floor((STAT_GRID.rows - art.length) / 2);
	for (const [rowIndex, row] of art.entries()) {
		const left = Math.floor((STAT_GRID.columns - row.length) / 2);
		for (const [columnIndex, mark] of [...row].entries()) {
			const cell = (top + rowIndex) * STAT_GRID.columns + left + columnIndex;
			if (mark === '#') states[cell] = DOT_FILLED;
			else if (mark === 'o') states[cell] = DOT_HOLLOW;
		}
	}
	return states;
}

export function isStatIcon(shape: string): shape is StatIcon {
	return shape in STAT_ICONS || shape in STAT_DOT_ART;
}

export function iconStates(icon: StatIcon): Uint8Array {
	if (icon in STAT_DOT_ART) return dotArtStates(STAT_DOT_ART[icon as keyof typeof STAT_DOT_ART]);
	const art: IconArt = STAT_ICONS[icon as keyof typeof STAT_ICONS];
	const stroke = iconCoverage(art, ICON_STROKE);
	const ring = iconCoverage(art, ICON_RING_STROKE);
	const states = blankStates();
	for (let cell = 0; cell < states.length; cell++) {
		if (stroke[cell] >= STROKE_COVERAGE) states[cell] = DOT_FILLED;
		else if (ring[cell] >= STROKE_COVERAGE) states[cell] = DOT_HOLLOW;
	}
	return states;
}

/** Sets a figure in the page's heading face at the grid's full height, then reads it back as solid dots. */
export function numberStates(value: string, fontFamily: string): Uint8Array {
	const context = createRaster();
	const height = context.canvas.height;
	let size = height * 0.95;
	context.textBaseline = 'alphabetic';
	const setFont = () => (context.font = `700 ${size}px ${fontFamily}`);
	setFont();
	const fits = () => {
		const metrics = context.measureText(value);
		return { width: metrics.width, ascent: metrics.actualBoundingBoxAscent, descent: metrics.actualBoundingBoxDescent };
	};
	let box = fits();
	const scale = Math.min((context.canvas.width * 0.96) / box.width, (height * 0.92) / (box.ascent + box.descent));
	size *= scale;
	setFont();
	box = fits();
	context.fillText(value, (context.canvas.width - box.width) / 2, (height + box.ascent - box.descent) / 2);
	const cells = coverage(context);
	const states = blankStates();
	for (let cell = 0; cell < states.length; cell++) if (cells[cell] >= FILL_COVERAGE) states[cell] = DOT_FILLED;
	return states;
}

const LOGO_CELLS = STAT_GRID.rows - 2;

export async function logoStates(src: string): Promise<Uint8Array> {
	const cells = await sampleLogoCells(src, { cellsPerSide: LOGO_CELLS });
	const states = blankStates();
	const left = Math.floor((STAT_GRID.columns - LOGO_CELLS) / 2);
	const top = Math.floor((STAT_GRID.rows - LOGO_CELLS) / 2);
	for (const cell of cells) states[(top + cell.row) * STAT_GRID.columns + left + cell.column] = cell.filled ? DOT_FILLED : DOT_HOLLOW;
	return states;
}

import { paintColor } from '@/components/ds/ui/ds-color';
const SAMPLES_PER_CELL = 4;
const MIN_COVERAGE = 0.35;
// Below this spread the logo is effectively one colour, so every covered cell is drawn solid.
const MIN_LUMINANCE_SPREAD = 0.25;
const TILE_CORNER_INSET = 0.12;
const TILE_CORNER_TOLERANCE = 60;
const TILE_CELL_TOLERANCE = 90;
// A logo that fills its whole box is drawn as an app-icon tile, so its dot corners are rounded like one.
const SOLID_BOX_FILL = 0.9;
const TILE_CORNER_RADIUS = 0.22;

export interface LogoCell {
	column: number;
	row: number;
	filled: boolean;
}

type Rgb = [number, number, number];

interface CellSample {
	column: number;
	row: number;
	coverage: number;
	color: Rgb;
}

interface LogoSample {
	cells: CellSample[];
	tileColor: Rgb | null;
}

const colorDistance = (a: Rgb, b: Rgb) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const luminance = ([red, green, blue]: Rgb) => (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

// App-icon logos are a solid tile with the mark inside. Reading the tile colour just inside its corners lets the
// tile become the ring frame and the mark the solid dots, instead of one solid square.
function detectTileColor(pixels: Uint8ClampedArray, size: number, left: number, top: number, width: number, height: number): Rgb | null {
	const inset = Math.max(1, Math.round(Math.min(width, height) * TILE_CORNER_INSET));
	const corners = [
		[left + inset, top + inset],
		[left + width - 1 - inset, top + inset],
		[left + inset, top + height - 1 - inset],
		[left + width - 1 - inset, top + height - 1 - inset],
	].map(([x, y]) => {
		const offset = (Math.round(y) * size + Math.round(x)) * 4;
		return { alpha: pixels[offset + 3], color: [pixels[offset], pixels[offset + 1], pixels[offset + 2]] as Rgb };
	});
	if (corners.some((corner) => corner.alpha < 230)) return null;
	const average = [0, 1, 2].map((channel) => corners.reduce((sum, corner) => sum + corner.color[channel], 0) / corners.length) as Rgb;
	return corners.every((corner) => colorDistance(corner.color, average) < TILE_CORNER_TOLERANCE) ? average : null;
}

// Remote logos (media.brand.dev) send no CORS headers, which would taint the canvas; the Next image
// optimiser serves them from our own origin. Local files load directly, since the optimiser skips SVGs.
function sameOriginSource(src: string) {
	return /^https?:\/\//.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=256&q=75` : src;
}

function loadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new window.Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = sameOriginSource(src);
	});
}

function sampleLogo(image: HTMLImageElement, background: string | undefined, cellsPerSide: number): LogoSample {
	const size = cellsPerSide * SAMPLES_PER_CELL;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return { cells: [], tileColor: null };

	const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
	const width = image.naturalWidth * scale;
	const height = image.naturalHeight * scale;
	const left = (size - width) / 2;
	const top = (size - height) / 2;
	if (background) {
		context.fillStyle = paintColor(context, background);
		context.fillRect(left, top, width, height);
	}
	context.drawImage(image, left, top, width, height);
	const pixels = context.getImageData(0, 0, size, size).data;

	const cells: CellSample[] = [];
	for (let row = 0; row < cellsPerSide; row++) {
		for (let column = 0; column < cellsPerSide; column++) {
			let alpha = 0;
			const weighted: Rgb = [0, 0, 0];
			for (let y = 0; y < SAMPLES_PER_CELL; y++) {
				for (let x = 0; x < SAMPLES_PER_CELL; x++) {
					const offset = ((row * SAMPLES_PER_CELL + y) * size + column * SAMPLES_PER_CELL + x) * 4;
					const pixelAlpha = pixels[offset + 3] / 255;
					alpha += pixelAlpha;
					for (const channel of [0, 1, 2]) weighted[channel] += pixelAlpha * pixels[offset + channel];
				}
			}
			const color = weighted.map((channel) => (alpha > 0 ? channel / alpha : 0)) as Rgb;
			cells.push({ column, row, coverage: alpha / SAMPLES_PER_CELL ** 2, color });
		}
	}
	return { cells, tileColor: detectTileColor(pixels, size, left, top, width, height) };
}

function isInsideRoundedBox(cell: CellSample, box: { left: number; top: number; right: number; bottom: number }, radius: number) {
	const nearestX = Math.min(Math.max(cell.column, box.left + radius), box.right - radius);
	const nearestY = Math.min(Math.max(cell.row, box.top + radius), box.bottom - radius);
	return Math.hypot(cell.column - nearestX, cell.row - nearestY) <= radius;
}

function roundSolidBoxCorners(covered: CellSample[]) {
	if (covered.length === 0) return covered;
	const columns = covered.map((cell) => cell.column);
	const rows = covered.map((cell) => cell.row);
	const box = { left: Math.min(...columns), top: Math.min(...rows), right: Math.max(...columns), bottom: Math.max(...rows) };
	const boxArea = (box.right - box.left + 1) * (box.bottom - box.top + 1);
	if (covered.length / boxArea < SOLID_BOX_FILL) return covered;
	const radius = Math.min(box.right - box.left, box.bottom - box.top) * TILE_CORNER_RADIUS;
	return covered.filter((cell) => isInsideRoundedBox(cell, box, radius));
}

// Without a tile, the lighter parts become solid dots and the darker parts rings, so the mark keeps its contrast on a blue card.
function classifyCells({ cells, tileColor }: LogoSample): LogoCell[] {
	const covered = roundSolidBoxCorners(cells.filter((cell) => cell.coverage >= MIN_COVERAGE));
	const toCell = (cell: CellSample, filled: boolean) => ({ column: cell.column, row: cell.row, filled });
	if (tileColor) return covered.map((cell) => toCell(cell, colorDistance(cell.color, tileColor) >= TILE_CELL_TOLERANCE));

	const luminances = covered.map((cell) => luminance(cell.color));
	const darkest = Math.min(...luminances);
	const lightest = Math.max(...luminances);
	if (lightest - darkest < MIN_LUMINANCE_SPREAD) return covered.map((cell) => toCell(cell, true));
	const threshold = (darkest + lightest) / 2;
	return covered.map((cell) => toCell(cell, luminance(cell.color) >= threshold));
}

/** Samples a logo onto a square grid of cells, leaving out the cells the logo doesn't cover. */
export async function sampleLogoCells(src: string, { background, cellsPerSide }: { background?: string; cellsPerSide: number }): Promise<LogoCell[]> {
	const image = await loadImage(src);
	return classifyCells(sampleLogo(image, background, cellsPerSide));
}

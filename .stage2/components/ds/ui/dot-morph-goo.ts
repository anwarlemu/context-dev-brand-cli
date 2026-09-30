/**
 * A small raster of a scene, read back as how much of each pixel is covered and how dark that cover is.
 * Blurring it and cutting the blur back to a hard edge is what grows liquid necks between shapes that come close.
 */
export interface GooField {
	width: number;
	height: number;
	context: CanvasRenderingContext2D;
	coverage: Float32Array;
	darkness: Float32Array;
}

const THRESHOLD_LOW = 0.35;
const THRESHOLD_HIGH = 0.65;
// Below this much blur the threshold is blended in gradually, so a scene can raise its goo from zero without a jump.
const FULL_THRESHOLD_SIGMA = 0.8;

const LINEAR_CHANNEL = Float32Array.from({ length: 256 }, (_, channel) => {
	const c = channel / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

export function createGooField(width: number, height: number): GooField {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) throw new Error('2D canvas is unavailable');
	return { width, height, context, coverage: new Float32Array(width * height), darkness: new Float32Array(width * height) };
}

/** Wipes the field and leaves its context scaled, so the scene draws in its own units. */
export function clearGooField({ context, width, height }: GooField, scale: number) {
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.globalAlpha = 1;
	context.globalCompositeOperation = 'source-over';
	context.clearRect(0, 0, width, height);
	context.setTransform(scale, 0, 0, scale, 0, 0);
}

export function readGooField({ context, width, height, coverage, darkness }: GooField) {
	const { data } = context.getImageData(0, 0, width, height);
	// Scenes paint in a handful of flat colours, so neighbouring pixels usually repeat one; reusing its tone skips the cube root.
	let lastRed = -1;
	let lastGreen = -1;
	let lastBlue = -1;
	let lastTone = 0;
	for (let pixel = 0, offset = 0; pixel < coverage.length; pixel++, offset += 4) {
		const alpha = data[offset + 3] / 255;
		if (alpha === 0) {
			coverage[pixel] = 0;
			darkness[pixel] = 0;
			continue;
		}
		const red = data[offset];
		const green = data[offset + 1];
		const blue = data[offset + 2];
		if (red !== lastRed || green !== lastGreen || blue !== lastBlue) {
			lastRed = red;
			lastGreen = green;
			lastBlue = blue;
			lastTone = 1 - Math.cbrt(0.2126 * LINEAR_CHANNEL[red] + 0.7152 * LINEAR_CHANNEL[green] + 0.0722 * LINEAR_CHANNEL[blue]);
		}
		coverage[pixel] = alpha;
		darkness[pixel] = alpha * lastTone;
	}
}

function gaussianKernel(sigma: number) {
	const radius = Math.max(1, Math.ceil(sigma * 3));
	const kernel = new Float32Array(radius * 2 + 1);
	let total = 0;
	for (let offset = -radius; offset <= radius; offset++) {
		const weight = Math.exp(-(offset * offset) / (2 * sigma * sigma));
		kernel[offset + radius] = weight;
		total += weight;
	}
	for (let index = 0; index < kernel.length; index++) kernel[index] /= total;
	return kernel;
}

// Scenes fill only part of the field, so the blur skips everything its kernel can't reach from any content: whole
// rows, and the stretch of each row beyond its content's reach. Those pixels are written as zero, which is exactly what
// summing zeros gives, so the result is unchanged. The vertical pass sums whole rows at a time, walking memory in order
// instead of striding down each column; each pixel's sum still runs in the same order and precision.
interface BlurBuffers {
	sums: Float64Array;
	// Per row, the first and one-past-last column its blurred values can be non-zero in; an empty row has start === end.
	reachStart: Int32Array;
	reachEnd: Int32Array;
}

const blurBuffers = new Map<string, BlurBuffers>();

function blur(values: Float32Array, scratch: Float32Array, width: number, height: number, kernel: Float32Array) {
	const radius = (kernel.length - 1) / 2;
	const key = `${width}x${height}`;
	let buffers = blurBuffers.get(key);
	if (!buffers) {
		buffers = { sums: new Float64Array(width), reachStart: new Int32Array(height), reachEnd: new Int32Array(height) };
		blurBuffers.set(key, buffers);
	}
	const { sums, reachStart, reachEnd } = buffers;

	for (let y = 0; y < height; y++) {
		const rowStart = y * width;
		let first = -1;
		let last = -1;
		for (let x = 0; x < width; x++) {
			if (values[rowStart + x] !== 0) {
				if (first === -1) first = x;
				last = x;
			}
		}
		if (first === -1) {
			reachStart[y] = 0;
			reachEnd[y] = 0;
			scratch.fill(0, rowStart, rowStart + width);
			continue;
		}
		const start = Math.max(0, first - radius);
		const end = Math.min(width, last + radius + 1);
		reachStart[y] = start;
		reachEnd[y] = end;
		scratch.fill(0, rowStart, rowStart + start);
		scratch.fill(0, rowStart + end, rowStart + width);
		for (let x = start; x < end; x++) {
			let sum = 0;
			const from = Math.max(-radius, -x);
			const to = Math.min(radius, width - 1 - x);
			for (let offset = from; offset <= to; offset++) sum += values[rowStart + x + offset] * kernel[offset + radius];
			scratch[rowStart + x] = sum;
		}
	}

	for (let y = 0; y < height; y++) {
		const from = Math.max(-radius, -y);
		const to = Math.min(radius, height - 1 - y);
		const rowStart = y * width;
		let start = width;
		let end = 0;
		for (let offset = from; offset <= to; offset++) {
			const source = y + offset;
			if (reachStart[source] === reachEnd[source]) continue;
			if (reachStart[source] < start) start = reachStart[source];
			if (reachEnd[source] > end) end = reachEnd[source];
		}
		if (start >= end) {
			values.fill(0, rowStart, rowStart + width);
			continue;
		}
		sums.fill(0, start, end);
		for (let offset = from; offset <= to; offset++) {
			const weight = kernel[offset + radius];
			const sourceStart = (y + offset) * width;
			for (let x = start; x < end; x++) sums[x] += scratch[sourceStart + x] * weight;
		}
		values.fill(0, rowStart, rowStart + start);
		for (let x = start; x < end; x++) values[rowStart + x] = sums[x];
		values.fill(0, rowStart + end, rowStart + width);
	}
}

/** `sigma` is in field pixels. */
export function fuseGooField({ width, height, coverage, darkness }: GooField, scratch: Float32Array, sigma: number) {
	const kernel = gaussianKernel(sigma);
	blur(coverage, scratch, width, height, kernel);
	blur(darkness, scratch, width, height, kernel);
	const thresholdBlend = Math.min(1, sigma / FULL_THRESHOLD_SIGMA);
	for (let pixel = 0; pixel < coverage.length; pixel++) {
		const blurred = coverage[pixel];
		if (blurred <= 0.001) {
			coverage[pixel] = 0;
			darkness[pixel] = 0;
			continue;
		}
		const edge = Math.min(1, Math.max(0, (blurred - THRESHOLD_LOW) / (THRESHOLD_HIGH - THRESHOLD_LOW)));
		const cut = edge * edge * (3 - 2 * edge);
		const fused = blurred + (cut - blurred) * thresholdBlend;
		darkness[pixel] *= fused / blurred;
		coverage[pixel] = fused;
	}
}

import { deflateSync, inflateSync } from 'node:zlib';

// A small PNG codec. The encoder writes 8-bit RGBA, filter 0 per row, fixed zlib level and no time chunk, so the
// same pixels always give the same bytes. The decoder reads every non-interlaced PNG a design tool or browser
// exports (gray, gray-alpha, RGB, RGBA, palette; 1 to 16 bits) into straight RGBA.

export type Pixels = { width: number; height: number; data: Uint8ClampedArray };

const CRC = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buf: Buffer): number {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(td));
	return Buffer.concat([len, td, crc]);
}

/** Straight RGBA in, PNG bytes out. */
export function encodePng({ width, height, data }: Pixels): Buffer {
	const stride = width * 4;
	const raw = Buffer.alloc((stride + 1) * height);
	const src = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	for (let y = 0; y < height; y++) src.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

export const isPng = (buf: Buffer) => buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a;

/** PNG bytes in, straight RGBA out. Throws on an interlaced file (rare in exports; the caller falls back to a browser). */
export function decodePng(buf: Buffer): Pixels {
	if (!isPng(buf)) throw new Error('Not a PNG file');
	let pos = 8;
	let width = 0;
	let height = 0;
	let depth = 8;
	let type = 6;
	let interlace = 0;
	let palette: Buffer | undefined;
	let trns: Buffer | undefined;
	const idat: Buffer[] = [];
	while (pos < buf.length) {
		const len = buf.readUInt32BE(pos);
		const name = buf.toString('ascii', pos + 4, pos + 8);
		const body = buf.subarray(pos + 8, pos + 8 + len);
		if (name === 'IHDR') {
			width = body.readUInt32BE(0);
			height = body.readUInt32BE(4);
			depth = body[8]!;
			type = body[9]!;
			interlace = body[12]!;
		} else if (name === 'PLTE') palette = body;
		else if (name === 'tRNS') trns = body;
		else if (name === 'IDAT') idat.push(body);
		else if (name === 'IEND') break;
		pos += 12 + len;
	}
	if (interlace) throw new Error('Interlaced PNG');
	const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[type];
	if (!channels) throw new Error(`Unsupported PNG color type ${type}`);
	const bpp = Math.max(1, (channels * depth) / 8);
	const stride = Math.ceil((width * channels * depth) / 8);
	const raw = inflateSync(Buffer.concat(idat));
	const rows = Buffer.alloc(stride * height);
	let prev = Buffer.alloc(stride);
	for (let y = 0; y < height; y++) {
		const filter = raw[y * (stride + 1)]!;
		const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
		const out = rows.subarray(y * stride, (y + 1) * stride);
		for (let x = 0; x < stride; x++) {
			const a = x >= bpp ? out[x - bpp]! : 0;
			const b = prev[x]!;
			const c = x >= bpp ? prev[x - bpp]! : 0;
			let v = line[x]!;
			if (filter === 1) v += a;
			else if (filter === 2) v += b;
			else if (filter === 3) v += (a + b) >> 1;
			else if (filter === 4) {
				const p = a + b - c;
				const pa = Math.abs(p - a);
				const pb = Math.abs(p - b);
				const pc = Math.abs(p - c);
				v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
			}
			out[x] = v & 255;
		}
		prev = out;
	}
	const data = new Uint8ClampedArray(width * height * 4);
	const sample = (row: number, index: number): number => {
		const base = row * stride;
		if (depth === 8) return rows[base + index]!;
		if (depth === 16) return rows[base + index * 2]!;
		const perByte = 8 / depth;
		const byte = rows[base + Math.floor(index / perByte)]!;
		const shift = 8 - depth * ((index % perByte) + 1);
		const v = (byte >> shift) & ((1 << depth) - 1);
		return type === 3 ? v : Math.round((v * 255) / ((1 << depth) - 1));
	};
	const key16 = (b: Buffer, i: number) => (depth === 16 ? b.readUInt16BE(i) >> 8 : b.readUInt16BE(i) & 255);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const o = (y * width + x) * 4;
			if (type === 3) {
				const i = sample(y, x);
				data[o] = palette?.[i * 3] ?? 0;
				data[o + 1] = palette?.[i * 3 + 1] ?? 0;
				data[o + 2] = palette?.[i * 3 + 2] ?? 0;
				data[o + 3] = trns && i < trns.length ? trns[i]! : 255;
			} else if (type === 0 || type === 4) {
				const g = sample(y, x * channels);
				data[o] = data[o + 1] = data[o + 2] = g;
				data[o + 3] = type === 4 ? sample(y, x * channels + 1) : trns && g === key16(trns, 0) ? 0 : 255;
			} else {
				const r = sample(y, x * channels);
				const g = sample(y, x * channels + 1);
				const b = sample(y, x * channels + 2);
				data[o] = r;
				data[o + 1] = g;
				data[o + 2] = b;
				data[o + 3] = type === 6 ? sample(y, x * channels + 3) : trns && r === key16(trns, 0) && g === key16(trns, 2) && b === key16(trns, 4) ? 0 : 255;
			}
		}
	}
	return { width, height, data };
}

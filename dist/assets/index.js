import { createRequire as __ds_require } from 'node:module'; const require = __ds_require(import.meta.url);

// dist/assets/canvas.js
import { readFileSync as readFileSync2 } from "node:fs";
import { createCanvas, GlobalFonts, SvgExportFlag } from "@napi-rs/canvas";

// dist/lib/brand.js
import { readFileSync } from "node:fs";

// dist/lib/paths.js
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
var PKG_ROOT = (() => {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, "brand", "brand.json")) && dirname(dir) !== dir)
    dir = dirname(dir);
  return dir;
})();
var pkgPath = (...parts) => join(PKG_ROOT, ...parts);

// dist/lib/brand.js
var tokenFile;
function tokens() {
  tokenFile ??= JSON.parse(readFileSync(pkgPath("build", "tokens.json"), "utf8"));
  return tokenFile;
}
function colorHex(name, theme = "site") {
  const t = tokens();
  const table = theme === "site" ? t.site : theme === "product" ? t.product : { ...t.product, ...t.dark };
  const raw = table[`--ds-color-${name}`];
  if (!raw)
    return void 0;
  if (raw.startsWith("#"))
    return raw.toUpperCase();
  const rgb2 = raw.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[/,]\s*([\d.]+))?/);
  if (!rgb2)
    return void 0;
  const hex = [rgb2[1], rgb2[2], rgb2[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase();
  return rgb2[4] === void 0 ? `#${hex}` : `#${hex}${Math.round(Number(rgb2[4]) * 255).toString(16).padStart(2, "0").toUpperCase()}`;
}

// dist/assets/png.js
import { deflateSync } from "node:zlib";
var CRC = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++)
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(buf) {
  let c = 4294967295;
  for (let i = 0; i < buf.length; i++)
    c = CRC[(c ^ buf[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(pixels, width, height, channels = 4, dpi) {
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++)
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 4 ? 6 : 2;
  const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr)];
  if (dpi) {
    const phys = Buffer.alloc(9);
    const ppm = Math.round(dpi / 0.0254);
    phys.writeUInt32BE(ppm, 0);
    phys.writeUInt32BE(ppm, 4);
    phys[8] = 1;
    parts.push(chunk("pHYs", phys));
  }
  parts.push(chunk("IDAT", deflateSync(raw, { level: 6 })), chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(parts);
}

// dist/assets/canvas.js
var fonts;
function brandFonts() {
  if (fonts)
    return fonts;
  const doc6 = JSON.parse(readFileSync2(pkgPath("brand", "fonts", "fonts.json"), "utf8"));
  for (const face of [doc6.sans, doc6.data])
    for (const file of Object.values(face.files))
      GlobalFonts.registerFromPath(pkgPath("brand", "fonts", file), face.family);
  fonts = { sans: `"${doc6.sans.family}"`, data: `"${doc6.data.family}"` };
  return fonts;
}
function surface(width, height, opts = {}) {
  brandFonts();
  const scale = opts.scale ?? 1;
  const pw = Math.max(1, Math.round(width * scale));
  const ph = Math.max(1, Math.round(height * scale));
  const canvas = opts.svg ? createCanvas(pw, ph, SvgExportFlag.ConvertTextToPaths) : createCanvas(pw, ph);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { canvas, ctx, width, height, scale, svg: !!opts.svg };
}
function scratch(width, height) {
  brandFonts();
  const canvas = createCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
  return { canvas, ctx: canvas.getContext("2d") };
}
function pixelsOf(s) {
  const { width, height } = s.canvas;
  const img = s.canvas.getContext("2d").getImageData(0, 0, width, height);
  return { data: Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength), width, height };
}
function toPng(s, opts = {}) {
  if (s.svg)
    throw new Error("This surface records SVG; draw again on a raster surface for PNG.");
  const px2 = pixelsOf(s);
  if (!opts.opaque)
    return encodePng(px2.data, px2.width, px2.height, 4, opts.dpi);
  const rgb2 = Buffer.alloc(px2.width * px2.height * 3);
  for (let i = 0, j = 0; i < px2.data.length; i += 4, j += 3) {
    rgb2[j] = px2.data[i];
    rgb2[j + 1] = px2.data[i + 1];
    rgb2[j + 2] = px2.data[i + 2];
  }
  return encodePng(rgb2, px2.width, px2.height, 3, opts.dpi);
}
function encoded(s, type, quality = 92) {
  if (s.svg)
    throw new Error("This surface records SVG; draw again on a raster surface.");
  return type === "image/jpeg" ? s.canvas.toBuffer("image/jpeg", quality) : s.canvas.toBuffer("image/webp", quality);
}
function toSvg(s, physical) {
  if (!s.svg)
    throw new Error("This surface holds pixels; draw again with { svg: true } for SVG.");
  let svg = compactSvg(s.canvas.getContent().toString("utf8"));
  if (physical)
    svg = svg.replace(/(<svg [^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${physical.widthIn}in" height="${physical.heightIn}in" viewBox="0 0 ${s.canvas.width} ${s.canvas.height}"`);
  return svg;
}
function tokenColor(name) {
  if (/^#[0-9a-f]{3,8}$/i.test(name) || /^rgba?\(/.test(name))
    return name;
  const hex = colorHex(name.replace(/^--ds-color-/, ""));
  if (!hex)
    throw new Error(`Unknown color token \`${name}\`.`);
  if (hex.length === 9) {
    const n = (i) => Number.parseInt(hex.slice(i, i + 2), 16);
    return `rgba(${n(1)}, ${n(3)}, ${n(5)}, ${Math.round(n(7) / 255 * 1e3) / 1e3})`;
  }
  return hex;
}
function lightnessOf(hex) {
  const n = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return Math.cbrt(0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255));
}
function compactSvg(svg) {
  return svg.replace(/ d="([^"]*)"/g, (_m, d) => ` d="${compactPath(d)}"`);
}
var r2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? "0" : String(v);
};
function compactPath(d) {
  const tokens2 = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g);
  if (!tokens2 || tokens2.some((t) => /^[A-Za-z]$/.test(t) && !"MLQCZ".includes(t)))
    return d;
  const subpaths = [];
  let cur = [];
  let seg;
  for (const t of tokens2) {
    if (/^[A-Z]$/.test(t)) {
      if (t === "M" && cur.length) {
        subpaths.push(cur);
        cur = [];
      }
      seg = { cmd: t, nums: [] };
      cur.push(seg);
    } else
      seg?.nums.push(Number(t));
  }
  if (cur.length)
    subpaths.push(cur);
  return subpaths.map((sp) => circleOf(sp) ?? sp.map((s) => s.cmd + s.nums.map(r2).join(" ")).join("")).join("");
}
function circleOf(sp) {
  if (sp.length < 9 || sp[0].cmd !== "M" || sp[0].nums.length !== 2)
    return void 0;
  const pts = [];
  for (const s of sp) {
    if (s.cmd === "Z")
      continue;
    if (s.cmd !== "M" && s.cmd !== "Q")
      return void 0;
    for (let i = 0; i + 1 < s.nums.length; i += 2)
      pts.push([s.nums[i], s.nums[i + 1]]);
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const r = (x1 - x0) / 2;
  if (r <= 0 || Math.abs(x1 - x0 - (y1 - y0)) > r * 0.03)
    return void 0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  for (const s of sp) {
    if (s.cmd === "Z")
      continue;
    const n = s.nums;
    const ex = n[n.length - 2];
    const ey = n[n.length - 1];
    if (Math.abs(Math.hypot(ex - cx, ey - cy) - r) > Math.max(0.01, r * 0.02))
      return void 0;
  }
  const [sx, sy] = pts[0];
  const last2 = pts[pts.length - 1];
  if (Math.hypot(last2[0] - sx, last2[1] - sy) > Math.max(0.01, r * 0.02))
    return void 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    area += ax * by - bx * ay;
  }
  const sweep = area > 0 ? 1 : 0;
  return `M${r2(cx + r)} ${r2(cy)}A${r2(r)} ${r2(r)} 0 1 ${sweep} ${r2(cx - r)} ${r2(cy)}A${r2(r)} ${r2(r)} 0 1 ${sweep} ${r2(cx + r)} ${r2(cy)}Z`;
}

// dist/assets/shader.js
var clamp = (v, a = 0, b3 = 1) => Math.min(b3, Math.max(a, v));
var toLin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
var LIN = new Float32Array(256).map((_, i) => toLin(i));
var lightness = (r, g, b3) => Math.cbrt(0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[b3]);
function oklab(r, g, b3) {
  r = LIN[r];
  g = LIN[g];
  b3 = LIN[b3];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b3);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b3);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b3);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
}
var hexLightness = (h) => {
  const n = parseInt(h.slice(1), 16);
  return lightness(n >> 16 & 255, n >> 8 & 255, n & 255);
};
var cutCache = /* @__PURE__ */ new Map();
function cutout(img, mode, keyTol) {
  const key2 = [img.key, mode, keyTol].join("|");
  const hit = cutCache.get(key2);
  if (hit)
    return hit;
  const sc = Math.min(1, 900 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * sc));
  const h = Math.max(2, Math.round(img.height * sc));
  const { canvas: c, ctx: x } = scratch(w, h);
  x.drawImage(img.canvas, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h);
  const d = id.data;
  const N = w * h;
  const border = [];
  const model = [];
  for (let i = 0; i < w; i++) {
    border.push(i, (h - 1) * w + i);
    model.push(i);
  }
  for (let j = 1; j < h - 1; j++) {
    border.push(j * w, j * w + w - 1);
    model.push(j * w, j * w + w - 1);
  }
  const transparentBorder = border.filter((p) => d[p * 4 + 3] < 200).length / border.length;
  let removed = false;
  if (mode === "auto" && transparentBorder <= 0.25) {
    const lab = new Float32Array(N * 3);
    for (let p = 0; p < N; p++) {
      const o = oklab(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]);
      lab[p * 3] = o[0];
      lab[p * 3 + 1] = o[1];
      lab[p * 3 + 2] = o[2];
    }
    const K = 4;
    const cen = [];
    for (let k = 0; k < K; k++) {
      const p = model[Math.floor((k + 0.5) / K * model.length)];
      cen.push([lab[p * 3], lab[p * 3 + 1], lab[p * 3 + 2]]);
    }
    const dist = (p, c2) => Math.hypot(lab[p * 3] - c2[0], (lab[p * 3 + 1] - c2[1]) * 1.4, (lab[p * 3 + 2] - c2[2]) * 1.4);
    const asg = new Int32Array(model.length);
    for (let it = 0; it < 10; it++) {
      const acc = cen.map(() => [0, 0, 0, 0]);
      model.forEach((p, i) => {
        let b3 = 0;
        let bd = 1e9;
        cen.forEach((c2, k) => {
          const q2 = dist(p, c2);
          if (q2 < bd) {
            bd = q2;
            b3 = k;
          }
        });
        asg[i] = b3;
        const a = acc[b3];
        a[0] += lab[p * 3];
        a[1] += lab[p * 3 + 1];
        a[2] += lab[p * 3 + 2];
        a[3]++;
      });
      acc.forEach((a, k) => {
        if (a[3])
          cen[k] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]];
      });
    }
    const share = cen.map((_, k) => asg.filter((v) => v === k).length / model.length);
    const bgC = cen.filter((_, k) => share[k] >= 0.12);
    const tol = keyTol / 100;
    const dBg = new Float32Array(N);
    for (let p = 0; p < N; p++) {
      let m = 1e9;
      for (const c2 of bgC) {
        const q2 = dist(p, c2);
        if (q2 < m)
          m = q2;
      }
      dBg[p] = m;
    }
    const bg = new Uint8Array(N);
    const q = new Int32Array(N);
    let qh = 0;
    let qt = 0;
    for (const p of border)
      if (dBg[p] < tol * 1.5 && !bg[p]) {
        bg[p] = 1;
        q[qt++] = p;
      }
    while (qh < qt) {
      const p = q[qh++];
      const px2 = p % w;
      const py = p / w | 0;
      for (const n of [
        px2 > 0 ? p - 1 : -1,
        px2 < w - 1 ? p + 1 : -1,
        py > 0 ? p - w : -1,
        py < h - 1 ? p + w : -1
      ]) {
        if (n < 0 || bg[n])
          continue;
        const step = Math.hypot(lab[n * 3] - lab[p * 3], (lab[n * 3 + 1] - lab[p * 3 + 1]) * 1.4, (lab[n * 3 + 2] - lab[p * 3 + 2]) * 1.4);
        if (dBg[n] < tol || step < tol * 0.25 && dBg[n] < tol * 3) {
          bg[n] = 1;
          q[qt++] = n;
        }
      }
    }
    let subj = 0;
    for (let p = 0; p < N; p++) {
      if (bg[p])
        continue;
      const px2 = p % w;
      const py = p / w | 0;
      let nb = 0;
      let t = 0;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const X = px2 + dx;
          const Y = py + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h)
            continue;
          t++;
          nb += bg[Y * w + X];
        }
      if (nb / t > 0.8)
        d[p * 4 + 3] = 0;
      else
        subj++;
    }
    for (let p = 0; p < N; p++)
      if (bg[p])
        d[p * 4 + 3] = 0;
    const frac = subj / N;
    if (frac < 5e-3 || frac > 0.985) {
      for (let p = 0; p < N; p++)
        d[p * 4 + 3] = 255;
    } else
      removed = true;
    x.putImageData(id, 0, 0);
  }
  const { canvas: out, ctx: ox } = scratch(w, h);
  if (removed) {
    const { canvas: m, ctx: mx } = scratch(w, h);
    mx.filter = "blur(1px)";
    mx.drawImage(c, 0, 0);
    ox.drawImage(c, 0, 0);
    ox.globalCompositeOperation = "destination-in";
    ox.drawImage(m, 0, 0);
  } else
    ox.drawImage(c, 0, 0);
  if (cutCache.size > 8)
    cutCache.clear();
  cutCache.set(key2, out);
  return out;
}
function grid(W2, H2, dot, gap) {
  const pitch = Math.max(1, dot + gap);
  const cols = Math.min(500, Math.max(1, Math.floor((W2 + gap) / pitch)));
  const rows = Math.min(500, Math.max(1, Math.floor((H2 + gap) / pitch)));
  return {
    cols,
    rows,
    pitch,
    ox: (W2 - pitch * cols) / 2,
    oy: (H2 - pitch * rows) / 2
  };
}
function sample(cut, g, R) {
  const k = 4;
  const cw = g.cols * k;
  const ch = g.rows * k;
  const { ctx: x } = scratch(cw, ch);
  const f = k / g.pitch;
  x.setTransform(f, 0, 0, f, -g.ox * f, -g.oy * f);
  x.imageSmoothingQuality = "high";
  x.drawImage(cut, R.x, R.y, R.w, R.h);
  const d = x.getImageData(0, 0, cw, ch).data;
  const P = cw * ch;
  const A = new Float32Array(P);
  const Lp = new Float32Array(P);
  for (let p = 0; p < P; p++) {
    A[p] = d[p * 4 + 3] / 255;
    Lp[p] = lightness(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]);
  }
  const x0 = (R.x - g.ox) * f;
  const x1 = (R.x + R.w - g.ox) * f;
  const y0 = (R.y - g.oy) * f;
  const y1 = (R.y + R.h - g.oy) * f;
  const inF = (X, Y) => X + 0.5 >= x0 && X + 0.5 <= x1 && Y + 0.5 >= y0 && Y + 0.5 <= y1;
  const cx0 = clamp(Math.ceil(x0), 0, cw - 1);
  const cx1 = clamp(Math.floor(x1) - 1, 0, cw - 1);
  const cy0 = clamp(Math.ceil(y0), 0, ch - 1);
  const cy1 = clamp(Math.floor(y1) - 1, 0, ch - 1);
  const Ae = A.slice();
  const Le = Lp.slice();
  for (let Y = 0; Y < ch; Y++)
    for (let X = 0; X < cw; X++)
      if (!inF(X, Y)) {
        const j = clamp(Y, cy0, cy1) * cw + clamp(X, cx0, cx1);
        Ae[Y * cw + X] = A[j];
        Le[Y * cw + X] = Lp[j];
      }
  const G = new Float32Array(P);
  for (let y = 1; y < ch - 1; y++)
    for (let X = 1; X < cw - 1; X++) {
      const p = y * cw + X;
      const s = (arr, mul) => {
        const v = (i) => arr[i] * (mul ? Ae[i] : 1);
        const gx = v(p - cw + 1) + 2 * v(p + 1) + v(p + cw + 1) - v(p - cw - 1) - 2 * v(p - 1) - v(p + cw - 1);
        const gy = v(p + cw - 1) + 2 * v(p + cw) + v(p + cw + 1) - v(p - cw - 1) - 2 * v(p - cw) - v(p - cw + 1);
        return Math.hypot(gx, gy);
      };
      G[p] = Math.max(s(Le, true), s(Ae, false) * 0.6);
    }
  const N = g.cols * g.rows;
  const m = new Float32Array(N);
  const L = new Float32Array(N);
  const e = new Float32Array(N);
  for (let r = 0; r < g.rows; r++)
    for (let q = 0; q < g.cols; q++) {
      let cov = 0;
      let lum = 0;
      let em = 0;
      let fr = 0;
      for (let yy = 0; yy < k; yy++)
        for (let xx = 0; xx < k; xx++) {
          const Y = r * k + yy;
          const X = q * k + xx;
          const p = Y * cw + X;
          cov += A[p];
          lum += A[p] * Lp[p];
          em += G[p];
          fr += inF(X, Y) ? 1 : 0;
        }
      const i = r * g.cols + q;
      m[i] = fr >= k * k * 0.25 ? cov / fr : 0;
      L[i] = cov > 0 ? lum / cov : 0;
      e[i] = em / (k * k);
    }
  return { m, L, e };
}
var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
function hash(i) {
  let h = Math.imul(i ^ 2654435769, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function boxBlur(v, wt, cols, rows, r) {
  const out = new Float32Array(v.length);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      let s = 0;
      let w = 0;
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const X = x + dx;
          const Y = y + dy;
          if (X < 0 || Y < 0 || X >= cols || Y >= rows)
            continue;
          const i = Y * cols + X;
          s += v[i] * wt[i];
          w += wt[i];
        }
      out[y * cols + x] = w > 0 ? s / w : v[y * cols + x];
    }
  return out;
}
var last = null;
function shade(img, g, R, o) {
  const key2 = [
    img.key,
    g.cols,
    g.rows,
    g.pitch,
    g.ox,
    g.oy,
    R.x,
    R.y,
    R.w,
    R.h,
    JSON.stringify(o)
  ].join("|");
  if (last && last.key === key2)
    return last.st;
  const { cols, rows } = g;
  const N = cols * rows;
  const st = new Uint8Array(N);
  const sm = sample(cutout(img, o.cutout, o.keyTol), g, R);
  const inS = new Uint8Array(N);
  let n = 0;
  for (let i = 0; i < N; i++)
    if (sm.m[i] >= 0.35) {
      inS[i] = 1;
      n++;
    }
  const trace = (i) => !inS[i] && sm.m[i] >= 0.1;
  if (n && o.render === "silhouette") {
    for (let i = 0; i < N; i++)
      st[i] = inS[i] ? 2 : trace(i) ? 1 : 0;
  } else if (n) {
    const light = o.dotsLight !== o.invert;
    let t = new Float32Array(N);
    for (let i = 0; i < N; i++)
      t[i] = light ? sm.L[i] : 1 - sm.L[i];
    if (o.localContrast > 0 && o.render !== "edges") {
      const r = Math.max(2, Math.round(Math.min(cols, rows) / 14));
      const bl = boxBlur(t, sm.m, cols, rows, r);
      const tt = new Float32Array(N);
      for (let i = 0; i < N; i++)
        tt[i] = t[i] + o.localContrast * (t[i] - bl[i]);
      t = tt;
    }
    const es = [];
    for (let i = 0; i < N; i++)
      if (inS[i])
        es.push(sm.e[i]);
    es.sort((a, b3) => a - b3);
    const e95 = es[Math.floor(es.length * 0.95)] || 1e-6;
    const v = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!inS[i])
        continue;
      const e = Math.min(1, sm.e[i] / e95);
      v[i] = o.render === "edges" ? e : o.render === "tone" ? t[i] : t[i] + o.edgeAmt * e;
      v[i] += hash(i) * 1e-4;
    }
    const idx = [];
    for (let i = 0; i < N; i++)
      if (inS[i])
        idx.push(i);
    idx.sort((a, b3) => v[a] - v[b3]);
    const u = new Float32Array(N);
    idx.forEach((i, r) => u[i] = (r + 0.5) / idx.length);
    const T1 = 1 - o.fillPct / 100;
    const T2 = Math.max(0, T1 - o.hollowPct / 100);
    const level = (x) => x >= T1 ? 2 : x >= T2 ? 1 : 3;
    const repOf = (s) => s === 2 ? (1 + T1) / 2 : s === 1 ? (T1 + T2) / 2 : T2 / 2;
    if (o.dither === "diffuse") {
      const err = new Float32Array(N);
      for (let y = 0; y < rows; y++) {
        const ltr = y % 2 === 0;
        for (let k = 0; k < cols; k++) {
          const x = ltr ? k : cols - 1 - k;
          const i = y * cols + x;
          if (!inS[i])
            continue;
          const val = u[i] + err[i];
          const s = level(val);
          st[i] = s;
          const e = val - repOf(s);
          const dir = ltr ? 1 : -1;
          const push = (X, Y, w) => {
            if (X < 0 || Y < 0 || X >= cols || Y >= rows)
              return;
            const j = Y * cols + X;
            if (inS[j])
              err[j] += e * w;
          };
          push(x + dir, y, 7 / 16);
          push(x - dir, y + 1, 3 / 16);
          push(x, y + 1, 5 / 16);
          push(x + dir, y + 1, 1 / 16);
        }
      }
    } else {
      for (const i of idx) {
        let val = u[i];
        if (o.dither === "pattern") {
          const r = i / cols | 0;
          const c = i % cols;
          val += (BAYER[(r & 3) * 4 + (c & 3)] - 0.5) * 0.22;
        }
        st[i] = level(val);
      }
    }
    for (let i = 0; i < N; i++)
      if (trace(i))
        st[i] = 1;
  }
  last = { key: key2, st };
  return st;
}

// dist/assets/dots.js
import { Path2D as Path2D3 } from "@napi-rs/canvas";

// dist/assets/og.js
import { readFileSync as readFileSync5 } from "node:fs";
import { Path2D as Path2D2 } from "@napi-rs/canvas";

// dist/design/platforms.js
var MB = 1024 * 1024;
var px = (w, h, name, x, y, rw, rh, official = false) => ({ name, official, rect: { x: x / w, y: y / h, w: rw / w, h: rh / h } });
var PLATFORMS = [
  { id: "og", label: "Link preview", width: 1200, height: 630, aliases: ["link-preview", "share", "opengraph", "open-graph", "social-card", "1.91:1"], avoid: [], shown: 540, limit: { bytes: 5 * MB, official: false }, source: "https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image", note: "X allows 5 MB for a card picture. Its page refuses automated reading, so the limit is approximate." },
  { id: "square", label: "Square post", width: 1080, height: 1080, aliases: ["1:1", "instagram", "instagram-post", "ig-post", "square-post"], avoid: [], shown: 468, limit: { bytes: 8 * MB, official: false } },
  { id: "portrait", label: "Portrait post", width: 1080, height: 1350, aliases: ["4:5", "portrait-post", "instagram-portrait", "vertical"], avoid: [], shown: 468, limit: { bytes: 8 * MB, official: false } },
  {
    id: "story",
    label: "Story",
    width: 1080,
    height: 1920,
    aliases: ["9:16", "stories", "instagram-story", "ig-story", "reel-cover", "tiktok", "phone"],
    avoid: [px(1080, 1920, "the profile bar at the top", 0, 0, 1080, 250), px(1080, 1920, "the reply bar at the bottom", 0, 1580, 1080, 340)],
    shown: 390,
    limit: { bytes: 8 * MB, official: false },
    source: "https://www.facebook.com/business/help/980593475366490",
    note: "Meta asks for about 14% at the top (250 px) and 20% at the bottom (340 px) to stay free. Its page draws the numbers with a script and could not be read, so they are approximate. Reels covers are stricter (about 35% at the bottom)."
  },
  { id: "landscape", label: "Landscape post", width: 1200, height: 675, aliases: ["16:9", "x-post", "twitter-post", "twitter", "tweet", "landscape-post", "wide", "horizontal"], avoid: [], shown: 516, limit: { bytes: 5 * MB, official: false }, source: "https://help.x.com/en/using-x/posting-gifs-and-pictures" },
  {
    id: "x-banner",
    label: "X header",
    width: 1500,
    height: 500,
    aliases: ["x", "x-header", "twitter-banner", "twitter-header", "twitter-cover", "x-cover", "3:1"],
    avoid: [px(1500, 500, "the profile picture, lower left", 0, 280, 390, 220), px(1500, 500, "the strip X may crop at the top", 0, 0, 1500, 60), px(1500, 500, "the strip X may crop at the bottom", 0, 440, 1500, 60)],
    shown: 600,
    limit: { bytes: 5 * MB, official: false },
    source: "https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo",
    note: "X recommends 1500 x 500 and the header is cropped by up to about 60 px at the top and bottom. The profile picture covers the lower left: its place is measured on x.com at its 600 px column, so it is approximate."
  },
  { id: "linkedin", label: "LinkedIn post", width: 1200, height: 627, aliases: ["linkedin-post", "li-post"], avoid: [], shown: 552, limit: { bytes: 5 * MB, official: false } },
  {
    id: "linkedin-banner",
    label: "LinkedIn profile cover",
    width: 1584,
    height: 396,
    aliases: ["linkedin-cover", "linkedin-header", "linkedin-background", "li-banner", "4:1"],
    avoid: [px(1584, 396, "the profile picture, lower left", 0, 168, 400, 228)],
    shown: 792,
    limit: { bytes: 8 * MB, official: true },
    source: "https://www.linkedin.com/help/linkedin/answer/a568217",
    note: "1584 x 396 and under 8 MB are LinkedIn's. Where the profile picture sits is measured on the desktop page, so it is approximate."
  },
  {
    id: "linkedin-page",
    label: "LinkedIn page cover",
    width: 1512,
    height: 256,
    aliases: ["linkedin-company", "linkedin-company-banner", "linkedin-page-banner", "linkedin-page-cover", "li-page"],
    avoid: [px(1512, 256, "the lower-right corner", 1260, 154, 252, 102), px(1512, 256, "the page logo, lower left", 0, 160, 225, 96), px(1512, 256, "the left edge", 0, 0, 40, 256), px(1512, 256, "the right edge", 1472, 0, 40, 256), px(1512, 256, "the top edge", 0, 0, 1512, 16), px(1512, 256, "the bottom edge", 0, 240, 1512, 16)],
    shown: 1128,
    limit: { bytes: 3 * MB, official: true },
    source: "https://www.linkedin.com/help/linkedin/answer/a563309",
    note: `1512 x 256, 3 MB, and "keep key details away from the edges, especially the lower-right corner" are LinkedIn's. The widths of those edges are approximate, as it gives none. (The older 1128 x 191 is the same shape to within 1%.)`
  },
  {
    id: "youtube",
    label: "YouTube channel art",
    width: 2560,
    height: 1440,
    aliases: ["youtube-banner", "youtube-channel-art", "channel-art", "youtube-art", "youtube-cover", "yt-banner"],
    avoid: [],
    safe: { name: "the part every device shows", official: true, rect: { x: (1 - 1235 / 2048) / 2, y: (1 - 338 / 1152) / 2, w: 1235 / 2048, h: 338 / 1152 } },
    shown: 1280,
    limit: { bytes: 6 * MB, official: true },
    source: "https://support.google.com/youtube/answer/10456525",
    note: "YouTube: 2560 x 1440 recommended, words and logos inside 1235 x 338 of 2048 x 1152, 6 MB or smaller."
  },
  {
    id: "youtube-thumbnail",
    label: "YouTube thumbnail",
    width: 1280,
    height: 720,
    aliases: ["thumbnail", "yt-thumbnail", "video-thumbnail", "youtube-thumb"],
    avoid: [px(1280, 720, "the video length, lower right", 1120, 630, 160, 90)],
    shown: 360,
    limit: { bytes: 2 * MB, official: true },
    source: "https://support.google.com/youtube/answer/72431",
    note: "YouTube takes 2 MB from a phone and 50 MB from a computer; the check warns at 2 MB. Where the video length sits is approximate."
  },
  { id: "email", label: "Email header", width: 1200, height: 400, aliases: ["email-header", "newsletter"], avoid: [], shown: 600, limit: { bytes: 1 * MB, official: false }, note: "Emails are usually 600 px wide, so this is drawn at twice that." },
  {
    id: "avatar",
    label: "Profile picture",
    width: 800,
    height: 800,
    aliases: ["profile-picture", "profile-photo", "pfp", "profile", "app-icon"],
    avoid: [],
    safe: { name: "the circle it is cropped to", official: true, rect: { x: (1 - Math.SQRT1_2) / 2, y: (1 - Math.SQRT1_2) / 2, w: Math.SQRT1_2, h: Math.SQRT1_2 } },
    shown: 400,
    limit: { bytes: 2 * MB, official: true },
    source: "https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo",
    note: "X takes 2 MB; YouTube takes 15 MB. Shown as a circle, so everything stays inside the square the circle holds."
  },
  { id: "pinterest", label: "Pinterest pin", width: 1e3, height: 1500, aliases: ["pin", "2:3"], avoid: [], shown: 236, limit: { bytes: 20 * MB, official: true }, source: "https://help.pinterest.com/en/business/article/pinterest-product-specs", note: "Pinterest recommends 2:3 (1000 x 1500), 20 MB on desktop. Its grid shows pins about 236 px wide (approximate), so small text needs to be large." },
  { id: "facebook-cover", label: "Facebook page cover", width: 1702, height: 630, aliases: ["facebook-banner", "fb-cover"], avoid: [px(1702, 630, "the strip a phone crops at the left", 0, 0, 95, 630), px(1702, 630, "the strip a phone crops at the right", 1607, 0, 95, 630), px(1702, 630, "the profile picture, lower left", 0, 470, 420, 160)], shown: 851, limit: { bytes: 100 * 1024, official: true }, source: "https://www.facebook.com/help/125379114252045", note: "Facebook recommends 851 x 315 (this is twice that) and under 100 KB for fast loading; phones show 2.4:1, so the sides are cropped. The profile picture covers part of the left: where is approximate." },
  { id: "facebook", label: "Facebook post", width: 1080, height: 1350, aliases: ["facebook-post", "fb-post", "threads", "threads-post", "meta-feed"], avoid: [], shown: 500, limit: { bytes: 8 * MB, official: false }, note: "Facebook, Threads and Meta feed ads take 4:5 at 1080 x 1350." },
  { id: "ad-300x250", label: "Medium rectangle ad", width: 300, height: 250, aliases: ["medium-rectangle", "mrec"], avoid: [], shown: 300, limit: { bytes: 150 * 1024, official: false }, source: "https://support.google.com/google-ads/answer/7031480", note: "Listed by Google Ads among common sizes. The 150 KB limit is what ad networks usually ask for (approximate)." },
  { id: "ad-336x280", label: "Large rectangle ad", width: 336, height: 280, aliases: ["large-rectangle"], avoid: [], shown: 336, limit: { bytes: 150 * 1024, official: false }, source: "https://support.google.com/google-ads/answer/7031480" },
  { id: "ad-728x90", label: "Leaderboard ad", width: 728, height: 90, aliases: ["leaderboard"], avoid: [], shown: 728, limit: { bytes: 150 * 1024, official: false }, source: "https://support.google.com/google-ads/answer/7031480" },
  { id: "ad-300x600", label: "Half page ad", width: 300, height: 600, aliases: ["half-page"], avoid: [], shown: 300, limit: { bytes: 150 * 1024, official: false }, source: "https://support.google.com/google-ads/answer/7031480" },
  { id: "ad-320x50", label: "Mobile banner ad", width: 320, height: 50, aliases: ["mobile-banner"], avoid: [], shown: 320, limit: { bytes: 150 * 1024, official: false }, note: "An IAB size; Google's page lists 300x50 instead." },
  { id: "ad-160x600", label: "Wide skyscraper ad", width: 160, height: 600, aliases: ["skyscraper", "wide-skyscraper"], avoid: [], shown: 160, limit: { bytes: 150 * 1024, official: false }, source: "https://support.google.com/google-ads/answer/7031480" },
  { id: "ad-970x250", label: "Billboard ad", width: 970, height: 250, aliases: ["billboard"], avoid: [], shown: 970, limit: { bytes: 150 * 1024, official: false }, note: "An IAB size; Google's page lists 970x90." },
  { id: "meeting", label: "Video call background", width: 1920, height: 1080, aliases: ["zoom", "zoom-background", "meet", "teams", "virtual-background"], avoid: [px(1920, 1080, "where the person sits", 560, 300, 800, 780)], shown: 960, note: "Zoom recommends 1920 x 1080. The middle is covered by the person on the call (approximate), and apps mirror the picture for the person themselves." },
  { id: "desktop", label: "Desktop wallpaper", width: 2880, height: 1800, aliases: ["wallpaper", "desktop-wallpaper", "laptop"], avoid: [], shown: 1440 },
  { id: "phone-wallpaper", label: "Phone wallpaper", width: 1170, height: 2532, aliases: ["lock-screen", "mobile-wallpaper", "iphone"], avoid: [px(1170, 2532, "the clock", 0, 0, 1170, 760), px(1170, 2532, "the home bar and controls", 0, 2240, 1170, 292)], shown: 390, note: "An iPhone at 3x. Where the clock and controls sit is approximate." },
  { id: "a4", label: "A4 page", width: 2480, height: 3508, aliases: ["a4-page", "one-pager", "one-pager-a4"], avoid: [], shown: 794, note: "At 300 dpi; shown is the page at 96 dpi." },
  { id: "letter", label: "US Letter page", width: 2550, height: 3300, aliases: ["us-letter", "letter-page", "one-pager-letter"], avoid: [], shown: 816, note: "At 300 dpi; shown is the page at 96 dpi." },
  { id: "business-card", label: "Business card", width: 1050, height: 600, aliases: ["card-print", "visiting-card"], avoid: [px(1050, 600, "the bleed and safe margin", 0, 0, 1050, 75), px(1050, 600, "the bleed and safe margin", 0, 525, 1050, 75), px(1050, 600, "the bleed and safe margin", 0, 0, 75, 600), px(1050, 600, "the bleed and safe margin", 975, 0, 75, 600)], shown: 336, note: "3.5 x 2 in at 300 dpi; the edges hold 0.125 in of bleed and 0.125 in of safe margin. Confirm with the printer." },
  { id: "email-signature", label: "Email signature", width: 1200, height: 300, aliases: ["signature"], avoid: [], shown: 600, limit: { bytes: 100 * 1024, official: false }, note: "Shown at 600 x 150; keep it light, mail clients clip large signatures." }
];
function platformOf(id, width, height) {
  const hit = PLATFORMS.find((p) => p.id === id);
  return hit ?? { id, label: id, width, height, aliases: [], avoid: [], shown: Math.max(540, width / 2) };
}
var zonePx = (z, width, height) => ({ x: z.rect.x * width, y: z.rect.y * height, w: z.rect.w * width, h: z.rect.h * height });
var key = (s) => s.toLowerCase().trim().replace(/[\s_]+/g, "-");
function sizeAlias(typed) {
  const k = key(typed);
  return PLATFORMS.find((p) => p.id === k || p.aliases.includes(k))?.id;
}

// dist/design/doc.js
var STATE_KEYS = ["template", "size", "theme", "copy", "images", "seed", "options", "layers", "allow", "blocks", "grid"];
var DOC_KEYS = ["version", "brand", "kind", ...STATE_KEYS, "history", "future"];

// dist/design/compose.js
var GRID = { cols: 12, rows: 12 };
function gridOf(doc6, margin) {
  const { width: W2, height: H2 } = doc6.size;
  const grid2 = doc6.grid ?? GRID;
  const pf = platformOf(doc6.size.id, W2, H2);
  let S = pf.safe ? zonePx(pf.safe, W2, H2) : { x: 0, y: 0, w: W2, h: H2 };
  for (const z of pf.avoid) {
    const r = zonePx(z, W2, H2);
    if (r.w > W2 - 1)
      S = r.y < 1 ? { ...S, y: r.y + r.h, h: S.y + S.h - r.y - r.h } : { ...S, h: r.y - S.y };
    else if (r.h > H2 - 1)
      S = r.x < 1 ? { ...S, x: r.x + r.w, w: S.x + S.w - r.x - r.w } : { ...S, w: r.x - S.x };
  }
  const m = margin ?? Math.round(Math.min(S.w, S.h) * 0.06);
  const g = Math.round(Math.min(S.w, S.h) * 0.02);
  const cw = (S.w - m * 2 - g * (grid2.cols - 1)) / grid2.cols;
  const ch = (S.h - m * 2 - g * (grid2.rows - 1)) / grid2.rows;
  return {
    m,
    g,
    cell: (at3) => ({ x: S.x + m + at3.col * (cw + g), y: S.y + m + at3.row * (ch + g), w: at3.cols * cw + (at3.cols - 1) * g, h: at3.rows * ch + (at3.rows - 1) * g })
  };
}
function blockRects(doc6, margin) {
  const g = gridOf(doc6, margin);
  return (doc6.blocks ?? []).map((block) => ({ block, rect: g.cell(block.at) }));
}

// dist/design/png.js
var TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++)
    c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
  return c >>> 0;
});

// dist/design/check.js
var SMALL_FLOOR = 8;
function rgb(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!m)
    return void 0;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
}
function luminance(hex) {
  const c = rgb(hex);
  if (!c)
    return Number.NaN;
  const [r, g, b3] = c.map((n) => {
    const v = n / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b3;
}
function contrast(a, b3) {
  const [x, y] = [luminance(a), luminance(b3)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

// dist/design/run.js
var BOOLEAN = /* @__PURE__ */ new Set(["json", "force", "help", "dry-run", "sample", "front", "back"]);
var FLAGS = ["variants", "template", "size", "theme", "width", "height", "seed", "set", "option", "image", "layer", "hide", "show", "reset", "allow", "out", "format", "scale", "by", "count", "to", "steps", "replace", "at", "place", "id", "grid", "flavor", ...BOOLEAN];

// dist/assets/glyphs.js
import { readFileSync as readFileSync3 } from "node:fs";
var cache = /* @__PURE__ */ new Map();
function covers(file) {
  const hit = cache.get(file);
  if (hit)
    return hit;
  const b3 = readFileSync3(file);
  const tables = b3.readUInt16BE(4);
  let cmap = 0;
  for (let i = 0; i < tables; i++)
    if (b3.toString("latin1", 12 + i * 16, 16 + i * 16) === "cmap")
      cmap = b3.readUInt32BE(12 + i * 16 + 8);
  const tests = [];
  for (let i = 0; i < b3.readUInt16BE(cmap + 2); i++) {
    const at3 = cmap + b3.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = b3.readUInt16BE(at3);
    if (format === 4) {
      const n = b3.readUInt16BE(at3 + 6) / 2;
      const end = at3 + 14;
      const start = end + n * 2 + 2;
      const delta = start + n * 2;
      const range = delta + n * 2;
      tests.push((cp) => {
        if (cp > 65535)
          return false;
        for (let s = 0; s < n; s++) {
          if (cp > b3.readUInt16BE(end + s * 2))
            continue;
          const from = b3.readUInt16BE(start + s * 2);
          if (cp < from)
            return false;
          const ro = b3.readUInt16BE(range + s * 2);
          const glyph = ro ? b3.readUInt16BE(range + s * 2 + ro + (cp - from) * 2) : cp;
          return glyph !== 0 && (glyph + b3.readUInt16BE(delta + s * 2) & 65535) !== 0;
        }
        return false;
      });
    } else if (format === 12) {
      const n = b3.readUInt32BE(at3 + 12);
      tests.push((cp) => {
        for (let g = 0; g < n; g++) {
          const o = at3 + 16 + g * 12;
          if (cp >= b3.readUInt32BE(o) && cp <= b3.readUInt32BE(o + 4))
            return b3.readUInt32BE(o + 8) + cp - b3.readUInt32BE(o) !== 0;
        }
        return false;
      });
    }
  }
  const test = (cp) => tests.some((t) => t(cp));
  cache.set(file, test);
  return test;
}
function missingGlyphs(text, face = "sans") {
  const doc6 = JSON.parse(readFileSync3(pkgPath("brand", "fonts", "fonts.json"), "utf8"));
  const file = pkgPath("brand", "fonts", Object.values(doc6[face].files)[0]);
  const has2 = covers(file);
  return [.../* @__PURE__ */ new Set([...text.normalize("NFC")])].filter((ch) => !/\s/.test(ch) && !has2(ch.codePointAt(0)));
}
function assertGlyphs(what, text, face = "sans") {
  const gone = missingGlyphs(text, face);
  if (!gone.length)
    return;
  const emoji = gone.filter((c) => new RegExp("\\p{Extended_Pictographic}", "u").test(c));
  throw new Error(`The brand's type has no letters for ${gone.map((c) => `"${c}"`).slice(0, 8).join(", ")} in the ${what}${emoji.length === gone.length ? ": emoji are not part of it. Take them out." : ". It draws Latin letters, numbers and marks. Write it in those."}`);
}

// dist/assets/logo.js
import { readFileSync as readFileSync4 } from "node:fs";
import { Path2D } from "@napi-rs/canvas";
var doc;
var logoDoc = () => doc ??= JSON.parse(readFileSync4(pkgPath("brand", "assets", "logo.json"), "utf8"));
var logoRatio = () => logoDoc().width / logoDoc().height;
var logoClear = (h) => h * logoDoc().clear.ratio;
var logoMin = (width, shown) => logoDoc().min.shown * width / shown;
var markRatio = () => logoDoc().mark.width / logoDoc().mark.height;
function drawLogo(ctx, x, y, h, mark, ink) {
  const l = logoDoc();
  const m = h / l.height;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(m, m);
  drawMarkUnits(ctx, l.height, mark);
  ctx.translate(-l.wordmark.origin[0], -l.wordmark.origin[1]);
  ctx.fillStyle = ink;
  ctx.fill(new Path2D(l.wordmark.paths.join("")));
  ctx.restore();
}
function drawMark(ctx, x, y, h, color2, pop = 1) {
  ctx.save();
  ctx.translate(x, y);
  drawMarkUnits(ctx, h, color2, pop);
  ctx.restore();
}
function drawMarkUnits(ctx, h, color2, pop = 1) {
  const l = logoDoc();
  ctx.save();
  ctx.scale(h / l.mark.height, h / l.mark.height);
  ctx.fillStyle = color2;
  ctx.fill(new Path2D(l.mark.path), "evenodd");
  const { cx, cy, r } = l.mark.circle;
  ctx.beginPath();
  ctx.arc(cx + 260.5 * (1 - pop), cy - 19.36 * (1 - pop), r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// dist/assets/og.js
var TEMPLATES = ["banner", "products", "social", "cards", "customer", "mark"];
var doc2;
var imageDoc = () => doc2 ??= JSON.parse(readFileSync5(pkgPath("brand", "assets", "image.json"), "utf8"));
var clampDim = (n) => Math.round(Math.min(4e3, Math.max(200, n || 0)));
function frameOf(d) {
  return imageDoc().sizes[d.size] ?? { label: "Custom", w: clampDim(d.w), h: clampDim(d.h) };
}
var resolved;
function palettes() {
  return resolved ??= imageDoc().palettes.map((p) => ({
    ...p,
    bg: tokenColor(p.bg),
    fill: tokenColor(p.fill),
    ring: tokenColor(p.ring),
    field: tokenColor(p.field),
    text: tokenColor(p.text),
    ink: tokenColor(p.ink),
    mark: tokenColor(p.mark)
  }));
}
var paletteOf = (d) => {
  const all = palettes();
  return all.find((p) => p.name.toLowerCase() === d.palette.toLowerCase()) ?? all[0];
};
var onFill = (p) => contrast(p.bg, p.fill) >= 4.5 ? p.bg : tokenColor("white");
function designFor(template, size, dims = { w: 1200, h: 675 }) {
  const t = imageDoc().templates[template];
  return { template, ...imageDoc().base, ...t.set, size: size ?? t.size, w: dims.w, h: dims.h };
}
var RING = 1.2;
var newCanvas = (w = 1, h = 1) => scratch(w, h).canvas;
var CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
var LOGO = { anchors: CORNERS, scale: [0.75, 1.6], hide: true };
var HEAD = { move: true, scale: [0.5, 1.5], align: true };
var BODY_CAN = { move: true, scale: [0.7, 1.4] };
var ART = { move: true, scale: [0.4, 1.6], hide: true };
var FIXED = {};
var CAN = {
  banner: { logo: LOGO, badge: FIXED, headline: HEAD, body: BODY_CAN, art: ART, field: FIXED },
  products: { logo: { scale: [0.75, 1.6], hide: true }, headline: { scale: [0.5, 1.5], align: true }, cta: FIXED, panel: FIXED, lists: FIXED, art: ART, field: FIXED },
  social: { logo: LOGO, badge: FIXED, headline: HEAD, body: BODY_CAN, art: ART, field: FIXED },
  cards: { logo: { scale: [0.75, 1.3], hide: true }, headline: { scale: [0.6, 1.4], align: true }, cards: FIXED, numbers: FIXED, panels: FIXED, footer: { hide: true }, field: FIXED },
  customer: { logo: { scale: [0.75, 1.6], hide: true }, partner: { scale: [0.6, 1.6] }, stat: { scale: [0.6, 1.3] }, headline: HEAD, art: { move: true, scale: [0.4, 1.6], hide: true }, field: FIXED },
  mark: { logo: { scale: [0.5, 1.3] }, field: FIXED }
};
var right = (r) => r.x + r.w;
var bottom = (r) => r.y + r.h;
var grow = (r, by) => ({ x: r.x - by, y: r.y - by, w: r.w + by * 2, h: r.h + by * 2 });
var hits = (a, b3) => a.x < right(b3) && right(a) > b3.x && a.y < bottom(b3) && bottom(a) > b3.y;
var union = (rs) => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map(right)) - x, h: Math.max(...rs.map(bottom)) - y };
};
function stageOf(size, W2, H2) {
  const pf = platformOf(size, W2, H2);
  if (pf.safe)
    return { S: zonePx(pf.safe, W2, H2), cuts: [] };
  let S = { x: 0, y: 0, w: W2, h: H2 };
  const cuts = [];
  for (const z of pf.avoid) {
    const r = zonePx(z, W2, H2);
    if (r.w > W2 - 1)
      S = r.y < 1 ? { ...S, y: bottom(r), h: bottom(S) - bottom(r) } : { ...S, h: r.y - S.y };
    else if (r.h > H2 - 1)
      S = r.x < 1 ? { ...S, x: right(r), w: right(S) - right(r) } : { ...S, w: r.x - S.x };
    else
      cuts.push(r);
  }
  return { S, cuts: cuts.filter((c) => hits(c, S)) };
}
var extents = /* @__PURE__ */ new Map();
function contentOf(img, d) {
  const key2 = [img.key, d.cutout, d.keyTol].join("|");
  const hit = extents.get(key2);
  if (hit)
    return hit;
  const c = cutout(img, d.cutout, d.keyTol);
  const { width: w, height: h } = c;
  const a = c.getContext("2d").getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (a[(y * w + x) * 4 + 3] > 60) {
        if (x < x0)
          x0 = x;
        if (x > x1)
          x1 = x;
        if (y < y0)
          y0 = y;
        if (y > y1)
          y1 = y;
      }
  const r = x1 < 0 ? { x: 0, y: 0, w: 1, h: 1 } : { x: x0 / w, y: y0 / h, w: (x1 - x0 + 1) / w, h: (y1 - y0 + 1) / h };
  if (extents.size > 40)
    extents.clear();
  extents.set(key2, r);
  return r;
}
function pictureRect(d, img, area, W2, H2, e) {
  const c = contentOf(img, d);
  const cw = img.width * c.w;
  const ch = img.height * c.h;
  let sc = Math.min(area.w / cw, area.h / ch);
  if (d.imgScale !== void 0)
    sc = d.imgX !== void 0 || d.imgY !== void 0 ? Math.min(W2 / img.width, H2 / img.height) * d.imgScale / 100 : sc * d.imgScale / 100;
  sc *= e.scale ?? 1;
  const cx = (d.imgX !== void 0 ? d.imgX * W2 : area.x + area.w / 2) + (e.dx ?? 0) * W2;
  const cy = (d.imgY !== void 0 ? d.imgY * H2 : area.y + area.h / 2) + (e.dy ?? 0) * H2;
  const whole = d.imgX !== void 0 || d.imgY !== void 0;
  const ox = whole ? img.width / 2 : img.width * (c.x + c.w / 2);
  const oy = whole ? img.height / 2 : img.height * (c.y + c.h / 2);
  return { x: cx - ox * sc, y: cy - oy * sc, w: img.width * sc, h: img.height * sc };
}
function wrap(ctx, text, max) {
  const out = [];
  for (const para of text.split("\n")) {
    const words3 = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words3) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > max) {
        out.push(line);
        line = w;
      } else
        line = next;
    }
    if (line)
      out.push(line);
  }
  return out;
}
function setFace(ctx, f, size) {
  ctx.font = `${f.weight} ${size}px ${f.family}`;
  ctx.letterSpacing = `${f.tracking * size}px`;
}
function setBlock(ctx, text, f, size, max) {
  setFace(ctx, f, size);
  const value = f.caps ? text.toUpperCase() : text;
  let lines = wrap(ctx, value, max);
  if (lines.length > 1 && !value.includes("\n")) {
    let lo = max * 0.5;
    let hi = max;
    for (let i = 0; i < 9; i++) {
      const mid = (lo + hi) / 2;
      const l = wrap(ctx, value, mid);
      if (l.length <= lines.length && l.every((x) => ctx.measureText(x).width <= mid))
        hi = mid;
      else
        lo = mid;
    }
    lines = wrap(ctx, value, hi);
  }
  const widths = lines.map((l) => ctx.measureText(l).width);
  ctx.letterSpacing = "0px";
  return { face: f, size, lines, widths, w: Math.max(0, ...widths), h: lines.length * size * f.leading, asked: text };
}
function fitBlock(ctx, text, f, from, least, maxW, maxH) {
  for (let size = from; ; size *= 0.965) {
    const at3 = Math.max(size, least);
    const b3 = setBlock(ctx, text, f, at3, maxW);
    if (b3.w <= maxW + 0.5 && b3.h <= maxH + 0.5)
      return b3;
    if (at3 <= least)
      return void 0;
  }
}
var tooLong = (what, size) => new Error(`The ${what} is too long for this layout at ${size}. Shorten it, or use a bigger size.`);
function drawBlock(ctx, b3, x, top, align, width, color2) {
  setFace(ctx, b3.face, b3.size);
  ctx.fillStyle = color2;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const lh = b3.size * b3.face.leading;
  const ink = b3.lines.map((l, i) => {
    const lx = align === "center" ? x + (width - b3.widths[i]) / 2 : align === "right" ? x + width - b3.widths[i] : x;
    const base = top + i * lh + lh / 2 + b3.size * 0.34;
    const m = ctx.measureText(l);
    ctx.fillText(l, lx, base);
    return { x: lx, y: base - m.actualBoundingBoxAscent, w: b3.widths[i], h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent };
  });
  ctx.letterSpacing = "0px";
  const box = union(ink);
  return { box: { x: box.x, y: top, w: box.w, h: b3.h }, ink };
}
var headFace = (fonts2) => ({ family: fonts2.sans, weight: 500, tracking: -0.02, leading: 1.18 });
var bodyFace = (fonts2) => ({ family: fonts2.sans, weight: 400, tracking: 0, leading: 1.42 });
var chipFace = (fonts2) => ({ family: fonts2.data, weight: 900, tracking: 0.08, leading: 1, caps: true, data: true });
var logoOn = (q) => q.edits.logo?.hidden === void 0 ? q.d.logo : !q.edits.logo.hidden;
function logoBox(q, anchor) {
  const e = q.edits.logo ?? {};
  if (!logoOn(q))
    return void 0;
  const h = 32 * q.u * (e.scale ?? 1);
  const w = logoRatio() * h;
  const at3 = e.anchor ?? anchor;
  const area = { x: q.S.x + q.m, y: q.S.y + q.m, w: q.S.w - q.m * 2, h: q.S.h - q.m * 2 };
  const r = {
    x: at3.endsWith("left") ? area.x : at3.endsWith("right") ? right(area) - w : area.x + (area.w - w) / 2,
    y: at3.startsWith("top") ? area.y : at3.startsWith("bottom") ? bottom(area) - h : area.y + (area.h - h) / 2,
    w,
    h
  };
  for (const c of q.cuts)
    if (hits(grow(r, logoClear(h)), c))
      r.x = c.x < q.W / 2 ? right(c) + q.m * 0.5 : c.x - w - q.m * 0.5;
  return r;
}
function putLogo(q, r, can = q.can.logo ?? FIXED, ink = q.p.ink) {
  if (!r)
    return;
  drawLogo(q.ctx, r.x, r.y, r.h, q.p.mark, ink);
  q.layers.push({ id: "logo", kind: "logo", box: r, logo: { clear: logoClear(r.h), min: logoMin(q.W, platformOf(q.d.size, q.W, q.H).shown) }, can });
}
var Runs = class {
  pitch;
  rects = [];
  cur;
  constructor(pitch) {
    this.pitch = pitch;
  }
  add(x, y, r) {
    const c = this.cur;
    if (c && Math.abs(c.y + c.h / 2 - y) < 0.01 && x - r - right(c) <= this.pitch)
      c.w = x + r - c.x;
    else
      this.rects.push(this.cur = { x: x - r, y: y - r, w: r * 2, h: r * 2 });
  }
};
var covered = (keep, x, y, r) => keep.some((b3) => x + r > b3.x && x - r < right(b3) && y + r > b3.y && y - r < bottom(b3));
function fadeFor(box, W2, H2) {
  const band = (over, dim) => Math.min(dim * 0.3, Math.max(24, over * 3));
  const o = { l: -box.x, r: right(box) - W2, t: -box.y, b: bottom(box) - H2 };
  const off = { l: o.l > 1, r: o.r > 1, t: o.t > 1, b: o.b > 1 };
  if (!off.l && !off.r && !off.t && !off.b)
    return void 0;
  const bw = Math.min(box.w, W2);
  const bh = Math.min(box.h, H2);
  const ease = (v) => {
    const k = Math.min(1, Math.max(0, v));
    return k * k * (3 - 2 * k);
  };
  return (x, y) => ease(off.l ? x / band(o.l, bw) : 1) * ease(off.r ? (W2 - x) / band(o.r, bw) : 1) * ease(off.t ? y / band(o.t, bh) : 1) * ease(off.b ? (H2 - y) / band(o.b, bh) : 1);
}
function drawDots(q, img, area, over = {}) {
  const { ctx, d, p, W: W2, H: H2 } = q;
  const keep = [...q.keep, ...q.hold ?? []];
  const id = over.id ?? "art";
  const e = q.edits[id] ?? {};
  const pic = e.hidden ? null : img;
  if (!pic && d.field === "none")
    return;
  const fill = over.fill ?? p.fill;
  const g = grid(W2, H2, d.dot, d.gap);
  const rect = pic && area ? pictureRect(d, pic, area, W2, H2, e) : void 0;
  const st = pic && rect ? shade(pic, g, rect, shaderOpts(d, fill, over.ground ?? p.bg)) : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const content = pic && rect ? contentOf(pic, d) : void 0;
  const box = content && rect ? { x: rect.x + content.x * rect.w, y: rect.y + content.y * rect.h, w: content.w * rect.w, h: content.h * rect.h } : void 0;
  const frame = over.clip;
  const local = box && frame ? { x: box.x - frame.x, y: box.y - frame.y, w: box.w, h: box.h } : box;
  const fadeAt = local ? frame ? fadeFor(local, frame.w, frame.h) : fadeFor(local, W2, H2) : void 0;
  const fade = fadeAt ? (x, y) => frame ? fadeAt(x - frame.x, y - frame.y) : fadeAt(x, y) : void 0;
  const LEVELS = fade ? 12 : 1;
  const filled = Array.from({ length: LEVELS }, () => new Path2D2());
  const hollow = Array.from({ length: LEVELS }, () => new Path2D2());
  const field = new Path2D2();
  const art = new Runs(g.pitch);
  const ground = new Runs(g.pitch);
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const v = st[r * g.cols + c];
      if (v === 3)
        continue;
      const x = g.ox + (c + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      if (frame && (x - rad < frame.x + 1 || x + rad > right(frame) - 1 || y - rad < frame.y + 1 || y + rad > bottom(frame) - 1))
        continue;
      if (covered(keep, x, y, rad))
        continue;
      if (over.mask && !over.mask(x, y))
        continue;
      if (v === 2 || v === 1 && d.field !== "faint") {
        const a = fade ? fade(x, y) : 1;
        const level = Math.min(LEVELS - 1, Math.ceil(a * LEVELS) - 1);
        if (fade && (level < 0 || a < 0.04))
          continue;
        const path = v === 2 ? filled[level] : hollow[level];
        const rr = v === 2 ? rad : ringR;
        path.moveTo(x + rr, y);
        path.arc(x, y, rr, 0, Math.PI * 2);
        art.add(x, y, rad);
      } else if (d.field !== "none") {
        const fr = d.field === "rings" ? ringR : rad;
        field.moveTo(x + fr, y);
        field.arc(x, y, fr, 0, Math.PI * 2);
        ground.add(x, y, rad);
      }
    }
  ctx.globalAlpha = over.fieldOp ?? p.fieldOp;
  if (d.field === "rings") {
    ctx.strokeStyle = over.field ?? p.field;
    ctx.lineWidth = RING;
    ctx.stroke(field);
  } else {
    ctx.fillStyle = over.field ?? p.field;
    ctx.fill(field);
  }
  for (let i = 0; i < LEVELS; i++) {
    ctx.globalAlpha = (i + 1) / LEVELS;
    ctx.strokeStyle = over.ring ?? p.ring;
    ctx.lineWidth = RING;
    ctx.stroke(hollow[i]);
    ctx.fillStyle = fill;
    ctx.fill(filled[i]);
  }
  ctx.globalAlpha = 1;
  const on = over.on ? { over: [over.on] } : {};
  if (ground.rects.length)
    q.layers.push({ id: over.id ? `${id}-field` : "field", kind: "art", box: frame ?? { x: 0, y: 0, w: W2, h: H2 }, ink: ground.rects, bleeds: true, ...on, can: FIXED });
  if (box && art.rects.length)
    q.layers.push({ id, kind: "art", box, ink: art.rects, ...fade ? { fades: true } : {}, ...on, can: q.can[id] ?? FIXED });
}
function shaderOpts(d, fill, bg) {
  return {
    dot: d.dot,
    gap: d.gap,
    render: d.render,
    fillPct: d.fillPct,
    hollowPct: d.hollowPct,
    localContrast: 3,
    edgeAmt: 0,
    dither: d.dither,
    invert: d.invert,
    cutout: d.cutout,
    keyTol: d.keyTol,
    dotsLight: hexLightness(fill) > hexLightness(bg)
  };
}
function drawDesign(canvas, d, img, fonts2, edits = {}) {
  const f = frameOf(d);
  const { w: W2, h: H2 } = f;
  const { S, cuts } = stageOf(d.size, W2, H2);
  const p = paletteOf(d);
  const ctx = canvas.getContext("2d");
  const s = canvas.width / W2;
  const u = f.u ?? Math.sqrt(S.w * Math.min(S.h, S.w * 1.6)) / 900 * (S.w / S.h > 2.2 ? 1.05 : 1.2);
  const floor = SMALL_FLOOR * W2 / platformOf(d.size, W2, H2).shown;
  const q = { ctx, d, W: W2, H: H2, S, cuts, u, m: 32 * u, floor: Math.ceil(floor), p, fonts: fonts2, edits, layers: [], can: CAN[d.template], keep: [] };
  for (const [what, text] of Object.entries({ headline: d.headline, body: d.body, cards: d.cards, footer: d.footer, "partner name": d.partnerName, lists: d.lists, cta: d.cta, stat: d.stat }))
    if (text)
      assertGlyphs(what, text);
  if (d.badge)
    assertGlyphs("badge", d.badge.toUpperCase(), "data");
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W2, H2);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  let page;
  if (d.page) {
    const block = setBlock(ctx, d.page, chipFace(fonts2), Math.max(q.floor, 13 * u), S.w);
    const y = bottom(S) - q.m * 0.8 - block.h;
    page = { block, x: right(S) - q.m - block.w, y };
    q.S = { ...S, h: y - q.m * 0.4 - S.y };
    q.hold = [grow({ x: page.x, y, w: block.w, h: block.h }, 12)];
  }
  const draw = { banner: drawBanner, products: drawProducts, social: drawSocial, cards: drawCardsPost, customer: drawCustomer, mark: drawMarkOnly }[d.template];
  const out = draw(q, img);
  if (page) {
    const r = drawBlock(ctx, page.block, page.x, page.y, "left", page.block.w, p.ink);
    q.layers.push({ id: "page", kind: "text", box: r.box, ink: r.ink, text: { asked: d.page, drawn: page.block.lines.join(" "), size: page.block.size, color: p.ink, ground: [p.bg], own: true }, can: FIXED });
  }
  ctx.globalAlpha = 1;
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
  return { ...out, layers: q.layers, ...q.notes?.length ? { notes: q.notes } : {} };
}
var sizeName = (q) => `${q.d.size === "custom" ? "" : `${q.d.size} `}${q.W}x${q.H}`;
function column(q, o) {
  const { ctx, d, fonts: fonts2 } = q;
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const hf = o.headFace ?? headFace(fonts2);
  const least = Math.max(q.floor, o.least ?? q.floor * 1.15);
  const make = (size, k) => {
    const badge = d.badge.trim() ? setBlock(ctx, d.badge.trim(), chipFace(fonts2), Math.max(q.floor, size * 0.26), o.maxW) : void 0;
    if (badge && (badge.lines.length > 1 || badge.w > o.maxW - badge.size * 1.8))
      return void 0;
    const head2 = d.headline.trim() ? setBlock(ctx, d.headline.trim(), hf, size * k, o.maxW) : void 0;
    const bodySize = Math.max(q.floor, Math.min(o.body, size * 0.62)) * (eb.scale ?? 1);
    const body = d.body.trim() ? setBlock(ctx, d.body.trim(), bodyFace(fonts2), bodySize, o.maxW) : void 0;
    if (head2 && head2.w > o.maxW + 0.5 || body && body.w > o.maxW + 0.5)
      return void 0;
    if (body && body.size < q.floor - 0.01)
      return void 0;
    const gapA = badge ? badge.size * 0.95 : 0;
    const gapB = head2 && body ? Math.max(body.size * 0.45, size * 0.22) : 0;
    return { badge, head: head2, body, gapA, gapB, w: Math.max(head2?.w ?? 0, body?.w ?? 0, badge ? badge.w + badge.size * 1.8 : 0), h: (badge ? badge.size * 1.9 + gapA : 0) + (head2?.h ?? 0) + gapB + (body?.h ?? 0) };
  };
  for (let size = o.size; ; size *= 0.965) {
    const at3 = Math.max(size, least);
    const c = make(at3, 1);
    if (c && c.h <= o.maxH + 0.5) {
      const k = eh.scale ?? 1;
      if (k === 1)
        return c;
      const fits = (x) => !!x && x.h <= o.maxH + 0.5 && (!x.head || x.head.size >= q.floor - 0.01);
      const scaled = make(at3, k);
      if (fits(scaled))
        return scaled;
      for (let j = 1; j <= 40; j++) {
        const kk = k + (1 - k) * j / 40;
        const near = make(at3, kk);
        if (fits(near)) {
          const pct = (n) => `${Math.round(Math.abs(n - 1) * 100)}%`;
          (q.notes ??= []).push(k > 1 ? `the headline grew ${pct(kk)}, the most that fits here, not ${pct(k)}` : `the headline shrank ${pct(kk)}, the least it reads at here, not ${pct(k)}`);
          return near;
        }
      }
      return void 0;
    }
    if (at3 <= least)
      return void 0;
  }
}
function putColumn(q, c, x, top, w, align) {
  const { ctx, d, p } = q;
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const a = eh.align ?? align;
  const dx = (eh.dx ?? 0) * q.W;
  let y = top + (eh.dy ?? 0) * q.H;
  if (c.badge) {
    const b3 = c.badge;
    const bw = b3.w + b3.size * 1.8;
    const bh = b3.size * 1.9;
    const bx = (a === "center" ? x + (w - bw) / 2 : a === "right" ? x + w - bw : x) + dx;
    const ink = onFill(p);
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.roundRect(bx, y, bw, bh, bh / 2);
    ctx.fill();
    const r = drawBlock(ctx, b3, bx + b3.size * 0.9 + b3.size * 0.04, y + (bh - b3.h) / 2, "left", b3.w, ink);
    q.layers.push({ id: "badge", kind: "text", box: { x: bx, y, w: bw, h: bh }, ink: [{ x: bx, y, w: bw, h: bh }], text: { asked: d.badge.trim(), drawn: b3.lines.join("\n"), size: b3.size, color: ink, ground: [p.fill] }, can: q.can.badge ?? FIXED });
    void r;
    y += bh + c.gapA;
  }
  if (c.head) {
    const r = drawBlock(ctx, c.head, x + dx, y, a, w, p.text);
    q.layers.push({ id: "headline", kind: "text", box: r.box, ink: r.ink, text: { asked: d.headline.trim(), drawn: c.head.lines.join("\n"), size: c.head.size, color: p.text, ground: [p.bg] }, can: q.can.headline ?? FIXED });
    y += c.head.h + c.gapB;
  }
  if (c.body) {
    const r = drawBlock(ctx, c.body, x + dx + (eb.dx ?? 0) * q.W, y + (eb.dy ?? 0) * q.H, a, w, p.ink);
    q.layers.push({ id: "body", kind: "text", box: r.box, ink: r.ink, text: { asked: d.body.trim(), drawn: c.body.lines.join("\n"), size: c.body.size, color: p.ink, ground: [p.bg] }, can: q.can.body ?? FIXED });
  }
}
function columnBoxes(q, c, x, top, w, align) {
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const a = eh.align ?? align;
  const at3 = (bw) => (a === "center" ? x + (w - bw) / 2 : a === "right" ? x + w - bw : x) + (eh.dx ?? 0) * q.W;
  let y = top + (eh.dy ?? 0) * q.H;
  const out = [];
  if (c.badge) {
    const bw = c.badge.w + c.badge.size * 1.8;
    out.push({ x: at3(bw), y, w: bw, h: c.badge.size * 1.9 });
    y += c.badge.size * 1.9 + c.gapA;
  }
  if (c.head) {
    out.push({ x: at3(c.head.w), y, w: c.head.w, h: c.head.h });
    y += c.head.h + c.gapB;
  }
  if (c.body)
    out.push({ x: at3(c.body.w) + (eb.dx ?? 0) * q.W, y: y + (eb.dy ?? 0) * q.H, w: c.body.w, h: c.body.h });
  return out;
}
function regions(q, area) {
  const cut = q.cuts.find((c) => hits(area, c));
  if (!cut)
    return [area];
  const gap = q.m * 0.5;
  const out = [];
  const above = { ...area, h: cut.y - gap * 0.5 - area.y };
  if (above.h > q.floor * 1.3)
    out.push(above);
  const side = cut.x < q.W / 2 ? { ...area, x: right(cut) + gap, w: right(area) - right(cut) - gap } : { ...area, w: cut.x - gap - area.x };
  if (side.w > q.W * 0.15)
    out.push(side);
  return out.length ? out : [area];
}
function clearOfLogo(q, area, logo) {
  if (!logo)
    return area;
  const l = grow(logo, logoClear(logo.h) + q.m * 0.3);
  if (!hits(area, l))
    return area;
  const mid = logo.y + logo.h / 2 < area.y + area.h / 2;
  return mid ? { ...area, y: bottom(l), h: bottom(area) - bottom(l) } : { ...area, h: l.y - area.y };
}
function drawBanner(q, img) {
  const { d, S, W: W2, H: H2, m } = q;
  const ratio = S.w / S.h;
  const wide = ratio >= 1.2;
  const strip = ratio >= 2.2;
  const hasArt = !!img && !q.edits.art?.hidden;
  const size = d.textSize ?? (strip ? Math.max(0.15 * S.h, q.floor * 1.6) : wide ? 64 * S.h / 630 : 80 * W2 / 1080);
  const share = d.textWidth ?? (wide ? hasArt ? strip ? 0.42 : 0.45 : 0.8 : 1);
  let logo = logoBox(q, "top-left");
  const area = { x: S.x + m, y: S.y + m, w: Math.min(S.w - m * 2, wide ? S.w * share : (S.w - m * 2) * share), h: S.h - m * 2 };
  if (d.textX !== void 0)
    area.x = d.textX * W2;
  const tall = !wide && hasArt;
  const body = size * 0.42;
  const picks = [];
  const aside = logo ? regions(q, { ...area, y: area.y }) : regions(q, area);
  const tries = strip && hasArt && d.textWidth === void 0 ? aside.flatMap((r3) => r3.x > area.x + 1 ? [{ ...r3, w: S.x + S.w * 0.68 - r3.x }] : [r3, { ...r3, w: S.w * 0.58 }]) : aside;
  for (const raw of tries) {
    const shifted = raw.x > area.x + 1;
    const l = shifted && logo && !q.edits.logo?.anchor ? { ...logo, x: raw.x } : logo;
    const r3 = clearOfLogo(q, raw, l);
    const c2 = column(q, { size, body, maxW: r3.w, maxH: tall ? Math.min(r3.h, S.h * 0.5) : r3.h });
    if (!c2)
      continue;
    picks.push({ c: c2, r: shifted ? { ...r3, x: raw.x } : r3, s: c2.head?.size ?? c2.body?.size ?? 1 });
  }
  const most = Math.max(0, ...picks.map((x) => x.s));
  const best = picks.find((x) => x.s * 1.25 >= most);
  if (!best)
    throw tooLong(d.headline.length >= d.body.length ? "headline" : "body", sizeName(q));
  const { c, r } = best;
  if (logo && r.x > area.x + 1 && !q.edits.logo?.anchor)
    logo = { ...logo, x: r.x };
  const pref = d.textY !== void 0 ? d.textY * H2 : tall || strip ? r.y + (strip ? Math.max(0, (r.h - c.h) * 0.3) : 0) : S.y + S.h * 0.3;
  const top = d.textY !== void 0 ? pref : Math.max(r.y, Math.min(pref, bottom(r) - c.h));
  const boxes = columnBoxes(q, c, r.x, top, r.w, "left");
  const words3 = boxes.length ? union(boxes) : { x: r.x, y: r.y, w: 0, h: 0 };
  q.keep = [...boxes.map((b3) => grow(b3, 12)), ...logo ? [grow(logo, Math.max(12, logoClear(logo.h)))] : []];
  const gap = m * 0.9;
  const room = wide ? strip ? { x: Math.max(right(words3) + gap, W2 * 0.66 - H2 * 0.54), y: -H2 * 0.04, w: 0, h: H2 * 1.08 } : { x: Math.max(right(words3) + gap, S.x + S.w * 0.46), y: S.y + m * 0.55, w: 0, h: S.h - m * 1.1 } : { x: S.x + m, y: bottom(words3) + gap, w: S.w - m * 2, h: bottom(S) - m - bottom(words3) - gap };
  if (wide)
    room.w = strip ? Math.min(H2 * 1.08, right(S) - m * 0.8 - room.x) : right(S) - m * 0.8 - room.x;
  if (logo && hits(grow(logo, logoClear(logo.h)), room)) {
    const l = grow(logo, logoClear(logo.h) + 6);
    if (logo.y > q.H / 2)
      room.h = l.y - room.y;
    else if (wide) {
      room.h -= bottom(l) - room.y;
      room.y = bottom(l);
    }
  }
  drawDots(q, img, room.w > 40 && room.h > 40 ? room : { x: S.x + m, y: S.y + m, w: S.w - m * 2, h: S.h - m * 2 });
  putLogo(q, logo);
  putColumn(q, c, r.x, top, r.w, "left");
  return { text: words3, area: room };
}
function socialStacks(q, size) {
  const { S, m, fonts: fonts2 } = q;
  const c = column({ ...q, edits: {} }, { size, body: size * BODY * 1.1, maxW: S.w * 0.8, maxH: S.h * 0.56, headFace: { family: fonts2.sans, weight: 400, tracking: -0.01, leading: 1.1 } });
  return !!c && S.h - m - Math.max(m, S.h * 0.075) - c.h > S.h * 0.4;
}
var BODY = 0.33;
function drawSocial(q, img) {
  const { d, S, W: W2, H: H2, m, fonts: fonts2 } = q;
  const ratio = S.w / S.h;
  const hasArt = !!img && !q.edits.art?.hidden;
  const size = d.textSize ?? 110 * Math.sqrt(S.w * Math.min(S.h, S.w * 1.4)) / 900;
  const strip = ratio >= 2.2 || ratio >= 1.2 && hasArt && d.textX === void 0 && !socialStacks(q, size);
  const head2 = { family: fonts2.sans, weight: 400, tracking: -0.01, leading: 1.1 };
  const logo = logoBox(q, "top-left");
  const share = d.textWidth ?? (strip ? hasArt ? 0.58 : 0.8 : ratio >= 1.2 ? 0.8 : 0.88);
  let area = { x: S.x + S.w * (1 - share) / 2, y: S.y + m, w: S.w * share, h: S.h - m * 2 };
  if (strip)
    area = { x: S.x + m, y: S.y + m, w: S.w * share, h: S.h - m * 2 };
  if (d.textX !== void 0)
    area.x = d.textX * W2 - area.w / 2;
  area = clearOfLogo(q, area, logo);
  let best;
  for (const r3 of regions(q, area)) {
    const maxH = hasArt && !strip ? Math.min(r3.h, S.h * (ratio >= 1.2 ? 0.56 : 0.6)) : r3.h;
    const c2 = column(q, { size, body: size * BODY * 1.1, maxW: r3.w, maxH, headFace: head2 });
    if (c2 && (!best || (c2.head?.size ?? 0) > (best.c.head?.size ?? 0) * 1.25))
      best = { c: c2, r: r3 };
  }
  if (!best)
    throw tooLong(d.headline.length >= d.body.length ? "headline" : "body", sizeName(q));
  const { c, r } = best;
  const below = !strip && hasArt;
  const top = d.textY !== void 0 ? d.textY * H2 : below ? Math.max(r.y, S.y + S.h * 0.075) : Math.max(r.y, r.y + (r.h - c.h) / 2);
  const boxes = columnBoxes(q, c, r.x, top, r.w, "center");
  const words3 = boxes.length ? union(boxes) : { x: r.x, y: r.y, w: 0, h: 0 };
  const pad = Math.max(12, 0.13 * size);
  q.keep = [...boxes.map((b3) => grow(b3, pad)), ...logo ? [grow(logo, Math.max(12, logoClear(logo.h)))] : []];
  const gap = Math.max(pad, 0.035 * S.h);
  let room = strip ? { x: Math.max(right(words3) + gap * 2, S.x + S.w * 0.6), y: S.y + m * 0.6, w: 0, h: S.h - m * 1.2 } : { x: S.x + 0.06 * S.w, y: bottom(words3) + gap, w: 0.88 * S.w, h: bottom(S) - Math.max(m * 0.8, 0.04 * S.h) - bottom(words3) - gap };
  if (strip)
    room.w = right(S) - m * 0.8 - room.x;
  if (logo && hits(grow(logo, logoClear(logo.h)), room)) {
    const l = grow(logo, logoClear(logo.h) + 6);
    room = logo.y > S.y + S.h / 2 ? { ...room, h: l.y - room.y } : { ...room, y: bottom(l), h: bottom(room) - bottom(l) };
  }
  drawDots(q, img, room.w > 40 && room.h > 40 ? room : void 0);
  putLogo(q, logo);
  putColumn(q, c, r.x, top, r.w, "center");
  return { text: words3, area: room };
}
function drawMarkOnly(q) {
  const { ctx, S, p } = q;
  const e = q.edits.logo ?? {};
  const side = Math.min(S.w, S.h);
  const w = side * 0.62 * (e.scale ?? 1);
  const h = w / markRatio();
  const r = { x: S.x + (S.w - w) / 2, y: S.y + (S.h - h) / 2, w, h };
  q.keep = [grow(r, logoClear(h))];
  drawDots(q, null, void 0);
  drawMark(ctx, r.x, r.y, h, p.mark === p.bg ? p.ink : p.mark);
  q.layers.push({ id: "logo", kind: "logo", box: r, logo: { clear: logoClear(h), min: logoMin(q.W, platformOf(q.d.size, q.W, q.H).shown) }, can: CAN.mark.logo });
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
}
function drawBurst(q) {
  const { ctx, d, p, W: W2, H: H2, S } = q;
  const keep = [...q.keep, ...q.hold ?? []];
  const e = q.edits.art ?? {};
  if (!d.burst || e.hidden)
    return;
  const wide = S.w / S.h >= 1.2;
  const cx = (d.imgX ?? (wide ? 1.02 : 0.95)) * W2 + (e.dx ?? 0) * W2;
  const cy = (d.imgY !== void 0 ? d.imgY * H2 : wide ? S.y + S.h * 0.5 : S.y + S.h * 0.8) + (e.dy ?? 0) * H2;
  const R = Math.sqrt(W2 * S.h) * (d.imgScale ?? 100) / 100 * (e.scale ?? 1);
  const rays = 44;
  const step = Math.PI * 2 / rays;
  const turn = ((d.seed || 1) - 1) * step * 0.618 % step;
  const far = R * 0.78;
  const filled = new Path2D2();
  const hollow = new Path2D2();
  const ink = [];
  let ring = 0;
  for (let r = R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off + turn;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const lit = (1 + Math.sin(a)) / 2;
      const lift = Math.min(1, r / (R * 0.7));
      const rad = Math.min(r * step * 0.4, R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * lift);
      if (rad < 1.2)
        continue;
      if (x + rad < 0 || x - rad > W2 || y + rad < 0 || y - rad > H2)
        continue;
      if (covered(keep, x, y, rad))
        continue;
      ink.push({ x: x - rad, y: y - rad, w: rad * 2, h: rad * 2 });
      if (lit < 0.3 || lift < 0.35) {
        const rr = Math.max(0.5, rad - RING);
        hollow.moveTo(x + rr, y);
        hollow.arc(x, y, rr, 0, Math.PI * 2);
      } else {
        filled.moveTo(x + rad, y);
        filled.arc(x, y, rad, 0, Math.PI * 2);
      }
    }
  }
  ctx.strokeStyle = p.ring;
  ctx.lineWidth = RING * 1.6;
  ctx.stroke(hollow);
  ctx.fillStyle = p.fill;
  ctx.fill(filled);
  if (ink.length)
    q.layers.push({ id: "art", kind: "art", box: { x: cx - far, y: cy - far, w: far * 2, h: far * 2 }, ink, bleeds: true, can: q.can.art ?? FIXED });
}
var logoCuts = /* @__PURE__ */ new Map();
function logoCut(img, ink) {
  const key2 = [img.key, ink].join("|");
  const hit = logoCuts.get(key2);
  if (hit)
    return hit;
  const sc = Math.min(1, 800 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * sc));
  const h = Math.max(2, Math.round(img.height * sc));
  const c = newCanvas(w, h);
  const x = c.getContext("2d");
  x.drawImage(img.canvas, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h);
  const px2 = id.data;
  const border = [];
  for (let i = 0; i < w; i++)
    border.push(i, (h - 1) * w + i);
  for (let j = 0; j < h; j++)
    border.push(j * w, j * w + w - 1);
  const solid = border.filter((p) => px2[p * 4 + 3] > 200);
  if (solid.length > border.length * 0.5) {
    const mean = [0, 1, 2].map((k) => solid.reduce((n, p) => n + px2[p * 4 + k], 0) / solid.length);
    for (let p = 0; p < w * h; p++) {
      const dist = Math.hypot(px2[p * 4] - mean[0], px2[p * 4 + 1] - mean[1], px2[p * 4 + 2] - mean[2]);
      const keep = Math.min(1, Math.max(0, (dist - 24) / 70));
      px2[p * 4 + 3] = Math.min(px2[p * 4 + 3], keep * 255);
    }
    x.putImageData(id, 0, 0);
  }
  if (ink) {
    x.globalCompositeOperation = "source-in";
    x.fillStyle = ink;
    x.fillRect(0, 0, w, h);
  }
  const t = x.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++)
    for (let xx = 0; xx < w; xx++)
      if (t[(y * w + xx) * 4 + 3] > 24) {
        if (xx < x0)
          x0 = xx;
        if (xx > x1)
          x1 = xx;
        if (y < y0)
          y0 = y;
        if (y > y1)
          y1 = y;
      }
  let out = c;
  if (x1 >= x0 && (x0 > 0 || y0 > 0 || x1 < w - 1 || y1 < h - 1)) {
    out = newCanvas(x1 - x0 + 1, y1 - y0 + 1);
    out.getContext("2d").drawImage(c, -x0, -y0);
  }
  if (logoCuts.size > 12)
    logoCuts.clear();
  logoCuts.set(key2, out);
  return out;
}
function dotText(ctx, line, x, top, size, lh, sans) {
  const pitch = size / 13;
  const font = `700 ${size}px ${sans}`;
  const m = newCanvas().getContext("2d");
  m.font = font;
  m.letterSpacing = `${0.03 * size}px`;
  const w = Math.ceil(m.measureText(line).width + pitch * 2);
  const h = Math.ceil(lh);
  m.canvas.width = w;
  m.canvas.height = h;
  m.font = font;
  m.letterSpacing = `${0.03 * size}px`;
  m.fillStyle = "#000";
  m.fillText(line, 0, size * 0.8);
  const a = m.getImageData(0, 0, w, h).data;
  const dots = new Path2D2();
  const r = pitch * 0.4;
  for (let gy = pitch / 2; gy < h; gy += pitch)
    for (let gx = pitch / 2; gx < w; gx += pitch) {
      let ink = 0;
      let n = 0;
      for (let oy = -0.3; oy <= 0.31; oy += 0.15)
        for (let ox = -0.3; ox <= 0.31; ox += 0.15) {
          const px2 = Math.round(gx + ox * pitch);
          const py = Math.round(gy + oy * pitch);
          n++;
          if (px2 >= 0 && py >= 0 && px2 < w && py < h && a[(py * w + px2) * 4 + 3] > 127)
            ink++;
        }
      if (ink / n < 0.4)
        continue;
      dots.moveTo(x + gx + r, top + gy);
      dots.arc(x + gx, top + gy, r, 0, Math.PI * 2);
    }
  ctx.fill(dots);
}
function drawCustomer(q, img) {
  const { ctx, d, S, W: W2, H: H2, m, u, p, fonts: fonts2 } = q;
  const eh = q.edits.headline ?? {};
  const ep = q.edits.partner ?? {};
  const es = q.edits.stat ?? {};
  let logo = logoBox(q, "top-left");
  const wide = S.w / S.h >= 1.2;
  const ph = d.partnerSize * u * (ep.scale ?? 1);
  const cut = img ? logoCut(img, d.partnerWhite ? p.ink : null) : null;
  const name = d.partnerName.trim();
  let partner = null;
  let nameBlock;
  const roomRight = S.w - m * 2 - (logo ? logo.w + m * 2 : 0);
  if (cut) {
    const pw = Math.min(cut.width / cut.height * ph, S.w * 0.4, roomRight);
    const h = pw / cut.width * cut.height;
    partner = { x: right(S) - m - pw, y: S.y + m + ((logo?.h ?? ph) - h) / 2, w: pw, h };
    if (partner.y < S.y + m * 0.4)
      partner.y = S.y + m * 0.4;
  } else if (name) {
    nameBlock = fitBlock(ctx, name, { family: fonts2.sans, weight: 600, tracking: -0.02, leading: 1.1 }, ph, q.floor, roomRight, ph * 1.2);
    if (!nameBlock)
      throw tooLong("partner name", sizeName(q));
    partner = { x: right(S) - m - nameBlock.w, y: S.y + m + ((logo?.h ?? nameBlock.h) - nameBlock.h) / 2, w: nameBlock.w, h: nameBlock.h };
  }
  const statText = d.stat.trim();
  const headText = d.headline.trim();
  const headTop = Math.max(S.y + m, logo ? bottom(logo) + logoClear(logo.h) + m * 0.4 : 0, partner ? bottom(partner) + m * 0.4 : 0);
  const start = d.textSize ?? (wide ? 94 * S.h / 630 : (S.w / S.h < 0.7 ? 120 : 100) * (S.w / 1080));
  const area = { x: S.x + (wide ? m : Math.max(m, 0.06 * S.w)), y: headTop, w: S.w * (d.textWidth ?? (wide ? 0.58 : 0.86)), h: bottom(S) - m - headTop };
  if (d.textX !== void 0)
    area.x = d.textX * W2;
  const hf = { family: fonts2.sans, weight: 500, tracking: -0.03, leading: 1.06 };
  const measure = (big, r3, hk, sk) => {
    const statSize = big * 2 * sk;
    setFace(ctx, { family: fonts2.sans, weight: 700, tracking: 0.03, leading: 1 }, statSize);
    const stat = statText ? wrap(ctx, statText, Math.max(r3.w, right(S) - m - r3.x)) : [];
    const statW = stat.map((l) => ctx.measureText(l).width);
    ctx.letterSpacing = "0px";
    if (statW.some((w2) => w2 > right(S) - m - r3.x))
      return void 0;
    const head2 = headText ? setBlock(ctx, headText, hf, big * hk, r3.w) : void 0;
    if (head2 && head2.w > r3.w + 0.5)
      return void 0;
    const statLh = statSize * 0.86;
    const gap = stat.length && head2 ? big * 0.12 : 0;
    return { big, statSize, stat, head: head2, statLh, gap, h: stat.length * statLh + gap + (head2?.h ?? 0), w: Math.max(0, ...statW, head2?.w ?? 0), statW: Math.max(0, ...statW) };
  };
  let best;
  for (const r3 of regions(q, area)) {
    for (let big = start; ; big *= 0.965) {
      const at3 = Math.max(big, q.floor * 1.15);
      const w2 = measure(at3, r3, 1, 1);
      if (w2 && w2.h <= r3.h + 0.5) {
        if (!best || at3 > best.w.big * 1.25) {
          const edited = (eh.scale ?? 1) !== 1 || (es.scale ?? 1) !== 1 ? measure(at3, r3, eh.scale ?? 1, es.scale ?? 1) : w2;
          if (edited && edited.h <= r3.h + 0.5 && (!edited.head || edited.head.size >= q.floor - 0.01))
            best = { w: edited, r: r3 };
        }
        break;
      }
      if (at3 <= q.floor * 1.15)
        break;
    }
  }
  if (!best)
    throw tooLong(headText ? "headline" : "stat", sizeName(q));
  const { w, r } = best;
  if (logo && r.x > area.x + 1)
    logo = { ...logo, x: r.x };
  const pref = d.textY !== void 0 ? d.textY * H2 : S.y + S.h * (wide ? 0.21 : 0.16);
  const ty = (d.textY !== void 0 ? pref : Math.max(r.y, Math.min(pref, bottom(r) - w.h))) + (eh.dy ?? 0) * H2;
  const tx = r.x + (eh.dx ?? 0) * W2;
  const statH = w.stat.length * w.statLh;
  const statBox = w.stat.length ? { x: tx, y: ty, w: w.statW, h: statH } : void 0;
  const headAt = ty + statH + w.gap;
  const text = { x: tx, y: ty, w: Math.max(1, w.w), h: w.h };
  const pad = 16 * u;
  q.keep = [grow(text, pad), ...logo ? [grow(logo, Math.max(pad, logoClear(logo.h)))] : [], ...partner ? [grow(partner, pad)] : []];
  if (d.field !== "none")
    drawDots(q, null, void 0);
  drawBurst(q);
  putLogo(q, logo);
  if (cut && partner) {
    ctx.drawImage(cut, partner.x, partner.y, partner.w, partner.h);
    q.layers.push({ id: "partner", kind: "key", box: partner, can: CAN.customer.partner });
  } else if (partner && nameBlock) {
    const out = drawBlock(ctx, nameBlock, partner.x, partner.y, "left", nameBlock.w, p.ink);
    q.layers.push({ id: "partner", kind: "text", box: out.box, ink: out.ink, text: { asked: name, drawn: nameBlock.lines.join("\n"), size: nameBlock.size, color: p.ink, ground: [p.bg] }, can: CAN.customer.partner });
  }
  if (statBox) {
    ctx.fillStyle = p.text;
    w.stat.forEach((l, i) => dotText(ctx, l, tx, ty + i * w.statLh, w.statSize, w.statLh, fonts2.sans));
    q.layers.push({ id: "stat", kind: "text", box: statBox, ink: w.stat.map((_, i) => ({ x: tx, y: ty + i * w.statLh + w.statSize * 0.06, w: w.statW, h: w.statSize * 0.78 })), text: { asked: statText, drawn: w.stat.join("\n"), size: w.statSize, color: p.text, ground: [p.bg], bold: true }, can: CAN.customer.stat });
  }
  if (w.head) {
    const out = drawBlock(ctx, w.head, tx, headAt, eh.align ?? "left", r.w, p.text);
    q.layers.push({ id: "headline", kind: "text", box: out.box, ink: out.ink, text: { asked: headText, drawn: w.head.lines.join("\n"), size: w.head.size, color: p.text, ground: [p.bg] }, can: CAN.customer.headline });
  }
  return { text };
}
function drawProducts(q, img) {
  const { ctx, d, S, W: W2, H: H2, p, fonts: fonts2 } = q;
  const across = S.w / S.h >= 1.4;
  const k = across ? Math.max(S.h / 630, 0.72) : S.w / 1e3;
  const m = Math.min(24 * k, S.h * 0.06);
  const cut = q.cuts[0];
  const left = across && cut && cut.x < W2 / 2 ? right(cut) - S.x : 0;
  const fullest = left ? [Math.max(0.6, (left + S.w * 0.28) / S.w)] : [0.49, 0.42, 0.36];
  const full = across && left ? { y: 0, h: H2 } : { y: S.y, h: S.h };
  const panelBg = p.fill;
  const panelInk = onFill(p);
  const eh = q.edits.headline ?? {};
  const el = q.edits.logo ?? {};
  const groups = parseLists(d.lists);
  let panel;
  let lists;
  for (const split of fullest) {
    panel = across ? { x: S.x + S.w * split, y: full.y + m, w: S.w * (1 - split) - m, h: full.h - 2 * m } : { x: S.x + m, y: S.y + S.h * 0.4, w: S.w - 2 * m, h: S.h * 0.6 - m };
    const inner = grow(panel, -Math.max(22 * k, q.floor * 0.9));
    const safe = { x: Math.max(inner.x, S.x), y: Math.max(inner.y, S.y + 4), w: Math.min(right(inner), right(S)) - Math.max(inner.x, S.x), h: Math.min(bottom(inner), bottom(S) - 4) - Math.max(inner.y, S.y + 4) };
    lists = fitLists(q, groups, safe, 18 * k);
    if (lists)
      break;
  }
  if (!lists || !panel)
    throw tooLong("list", sizeName(q));
  const side = across ? { x: S.x + left, y: S.y, w: panel.x - S.x - left, h: S.h } : { x: S.x, y: S.y, w: S.w, h: panel.y - S.y };
  const maxW = side.w * (across ? 0.82 : 0.84);
  const withLogo = logoOn(q);
  const logoH0 = Math.max(30 * k * (el.scale ?? 1), logoMin(W2, platformOf(d.size, W2, H2).shown));
  const lw0 = logoRatio() * logoH0;
  const logoH = lw0 > side.w - m * 2 ? logoH0 * (side.w - m * 2) / lw0 : logoH0;
  const gapLogo = Math.max(38 * k, logoClear(logoH) * 1.4) * (side.h < 300 ? 0.6 : 1);
  const ctaText = d.cta.trim();
  const fs = Math.max(17 * k, q.floor);
  const cta = ctaText ? fitBlock(ctx, ctaText, { family: fonts2.sans, weight: 500, tracking: 0, leading: 1.2 }, fs, q.floor, maxW - fs * 2.6, fs * 1.3) : void 0;
  if (ctaText && !cta)
    throw tooLong("button", sizeName(q));
  const ctaH = cta ? cta.size * 2.6 : 0;
  const gapCta = cta ? 28 * k : 0;
  const start = d.textSize ?? (across ? 46 * S.h / 630 : 58 * S.w / 1080);
  const left0 = side.h - m * 2 - (withLogo ? logoH + gapLogo : 0) - gapCta - ctaH;
  const least = q.floor * 1.15;
  const base = d.headline.trim() ? fitBlock(ctx, d.headline.trim(), headFace(fonts2), Math.max(start, least), least, maxW, left0) : void 0;
  if (d.headline.trim() && !base)
    throw tooLong("headline", sizeName(q));
  const head2 = base && (eh.scale ?? 1) !== 1 ? setBlock(ctx, d.headline.trim(), headFace(fonts2), base.size * eh.scale, maxW) : base;
  if (head2 && (head2.w > maxW + 0.5 || head2.h > left0 + 0.5 || head2.size < q.floor - 0.01))
    throw tooLong("headline", `${sizeName(q)} at that size`);
  const blockH = (withLogo ? logoH + (head2 || cta ? gapLogo : 0) : 0) + (head2?.h ?? 0) + gapCta + ctaH;
  let y = side.y + (side.h - blockH) / 2;
  const cx = side.x + side.w / 2;
  ctx.fillStyle = panelBg;
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 16 * k);
  ctx.fill();
  q.layers.push({ id: "panel", kind: "panel", box: panel, can: FIXED });
  const pad = 6 * k;
  q.keep = lists.boxes.map((b3) => grow(b3, pad));
  const free = { x: panel.x + panel.w * 0.45, y: panel.y + panel.h * 0.5, w: panel.w * 0.5, h: panel.h * 0.45 };
  drawDots(q, img, free, { fill: panelInk, ring: panelInk, field: panelInk, fieldOp: d.field === "rings" ? 0.3 : 0.16, ground: panelBg, clip: grow(panel, -8 * k), on: "panel" });
  for (const t of lists.inks) {
    if (t.kind === "chip") {
      ctx.fillStyle = panelInk;
      ctx.beginPath();
      ctx.roundRect(t.x, t.y, t.w, lists.chipH, lists.chipH / 2);
      ctx.fill();
      drawBlock(ctx, { face: chipFace(fonts2), size: lists.chipFs, lines: [t.text.toUpperCase()], widths: [t.tw], w: t.tw, h: lists.chipH, asked: t.text }, t.x + lists.chipFs * 0.85, t.y + (lists.chipH - lists.chipFs) / 2, "left", t.tw, panelBg);
    } else {
      const mid = t.y + lists.itemLh / 2;
      dotIcon(ctx, t.text, t.x + lists.fs * 0.06, mid, lists.fs * 0.84, panelInk);
      ctx.font = `400 ${lists.fs}px ${fonts2.sans}`;
      ctx.letterSpacing = "0px";
      ctx.fillStyle = panelInk;
      ctx.fillText(t.text, t.x + lists.fs * 1.65, mid + lists.fs * 0.36);
    }
  }
  if (lists.inks.length) {
    const asked = groups.map((g) => [g.title, ...g.items].filter(Boolean).join("\n")).join("\n");
    q.layers.push({ id: "lists", kind: "text", box: union(lists.boxes), ink: lists.boxes, over: ["panel"], text: { asked, drawn: lists.inks.map((t) => t.text).join("\n"), size: Math.min(lists.fs, lists.chipFs), color: panelInk, ground: [panelBg] }, can: FIXED });
  }
  if (withLogo) {
    const lw = logoRatio() * logoH;
    putLogo(q, { x: cx - lw / 2, y, w: lw, h: logoH });
    y += logoH + (head2 || cta ? gapLogo : 0);
  }
  let text = { x: cx, y, w: 0, h: 0 };
  if (head2) {
    const r = drawBlock(ctx, head2, cx - maxW / 2, y, eh.align ?? "center", maxW, p.ink);
    text = r.box;
    q.layers.push({ id: "headline", kind: "text", box: r.box, ink: r.ink, text: { asked: d.headline.trim(), drawn: head2.lines.join("\n"), size: head2.size, color: p.ink, ground: [p.bg] }, can: CAN.products.headline });
    y += head2.h;
  }
  if (cta) {
    y += gapCta;
    const bw = cta.w + cta.size * 2.6;
    const bx = eh.align === "left" ? cx - maxW / 2 : eh.align === "right" ? cx + maxW / 2 - bw : cx - bw / 2;
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.roundRect(bx, y, bw, ctaH, ctaH / 2);
    ctx.fill();
    drawBlock(ctx, cta, bx + cta.size * 1.3, y + (ctaH - cta.h) / 2, "left", cta.w, panelInk);
    const box = { x: bx, y, w: bw, h: ctaH };
    q.layers.push({ id: "cta", kind: "text", box, ink: [box], text: { asked: ctaText, drawn: cta.lines.join(" "), size: cta.size, color: panelInk, ground: [p.fill] }, can: FIXED });
  }
  return { text, area: panel };
}
function fitLists(q, groups, area, want) {
  const { ctx, fonts: fonts2 } = q;
  if (!groups.length)
    return { inks: [], boxes: [], fs: want, chipFs: want, chipH: 0, itemLh: 0 };
  for (let fs = Math.max(want * 1.35, q.floor); ; fs *= 0.96) {
    const at3 = Math.max(fs, q.floor);
    const chipFs = Math.max(at3 * 0.89, q.floor);
    const chipH = chipFs * 1.85;
    const itemLh = at3 * 1.9;
    const groupGap = at3 * 1.2;
    const tall = (g) => (g.title ? chipH + at3 * 0.6 : 0) + g.items.length * itemLh;
    for (let cols = 1; cols <= Math.min(4, groups.reduce((n, g) => n + g.items.length + 1, 0)); cols++) {
      const rows = [[]];
      const hs = [0];
      let ok = true;
      const total = groups.reduce((n, g) => n + tall(g), 0) + groupGap * (groups.length - 1);
      const target = Math.min(area.h, Math.max(total / cols, 0) * 1.12 + itemLh);
      for (const g of groups) {
        let lines = [];
        const put2 = (t, h2, before) => {
          let c2 = rows.length - 1;
          const gap = hs[c2] ? before : 0;
          if (hs[c2] + gap + h2 > area.h + 0.5) {
            rows.push([]);
            hs.push(0);
            c2++;
          }
          const y = hs[c2] + (hs[c2] ? before : 0);
          rows[c2].push({ ...t, y });
          hs[c2] = y + h2;
        };
        const c = rows.length - 1;
        if (hs[c] && hs[c] + groupGap + tall(g) > target && rows.length < cols) {
          rows.push([]);
          hs.push(0);
        }
        if (g.title) {
          setFace(ctx, chipFace(fonts2), chipFs);
          const tw = ctx.measureText(g.title.toUpperCase()).width;
          lines.push({ kind: "chip", x: 0, y: 0, text: g.title, tw, w: tw + chipFs * 1.7 });
        }
        ctx.font = `400 ${at3}px ${fonts2.sans}`;
        ctx.letterSpacing = "0px";
        for (const it of g.items) {
          const tw = ctx.measureText(it).width;
          lines.push({ kind: "item", x: 0, y: 0, text: it, tw, w: at3 * 1.65 + tw });
        }
        lines.forEach((t, i) => put2(t, t.kind === "chip" ? chipH : itemLh, i === 0 ? groupGap : t.kind === "item" && lines[i - 1].kind === "chip" ? at3 * 0.6 : 0));
      }
      if (rows.length > cols)
        ok = false;
      const widths = rows.map((r) => Math.max(0, ...r.map((t) => t.w)));
      const gapX = at3 * 2.2;
      const w = widths.reduce((a, b3) => a + b3, 0) + gapX * (rows.length - 1);
      const h = Math.max(...hs);
      if (!ok || w > area.w + 0.5 || h > area.h + 0.5)
        continue;
      const inks = [];
      let x = area.x + (area.w - w) / 2;
      const y0 = area.y + (area.h - h) / 2;
      rows.forEach((r, i) => {
        for (const t of r)
          inks.push({ ...t, x, y: y0 + t.y });
        x += widths[i] + gapX;
      });
      return { inks, boxes: inks.map((t) => ({ x: t.x, y: t.y, w: t.w, h: t.kind === "chip" ? chipH : itemLh })), fs: at3, chipFs, chipH, itemLh };
    }
    if (at3 <= q.floor)
      return void 0;
  }
}
function drawCardsPost(q) {
  const { ctx, d, S, W: W2, p, fonts: fonts2 } = q;
  const cs = imageDoc().cards;
  const list = parseCards(d.cards);
  const strip = S.w / S.h >= 2.2;
  const k = Math.sqrt(S.w * S.h / (1200 * 630));
  const eh = q.edits.headline ?? {};
  const ef = q.edits.footer ?? {};
  const el = q.edits.logo ?? {};
  const cut = q.cuts[0];
  let area = { x: S.x + Math.max(S.w * 0.05, 24 * k), y: S.y + Math.max(S.h * 0.06, 18 * k), w: 0, h: 0 };
  area.w = S.w - (area.x - S.x) * 2;
  area.h = S.h - (area.y - S.y) * 2;
  if (cut && hits(area, cut))
    area = cut.x < W2 / 2 ? { ...area, x: right(cut) + 24 * k, w: right(area) - right(cut) - 24 * k } : { ...area, w: cut.x - area.x - 24 * k };
  const tf = headFace(fonts2);
  const least = q.floor * 1.15;
  const start = Math.max(least, d.textSize ?? 40 * k * (strip ? 0.9 : 1));
  const title0 = d.headline.trim() ? fitBlock(ctx, d.headline.trim(), tf, start, least, area.w, area.h * 0.34) : void 0;
  if (d.headline.trim() && !title0)
    throw tooLong("headline", sizeName(q));
  const title = title0 && (eh.scale ?? 1) !== 1 ? setBlock(ctx, d.headline.trim(), tf, title0.size * eh.scale, area.w) : title0;
  if (title && (title.w > area.w + 0.5 || title.h > area.h * 0.45 || title.size < q.floor - 0.01))
    throw tooLong("headline", `${sizeName(q)} at that size`);
  const titleH = title?.h ?? 0;
  const withLogo = logoOn(q);
  const address = ef.hidden ? "" : d.footer.trim();
  const fh = Math.max(30 * k * (strip ? 0.85 : 1), logoMin(W2, platformOf(d.size, W2, q.H).shown)) * (el.scale ?? 1);
  const addressBlock = address ? fitBlock(ctx, address, { family: fonts2.sans, weight: 500, tracking: 0, leading: 1.2 }, Math.max(21 * k, q.floor), q.floor, area.w - (withLogo ? logoRatio() * fh + fh * 2 : 0), fh * 1.6) : void 0;
  if (address && !addressBlock)
    throw tooLong("footer", sizeName(q));
  const footH = withLogo ? fh : addressBlock?.h ?? 0;
  const clear = withLogo ? logoClear(fh) : 0;
  const gapT = titleH ? S.h * (strip ? 0.05 : 0.05) : 0;
  const gapF = footH ? Math.max(S.h * 0.045, clear + 8 * k) : 0;
  const top = area.y + titleH + gapT;
  const room = { x: area.x, y: top, w: area.w, h: bottom(area) - footH - gapF - top };
  const n = list.length;
  const cardSet = n ? fitCards(q, list, room, k, strip) : { cards: [], s: 1, h: 0, bs: 0, hs: 0, badge: 0, pad: 0 };
  if (!cardSet)
    throw tooLong("card text", sizeName(q));
  const footY = bottom(area) - footH;
  const lift = Math.max(0, (room.h - cardSet.h) / 2);
  const titleY = area.y + (cardSet.h && S.h / S.w > 1.15 ? lift * 0.75 : 0);
  const shift2 = S.h / S.w > 1.15 ? lift * 0.75 : lift;
  for (const c of cardSet.cards)
    c.rect.y += shift2 - 0;
  const a = eh.align ?? "center";
  const tx = (w) => a === "left" ? area.x : a === "right" ? right(area) - w : area.x + (area.w - w) / 2;
  const logo = withLogo ? { x: area.x, y: footY, w: logoRatio() * fh, h: fh } : void 0;
  const addressAt = addressBlock ? { x: right(area) - addressBlock.w, y: footY + (footH - addressBlock.h) / 2, w: addressBlock.w, h: addressBlock.h } : void 0;
  const pad = 10 * k;
  q.keep = [
    ...title ? [grow({ x: tx(title.w), y: titleY, w: title.w, h: title.h }, pad)] : [],
    ...cardSet.cards.map((c) => grow(c.rect, pad)),
    ...logo ? [grow(logo, Math.max(pad, logoClear(fh)))] : [],
    ...addressAt ? [grow(addressAt, pad)] : []
  ];
  drawDots(q, null, void 0);
  let text = { x: 0, y: 0, w: 0, h: 0 };
  if (title) {
    const r = drawBlock(ctx, title, area.x, titleY, a, area.w, p.text);
    text = r.box;
    q.layers.push({ id: "headline", kind: "text", box: r.box, ink: r.ink, text: { asked: d.headline.trim(), drawn: title.lines.join("\n"), size: title.size, color: p.text, ground: [p.bg] }, can: CAN.cards.headline });
  }
  const light = hexLightness(p.bg) > 0.9;
  const fill = tokenColor(cs.fill);
  const inkRects = [];
  const drawnWords = [];
  const numbers = [];
  const badgeFill = tokenColor(cs.badge);
  const badgeInk = tokenColor(cs.badgeInk);
  const { hs, bs, badge } = cardSet;
  const rad = Math.min(cs.radius * k, 28 * k);
  for (const [i, cd] of cardSet.cards.entries()) {
    const r = cd.rect;
    ctx.save();
    ctx.shadowColor = cs.shadow.color;
    ctx.shadowBlur = cs.shadow.blur * k;
    ctx.shadowOffsetY = cs.shadow.y * k;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, rad);
    ctx.fill();
    ctx.restore();
    if (light) {
      ctx.strokeStyle = tokenColor(cs.edge);
      ctx.lineWidth = k;
      ctx.beginPath();
      ctx.roundRect(r.x + k / 2, r.y + k / 2, r.w - k, r.h - k, rad);
      ctx.stroke();
    }
    const hTop = r.y + cardSet.pad;
    const headH = Math.max(badge * 2, cd.heading.h);
    const bcx = r.x + cardSet.pad + badge;
    const bcy = hTop + (cd.heading.lines.length > 1 ? Math.max(badge, hs * cd.heading.face.leading / 2) : headH / 2);
    ctx.fillStyle = badgeFill;
    ctx.beginPath();
    ctx.arc(bcx, bcy, badge, 0, Math.PI * 2);
    ctx.fill();
    const num2 = String(i + 1);
    const nb = setBlock(ctx, num2, { family: fonts2.sans, weight: 500, tracking: 0, leading: 1 }, badge * 1.2, badge * 2);
    drawBlock(ctx, nb, bcx - nb.w / 2, bcy - nb.size / 2, "left", nb.w, badgeInk);
    numbers.push({ x: bcx - badge, y: bcy - badge, w: badge * 2, h: badge * 2 });
    const hx = r.x + cardSet.pad + badge * 2 + 14 * k * cardSet.s;
    const h = drawBlock(ctx, cd.heading, hx, cd.heading.lines.length > 1 ? hTop : hTop + (headH - cd.heading.h) / 2, "left", cd.heading.w, tokenColor(cs.heading));
    inkRects.push(...h.ink);
    drawnWords.push(...cd.heading.lines);
    if (cd.body) {
      const b3 = drawBlock(ctx, cd.body, r.x + cardSet.pad, hTop + headH + 12 * k * cardSet.s, "left", cd.body.w, tokenColor(cs.body));
      inkRects.push(...b3.ink);
      drawnWords.push(...cd.body.lines);
    }
  }
  if (cardSet.cards.length) {
    q.layers.push({ id: "panels", kind: "panel", box: union(cardSet.cards.map((c) => c.rect)), ink: cardSet.cards.map((c) => c.rect), can: FIXED });
    q.layers.push({ id: "cards", kind: "text", box: union(inkRects), ink: inkRects, over: ["panels"], text: { asked: list.map((c) => `${c.title}
${c.body}`).join("\n"), drawn: drawnWords.join("\n"), size: Math.min(hs, bs), color: tokenColor(cs.body), ground: [fill] }, can: FIXED });
    q.layers.push({ id: "numbers", kind: "key", box: union(numbers), ink: numbers, over: ["panels"], can: FIXED });
  }
  putLogo(q, logo);
  if (addressBlock && addressAt) {
    const r = drawBlock(ctx, addressBlock, addressAt.x, addressAt.y, "left", addressBlock.w, p.text);
    q.layers.push({ id: "footer", kind: "text", box: r.box, ink: r.ink, text: { asked: address, drawn: address, size: addressBlock.size, color: p.text, ground: [p.bg], own: d.footer === imageDoc().base.footer }, can: CAN.cards.footer });
  }
  return { text };
}
function parseCards(src) {
  return src.split(/\n\s*\n/).map((b3) => b3.trim()).filter(Boolean).map((b3) => {
    const [title, ...rest] = b3.split("\n");
    return { title: title.trim(), body: rest.join(" ").replace(/\s+/g, " ").trim() };
  });
}
function fitCards(q, list, room, k, strip) {
  const { ctx, fonts: fonts2 } = q;
  const n = list.length;
  const hf = { family: fonts2.sans, weight: 500, tracking: -0.01, leading: 1.2 };
  const bf = { family: fonts2.sans, weight: 400, tracking: 0, leading: 1.4 };
  const counts = n === 1 ? [1] : strip ? [Math.min(n, 4), Math.min(n, 3), 2] : room.w / room.h < 0.75 ? [1, 2] : [2, 1, Math.min(n, 3)];
  for (let s = 1; s > 0.3; s *= 0.95)
    for (const cols of [...new Set(counts)]) {
      const rows = Math.ceil(n / cols);
      const gapX = 24 * k * s;
      const gapY = 18 * k * s;
      const cw = (room.w - gapX * (cols - 1)) / cols;
      const ch = (room.h - gapY * (rows - 1)) / rows;
      const pad = Math.max(12, 28 * k * s);
      const badge = Math.max(13 * k * s, q.floor * 0.72);
      const hs = Math.max(25 * k * s, q.floor);
      const bs = Math.max(19 * k * s, q.floor);
      let tallest = 0;
      let fits = true;
      const blocks = list.map((c) => {
        const maxH = cw - pad * 2 - badge * 2 - 14 * k * s;
        const heading = setBlock(ctx, c.title, hf, hs, maxH);
        const body = c.body ? setBlock(ctx, c.body, bf, bs, cw - pad * 2) : void 0;
        if (heading.w > maxH + 0.5 || body && body.w > cw - pad * 2 + 0.5)
          fits = false;
        tallest = Math.max(tallest, pad * 2 + Math.max(badge * 2, heading.h) + (body ? 12 * k * s + body.h : 0));
        return { heading, body };
      });
      if (!fits || tallest > ch + 0.5)
        continue;
      const h = Math.min(ch, tallest * 1.12);
      const cards2 = blocks.map((b3, i) => {
        const r = Math.floor(i / cols);
        const inRow = Math.min(cols, n - r * cols);
        const rowW = inRow * cw + (inRow - 1) * gapX;
        return { ...b3, rect: { x: room.x + (room.w - rowW) / 2 + i % cols * (cw + gapX), y: room.y + r * (h + gapY), w: cw, h } };
      });
      return { cards: cards2, s, h: rows * h + (rows - 1) * gapY, hs, bs, badge, pad };
    }
  return void 0;
}
function parseLists(src) {
  const groups = [];
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line)
      continue;
    if (line.startsWith("#"))
      groups.push({ title: line.replace(/^#+\s*/, ""), items: [] });
    else {
      if (!groups.length)
        groups.push({ title: "", items: [] });
      groups[groups.length - 1].items.push(line);
    }
  }
  return groups;
}
function hashOf(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function dotIcon(ctx, label, x, cy, size, color2) {
  let bits = hashOf(label) & 511;
  const count = (n) => n.toString(2).replace(/0/g, "").length;
  for (let n = 0; count(bits) < 3; n++) {
    const h = hashOf(label + bits + n) % 9;
    for (let k = 0; k < 9; k++)
      if (!(bits & 1 << (h + k) % 9)) {
        bits |= 1 << (h + k) % 9;
        break;
      }
  }
  for (let n = 0; count(bits) > 7; n++) {
    const h = hashOf(label + bits + n) % 9;
    for (let k = 0; k < 9; k++)
      if (bits & 1 << (h + k) % 9) {
        bits &= ~(1 << (h + k) % 9);
        break;
      }
  }
  const step = size / 3;
  const r = step * 0.34;
  const lit = new Path2D2();
  const dim = new Path2D2();
  for (let i = 0; i < 9; i++) {
    const px2 = x + (i % 3 + 0.5) * step;
    const py = cy + (Math.floor(i / 3) - 1) * step;
    const path = bits & 1 << i ? lit : dim;
    path.moveTo(px2 + r, py);
    path.arc(px2, py, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = color2;
  ctx.globalAlpha = 0.32;
  ctx.fill(dim);
  ctx.globalAlpha = 1;
  ctx.fill(lit);
}

// dist/assets/dots.js
var RING2 = 1.2;
var SHADER_DEFAULTS = { render: "toneEdges", fillPct: 40, hollowPct: 40, localContrast: 3, edgeAmt: 0, dither: "none", invert: false, cutout: "auto", keyTol: 2 };
function placePicture(pic, box, scale = 100, cx = 0.5, cy = 0.5) {
  const sc = Math.min(box.w / pic.width, box.h / pic.height) * scale / 100;
  const w = pic.width * sc;
  const h = pic.height * sc;
  return { x: box.x + cx * box.w - w / 2, y: box.y + cy * box.h - h / 2, w, h };
}
function drawDotField(ctx, o) {
  const g = grid(o.width, o.height, o.dot, o.gap);
  const c = o.colors;
  const st = o.picture ? shade(o.picture, g, o.rect ?? placePicture(o.picture, { x: 0, y: 0, w: o.width, h: o.height }), {
    dot: o.dot,
    gap: o.gap,
    ...SHADER_DEFAULTS,
    ...o.shader,
    dotsLight: hexLightness(c.fill.slice(0, 7)) > hexLightness(c.bg.slice(0, 7))
  }) : new Uint8Array(g.cols * g.rows);
  const rad = o.dot / 2;
  const ringR = Math.max(0.1, rad - RING2 / 2);
  const pad = o.pad ?? 12;
  const keep = o.keep ?? [];
  const field = o.field ?? "none";
  const covered2 = (x, y, r) => keep.some((b3) => x + r > b3.x - pad && x - r < b3.x + b3.w + pad && y + r > b3.y - pad && y - r < b3.y + b3.h + pad);
  const filled = new Path2D3();
  const hollow = new Path2D3();
  const faint = new Path2D3();
  const runs = o.ink ? new Runs(g.pitch) : void 0;
  for (let r = 0; r < g.rows; r++)
    for (let q = 0; q < g.cols; q++) {
      const v = st[r * g.cols + q];
      if (v === 3)
        continue;
      const x = g.ox + (q + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      if (o.clip && (x - rad < o.clip.x || x + rad > o.clip.x + o.clip.w || y - rad < o.clip.y || y + rad > o.clip.y + o.clip.h))
        continue;
      if (covered2(x, y, rad))
        continue;
      if (o.mask && o.mask(x, y) < 0.5)
        continue;
      const k = o.size ? Math.max(0, o.size(x, y)) : 1;
      if (k <= 0.02)
        continue;
      if (v === 2 || v === 1 && field !== "faint" || field !== "none")
        runs?.add(x, y, rad * k);
      if (v === 2) {
        filled.moveTo(x + rad * k, y);
        filled.arc(x, y, rad * k, 0, Math.PI * 2);
      } else if (v === 1 && field !== "faint") {
        hollow.moveTo(x + ringR * k, y);
        hollow.arc(x, y, ringR * k, 0, Math.PI * 2);
      } else if (field !== "none") {
        const fr = (field === "rings" ? ringR : rad) * k;
        faint.moveTo(x + fr, y);
        faint.arc(x, y, fr, 0, Math.PI * 2);
      }
    }
  if (runs)
    o.ink.push(...runs.rects);
  ctx.save();
  ctx.globalAlpha = c.fieldOp;
  if (field === "rings") {
    ctx.strokeStyle = c.field;
    ctx.lineWidth = RING2;
    ctx.stroke(faint);
  } else {
    ctx.fillStyle = c.field;
    ctx.fill(faint);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.ring;
  ctx.lineWidth = RING2;
  ctx.stroke(hollow);
  ctx.fillStyle = c.fill;
  ctx.fill(filled);
  ctx.restore();
  return g;
}
function drawBurst2(ctx, o) {
  const rays = 44;
  const step = Math.PI * 2 / rays;
  const far = o.R * 0.78 * (o.grow ?? 1);
  const pad = o.pad ?? 16;
  const keep = o.keep ?? [];
  const covered2 = (x, y, r) => keep.some((b3) => x + r > b3.x - pad && x - r < b3.x + b3.w + pad && y + r > b3.y - pad && y - r < b3.y + b3.h + pad);
  const filled = new Path2D3();
  const hollow = new Path2D3();
  let ring = 0;
  for (let r = o.R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off + (o.turn ?? 0) * step;
      const x = o.cx + Math.cos(a) * r;
      const y = o.cy + Math.sin(a) * r;
      const lit = (1 + Math.sin(a)) / 2;
      const grow2 = Math.min(1, r / (o.R * 0.7));
      const rad = Math.min(r * step * 0.4, o.R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow2);
      if (rad < 1.2)
        continue;
      if (x + rad < 0 || x - rad > o.width || y + rad < 0 || y - rad > o.height)
        continue;
      if (covered2(x, y, rad))
        continue;
      o.ink?.push({ x: x - rad, y: y - rad, w: rad * 2, h: rad * 2 });
      if (lit < 0.3 || grow2 < 0.35) {
        const rr = Math.max(0.5, rad - RING2);
        hollow.moveTo(x + rr, y);
        hollow.arc(x, y, rr, 0, Math.PI * 2);
      } else {
        filled.moveTo(x + rad, y);
        filled.arc(x, y, rad, 0, Math.PI * 2);
      }
    }
  }
  ctx.save();
  ctx.strokeStyle = o.ring;
  ctx.lineWidth = RING2 * 1.6;
  ctx.stroke(hollow);
  ctx.fillStyle = o.fill;
  ctx.fill(filled);
  ctx.restore();
}

// dist/assets/text.js
function setFont(ctx, s) {
  ctx.font = `${s.weight} ${s.size}px ${s.family}`;
  ctx.letterSpacing = `${(s.tracking ?? 0) * s.size}px`;
}
function wrap2(ctx, text, max) {
  const out = [];
  for (const para of text.split("\n")) {
    const words3 = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words3) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > max) {
        out.push(line);
        line = w;
      } else
        line = next;
    }
    out.push(line);
  }
  return out;
}
function fit(ctx, text, style, max, maxLines = 99, minScale = 0.5, what = "text") {
  const value = style.caps ? text.toUpperCase() : text;
  for (let size = style.size; size >= style.size * minScale - 0.01; size -= Math.max(0.5, style.size / 40)) {
    setFont(ctx, { ...style, size });
    const lines = wrap2(ctx, value, max);
    const widths = lines.map((l) => ctx.measureText(l).width);
    if (lines.length <= maxLines && widths.every((w) => w <= max + 0.5)) {
      ctx.letterSpacing = "0px";
      return { lines, size, widths, width: Math.max(0, ...widths), height: lines.length * size * (style.leading ?? 1.2), style: { ...style, size } };
    }
  }
  ctx.letterSpacing = "0px";
  throw new Error(`The ${what} is too long for this layout: it needs more than ${maxLines} line${maxLines === 1 ? "" : "s"} at ${Math.round(style.size * minScale)}px in ${Math.round(max)}px. Shorten it.`);
}
function drawFitted(ctx, f, x, top, width = f.width) {
  const s = f.style;
  const lh = s.size * (s.leading ?? 1.2);
  setFont(ctx, s);
  ctx.fillStyle = s.color ?? "#000000";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  f.lines.forEach((l, i) => {
    const w = f.widths[i];
    const lx = s.align === "center" ? x + (width - w) / 2 : s.align === "right" ? x + width - w : x;
    ctx.fillText(l, lx, top + i * lh + s.size * 0.92);
  });
  ctx.letterSpacing = "0px";
  const left = s.align === "center" ? x + (width - f.width) / 2 : s.align === "right" ? x + width - f.width : x;
  return { x: left, y: top, w: f.width, h: f.lines.length * lh };
}

// dist/assets/picture.js
import { createHash } from "node:crypto";
import { readFileSync as readFileSync6 } from "node:fs";
import { isAbsolute, resolve as resolve2 } from "node:path";
import { loadImage } from "@napi-rs/canvas";
var KINDS = [
  ["png", (b3) => b3.length > 8 && b3[0] === 137 && b3[1] === 80 && b3[2] === 78 && b3[3] === 71],
  ["jpeg", (b3) => b3.length > 3 && b3[0] === 255 && b3[1] === 216],
  ["webp", (b3) => b3.length > 12 && b3.toString("ascii", 0, 4) === "RIFF" && b3.toString("ascii", 8, 12) === "WEBP"],
  ["gif", (b3) => b3.length > 6 && b3.toString("ascii", 0, 3) === "GIF"],
  ["svg", (b3) => /<svg[\s>]/i.test(b3.toString("utf8", 0, Math.min(b3.length, 4096)))]
];
function pictureKind(data) {
  return KINDS.find(([, test]) => test(data))?.[0];
}
function cutShort(b3, kind) {
  if (kind === "png")
    return b3.indexOf("IEND", Math.max(0, b3.length - 4096), "latin1") < 0;
  if (kind === "jpeg")
    return b3.lastIndexOf(Buffer.from([255, 217])) < 0;
  if (kind === "webp")
    return b3.readUInt32LE(4) + 8 > b3.length + 1;
  return false;
}
async function pictureFrom(data, max = 1e3) {
  const kind = pictureKind(data);
  if (!kind)
    throw new Error("Use a PNG, JPEG, WebP, GIF or SVG picture.");
  if (cutShort(data, kind))
    throw new Error("That picture is cut short: the end of the file is missing.");
  let img;
  try {
    img = await loadImage(data);
  } catch {
    throw new Error(`That ${kind.toUpperCase()} picture could not be read.`);
  }
  const iw = img.width || max;
  const ih = img.height || (img.width ? max : iw);
  const k = Math.min(1, max / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * k));
  const h = Math.max(1, Math.round(ih * k));
  const { canvas, ctx } = scratch(w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const px2 = ctx.getImageData(0, 0, w, h).data;
  let seen = false;
  for (let i = 3; i < px2.length && !seen; i += 4)
    seen = px2[i] > 8;
  if (!seen)
    throw new Error("That picture has nothing in it: every pixel is transparent.");
  return { canvas, width: w, height: h, key: createHash("sha1").update(data).update(String(max)).digest("hex") };
}
async function readPicture(cwd, path, max = 1e3) {
  const abs = isAbsolute(path) ? path : resolve2(cwd, path);
  let data;
  try {
    data = readFileSync6(abs);
  } catch {
    throw new Error(`No picture at ${path}.`);
  }
  if (!pictureKind(data))
    throw new Error(`${path} is not a PNG, JPEG, WebP, GIF or SVG picture.`);
  try {
    return await pictureFrom(data, max);
  } catch (err) {
    throw new Error(`${path}: ${err.message}`);
  }
}
function pictureOf(width, height, draw, key2) {
  const { canvas, ctx } = scratch(width, height);
  draw(ctx);
  return { canvas, width, height, key: `drawn:${key2}` };
}

// dist/assets/samples.js
import { Path2D as Path2D4 } from "@napi-rs/canvas";
var SAMPLES = {
  Globe(x) {
    const r = 250;
    const g = x.createRadialGradient(210, 200, 20, 300, 300, r);
    g.addColorStop(0, "#c9d3ea");
    g.addColorStop(0.5, "#46557a");
    g.addColorStop(1, "#0c1220");
    x.fillStyle = g;
    x.beginPath();
    x.arc(300, 300, r, 0, 7);
    x.fill();
    x.strokeStyle = "#eef2fb";
    x.lineWidth = 8;
    for (const k of [0.35, 0.7]) {
      x.beginPath();
      x.ellipse(300, 300, r * k, r, 0, 0, 7);
      x.stroke();
    }
    for (const y of [-0.5, 0, 0.5]) {
      const yy = 300 + y * r;
      const hw = Math.sqrt(1 - y * y) * r;
      x.beginPath();
      x.moveTo(300 - hw, yy);
      x.lineTo(300 + hw, yy);
      x.stroke();
    }
  },
  Sphere(x) {
    const g = x.createRadialGradient(230, 210, 10, 290, 280, 230);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.18, "#9aa7c4");
    g.addColorStop(0.7, "#2a3350");
    g.addColorStop(1, "#0d1222");
    x.fillStyle = g;
    x.beginPath();
    x.arc(290, 290, 210, 0, 7);
    x.fill();
  },
  Cursor(x) {
    x.fillStyle = "#0c1220";
    x.beginPath();
    x.moveTo(170, 70);
    x.lineTo(170, 500);
    x.lineTo(275, 395);
    x.lineTo(345, 540);
    x.lineTo(410, 510);
    x.lineTo(340, 368);
    x.lineTo(485, 368);
    x.closePath();
    x.fill();
    x.fillStyle = "#7d8fb5";
    x.beginPath();
    x.moveTo(205, 160);
    x.lineTo(205, 400);
    x.lineTo(270, 335);
    x.closePath();
    x.fill();
  },
  Layers(x) {
    const L = (y, c) => {
      x.fillStyle = c;
      x.beginPath();
      x.moveTo(300, y - 110);
      x.lineTo(530, y);
      x.lineTo(300, y + 110);
      x.lineTo(70, y);
      x.closePath();
      x.fill();
    };
    L(410, "#8a9abb");
    L(320, "#3f4f73");
    L(230, "#0c1220");
  },
  Key(x) {
    const g = x.createLinearGradient(0, 40, 0, 270);
    g.addColorStop(0, "#5d6c90");
    g.addColorStop(1, "#0c1220");
    x.fillStyle = g;
    const k = new Path2D4();
    k.arc(150, 150, 130, 0, Math.PI * 2);
    k.moveTo(205, 150);
    k.arc(150, 150, 55, 0, Math.PI * 2);
    k.rect(262, 124, 600, 48);
    k.rect(638, 172, 44, 64);
    k.rect(718, 172, 44, 46);
    k.rect(800, 172, 62, 84);
    x.fill(k, "evenodd");
    x.strokeStyle = "#a9b6d4";
    x.lineWidth = 14;
    x.beginPath();
    x.arc(150, 150, 92, Math.PI * 0.9, Math.PI * 1.75);
    x.stroke();
  }
};
var SAMPLE_SIZE = { Key: [900, 300] };
function sampleNames() {
  return Object.keys(SAMPLES);
}
function samplePicture(name) {
  const key2 = Object.keys(SAMPLES).find((k) => k.toLowerCase() === name.replace(/^sample:/i, "").toLowerCase());
  if (!key2)
    return void 0;
  const [w, h] = SAMPLE_SIZE[key2] ?? [600, 600];
  return pictureOf(w, h, SAMPLES[key2], `sample:${key2}`);
}

// dist/assets/recipes.js
var at = (col, row, cols, rows) => ({ col, row, cols, rows });
var b = (id, type, a) => ({ id, type, at: a });
var words = (pairs) => Object.fromEntries(pairs.filter(([, , v]) => v?.trim()).map(([id, slot, v]) => [`${id}.${slot}`, v]));
var has = (c, k) => !!c[k]?.trim();
var SOCIAL = ["square", "portrait", "landscape", "og", "linkedin", "story", "facebook"];
var RECIPES = [
  {
    id: "quote-card",
    label: "Quote card",
    description: "A quote with the open quote mark, who said it, and the logo.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "quote", required: true }, { id: "attribution" }],
    sample: { quote: "We cut our setup from a week to an afternoon.", attribution: "Head of growth, Acme" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", s === "tall" ? at(0, 0, 5, 1) : at(0, 0, 4, 1)), b("quote", "quote", s === "wide" ? at(0, 2, 11, 9) : s === "tall" ? at(0, 3, 12, 6) : at(0, 2, 12, 8))],
      copy: words([["quote", "text", c.quote], ["quote", "attribution", c.attribution]])
    })
  },
  {
    id: "stat-card",
    label: "Stat card",
    description: "A big number in dots, what it counts, a line of context, and the burst.",
    sizes: SOCIAL,
    theme: "Blue",
    copy: [{ id: "stat", required: true }, { id: "label", required: true }, { id: "headline" }],
    sample: { stat: "42%", label: "less time on setup", headline: "Acme moved its crawling in a day." },
    build: (c, s) => ({
      blocks: [b("burst", "burst", s === "tall" ? at(3, 7, 9, 5) : at(6, 2, 6, 10)), b("logo", "logo", at(0, 0, 4, 1)), b("stat", "stat", s === "tall" ? at(0, 2, 12, 4) : at(0, 2, 7, 5)), ...has(c, "headline") ? [b("headline", "body", s === "tall" ? at(0, 6, 10, 2) : at(0, 8, 6, 3))] : []],
      copy: words([["stat", "value", c.stat], ["stat", "label", c.label], ["headline", "text", c.headline]])
    })
  },
  {
    id: "launch-card",
    label: "Launch card",
    description: "A release or changelog entry: a label, what shipped, a line, and a picture in dots.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "badge" }, { id: "headline", required: true }, { id: "body" }, { id: "date" }],
    images: [{ id: "picture" }],
    sample: { badge: "New", headline: "Browser profiles", body: "Log in once, reuse the session on every scrape.", date: "October 8, 2026" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), ...has(c, "badge") ? [b("badge", "badge", s === "tall" ? at(0, 2, 4, 1) : at(0, 2, 3, 1))] : [], b("headline", "headline", s === "wide" ? at(0, 3, 6, 4) : at(0, 3, 12, 2)), ...has(c, "body") ? [b("body", "body", s === "wide" ? at(0, 7, 6, 2) : at(0, 5, 11, 1))] : [], ...has(c, "date") ? [b("date", "body", s === "wide" ? at(0, 10, 5, 1) : at(0, 11, 6, 1))] : [], b("picture", "picture", s === "wide" ? at(7, 1, 5, 10) : at(2, 6, 8, 5))],
      copy: words([["badge", "text", c.badge], ["headline", "text", c.headline], ["body", "text", c.body], ["date", "text", c.date]])
    })
  },
  {
    id: "feature-card",
    label: "Feature card",
    description: "A feature: its name, a line, three points with their dot glyphs, and a picture in dots.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "headline", required: true }, { id: "body" }, { id: "items" }],
    images: [{ id: "picture" }],
    sample: { headline: "Scrape any page", body: "Markdown, HTML or screenshots in one request.", items: "PDFs and pages | Structured fields | Screenshots" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("headline", "headline", s === "wide" ? at(0, 2, 6, 3) : at(0, 2, 12, 2)), ...has(c, "body") ? [b("body", "body", s === "wide" ? at(0, 5, 6, 2) : at(0, 4, 11, 1))] : [], ...has(c, "items") ? [b("items", "list", s === "wide" ? at(0, 8, 6, 4) : at(0, 6, 6, 5))] : [], b("picture", "picture", s === "wide" ? at(7, 1, 5, 10) : at(6, 6, 6, 6))],
      copy: words([["headline", "text", c.headline], ["body", "text", c.body], ["items", "items", c.items]])
    })
  },
  {
    id: "comparison-card",
    label: "Comparison card",
    description: "Two sides with a heading and points each: before and after, us and the old way.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "headline" }, { id: "left-title", required: true }, { id: "left-items", required: true }, { id: "right-title", required: true }, { id: "right-items", required: true }],
    sample: { headline: "Two ways to get web data", "left-title": "Your own crawlers", "left-items": "Proxies to run | Breaks on layout changes | Weeks to build", "right-title": "One API", "right-items": "No proxies | Clean Markdown | Minutes to start" },
    build: (c, s) => {
      const tall = s === "tall";
      return {
        blocks: [b("logo", "logo", at(0, 0, 4, 1)), ...has(c, "headline") ? [b("headline", "headline", at(0, 1, 12, 2))] : [], b("divider", "divider", tall ? at(0, 7, 12, 1) : at(0, 3, 12, 1)), b("left-title", "body", tall ? at(0, 4, 12, 1) : at(0, 4, 6, 1)), b("left", "list", tall ? at(0, 5, 12, 2) : at(0, 5, 6, 6)), b("right-title", "body", tall ? at(0, 8, 12, 1) : at(6, 4, 6, 1)), b("right", "list", tall ? at(0, 9, 12, 3) : at(6, 5, 6, 6))],
        copy: words([["headline", "text", c.headline], ["left-title", "text", c["left-title"]], ["left", "items", c["left-items"]], ["right-title", "text", c["right-title"]], ["right", "items", c["right-items"]]])
      };
    }
  },
  {
    id: "pricing-card",
    label: "Pricing card",
    description: "A plan: its name, the price in dots, what it includes, and a button.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "plan", required: true }, { id: "price", required: true }, { id: "period" }, { id: "items" }, { id: "cta" }],
    sample: { plan: "Developer", price: "$49", period: "a month", items: "10,000 credits | 10 concurrent requests | Email support", cta: "Start for free" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("plan", "headline", s === "wide" ? at(0, 2, 7, 2) : at(0, 2, 8, 2)), b("price", "stat", s === "wide" ? at(0, 4, 6, 4) : at(0, 4, 8, 3)), ...has(c, "items") ? [b("items", "list", s === "wide" ? at(7, 3, 5, 6) : at(0, 7, 10, 3))] : [], ...has(c, "cta") ? [b("cta", "button", at(0, 10, 5, 2))] : []],
      copy: words([["plan", "text", c.plan], ["price", "value", c.price], ["price", "label", c.period], ["items", "items", c.items], ["cta", "text", c.cta]])
    })
  },
  {
    id: "event-card",
    label: "Event card",
    description: "A webinar or meetup: what kind, its title, the date, who speaks (a role, never a made-up name), and the burst.",
    sizes: SOCIAL,
    theme: "Blue",
    copy: [{ id: "badge" }, { id: "headline", required: true }, { id: "date", required: true }, { id: "speaker" }],
    sample: { badge: "Webinar", headline: "Scraping at scale without proxies", date: "Thursday, October 8, 2026 at 10am PT", speaker: "With the engineering team at Acme" },
    build: (c, s) => ({
      blocks: [b("burst", "burst", s === "tall" ? at(3, 7, 9, 5) : at(7, 2, 5, 10)), b("logo", "logo", at(0, 0, 4, 1)), ...has(c, "badge") ? [b("badge", "badge", at(0, 2, 3, 1))] : [], b("headline", "headline", s === "tall" ? at(0, 3, 12, 3) : at(0, 3, 7, 4)), b("date", "body", s === "tall" ? at(0, 6, 10, 1) : at(0, 8, 7, 1)), ...has(c, "speaker") ? [b("speaker", "body", s === "tall" ? at(0, 7, 8, 1) : at(0, 9, 7, 1))] : []],
      copy: words([["badge", "text", c.badge], ["headline", "text", c.headline], ["date", "text", c.date], ["speaker", "text", c.speaker]])
    })
  },
  {
    id: "hiring-card",
    label: "Hiring card",
    description: "We are hiring: a headline, the open roles with their dot glyphs, and a button.",
    sizes: SOCIAL,
    theme: "Paper",
    copy: [{ id: "headline", required: true }, { id: "roles", required: true }, { id: "cta" }],
    sample: { headline: "We are hiring", roles: "Founding engineer | Developer advocate | Product designer", cta: "See open roles" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("headline", "headline", at(0, 2, 12, 3)), b("roles", "list", s === "wide" ? at(0, 5, 7, 5) : at(0, 5, 12, 4)), ...has(c, "cta") ? [b("cta", "button", s === "wide" ? at(0, 10, 5, 2) : at(0, 10, 6, 2))] : [], ...s === "wide" ? [b("burst", "burst", at(8, 4, 4, 8))] : []],
      copy: words([["headline", "text", c.headline], ["roles", "items", c.roles], ["cta", "text", c.cta]])
    })
  },
  {
    id: "screenshot",
    label: "Framed screenshot",
    description: "A screenshot in the site's window, with a headline and a line.",
    sizes: [...SOCIAL, "x-banner"],
    theme: "Mist",
    copy: [{ id: "headline" }, { id: "body" }],
    images: [{ id: "screenshot", required: true }],
    sample: { headline: "Every page as clean Markdown" },
    build: (c, s) => ({
      grid: s === "strip" ? { cols: 12, rows: 6 } : void 0,
      blocks: s === "strip" ? [b("logo", "logo", at(4, 0, 3, 1)), ...has(c, "headline") ? [b("headline", "headline", at(4, 1, 4, 3))] : [], ...has(c, "body") ? [b("body", "body", at(4, 4, 4, 1))] : [], b("screenshot", "screenshot", at(8, 0, 4, 6))] : [b("logo", "logo", at(0, 0, 4, 1)), ...has(c, "headline") ? [b("headline", "headline", s === "wide" ? at(0, 1, 12, 2) : at(0, 1, 12, 2))] : [], ...has(c, "body") ? [b("body", "body", at(0, 3, 12, 1))] : [], b("screenshot", "screenshot", s === "wide" ? at(1, 4, 10, 8) : at(0, 4, 12, 8))],
      copy: words([["headline", "text", c.headline], ["body", "text", c.body]])
    })
  },
  {
    id: "before-after",
    label: "Before and after",
    description: "Two screenshots side by side, each with its label.",
    sizes: SOCIAL,
    theme: "Mist",
    copy: [{ id: "headline" }, { id: "before", required: true }, { id: "after", required: true }],
    images: [{ id: "before-shot", required: true }, { id: "after-shot", required: true }],
    sample: { headline: "From HTML to Markdown", before: "Before", after: "After" },
    build: (c, s) => {
      const tall = s === "tall" || s === "square";
      return {
        blocks: [b("logo", "logo", at(0, 0, 4, 1)), ...has(c, "headline") ? [b("headline", "headline", at(0, 1, 12, 2))] : [], b("before", "badge", tall ? at(0, 3, 12, 1) : at(0, 3, 6, 1)), b("before-shot", "screenshot", tall ? at(0, 4, 12, 3) : at(0, 4, 6, 8)), b("after", "badge", tall ? at(0, 8, 12, 1) : at(6, 3, 6, 1)), b("after-shot", "screenshot", tall ? at(0, 9, 12, 3) : at(6, 4, 6, 8))],
        copy: words([["headline", "text", c.headline], ["before", "text", c.before], ["after", "text", c.after]])
      };
    }
  },
  {
    id: "ad",
    label: "Display ad",
    description: "An ad at any IAB size: the logo, a headline and a button, laid out by its shape.",
    sizes: ["ad-300x250", "ad-336x280", "ad-728x90", "ad-300x600", "ad-320x50", "ad-160x600", "ad-970x250", "square", "story", "facebook"],
    theme: "Blue",
    copy: [{ id: "headline", required: true }, { id: "cta" }],
    sample: { headline: "Web data for your agents", cta: "Start free" },
    build: (c, s) => {
      const cta = has(c, "cta");
      const blocks = s === "strip" || s === "tiny" ? [b("logo", "logo", at(0, 0, 3, 6)), b("headline", "headline", at(3, 0, cta ? 6 : 9, 6)), ...cta ? [b("cta", "button", at(9, 0, 3, 6))] : []] : s === "tall" ? [b("logo", "mark", at(0, 0, 12, 2)), b("headline", "headline", at(0, 3, 12, 4)), b("burst", "burst", at(0, 7, 12, 3)), ...cta ? [b("cta", "button", at(0, 10, 12, 2))] : []] : [b("logo", "logo", at(0, 0, 6, 2)), b("headline", "headline", at(0, 3, 12, 5)), ...cta ? [b("cta", "button", at(0, 9, 8, 3))] : []];
      return { grid: s === "strip" || s === "tiny" ? { cols: 12, rows: 6 } : void 0, blocks, copy: words([["headline", "text", c.headline], ["cta", "text", c.cta]]) };
    }
  },
  {
    id: "background",
    label: "Call background or wallpaper",
    description: "The brand's dots for a video call, a desktop or a phone, the logo where nothing covers it.",
    sizes: ["meeting", "desktop", "phone-wallpaper", "youtube", "landscape"],
    theme: "Night",
    copy: [{ id: "headline" }],
    images: [{ id: "picture" }],
    sample: {},
    build: (c, s) => ({
      blocks: [b("field", "field", at(0, 0, 12, 12)), ...s === "tall" ? [b("picture", "picture", at(1, 2, 10, 7))] : [b("burst", "burst", at(8, 0, 4, 12))], b("logo", "logo", s === "tall" ? at(3, 10, 6, 2) : at(0, 0, 4, 2)), ...has(c, "headline") ? [b("headline", "body", s === "tall" ? at(1, 9, 10, 1) : at(0, 2, 4, 1))] : []],
      copy: words([["headline", "text", c.headline]])
    })
  },
  {
    id: "one-pager",
    label: "One-pager",
    description: "A printable page: the logo, a headline, a paragraph, points, a figure and a quote.",
    sizes: ["a4", "letter"],
    theme: "Paper",
    copy: [{ id: "headline", required: true }, { id: "body" }, { id: "items" }, { id: "stat" }, { id: "stat-label" }, { id: "quote" }, { id: "attribution" }, { id: "footer" }],
    sample: { headline: "Web data for your agents", body: "One API to scrape, search and crawl the live web, with every page returned as clean Markdown.", items: "Scrape any page | Crawl a whole site | Search the web | Watch pages for changes", stat: "42%", "stat-label": "less time on setup at Acme", quote: "We cut our setup from a week to an afternoon.", attribution: "Head of growth, Acme", footer: "acme.com" },
    build: (c) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("headline", "headline", at(0, 1, 12, 2)), ...has(c, "body") ? [b("body", "body", at(0, 3, 10, 1))] : [], ...has(c, "items") ? [b("items", "list", at(0, 5, 6, 3))] : [], ...has(c, "stat") ? [b("stat", "stat", at(7, 5, 5, 3))] : [], ...has(c, "quote") ? [b("quote", "quote", at(0, 8, 12, 3))] : [], ...has(c, "footer") ? [b("footer", "body", at(0, 11, 6, 1))] : []],
      copy: words([["headline", "text", c.headline], ["body", "text", c.body], ["items", "items", c.items], ["stat", "value", c.stat], ["stat", "label", c["stat-label"]], ["quote", "text", c.quote], ["quote", "attribution", c.attribution], ["footer", "text", c.footer]])
    })
  },
  {
    id: "report-cover",
    label: "Report cover",
    description: "The cover of a report or case study: the logo, a title, a line, a date and the burst.",
    sizes: ["a4", "letter", "portrait"],
    theme: "Blue",
    copy: [{ id: "headline", required: true }, { id: "body" }, { id: "date" }],
    sample: { headline: "The state of web data for agents", body: "What we learned from a year of scraping.", date: "2026" },
    build: (c) => ({
      blocks: [b("burst", "burst", at(2, 6, 10, 6)), b("logo", "logo", at(0, 0, 4, 1)), b("headline", "headline", at(0, 2, 11, 3)), ...has(c, "body") ? [b("body", "body", at(0, 5, 9, 1))] : [], ...has(c, "date") ? [b("date", "body", at(0, 11, 8, 1))] : []],
      copy: words([["headline", "text", c.headline], ["body", "text", c.body], ["date", "text", c.date]])
    })
  },
  {
    id: "letterhead",
    label: "Letterhead",
    description: "A page for letters: the logo at the top, the address and contact lines at the foot, the rest left for the letter.",
    sizes: ["a4", "letter"],
    theme: "Paper",
    copy: [{ id: "address" }, { id: "contact" }],
    sample: { address: "123 Market Street, San Francisco, CA", contact: "hello@acme.com \xB7 acme.com" },
    build: (c) => ({
      blocks: [b("logo", "logo", at(0, 0, 3, 1)), b("rule", "divider", at(0, 10, 12, 1)), ...has(c, "address") ? [b("address", "body", at(0, 11, 6, 1))] : [], ...has(c, "contact") ? [b("contact", "body", at(6, 11, 6, 1))] : []],
      copy: words([["address", "text", c.address], ["contact", "text", c.contact]])
    })
  },
  {
    id: "certificate",
    label: "Certificate",
    description: "A certificate: what for, who to, a line, the date and who signs (a role).",
    sizes: ["a4", "letter", "landscape", "desktop"],
    theme: "Paper",
    copy: [{ id: "title", required: true }, { id: "recipient", required: true }, { id: "body" }, { id: "date" }, { id: "signed" }],
    sample: { title: "Certificate of completion", recipient: "Alex Doe", body: "Finished the web data for agents course.", date: "October 8, 2026", signed: "Head of education, Acme" },
    build: (c, s) => ({
      blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("title", "badge", at(0, 2, 6, 1)), b("recipient", "headline", s === "tall" ? at(0, 3, 12, 3) : at(0, 3, 12, 3)), ...has(c, "body") ? [b("body", "body", at(0, 6, 10, 1))] : [], b("rule", "divider", at(0, 9, 12, 1)), ...has(c, "date") ? [b("date", "body", at(0, 10, 5, 1))] : [], ...has(c, "signed") ? [b("signed", "body", at(7, 10, 5, 1))] : []],
      copy: words([["title", "text", c.title], ["recipient", "text", c.recipient], ["body", "text", c.body], ["date", "text", c.date], ["signed", "text", c.signed]])
    })
  },
  {
    id: "business-card",
    label: "Business card",
    description: "A business card at print size with bleed: the logo, a name, a role and how to reach them.",
    sizes: ["business-card"],
    theme: "Paper",
    copy: [{ id: "name", required: true }, { id: "role" }, { id: "contact" }],
    sample: { name: "Alex Doe", role: "Developer advocate", contact: "alex@acme.com" },
    build: (c) => ({
      grid: { cols: 12, rows: 6 },
      blocks: [b("logo", "logo", at(0, 0, 6, 2)), b("name", "headline", at(0, 2, 10, 2)), ...has(c, "role") ? [b("role", "body", at(0, 4, 10, 1))] : [], ...has(c, "contact") ? [b("contact", "body", at(0, 5, 10, 1))] : []],
      copy: words([["name", "text", c.name], ["role", "text", c.role], ["contact", "text", c.contact]])
    })
  },
  {
    id: "name-tag",
    label: "Event badge or name tag",
    description: "A badge for an event: the logo, a name, a role and the event.",
    sizes: ["name-tag", "event-badge"],
    theme: "Blue",
    copy: [{ id: "name", required: true }, { id: "role" }, { id: "event" }],
    sample: { name: "Alex Doe", role: "Engineer, Acme", event: "Agents Summit 2026" },
    build: (c) => ({
      blocks: [b("logo", "logo", at(0, 0, 6, 2)), b("name", "headline", at(0, 4, 12, 4)), ...has(c, "role") ? [b("role", "body", at(0, 8, 12, 2))] : [], ...has(c, "event") ? [b("event", "badge", at(0, 10, 8, 2))] : []],
      copy: words([["name", "text", c.name], ["role", "text", c.role], ["event", "text", c.event]])
    })
  },
  {
    id: "email-header",
    label: "Email header",
    description: "The top of an email: the logo, a headline and a picture in dots.",
    sizes: ["email"],
    theme: "Paper",
    copy: [{ id: "headline", required: true }],
    images: [{ id: "picture" }],
    sample: { headline: "What shipped in October" },
    build: (c) => ({ grid: { cols: 12, rows: 6 }, blocks: [b("logo", "logo", at(0, 0, 4, 1)), b("headline", "headline", at(0, 2, 7, 3)), b("picture", "picture", at(8, 0, 4, 6))], copy: words([["headline", "text", c.headline]]) })
  },
  {
    id: "email-signature",
    label: "Email signature",
    description: "A signature: the mark, a name, a role and a link.",
    sizes: ["email-signature"],
    theme: "Paper",
    copy: [{ id: "name", required: true }, { id: "role" }, { id: "contact" }],
    sample: { name: "Alex Doe", role: "Developer advocate, Acme", contact: "acme.com" },
    build: (c) => ({
      grid: { cols: 12, rows: 3 },
      blocks: [b("mark", "mark", at(0, 0, 2, 3)), b("name", "body", at(3, 0, 9, 1)), ...has(c, "role") ? [b("role", "body", at(3, 1, 9, 1))] : [], ...has(c, "contact") ? [b("contact", "body", at(3, 2, 9, 1))] : []],
      copy: words([["name", "text", c.name], ["role", "text", c.role], ["contact", "text", c.contact]])
    })
  }
];

// dist/assets/io.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname as dirname2, isAbsolute as isAbsolute2, relative } from "node:path";
var normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
function distance(a, b3) {
  const row = Array.from({ length: b3.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b3.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b3[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b3.length];
}
function suggest(typed, pool, max = 3) {
  const t = normalize(typed);
  return [...new Set(pool)].map((name) => {
    const n = normalize(name);
    return { name, d: n && (n.includes(t) || t.includes(n)) ? Math.abs(n.length - t.length) * 0.3 : distance(t, n) };
  }).filter((s) => s.d <= Math.max(2, t.length * 0.4)).sort((a, b3) => a.d - b3.d || a.name.length - b3.name.length).slice(0, max).map((s) => s.name);
}
function unknown(what, typed, pool) {
  const near = suggest(typed, pool);
  return new Error(`Unknown ${what} \`${typed}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(" or ")}?` : ""} Choose from: ${pool.join(", ")}.`);
}
function pick(what, typed, pool) {
  const hit = pool.find((p) => p.toLowerCase() === typed.trim().toLowerCase());
  if (!hit)
    throw unknown(what, typed, [...pool]);
  return hit;
}
function num(name, value, min, max, opts = {}) {
  if (value === void 0 || value === null || value === "")
    return void 0;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || opts.integer && !Number.isInteger(n))
    throw new Error(`--${name} takes a ${opts.integer ? "whole " : ""}number, not \`${String(value)}\`.`);
  if (n < min || n > max)
    throw new Error(`--${name} takes ${min} to ${max}, not ${n}.`);
  return n;
}
function write(path, data) {
  mkdirSync(dirname2(path), { recursive: true });
  writeFileSync(path, data);
}
function display(cwd, path) {
  const rel = relative(cwd, path);
  return !rel || rel.startsWith("..") || isAbsolute2(rel) ? path : rel;
}

// dist/assets/image.js
var RENDERS = ["toneEdges", "tone", "edges", "silhouette"];
var DITHERS = ["none", "diffuse", "pattern"];
var FIELDS = ["none", "faint", "rings"];
function imageSizes() {
  const doc6 = imageDoc();
  return Object.entries(doc6.sizes).map(([id, s]) => ({
    id,
    kinds: ["share", "social"].filter((k) => doc6.kinds[k].sizes.includes(id)),
    label: s.label,
    width: s.w,
    height: s.h,
    aliases: Object.entries(doc6.aliases).filter(([, to]) => to === id).map(([from]) => from)
  }));
}
function sizeId(typed) {
  const t = typed.trim().toLowerCase();
  if (t === "custom")
    return "custom";
  const hit = imageDoc().sizes[t] ? t : imageDoc().aliases[t] ?? sharedSize(t);
  if (!hit)
    throw unknown("size", typed, [...imageSizes().map((s) => s.id), "custom"]);
  return hit;
}
function sharedSize(t) {
  const id = sizeAlias(t);
  return id && imageDoc().sizes[id] ? id : void 0;
}
function slotsOf(t) {
  switch (t) {
    case "banner":
    case "social":
      return ["headline", "body", "badge"];
    case "products":
      return ["headline", "cta", "lists"];
    case "cards":
      return ["headline", "cards", "footer"];
    case "customer":
      return ["headline", "stat", "partner-name"];
    case "mark":
      return [];
  }
}
var slotKey = (slot) => slot === "partner-name" ? "partnerName" : slot;
var SLOTS = ["headline", "body", "badge", "cta", "lists", "cards", "footer", "stat", "partner-name"];
function designOf(req) {
  const template = pick("template", req.template, TEMPLATES);
  const spec = imageDoc().templates[template];
  const kind = req.kind ? pick("kind", req.kind, ["share", "social"]) : void 0;
  const size = req.size ? sizeId(req.size) : kind === "social" && spec.sizes.includes("landscape") ? "landscape" : spec.size;
  if (!spec.sizes.includes(size))
    throw new Error(`The ${template} layout does not come in ${size}. It comes in ${spec.sizes.join(", ")}.${size === "avatar" ? " For a profile picture, use mark." : ""}`);
  if (size === "custom" && (!req.width || !req.height))
    throw new Error("A custom size needs --width and --height (200 to 4000).");
  if (size !== "custom" && (req.width || req.height))
    throw new Error(`--width and --height go with --size custom, not ${size}.`);
  const dims = size === "custom" ? { w: clampDim(req.width), h: clampDim(req.height) } : void 0;
  const set = stripUndefined(req.set ?? {});
  const takes = slotsOf(template);
  const sample2 = req.sample ? Object.fromEntries(Object.entries(spec.sample).filter(([k]) => !set[k])) : {};
  const d = { ...designFor(template, size, dims), ...sample2, ...set };
  if (d.palette)
    d.palette = pick("theme", d.palette, palettes().map((p) => p.name));
  for (const slot of SLOTS)
    if (!takes.includes(slot) && set[slotKey(slot)])
      throw new Error(`The ${template} layout does not draw ${slot}, so "${String(set[slotKey(slot)])}" would be lost. It draws ${takes.join(", ") || "no copy"}.`);
  for (const slot of spec.required)
    if (!String(d[slotKey(slot)] ?? "").trim())
      throw new Error(`The ${template} layout needs --${slot}. Nothing is made up for it; --sample fills in sample copy.`);
  d.render = pick("render", d.render, RENDERS);
  d.dither = pick("dither", d.dither, DITHERS);
  d.field = pick("field", d.field, FIELDS);
  d.cutout = pick("cutout", d.cutout, ["auto", "whole"]);
  if (!Number.isInteger(d.seed) || d.seed < 0)
    throw new Error(`--seed takes a whole number, 0 or more, not ${String(d.seed)}.`);
  return d;
}
function stripUndefined(o) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== void 0));
}
var seededSample = (seed) => sampleNames()[(((seed || 1) - 1) % sampleNames().length + sampleNames().length) % sampleNames().length];
async function pictureFor(d, cwd, partner) {
  if (partner && d.template !== "customer")
    throw new Error(`The ${d.template} layout draws no customer logo. Use customer.`);
  if (partner && d.partnerName.trim())
    throw new Error(`Pass the customer's logo or their name, not both ("${d.partnerName}" would not be drawn).`);
  if (d.template === "customer" && d.image && d.image !== "none")
    throw new Error("The customer layout draws no picture; its art is the burst. Pass --partner for the customer's logo.");
  if (d.template === "customer")
    return partner ? readPicture(cwd, partner, 800) : null;
  if (d.template === "cards" || d.template === "mark") {
    if (d.image && d.image !== "none")
      throw new Error(`The ${d.template} layout draws no picture.`);
    return null;
  }
  if (!d.image)
    return samplePicture(seededSample(d.seed)) ?? null;
  if (d.image === "none")
    return null;
  if (d.image.toLowerCase().startsWith("sample:")) {
    const s = samplePicture(d.image);
    if (!s)
      throw unknown("sample picture", d.image.slice(7), sampleNames());
    return s;
  }
  return readPicture(cwd, d.image);
}
function renderDesign(d, picture, opts = { png: true }, edits = {}) {
  const L = frameOf(d);
  const scale = opts.scale ?? 1;
  const out = { width: Math.round(L.w * scale), height: Math.round(L.h * scale), layers: [] };
  const raster = opts.png !== false || opts.jpg || opts.webp;
  if (raster || !opts.svg) {
    const s = surface(L.w, L.h, { scale });
    const drawn = drawDesign(s.canvas, d, picture, brandFonts(), edits);
    out.layers = drawn.layers;
    if (drawn.notes)
      out.notes = drawn.notes;
    if (opts.png !== false)
      out.png = toPng(s);
    if (opts.jpg)
      out.jpg = encoded(s, "image/jpeg");
    if (opts.webp)
      out.webp = encoded(s, "image/webp");
  }
  if (opts.svg) {
    const s = surface(L.w, L.h, { svg: true });
    const r = drawDesign(s.canvas, d, picture, brandFonts(), edits);
    if (!out.layers.length)
      out.layers = r.layers;
    if (r.notes && !out.notes)
      out.notes = r.notes;
    out.svg = toSvg(s);
  }
  return out;
}
function imageCatalog() {
  const doc6 = imageDoc();
  return {
    kinds: Object.entries(doc6.kinds).map(([id, k]) => ({ id, label: k.label, templates: k.templates, sizes: k.sizes, custom: k.custom })),
    templates: TEMPLATES.map((id) => {
      const t = doc6.templates[id];
      return { id, name: t.label, description: t.description, defaultSize: t.size, sizes: t.sizes, theme: designFor(id).palette, slots: slotsOf(id), required: t.required, picture: id === "customer" ? "partner (the customer logo, only when passed)" : id === "cards" || id === "mark" ? "none" : "image (any picture, through the dot shader)" };
    }),
    sizes: [...imageSizes(), { id: "custom", kinds: ["share", "social"], label: "Custom", width: 0, height: 0, aliases: [], note: "--width and --height, 200 to 4000" }],
    palettes: palettes().map((p) => ({ name: p.name, bg: p.bg, dots: p.fill, text: p.text })),
    samples: sampleNames().map((n) => `sample:${n}`),
    renders: RENDERS,
    dithers: DITHERS,
    fields: FIELDS,
    formats: ["png", "svg", "jpg", "webp"],
    made: RECIPES.map((r) => ({ id: r.id, name: r.label, description: r.description, sizes: r.sizes, words: r.copy.map((c) => `${c.id}${c.required ? " (needed)" : ""}`), pictures: (r.images ?? []).map((i) => i.id) })),
    notes: doc6.notes
  };
}

// dist/assets/deck.js
import { readFileSync as readFileSync7 } from "node:fs";

// dist/assets/compose.js
var TEXT = { scale: [0.5, 1.6], hide: true, align: true };
var PART = { scale: [0.5, 1.6], hide: true };
var BLOCKS = [
  { type: "headline", names: ["title", "heading"], kind: "text", description: "The headline in the brand sans at 500.", copy: [{ id: "text", required: true }], span: { cols: 12, rows: 3 }, place: "top" },
  { type: "body", names: ["subtitle", "text", "paragraph"], kind: "text", description: "A line or a paragraph.", copy: [{ id: "text", required: true }], span: { cols: 8, rows: 2 } },
  { type: "badge", names: ["eyebrow", "chip", "tag", "label"], kind: "text", description: "A short label in Doto capitals on a pill.", copy: [{ id: "text", required: true }], span: { cols: 3, rows: 1 }, place: "top-left" },
  { type: "logo", names: ["wordmark", "lockup"], kind: "logo", description: "The logo, mark and wordmark.", copy: [], span: { cols: 4, rows: 1 }, place: "top-left" },
  { type: "mark", names: ["logomark", "symbol"], kind: "logo", description: "The mark alone.", copy: [], span: { cols: 3, rows: 3 }, place: "center" },
  { type: "picture", names: ["image", "photo", "globe", "art"], kind: "art", description: "Any picture through the dot shader (a built-in one when none is given), placed whole.", copy: [], image: { values: ["sample:Globe", "sample:Sphere", "sample:Cursor", "sample:Layers", "sample:Key"] }, span: { cols: 6, rows: 8 }, place: "right" },
  { type: "screenshot", names: ["window", "browser", "frame"], kind: "key", description: "A picture shown as it is (not in dots) in the site's window: three window dots on the code bar, set in the soft blue ring.", copy: [], image: { required: true }, span: { cols: 8, rows: 7 }, place: "center" },
  { type: "burst", names: ["rays"], kind: "art", description: "The customer story's burst of dots.", copy: [], span: { cols: 6, rows: 6 }, place: "bottom-right", under: true },
  { type: "field", names: ["dots", "pattern", "grid"], kind: "art", description: "The faint dot grid.", copy: [], options: [{ id: "style", values: ["faint", "rings"] }], span: { cols: 12, rows: 12 }, place: "center", under: true },
  { type: "card", names: ["feature"], kind: "panel", description: "A white card with a numbered heading and a few lines, as on the cards post.", copy: [{ id: "heading", required: true }, { id: "text" }, { id: "number" }], sample: { heading: "Web extraction", text: "Any page as markdown.", number: "1" }, span: { cols: 6, rows: 3 } },
  { type: "stat", names: ["number", "metric"], kind: "text", description: "A big number set in dots, with a line under it.", copy: [{ id: "value", required: true }, { id: "label" }], sample: { value: "42%", label: "less time on setup" }, span: { cols: 6, rows: 4 } },
  { type: "quote", names: ["testimonial"], kind: "text", description: "A quote with the open quote mark and who said it in Doto capitals.", copy: [{ id: "text", required: true }, { id: "attribution" }], sample: { text: "It just works.", attribution: "Head of growth, Acme" }, span: { cols: 10, rows: 5 } },
  { type: "list", names: ["bullets", "points"], kind: "text", description: "Points with | between, each with its dot glyph.", copy: [{ id: "items", required: true }], sample: { items: "Scrape any page | Crawl a site | Search the web" }, span: { cols: 6, rows: 5 } },
  { type: "button", names: ["cta"], kind: "text", description: "A pill button in the palette's dots color.", copy: [{ id: "text", required: true }], span: { cols: 3, rows: 1 }, place: "bottom-left" },
  { type: "search", names: ["search-bar", "input"], kind: "text", description: "A search field with the words in it (built from tokens: white pill, hairline, muted words).", copy: [{ id: "text", required: true }], span: { cols: 8, rows: 1 }, place: "center" },
  { type: "chart", names: ["graph"], kind: "text", description: `A bar, line or donut chart from "label value | label value" (built from tokens: the palette's dots and ink).`, copy: [{ id: "data", required: true }, { id: "title" }], sample: { data: "Scrape 42 | Crawl 31 | Search 27", title: "Calls by kind" }, options: [{ id: "kind", values: ["bar", "line", "donut"] }], span: { cols: 6, rows: 6 } },
  { type: "divider", names: ["rule", "line"], kind: "art", description: "A hairline across its cells.", copy: [], span: { cols: 12, rows: 1 }, place: "center" },
  { type: "icon", names: ["glyph"], kind: "key", description: "A 3 by 3 dot glyph, as the products list uses; its number picks which.", copy: [], options: [{ id: "number", range: [0, 511] }], span: { cols: 1, rows: 1 } }
];
var info = (type) => BLOCKS.find((b3) => b3.type === type);
function drawCompose(canvas, doc6, pictures, fonts2 = brandFonts()) {
  const W2 = doc6.size.width;
  const H2 = doc6.size.height;
  const d = { ...designFor("banner", doc6.size.id === "custom" || !imageDoc().sizes[doc6.size.id] ? "custom" : doc6.size.id, { w: W2, h: H2 }), palette: doc6.theme ?? "Paper", seed: doc6.seed ?? 1 };
  const p = paletteOf(d);
  const ctx = canvas.getContext("2d");
  const s = canvas.width / W2;
  const f = frameOf(d);
  const u = f.u ?? Math.sqrt(W2 * H2) / 900;
  const floor = SMALL_FLOOR * W2 / platformOf(doc6.size.id, W2, H2).shown;
  const layers = [];
  const q = { ctx, d, W: W2, H: H2, S: { x: 0, y: 0, w: W2, h: H2 }, cuts: [], u, m: 32 * u, floor, p, fonts: fonts2, edits: doc6.layers, layers, can: {}, keep: [] };
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W2, H2);
  ctx.textBaseline = "alphabetic";
  const placed = blockRects(doc6).filter((b3) => !doc6.layers[b3.block.id]?.hidden);
  const words3 = (id, slot) => doc6.copy[`${id}.${slot}`]?.trim() ?? "";
  const solid = placed.filter((b3) => info(b3.block.type).kind !== "art");
  q.keep = solid.map((b3) => grow(b3.rect, b3.block.type === "logo" || b3.block.type === "mark" ? Math.max(8, logoClear(Math.min(b3.rect.h, 48 * u))) : 8));
  const e = (id) => doc6.layers[id] ?? {};
  const tooLong3 = (id) => new Error(`The ${id} is too long for its cells. Shorten it, or give it more cells (make it wider or taller).`);
  const fit2 = (id, text, face, from, r, least = floor) => {
    assertGlyphs(id, face.caps ? text.toUpperCase() : text, face.data ? "data" : "sans");
    const k = e(id).scale ?? 1;
    const b3 = fitBlock(ctx, text, face, from, Math.max(least, floor), r.w, r.h);
    if (!b3)
      throw tooLong3(id);
    if (k === 1)
      return b3;
    const scaled = setBlock(ctx, text, face, b3.size * k, r.w);
    if (scaled.w > r.w + 0.5 || scaled.h > r.h + 0.5 || scaled.size < floor - 0.01)
      throw tooLong3(`${id} at that size`);
    return scaled;
  };
  const put2 = (id, b3, r, align, color2, ground = p.bg, extra = {}, top = r.y) => {
    const out = drawBlock(ctx, b3, r.x, top, e(id).align ?? align, r.w, color2);
    layers.push({ id, kind: "text", box: out.box, ink: out.ink, text: { asked: b3.asked, drawn: b3.lines.join("\n"), size: b3.size, color: color2, ground: [ground] }, can: TEXT, ...extra });
    return out.box;
  };
  for (const { block, rect: r } of placed) {
    const id = block.id;
    switch (block.type) {
      case "field": {
        const style = doc6.options[`${id}.style`] === "rings" ? "rings" : "faint";
        const ink = [];
        drawDotField(ctx, { width: W2, height: H2, dot: 6, gap: 8, colors: p, field: style, clip: r, keep: q.keep, pad: 0, ink });
        layers.push({ id, kind: "art", box: r, ink, can: PART });
        break;
      }
      case "burst": {
        const ink = [];
        const R = Math.min(r.w, r.h) / 2 / 0.78 * (e(id).scale ?? 1);
        drawBurst2(ctx, { width: W2, height: H2, cx: r.x + r.w / 2, cy: r.y + r.h / 2, R, fill: p.fill, ring: p.ring, keep: q.keep, pad: 0, ink, turn: ((doc6.seed ?? 1) - 1) * 0.618 % 1 });
        layers.push({ id, kind: "art", box: union(ink.length ? ink : [r]), ink, can: PART });
        break;
      }
      case "picture": {
        const pic = pictures[id] ?? null;
        if (!pic)
          break;
        Object.assign(d, { field: "none", dot: 7.6, gap: 3.8, imgX: void 0, imgY: void 0, imgScale: void 0 });
        q.can = { [id]: PART };
        drawDots(q, pic, r, { id });
        break;
      }
      case "screenshot": {
        const pic = pictures[id] ?? null;
        if (!pic)
          throw new Error(`The ${id} needs a picture: --image ${id}=screen.png.`);
        const ring = Math.max(4, 8 * u);
        const bar = Math.max(18, 44 * u * 0.7);
        const k = e(id).scale ?? 1;
        const maxW = (r.w - ring * 2) * k;
        const maxH = (r.h - ring * 2 - bar) * k;
        const sc = Math.min(maxW / pic.width, maxH / pic.height);
        const pw = pic.width * sc;
        const ph = pic.height * sc;
        const box = { x: r.x + (r.w - pw - ring * 2) / 2, y: r.y + (r.h - ph - bar - ring * 2) / 2, w: pw + ring * 2, h: ph + bar + ring * 2 };
        const rad = Math.min(16 * u, box.w / 10);
        ctx.fillStyle = tokenColor("ring-tint");
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.w, box.h, rad + ring);
        ctx.fill();
        const win = grow(box, -ring);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(win.x, win.y, win.w, win.h, rad);
        ctx.clip();
        ctx.fillStyle = tokenColor("bg-code");
        ctx.fillRect(win.x, win.y, win.w, bar);
        const dot = bar * 0.27;
        ["window-close", "window-minimize", "window-zoom"].forEach((t, i) => {
          ctx.fillStyle = tokenColor(t);
          ctx.beginPath();
          ctx.arc(win.x + bar * 0.55 + i * dot * 2.6, win.y + bar / 2, dot / 2 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(pic.canvas, win.x, win.y + bar, pw, ph);
        ctx.restore();
        layers.push({ id, kind: "key", box, can: PART });
        break;
      }
      case "divider": {
        const h = Math.max(1, u) * (e(id).scale ?? 1);
        const y = r.y + r.h / 2 - h / 2;
        ctx.fillStyle = p.field;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(r.x, y, r.w, h);
        ctx.globalAlpha = 1;
        layers.push({ id, kind: "art", box: { x: r.x, y, w: r.w, h }, can: PART });
        break;
      }
      case "logo": {
        const least = logoMin(W2, platformOf(doc6.size.id, W2, H2).shown);
        const h = Math.max(least, Math.min(r.h / (1 + 2 * logoClear(1)), r.w / logoRatio(), 48 * u)) * (e(id).scale ?? 1);
        const w = logoRatio() * h;
        if (w > r.w + 1)
          throw new Error(`The ${id} needs more cells: at least ${Math.ceil(w)} px wide here. Make it wider (too long for its cells as it is).`);
        const box = { x: r.x, y: r.y + (r.h - h) / 2, w, h };
        drawLogo(ctx, box.x, box.y, h, p.mark, p.ink);
        layers.push({ id, kind: "logo", box, logo: { clear: logoClear(h), min: logoMin(W2, platformOf(doc6.size.id, W2, H2).shown) }, can: PART });
        break;
      }
      case "mark": {
        const h = Math.min(r.h, r.w / markRatio()) * 0.8 * (e(id).scale ?? 1);
        const box = { x: r.x + (r.w - h * markRatio()) / 2, y: r.y + (r.h - h) / 2, w: h * markRatio(), h };
        drawMark(ctx, box.x, box.y, h, p.mark === p.bg ? p.ink : p.mark);
        layers.push({ id, kind: "logo", box, logo: { clear: logoClear(h), min: logoMin(W2, platformOf(doc6.size.id, W2, H2).shown) }, can: PART });
        break;
      }
      case "headline": {
        const b3 = fit2(id, words3(id, "text"), headFace(fonts2), Math.min(r.h, 110 * u), r, floor * 1.15);
        put2(id, b3, r, "left", p.text);
        break;
      }
      case "body": {
        const b3 = fit2(id, words3(id, "text"), bodyFace(fonts2), Math.max(floor, Math.min(32 * u, r.h)), r);
        put2(id, b3, r, "left", p.ink);
        break;
      }
      case "badge": {
        const text = words3(id, "text");
        const b3 = fit2(id, text, chipFace(fonts2), Math.max(floor, Math.min(14 * u, r.h * 0.5)), { ...r, w: r.w * 0.86, h: r.h / 1.9 });
        const bw = b3.w + b3.size * 1.8;
        const bh = b3.size * 1.9;
        const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: bw, h: bh };
        ctx.fillStyle = p.fill;
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, bw, bh, bh / 2);
        ctx.fill();
        const ink = onFill(p);
        drawBlock(ctx, b3, box.x + b3.size * 0.94, box.y + (bh - b3.h) / 2, "left", b3.w, ink);
        layers.push({ id, kind: "text", box, ink: [box], text: { asked: text, drawn: b3.lines.join("\n"), size: b3.size, color: ink, ground: [p.fill] }, can: PART });
        break;
      }
      case "button": {
        const text = words3(id, "text");
        const fs = Math.max(floor, Math.min(18 * u, r.h / 2.7));
        const b3 = fit2(id, text, { family: fonts2.sans, weight: 500, tracking: 0, leading: 1.2 }, fs, { ...r, w: r.w - fs * 2.6, h: r.h / 2.6 });
        const bw = b3.w + b3.size * 2.6;
        const bh = b3.size * 2.6;
        const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: bw, h: bh };
        ctx.fillStyle = p.fill;
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, bw, bh, bh / 2);
        ctx.fill();
        const ink = onFill(p);
        drawBlock(ctx, b3, box.x + b3.size * 1.3, box.y + (bh - b3.h) / 2, "left", b3.w, ink);
        layers.push({ id, kind: "text", box, ink: [box], text: { asked: text, drawn: b3.lines.join(" "), size: b3.size, color: ink, ground: [p.fill] }, can: PART });
        break;
      }
      case "search": {
        const text = words3(id, "text");
        const fs = Math.max(floor, Math.min(20 * u, r.h * 0.4));
        const white = tokenColor("white");
        const muted = tokenColor("text-muted");
        const b3 = fit2(id, text, { family: fonts2.sans, weight: 400, tracking: 0, leading: 1.2 }, fs, { ...r, w: r.w - fs * 4, h: r.h * 0.7 });
        const bh = Math.min(r.h, b3.size * 2.8);
        const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: r.w, h: bh };
        ctx.fillStyle = white;
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.w, bh, bh / 2);
        ctx.fill();
        ctx.strokeStyle = tokenColor("border-hairline");
        ctx.lineWidth = Math.max(1, u);
        ctx.stroke();
        const cx = box.x + bh * 0.55;
        const cy = box.y + bh / 2;
        ctx.strokeStyle = muted;
        ctx.lineWidth = Math.max(1.5, b3.size * 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy - b3.size * 0.08, b3.size * 0.32, 0, Math.PI * 2);
        ctx.moveTo(cx + b3.size * 0.24, cy + b3.size * 0.16);
        ctx.lineTo(cx + b3.size * 0.46, cy + b3.size * 0.38);
        ctx.stroke();
        drawBlock(ctx, b3, box.x + bh * 1.05, box.y + (bh - b3.h) / 2, "left", b3.w, muted);
        layers.push({ id, kind: "text", box, ink: [box], text: { asked: text, drawn: b3.lines.join(" "), size: b3.size, color: muted, ground: [white] }, can: PART });
        break;
      }
      case "stat": {
        const value = words3(id, "value");
        const label = words3(id, "label");
        assertGlyphs(id, value);
        const k = e(id).scale ?? 1;
        const size0 = Math.min(r.h * (label ? 0.62 : 0.95), 240 * u);
        setFace(ctx, { ...headFace(fonts2), weight: 700, tracking: 0.03 }, size0);
        const vw0 = ctx.measureText(value).width;
        ctx.letterSpacing = "0px";
        const size = (vw0 > r.w ? size0 * r.w / vw0 : size0) * k;
        const vw = vw0 * size / size0;
        if (size < floor * 1.5 || vw > r.w + 0.5)
          throw tooLong3(k > 1 ? `${id} at that size` : id);
        const vh = size * 0.86;
        const lb = label ? fit2(`${id}-label`, label, bodyFace(fonts2), Math.max(floor, size * 0.24), { ...r, h: r.h - vh - size * 0.1 }) : void 0;
        const top = r.y + (r.h - vh - (lb ? size * 0.1 + lb.h : 0)) / 2;
        ctx.fillStyle = p.text;
        dotText(ctx, value, r.x, top, size, vh, fonts2.sans);
        const vbox = { x: r.x, y: top + size * 0.06, w: Math.min(vw, r.w), h: size * 0.78 };
        layers.push({ id, kind: "text", box: vbox, ink: [vbox], text: { asked: value, drawn: value, size, color: p.text, ground: [p.bg], bold: true }, can: PART });
        if (lb)
          put2(`${id}-label`, lb, r, "left", p.ink, p.bg, { can: {} }, top + vh + size * 0.1);
        break;
      }
      case "quote": {
        const text = words3(id, "text");
        const who = words3(id, "attribution");
        const markH = Math.min(r.h * 0.22, 140 * u);
        const a = who ? fit2(`${id}-attribution`, who, chipFace(fonts2), Math.max(floor, 18 * u), { ...r, h: r.h * 0.2 }) : void 0;
        const b3 = fit2(id, text, { family: fonts2.sans, weight: 400, tracking: -0.02, leading: 1.2 }, Math.min(64 * u, r.h * 0.3), { ...r, h: r.h - markH - (a ? a.h + 24 * u : 0) });
        setFace(ctx, headFace(fonts2), markH * 1.6);
        ctx.fillStyle = p.text;
        ctx.fillText("\u201C", r.x - markH * 0.05, r.y + markH * 1.1);
        const qb = put2(id, b3, r, "left", p.ink, p.bg, {}, r.y + markH);
        layers.push({ id: `${id}-mark`, kind: "art", box: { x: r.x, y: r.y, w: markH, h: markH * 0.9 }, can: {} });
        if (a)
          put2(`${id}-attribution`, a, r, "left", p.ink, p.bg, { can: {} }, qb.y + qb.h + 24 * u);
        break;
      }
      case "list": {
        const items2 = words3(id, "items").split("|").map((x) => x.trim()).filter(Boolean);
        for (const it of items2)
          assertGlyphs(id, it);
        const k = e(id).scale ?? 1;
        let fs = Math.min(32 * u, r.h / (items2.length * 1.7)) * k;
        let fitted2 = [];
        for (; fs >= floor - 0.01; fs *= 0.95) {
          fitted2 = items2.map((it) => setBlock(ctx, it, bodyFace(fonts2), fs, r.w - fs * 1.7));
          const h = fitted2.reduce((n, b3) => n + b3.h, 0) + fs * 0.5 * (items2.length - 1);
          if (fitted2.every((b3) => b3.w <= r.w - fs * 1.7 + 0.5) && h <= r.h + 0.5)
            break;
        }
        if (fs < floor - 0.01)
          throw tooLong3(id);
        let y = r.y;
        const ink = [];
        for (const b3 of fitted2) {
          dotIcon(ctx, b3.asked, r.x, y + b3.size * b3.face.leading / 2, b3.size * 0.8, p.fill);
          ink.push(...drawBlock(ctx, b3, r.x + fs * 1.7, y, "left", b3.w, p.ink).ink);
          y += b3.h + fs * 0.5;
        }
        layers.push({ id, kind: "text", box: union(ink), ink, text: { asked: items2.join("\n"), drawn: fitted2.flatMap((b3) => b3.lines).join("\n"), size: fs, color: p.ink, ground: [p.bg] }, can: PART });
        break;
      }
      case "card": {
        const cs = imageDoc().cards;
        const fill = tokenColor(cs.fill);
        const rad = Math.min(cs.radius * u, r.h / 4);
        ctx.save();
        ctx.shadowColor = cs.shadow.color;
        ctx.shadowBlur = cs.shadow.blur * u;
        ctx.shadowOffsetY = cs.shadow.y * u;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, rad);
        ctx.fill();
        ctx.restore();
        layers.push({ id, kind: "panel", box: r, can: PART });
        const pad = Math.min(28 * u, r.h * 0.18, r.w * 0.08);
        const inner = grow(r, -pad);
        const n = words3(id, "number");
        const badge = n ? Math.max(13 * u, floor / 1.15) : 0;
        const heading = fit2(`${id}-heading`, words3(id, "heading"), { family: fonts2.sans, weight: 500, tracking: -0.01, leading: 1.2 }, Math.max(floor, 26 * u), { ...inner, w: inner.w - (n ? badge * 2 + 14 * u : 0), h: inner.h * 0.5 });
        const tx = inner.x + (n ? badge * 2 + 14 * u : 0);
        if (n) {
          ctx.fillStyle = tokenColor(cs.badge);
          ctx.beginPath();
          ctx.arc(inner.x + badge, inner.y + heading.size * heading.face.leading / 2, badge, 0, Math.PI * 2);
          ctx.fill();
          const nb = setBlock(ctx, n, { family: fonts2.sans, weight: 500, tracking: 0, leading: 1 }, badge * 1.2, badge * 2);
          drawBlock(ctx, nb, inner.x + badge - nb.w / 2, inner.y + heading.size * heading.face.leading / 2 - nb.size / 2, "left", nb.w, tokenColor(cs.badgeInk));
          layers.push({ id: `${id}-number`, kind: "text", box: { x: inner.x, y: inner.y, w: badge * 2, h: badge * 2 }, over: [id], text: { asked: n, drawn: n, size: nb.size, color: tokenColor(cs.badgeInk), ground: [tokenColor(cs.badge)], own: true }, can: {} });
        }
        const hb = drawBlock(ctx, heading, tx, inner.y, "left", heading.w, tokenColor(cs.heading));
        layers.push({ id: `${id}-heading`, kind: "text", box: hb.box, ink: hb.ink, over: [id], text: { asked: heading.asked, drawn: heading.lines.join("\n"), size: heading.size, color: tokenColor(cs.heading), ground: [fill] }, can: {} });
        const body = words3(id, "text");
        if (body) {
          const top = inner.y + Math.max(heading.h, badge * 2) + 12 * u;
          const bb = fit2(`${id}-text`, body, { family: fonts2.sans, weight: 400, tracking: 0, leading: 1.4 }, Math.max(floor, 19 * u), { ...inner, y: top, h: inner.y + inner.h - top });
          const out = drawBlock(ctx, bb, inner.x, top, "left", bb.w, tokenColor(cs.body));
          layers.push({ id: `${id}-text`, kind: "text", box: out.box, ink: out.ink, over: [id], text: { asked: body, drawn: bb.lines.join("\n"), size: bb.size, color: tokenColor(cs.body), ground: [fill] }, can: {} });
        }
        break;
      }
      case "chart": {
        const data = words3(id, "data").split("|").map((x) => x.trim()).filter(Boolean).map((row) => {
          const m = /^(.*\S)\s+(-?\d+(?:\.\d+)?)%?$/.exec(row);
          if (!m)
            throw new Error(`The ${id}'s data is "label value" rows with | between; "${row}" has no value at its end.`);
          return { label: m[1], value: Number(m[2]), raw: row };
        });
        if (data.length < 2 || data.length > 12)
          throw new Error(`The ${id} takes 2 to 12 rows, not ${data.length}.`);
        const kind = String(doc6.options[`${id}.kind`] ?? "bar");
        const title = words3(id, "title");
        const fs = Math.max(floor, Math.min(18 * u, r.h / (data.length * 2.4)));
        const tb = title ? fit2(`${id}-title`, title, { family: fonts2.sans, weight: 500, tracking: -0.01, leading: 1.2 }, Math.max(floor, 26 * u), { ...r, h: r.h * 0.2 }) : void 0;
        const area = { ...r, y: r.y + (tb ? tb.h + 12 * u : 0), h: r.h - (tb ? tb.h + 12 * u : 0) };
        if (tb)
          put2(`${id}-title`, tb, r, "left", p.text, p.bg, { can: {} });
        const max = Math.max(...data.map((x) => x.value), 0);
        const face = { family: fonts2.sans, weight: 400, tracking: 0, leading: 1.2 };
        const ink = [];
        const drawn = [];
        const label = (text, x, y, align = "left", w = area.w) => {
          const b3 = setBlock(ctx, text, face, fs, w);
          if (b3.w > w + 0.5)
            throw tooLong3(id);
          const ax = align === "right" ? x - b3.w : align === "center" ? x - b3.w / 2 : x;
          ink.push(...drawBlock(ctx, b3, ax, y, "left", b3.w, p.ink).ink);
          drawn.push(text);
          return b3;
        };
        if (kind === "bar") {
          setFace(ctx, face, fs);
          const lw = Math.min(area.w * 0.4, Math.max(...data.map((x) => ctx.measureText(x.label).width)));
          const vw = Math.max(...data.map((x) => ctx.measureText(String(x.value)).width));
          ctx.letterSpacing = "0px";
          const row = area.h / data.length;
          const bh = Math.min(row * 0.55, fs * 1.4);
          data.forEach((x, i) => {
            const y = area.y + i * row + (row - fs * 1.2) / 2;
            label(x.label, area.x, y, "left", lw);
            const bx = area.x + lw + fs;
            const full = area.w - lw - vw - fs * 2;
            const w = max > 0 ? Math.max(0, full * x.value / max) : 0;
            ctx.fillStyle = p.fill;
            ctx.beginPath();
            ctx.roundRect(bx, area.y + i * row + (row - bh) / 2, Math.max(bh, w), bh, bh / 2);
            ctx.fill();
            label(String(x.value), bx + Math.max(bh, w) + fs * 0.5, y, "left", vw + 2);
          });
        } else if (kind === "line") {
          const plot = { x: area.x, y: area.y, w: area.w, h: area.h - fs * 2 };
          const pts = data.map((x, i) => ({ x: plot.x + plot.w * i / (data.length - 1), y: plot.y + plot.h - (max > 0 ? plot.h * x.value / max : 0) }));
          ctx.strokeStyle = p.fill;
          ctx.lineWidth = Math.max(2, 3 * u);
          ctx.beginPath();
          pts.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
          ctx.stroke();
          ctx.fillStyle = p.fill;
          for (const pt of pts) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(3, 5 * u), 0, Math.PI * 2);
            ctx.fill();
          }
          const slot = plot.w / data.length;
          data.forEach((x, i) => label(`${x.label} ${x.value}`, pts[i].x, plot.y + plot.h + fs * 0.5, i === 0 ? "left" : i === data.length - 1 ? "right" : "center", slot * 1.9));
        } else {
          const total = data.reduce((n, x) => n + Math.max(0, x.value), 0) || 1;
          const R = Math.min(area.h / 2, area.w * 0.28);
          const cx = area.x + R;
          const cy = area.y + area.h / 2;
          let a = -Math.PI / 2;
          const shades = [1, 0.7, 0.45, 0.25];
          data.forEach((x, i) => {
            const b3 = a + Math.PI * 2 * Math.max(0, x.value) / total;
            ctx.strokeStyle = p.fill;
            ctx.globalAlpha = shades[i % shades.length];
            ctx.lineWidth = R * 0.34;
            ctx.beginPath();
            ctx.arc(cx, cy, R * 0.83, a, b3);
            ctx.stroke();
            ctx.globalAlpha = 1;
            a = b3;
          });
          const lx = cx + R + fs * 1.5;
          data.forEach((x, i) => {
            const y = area.y + (area.h - data.length * fs * 1.6) / 2 + i * fs * 1.6;
            ctx.fillStyle = p.fill;
            ctx.globalAlpha = shades[i % shades.length];
            ctx.beginPath();
            ctx.arc(lx + fs * 0.4, y + fs * 0.6, fs * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            label(`${x.label} ${x.value}`, lx + fs * 1.3, y, "left", area.x + area.w - lx - fs * 1.3);
          });
        }
        layers.push({ id, kind: "text", box: union(ink), ink, text: { asked: data.map((x) => `${x.label} ${x.value}`).join("\n"), drawn: drawn.join("\n"), size: fs, color: p.ink, ground: [p.bg] }, can: PART });
        break;
      }
      case "icon": {
        const name = String(doc6.options[`${id}.number`] ?? 0);
        const sz = Math.min(r.w, r.h) * (e(id).scale ?? 1);
        dotIcon(ctx, name, r.x + (r.w - sz) / 2, r.y + r.h / 2, sz, p.fill);
        layers.push({ id, kind: "key", box: { x: r.x + (r.w - sz) / 2, y: r.y + (r.h - sz) / 2, w: sz, h: sz }, can: PART });
        break;
      }
    }
  }
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
  return layers;
}

// dist/assets/slide-blocks.js
var at2 = (col, row, cols, rows) => ({ col, row, cols, rows });
var b2 = (id, type, a) => ({ id, type, at: a });
var items = (v) => (v ?? "").split("|").map((x) => x.trim()).filter(Boolean);
var words2 = (pairs) => Object.fromEntries(pairs.filter(([, , v]) => v?.trim()).map(([id, slot, v]) => [`${id}.${slot}`, v]));
var head = (s) => s.title?.trim() ? [b2("title", "headline", at2(0, 2, 12, 2))] : [];
var BLOCK_SLIDES = {
  agenda: (s) => ({ blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), b2("items", "list", at2(0, 4, 8, 8))], copy: words2([["title", "text", s.title], ["items", "items", s.items]]) }),
  team: (s) => {
    const people = items(s.items).slice(0, 8);
    const cols = people.length > 4 ? 4 : Math.max(1, people.length);
    const w = 12 / cols;
    return {
      blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), ...people.map((_, i) => b2(`person-${i + 1}`, "card", at2(i % cols * w, 4 + Math.floor(i / cols) * 4, w, 3)))],
      copy: { ...words2([["title", "text", s.title]]), ...Object.assign({}, ...people.map((p, i) => {
        const [name, ...role] = p.split(",");
        return words2([[`person-${i + 1}`, "heading", name?.trim()], [`person-${i + 1}`, "text", role.join(",").trim()]]);
      })) }
    };
  },
  timeline: (s) => {
    const steps = items(s.items).slice(0, 6);
    const w = Math.floor(12 / Math.max(1, steps.length));
    return {
      blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), b2("line", "divider", at2(0, 5, 12, 1)), ...steps.map((_, i) => b2(`step-${i + 1}`, "card", at2(i * w, 6, w, 4)))],
      copy: { ...words2([["title", "text", s.title]]), ...Object.assign({}, ...steps.map((p, i) => {
        const [when, ...what] = p.split(" ");
        return { ...words2([[`step-${i + 1}`, "heading", when], [`step-${i + 1}`, "text", what.join(" ")]]), [`step-${i + 1}.number`]: String(i + 1) };
      })) }
    };
  },
  chart: (s) => ({ blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), b2("chart", "chart", at2(0, 4, s.body?.trim() ? 8 : 12, 8)), ...s.body?.trim() ? [b2("body", "body", at2(9, 4, 3, 4))] : []], copy: words2([["title", "text", s.title], ["chart", "data", s.data], ["body", "text", s.body]]) }),
  comparison: (s) => ({
    blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), b2("left-title", "body", at2(0, 4, 5, 1)), b2("left", "list", at2(0, 5, 5, 6)), b2("right-title", "body", at2(7, 4, 5, 1)), b2("right", "list", at2(7, 5, 5, 6))],
    copy: words2([["title", "text", s.title], ["left-title", "text", s["left-title"]], ["left", "items", s["left-items"]], ["right-title", "text", s["right-title"]], ["right", "items", s["right-items"]]])
  }),
  "image-grid": (s) => {
    const n = Math.min(4, Math.max(2, Number(s.count) || 3));
    const w = 12 / n;
    return { blocks: [b2("logo", "logo", at2(0, 0, 4, 2)), ...head(s), ...Array.from({ length: n }, (_, i) => b2(`picture-${i + 1}`, "picture", at2(i * w, 4, w, 8)))], copy: words2([["title", "text", s.title]]) };
  },
  qa: (s) => ({ blocks: [b2("field", "field", at2(0, 0, 12, 12)), b2("logo", "logo", at2(0, 0, 4, 2)), b2("title", "headline", at2(1, 4, 10, 3)), ...s.body?.trim() ? [b2("body", "body", at2(2, 7, 8, 1))] : []], copy: words2([["title", "text", s.title], ["body", "text", s.body]]), layers: { title: { align: "center" }, ...s.body?.trim() ? { body: { align: "center" } } : {} } })
};

// dist/assets/deck.js
var doc3;
var deckDoc = () => doc3 ??= JSON.parse(readFileSync7(pkgPath("brand", "assets", "deck.json"), "utf8"));
var slideTypes = () => Object.keys(deckDoc().slides);
var LOGO2 = { anchors: ["top-left", "top-right", "bottom-left", "bottom-right"], scale: [0.6, 1.8], hide: true };
var TITLE = { move: true, scale: [0.5, 1.5], align: true };
var TEXT2 = { move: true, scale: [0.6, 1.5] };
var ART2 = { move: true, scale: [0.4, 1.6], hide: true };
var BT = { scale: [0.5, 1.6], hide: true, align: true };
var BP = { scale: [0.5, 1.6], hide: true };
var cards = (prefix, n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [[`${prefix}-${i + 1}`, { hide: true }], [`${prefix}-${i + 1}-heading`, {}], [`${prefix}-${i + 1}-text`, {}], [`${prefix}-${i + 1}-number`, {}]]).flat());
var BLOCK_CAN = {
  agenda: { logo: BP, title: BT, items: BP },
  team: { logo: BP, title: BT, ...cards("person", 8) },
  timeline: { logo: BP, title: BT, line: { hide: true }, ...cards("step", 6) },
  chart: { logo: BP, title: BT, chart: { hide: true }, "chart-title": {}, body: BT },
  comparison: { logo: BP, title: BT, "left-title": BT, left: BP, "right-title": BT, right: BP },
  "image-grid": { logo: BP, title: BT, ...Object.fromEntries(Array.from({ length: 4 }, (_, i) => [[`picture-${i + 1}`, BP], [`picture-${i + 1}-field`, {}]]).flat()) },
  qa: { field: { hide: true }, logo: BP, title: BT, body: BT }
};
var SLIDE_CAN = {
  cover: { logo: LOGO2, title: TITLE, body: TEXT2, art: ART2, field: {} },
  section: { logo: LOGO2, number: { scale: [0.5, 1.3] }, title: TITLE, field: { hide: true } },
  statement: { logo: LOGO2, title: TITLE, field: { hide: true } },
  bullets: { logo: LOGO2, title: TITLE, items: { scale: [0.6, 1.3] }, icons: {}, art: ART2, field: { hide: true } },
  stat: { logo: LOGO2, stat: { scale: [0.6, 1.3] }, title: TITLE, art: ART2, field: {} },
  quote: { logo: LOGO2, mark: { hide: true }, quote: TITLE, attribution: { scale: [0.7, 1.4] }, field: { hide: true } },
  image: { logo: LOGO2, title: TITLE, body: TEXT2, art: ART2, field: {} },
  closing: { logo: { scale: [0.6, 1.5] }, title: TITLE, url: { scale: [0.7, 1.4], hide: true }, field: { hide: true } },
  ...BLOCK_CAN
};
var SLIDE_REFLOWS = {
  cover: { title: ["body", "art"], art: ["title", "body"] },
  section: { title: ["number"], number: ["title"] },
  statement: {},
  bullets: { title: ["items", "icons", "field"], items: ["icons", "field"] },
  stat: { title: ["stat"], stat: ["title"] },
  quote: { quote: ["mark", "attribution"], mark: ["quote", "attribution"], attribution: ["quote", "mark"] },
  image: { title: ["body", "art"], body: ["title", "art"], art: ["title", "body"] },
  closing: { title: ["logo"], logo: ["title"] },
  agenda: { title: ["items"] },
  team: { title: Object.keys(BLOCK_CAN.team) },
  timeline: { title: Object.keys(BLOCK_CAN.timeline) },
  chart: { title: ["chart", "chart-title", "body"], body: ["chart", "chart-title"] },
  comparison: {},
  "image-grid": {},
  qa: { title: ["body"], body: ["title"] }
};
function deckCatalog() {
  const d = deckDoc();
  return {
    size: { width: d.width, height: d.height },
    slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, description: d.slides[id].description, palette: d.slides[id].palette, slots: [...d.slides[id].slots, ...d.slides[id].picture ? ["image"] : []], required: d.slides[id].required, sample: d.slides[id].sample })),
    palettes: palettes().map((p) => p.name)
  };
}
function slotsFor(type, given, sample2 = false) {
  const def = deckDoc().slides[type];
  const out = { ...def.own, ...sample2 ? def.sample : {} };
  for (const [k, v] of Object.entries(given)) {
    if (["type", "palette", "theme", "picture", "pictures", "images", "count", "sample", ...def.picture ? ["image"] : []].includes(k) || v === void 0)
      continue;
    const slot = k === "headline" && def.slots.includes("title") ? "title" : k;
    if (!def.slots.includes(slot))
      throw new Error(`A ${type} slide does not take "${k}". It takes ${[...def.slots, ...def.picture ? ["image"] : []].map((s) => `"${s}"`).join(", ")}.`);
    if (Array.isArray(v) && v.every((x) => typeof x === "string"))
      out[slot] = v.join(" | ");
    else if (typeof v === "string")
      out[slot] = v;
    else
      throw new Error(`A ${type} slide's "${k}" takes text.`);
  }
  for (const r of def.required)
    if (!out[r]?.trim())
      throw new Error(`A ${type} slide needs "${r}". Nothing is made up for it; --sample fills in sample copy.`);
  return out;
}
var W = 1920;
var H = 1080;
var U = Math.sqrt(W * H) / 900;
var M = 32 * U;
var color = (p, name) => contrast(tokenColor(name), p.bg) >= 4.5 ? tokenColor(name) : p.ink;
var tooLong2 = (what) => new Error(`The ${what} is too long for this slide. Shorten it, or split it over two.`);
function fitted(s, id, slot, face, from, least, maxW, maxH) {
  const value = s.slots[slot].trim();
  const b3 = fitBlock(s.q.ctx, value, face, from, Math.max(least, s.q.floor), maxW, maxH);
  if (!b3)
    throw tooLong2(slot);
  const k = s.q.edits[id]?.scale ?? 1;
  if (k === 1)
    return b3;
  const e = setBlock(s.q.ctx, value, face, b3.size * k, maxW);
  if (e.w > maxW + 0.5 || e.h > maxH + 0.5 || e.size < s.q.floor - 0.01)
    throw tooLong2(`${slot} at that size`);
  return e;
}
var shift = (q, id) => ({ x: (q.edits[id]?.dx ?? 0) * W, y: (q.edits[id]?.dy ?? 0) * H });
function boxOf(q, id, b3, x, top, w, align) {
  const a = q.edits[id]?.align ?? align;
  const d = shift(q, id);
  return { x: (a === "center" ? x + (w - b3.w) / 2 : a === "right" ? x + w - b3.w : x) + d.x, y: top + d.y, w: b3.w, h: b3.h };
}
function put(q, id, b3, x, top, w, align, ink, own = false) {
  const d = shift(q, id);
  const r = drawBlock(q.ctx, b3, x + d.x, top + d.y, q.edits[id]?.align ?? align, w, ink);
  q.layers.push({ id, kind: "text", box: r.box, ink: r.ink, text: { asked: b3.asked, drawn: b3.lines.join("\n"), size: b3.size, color: ink, ground: [q.p.bg], ...own ? { own } : {} }, can: q.can[id] ?? {} });
}
function drawSlide(ctx, slide, fonts2 = brandFonts(), edits = {}) {
  const type = pick("slide type", slide.type, slideTypes());
  const slots = slotsFor(type, slide, slide.sample === true);
  const wanted = slide.palette ?? slide.theme;
  const p = paletteOf({ palette: wanted ? pick("theme", wanted, palettes().map((x) => x.name)) : deckDoc().slides[type].palette });
  const pic = edits.art?.hidden ? null : slide.picture ?? null;
  for (const [k, v] of Object.entries(slots)) {
    const doto = k === "attribution" || k === "url";
    assertGlyphs(k, doto ? v.toUpperCase() : v, doto ? "data" : "sans");
  }
  const blocks = BLOCK_SLIDES[type];
  if (blocks) {
    const built = blocks({ ...slots, count: String(slide.count ?? slide.pictures?.length ?? 3) });
    const pics = {};
    (built.blocks ?? []).filter((x) => x.type === "picture").forEach((x, i) => pics[x.id] = slide.pictures?.[i] ?? samplePicture(sampleNames()[i % sampleNames().length]) ?? null);
    const k = ctx.getTransform().a;
    const doc6 = { size: { id: "slide", width: W, height: H }, theme: p.name, copy: built.copy, blocks: built.blocks, grid: built.grid, layers: { ...built.layers, ...edits }, images: {}, options: {}, seed: 1 };
    return drawCompose({ width: W * k, height: H * k, getContext: () => ctx }, doc6, pics, fonts2);
  }
  const d = { ...designFor("banner", "custom", { w: W, h: H }), palette: p.name };
  const can = SLIDE_CAN[type];
  const q = { ctx, d, W, H, S: { x: 0, y: 0, w: W, h: H }, cuts: [], u: U, m: M, floor: SMALL_FLOOR * W / platformOf("slide", W, H).shown, p, fonts: fonts2, edits, layers: [], can, keep: [] };
  const title = { family: fonts2.sans, weight: 500, tracking: -0.02, leading: 1.18 };
  const bodyF = { family: fonts2.sans, weight: 400, tracking: 0, leading: 1.42 };
  const data = { family: fonts2.data, weight: 900, tracking: 0.08, leading: 1.2, caps: true, data: true };
  const s = { q, slots, title };
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const logo = type === "closing" ? void 0 : logoBox(q, "top-left");
  const clear = logo ? logoClear(logo.h) : 0;
  const atTop = logo && logo.y < H / 2;
  const top0 = atTop ? logo.y + logo.h + Math.max(clear, 40) : M;
  const foot = logo && !atTop ? logo.y - Math.max(clear, 40) : H - M;
  const keep = (pad, ...rs) => {
    q.keep = [...rs.filter((r) => !!r).map((r) => grow(r, pad)), ...logo ? [grow(logo, Math.max(clear, 16))] : []];
  };
  const field = (mode, dot, gap, over = {}, image = null, area) => {
    Object.assign(d, { field: edits.field?.hidden ? "none" : mode, dot, gap });
    drawDots(q, image, area, over);
  };
  const middle = (h, up = 0) => Math.max(top0, Math.min((H - h) / 2 - up, foot - h));
  switch (type) {
    case "cover": {
      const t = fitted(s, "title", "title", { ...title, tracking: -0.03, leading: 1.06 }, 150, 64, W * 0.54, (foot - top0) * (slots.body ? 0.68 : 1));
      const b3 = slots.body?.trim() ? fitted(s, "body", "body", bodyF, 46, 28, W * 0.5, foot - top0 - t.h - 40) : void 0;
      const top = middle(t.h + (b3 ? 40 + b3.h : 0), -20);
      const rt = boxOf(q, "title", t, M, top, W * 0.54, "left");
      const rb = b3 && boxOf(q, "body", b3, M, top + t.h + 40, W * 0.5, "left");
      keep(16 * U, rt, rb);
      if (pic)
        field("none", 7.6, 3.8, {}, pic, { x: Math.max(rt.x + rt.w + 40, W * 0.54), y: M, w: W - M - Math.max(rt.x + rt.w + 40, W * 0.54), h: H - M * 2 });
      else
        drawBurst(q);
      putLogo(q, logo);
      put(q, "title", t, M, top, W * 0.54, "left", p.text);
      if (b3)
        put(q, "body", b3, M, top + t.h + 40, W * 0.5, "left", p.ink);
      break;
    }
    case "section": {
      const n = slots.number?.trim() ?? "";
      const size = 230 * (edits.number?.scale ?? 1);
      setFace(ctx, { ...title, weight: 700, tracking: 0.03 }, size);
      const nw = n ? ctx.measureText(n).width : 0;
      ctx.letterSpacing = "0px";
      if (nw > W - M * 4)
        throw tooLong2("number");
      const nh = n ? size * 0.86 : 0;
      const t = fitted(s, "title", "title", title, 120, 48, W * 0.72, foot - top0 - nh - 24);
      const x = M * 2;
      const top = middle(nh + (n ? 24 : 0) + t.h, -10);
      const tt = top + nh + (n ? 24 : 0);
      keep(24 * U, n ? { x, y: top, w: nw, h: nh } : void 0, boxOf(q, "title", t, x, tt, W * 0.72, "left"));
      field("rings", 6, 10);
      putLogo(q, logo);
      if (n) {
        ctx.fillStyle = p.text;
        dotText(ctx, n, x, top, size, nh, fonts2.sans);
        q.layers.push({ id: "number", kind: "text", box: { x, y: top, w: nw, h: nh }, ink: [{ x, y: top + size * 0.06, w: nw, h: size * 0.78 }], text: { asked: n, drawn: n, size, color: p.text, ground: [p.bg] }, can: can.number });
      }
      put(q, "title", t, x, tt, W * 0.72, "left", p.text);
      break;
    }
    case "statement": {
      const t = fitted(s, "title", "title", { ...title, leading: 1.16 }, 96, 44, W * 0.72, foot - top0);
      const top = middle(t.h);
      keep(24 * U, boxOf(q, "title", t, W * 0.14, top, W * 0.72, "center"));
      field("faint", 8.8, 31.2, { field: p.fill, fieldOp: 1, mask: (x, y) => Math.max(Math.abs(x - W / 2) / (W / 2) * 1.1, Math.abs(y - H / 2) / (H / 2) * 1.4) >= 0.725 });
      putLogo(q, logo);
      put(q, "title", t, W * 0.14, top, W * 0.72, "center", p.text);
      break;
    }
    case "bullets": {
      const items2 = (slots.items ?? "").split("|").map((x2) => x2.trim()).filter(Boolean);
      if (items2.length > 8)
        throw new Error(`A bullets slide holds up to 8 points and it was given ${items2.length}, which is too many. Split it.`);
      const x = M * 2;
      const t = slots.title?.trim() ? fitted(s, "title", "title", title, 88, 44, W - x * 2, (foot - top0) * 0.34) : void 0;
      const top = top0 + 40;
      const listTop = top + (t ? t.h + 64 : 0);
      const set = (size) => {
        for (const cols of items2.length > 4 ? [2, 1] : [1, 2]) {
          const colW = (W - x * 2 - (cols - 1) * 80) / cols - (cols === 1 && pic ? W * 0.3 : 0);
          const per = Math.ceil(items2.length / cols);
          const inset = size * 1.5;
          const blocks2 = items2.map((it) => setBlock(ctx, it, bodyF, size, colW - inset));
          if (blocks2.some((b3) => b3.w > colW - inset + 0.5))
            continue;
          const gap = size * 0.75;
          const hs = Array.from({ length: cols }, (_, c) => blocks2.slice(c * per, (c + 1) * per).reduce((n, b3) => n + b3.h + gap, -gap));
          if (Math.max(...hs) > foot - listTop + 0.5)
            continue;
          const out = [];
          blocks2.forEach((b3, i) => {
            const c = Math.floor(i / per);
            const before = blocks2.slice(c * per, i).reduce((n, v) => n + v.h + gap, 0);
            out.push({ b: b3, x: x + c * (colW + 80), y: listTop + before });
          });
          return { out, size, inset };
        }
        return void 0;
      };
      let list;
      for (let size = 46; !list && size >= 24; size *= 0.96)
        list = set(size);
      const k = edits.items?.scale ?? 1;
      if (list && k !== 1)
        list = set(list.size * k);
      if (!list || list.size < q.floor)
        throw tooLong2(k !== 1 ? "list at that size" : "list");
      const words3 = list.out.map((o) => ({ x: o.x, y: o.y, w: list.inset + o.b.w, h: o.b.h }));
      keep(20 * U, ...words3, t && boxOf(q, "title", t, x, top, W - x * 2, "left"));
      const right2 = { x: W * 0.62, y: 0, w: W * 0.38, h: H };
      const reach = [...words3, ...t ? [boxOf(q, "title", t, x, top, W - x * 2, "left")] : []].filter((r) => r.x + r.w > right2.x - 60);
      const from = pic ? 0 : Math.max(0, ...reach.map((r) => r.y + r.h + 48));
      field(from > H * 0.62 ? "none" : "rings", 6, 10, { mask: (px2, py) => px2 > right2.x && py > from }, pic, pic ? { x: W * 0.64, y: H * 0.3, w: W * 0.36 - M, h: H * 0.7 - M } : void 0);
      putLogo(q, logo);
      if (t)
        put(q, "title", t, x, top, W - x * 2, "left", p.text);
      const ink = [];
      const icons = [];
      for (const o of list.out) {
        const iy = o.y + list.size * bodyF.leading / 2;
        dotIcon(ctx, o.b.asked, o.x, iy, list.size * 0.8, p.fill);
        icons.push({ x: o.x, y: iy - list.size * 0.4, w: list.size * 0.8, h: list.size * 0.8 });
        ink.push(...drawBlock(ctx, o.b, o.x + list.inset, o.y, "left", o.b.w, p.ink).ink);
      }
      q.layers.push({ id: "items", kind: "text", box: union(ink), ink, text: { asked: items2.join("\n"), drawn: list.out.flatMap((o) => o.b.lines).join("\n"), size: list.size, color: p.ink, ground: [p.bg] }, can: can.items });
      q.layers.push({ id: "icons", kind: "art", box: union(icons), ink: icons, can: {} });
      break;
    }
    case "stat": {
      const st = slots.stat.trim();
      const hf = { ...title, tracking: -0.03, leading: 1.06 };
      const x = M * 1.4;
      const maxW = W * 0.56;
      const measure = (big, ks, kt) => {
        const size = big * 2 * ks;
        setFace(ctx, { ...title, weight: 700, tracking: 0.03 }, size);
        const w = ctx.measureText(st).width;
        ctx.letterSpacing = "0px";
        const b3 = slots.title?.trim() ? setBlock(ctx, slots.title.trim(), hf, big * kt, maxW) : void 0;
        const h = size * 0.86 + (b3 ? big * 0.12 + b3.h : 0);
        return w > W - x * 2 || b3 && b3.w > maxW + 0.5 || h > foot - top0 ? void 0 : { size, w, b: b3, h, big };
      };
      let m;
      for (let big = 160; !m && big >= 40; big *= 0.965)
        m = measure(big, 1, 1);
      if (m && (edits.stat?.scale || edits.title?.scale))
        m = measure(m.big, edits.stat?.scale ?? 1, edits.title?.scale ?? 1);
      if (!m || m.b && m.b.size < q.floor)
        throw tooLong2(slots.title ? "title" : "stat");
      const top = middle(m.h);
      const tt = top + m.size * 0.86 + m.big * 0.12;
      const rs = { x, y: top, w: m.w, h: m.size * 0.86 };
      keep(16 * U, rs, m.b && boxOf(q, "title", m.b, x, tt, maxW, "left"));
      drawBurst(q);
      putLogo(q, logo);
      ctx.fillStyle = p.text;
      dotText(ctx, st, x, top, m.size, m.size * 0.86, fonts2.sans);
      q.layers.push({ id: "stat", kind: "text", box: rs, ink: [{ ...rs, y: top + m.size * 0.06, h: m.size * 0.78 }], text: { asked: st, drawn: st, size: m.size, color: p.text, ground: [p.bg] }, can: can.stat });
      if (m.b)
        put(q, "title", m.b, x, tt, maxW, "left", p.text);
      break;
    }
    case "quote": {
      const x = W * 0.12;
      const mark = edits.mark?.hidden ? 0 : 110;
      const a = slots.attribution?.trim() ? fitted(s, "attribution", "attribution", data, 34, 24, W * 0.76, 100) : void 0;
      const t = fitted(s, "quote", "quote", { family: fonts2.sans, weight: 400, tracking: -0.025, leading: 1.18 }, 76, 36, W * 0.76, foot - top0 - mark - (a ? 64 + a.h : 0));
      const top = middle(mark + t.h + (a ? 64 + a.h : 0));
      const rt = boxOf(q, "quote", t, x, top + mark, W * 0.76, "left");
      const ra = a && boxOf(q, "attribution", a, x, top + mark + t.h + 64, W * 0.76, "left");
      const rm = mark ? { x: x - 8, y: top, w: 120, h: 90 } : void 0;
      keep(24 * U, rt, ra, rm);
      field("rings", 6, 10, { mask: (px2, py) => px2 / W + py / H > 1.45 });
      putLogo(q, logo);
      if (rm) {
        setFace(ctx, { ...title, tracking: 0 }, 220);
        ctx.fillStyle = p.text;
        const g = ctx.measureText("\u201C");
        ctx.fillText("\u201C", x - 8, top + 220 * 0.72);
        q.layers.push({ id: "mark", kind: "art", box: { x: x - 8 - g.actualBoundingBoxLeft, y: top + 220 * 0.72 - g.actualBoundingBoxAscent, w: g.actualBoundingBoxRight + g.actualBoundingBoxLeft, h: g.actualBoundingBoxAscent + g.actualBoundingBoxDescent }, can: can.mark });
      }
      put(q, "quote", t, x, top + mark, W * 0.76, "left", p.ink);
      if (a)
        put(q, "attribution", a, x, top + mark + t.h + 64, W * 0.76, "left", color(p, "text-muted"));
      break;
    }
    case "image": {
      const tall = foot - top0;
      const t = fitted(s, "title", "title", { family: fonts2.sans, weight: 400, tracking: -0.01, leading: 1.1 }, 96, 44, W * 0.8, tall * (pic ? 0.34 : 0.7));
      const b3 = slots.body?.trim() ? fitted(s, "body", "body", bodyF, 36, 24, W * 0.7, tall * 0.2) : void 0;
      const h = t.h + (b3 ? 28 + b3.h : 0);
      const top = pic ? top0 : middle(h);
      const rt = boxOf(q, "title", t, W * 0.1, top, W * 0.8, "center");
      const rb = b3 && boxOf(q, "body", b3, W * 0.15, top + t.h + 28, W * 0.7, "center");
      keep(16 * U, rt, rb);
      const below = top + h + 48;
      if (pic)
        field("none", 7.6, 3.8, {}, pic, { x: M, y: below, w: W - M * 2, h: foot - below });
      putLogo(q, logo);
      put(q, "title", t, W * 0.1, top, W * 0.8, "center", p.text);
      if (b3)
        put(q, "body", b3, W * 0.15, top + t.h + 28, W * 0.7, "center", p.ink);
      break;
    }
    case "closing": {
      const lh = 112 * (edits.logo?.scale ?? 1);
      const lw = logoRatio() * lh;
      const t = slots.title?.trim() ? fitted(s, "title", "title", title, 56, 32, W * 0.7, 260) : void 0;
      const u = slots.url?.trim() && !edits.url?.hidden ? fitted(s, "url", "url", data, 32, 24, W * 0.8, 60) : void 0;
      const gap = Math.max(48, logoClear(lh) * 1.15);
      const top = (H - (lh + (t ? gap + t.h : 0))) / 2 - 20;
      const lr = { x: (W - lw) / 2, y: top, w: lw, h: lh };
      const rt = t && boxOf(q, "title", t, W * 0.15, top + lh + gap, W * 0.7, "center");
      const ut = H - 120;
      q.keep = [grow(lr, Math.max(40 * U, logoClear(lh))), ...rt ? [grow(rt, 40 * U)] : [], ...u ? [grow(boxOf(q, "url", u, W * 0.1, ut, W * 0.8, "center"), 40 * U)] : []];
      field("faint", 7.2, 40.8);
      drawLogo(ctx, lr.x, lr.y, lh, p.mark, p.ink);
      q.layers.push({ id: "logo", kind: "logo", box: lr, logo: { clear: logoClear(lh), min: logoMin(W, 960) }, can: can.logo });
      if (t)
        put(q, "title", t, W * 0.15, top + lh + gap, W * 0.7, "center", p.ink);
      if (u)
        put(q, "url", u, W * 0.1, ut, W * 0.8, "center", p.ink, slots.url === deckDoc().slides.closing.own?.url);
      break;
    }
  }
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 1;
  return q.layers;
}
function renderSlide(slide, opts = { png: true }, edits = {}) {
  const scale = opts.scale ?? 1;
  const out = { width: W * scale, height: H * scale, layers: [] };
  if (opts.png !== false || opts.jpg || opts.webp || opts.rgb || !opts.svg) {
    const s = surface(W, H, { scale });
    out.layers = drawSlide(s.ctx, slide, brandFonts(), edits);
    if (opts.png !== false)
      out.png = toPng(s, { opaque: true });
    if (opts.jpg)
      out.jpg = encoded(s, "image/jpeg");
    if (opts.webp)
      out.webp = encoded(s, "image/webp");
    const px2 = pixelsOf(s).data;
    const rgb2 = Buffer.alloc(px2.length / 4 * 3);
    for (let i = 0, j = 0; i < px2.length; i += 4, j += 3) {
      rgb2[j] = px2[i];
      rgb2[j + 1] = px2[i + 1];
      rgb2[j + 2] = px2[i + 2];
    }
    out.rgb = rgb2;
  }
  if (opts.svg) {
    const s = surface(W, H, { svg: true });
    const layers = drawSlide(s.ctx, slide, brandFonts(), edits);
    if (!out.layers.length)
      out.layers = layers;
    out.svg = toSvg(s);
  }
  return out;
}

// dist/assets/merch.js
import { readFileSync as readFileSync8 } from "node:fs";

// dist/assets/pdf.js
import { deflateSync as deflateSync2 } from "node:zlib";
function imagesToPdf(pages, pageWidthPt) {
  if (!pages.length)
    throw new Error("A PDF needs at least one page.");
  const objects = [];
  const add = (body) => {
    objects.push(typeof body === "string" ? Buffer.from(body, "latin1") : body);
    return objects.length;
  };
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  const kids = [];
  for (const page of pages) {
    const ptW = pageWidthPt;
    const ptH = Math.round(pageWidthPt * page.height / page.width * 100) / 100;
    const data = deflateSync2(page.rgb, { level: 6 });
    const img = add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${data.length} >>
stream
`, "latin1"), data, Buffer.from("\nendstream", "latin1")]));
    const content = `q ${ptW} 0 0 ${ptH} 0 0 cm /Im0 Do Q`;
    const contents = add(`<< /Length ${content.length} >>
stream
${content}
endstream`);
    kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Resources << /XObject << /Im0 ${img} 0 R >> >> /Contents ${contents} 0 R >>`));
  }
  objects[1] = Buffer.from(`<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`, "latin1");
  const parts = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1")];
  const offsets = [];
  let at3 = parts[0].length;
  objects.forEach((body, i) => {
    const head2 = Buffer.from(`${i + 1} 0 obj
`, "latin1");
    const tail = Buffer.from("\nendobj\n", "latin1");
    offsets.push(at3);
    parts.push(head2, body, tail);
    at3 += head2.length + body.length + tail.length;
  });
  const xref = [`xref
0 ${objects.length + 1}
0000000000 65535 f 
`, ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n 
`)].join("");
  parts.push(Buffer.from(`${xref}trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${at3}
%%EOF
`, "latin1"));
  return Buffer.concat(parts);
}

// dist/assets/merch.js
var PX_PER_IN = 300;
var MIN_LOGO_IN = 0.25;
var doc4;
var merchDoc = () => doc4 ??= JSON.parse(readFileSync8(pkgPath("brand", "assets", "merch.json"), "utf8"));
var merchItems = () => merchDoc().items;
var findItem = (id) => {
  const name = pick("item", id, merchItems().map((i) => i.id));
  return merchItems().find((i) => i.id === name);
};
function merchCatalog() {
  return {
    items: merchItems().map((i) => ({
      id: i.id,
      name: i.name,
      trim: { width: i.size[0], height: i.size[1], unit: "in" },
      bleed: i.bleed,
      safe: i.safe,
      method: i.method,
      variants: i.variants,
      pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
      dieCut: Boolean(i.cut),
      slots: itemSlots(i),
      picture: i.layers.some((l) => l.type === "dots" && l.mode === "picture"),
      source: i.source
    })),
    variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v }))
  };
}
function colorsOf(v) {
  if (v.one) {
    const c = tokenColor(v.one);
    return { bg: v.one === "white" ? tokenColor("black") : tokenColor("white"), fill: c, ring: c, field: c, fieldOp: 1, mark: c, ink: c, text: c };
  }
  const p = paletteOf({ palette: v.palette });
  return { bg: p.bg, fill: p.fill, ring: p.ring, field: p.field, fieldOp: p.fieldOp, mark: p.mark, ink: p.ink, text: p.text };
}
var itemSlots = (item) => [...new Set(item.layers.flatMap((l) => l.type === "text" ? [l.slot] : []))];
function drawItem(ctx, item, req = {}) {
  const variant = pick(`variant for ${item.id}`, req.variant ?? item.variants[0], item.variants);
  const v = merchDoc().variants[variant];
  const c = colorsOf(v);
  const o = item.bleed * PX_PER_IN;
  const W2 = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
  const H2 = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
  const px2 = (b3) => ({ x: b3[0] * PX_PER_IN + o, y: b3[1] * PX_PER_IN + o, w: b3[2] * PX_PER_IN, h: b3[3] * PX_PER_IN });
  const takes = new Set(itemSlots(item));
  for (const k of Object.keys(req.slots ?? {}))
    if (!takes.has(k))
      throw new Error(`${item.id} does not draw --${k}.${takes.size ? ` It takes ${[...takes].map((s) => `--${s}`).join(", ")}.` : " It takes no text."}`);
  if (req.picture && !item.layers.some((l) => l.type === "dots" && l.mode === "picture"))
    throw new Error(`${item.id} holds no picture; --image goes with poster.`);
  const slots = { ...merchDoc().own, ...req.sample ? merchDoc().sample : {}, ...req.slots };
  for (const [k, t] of Object.entries(slots))
    if (takes.has(k))
      assertGlyphs(k, k === "url" ? t.toUpperCase() : t, k === "url" ? "data" : "sans");
  const fonts2 = brandFonts();
  const layers = [];
  const gone = item.layers.find((l) => l.type === "text" && l.slot !== "url" && !slots[l.slot]?.trim());
  const parts = gone ? item.layers.map((l) => l.type === "logo" && l.box[1] > gone.box[1] ? { ...l, box: [l.box[0], gone.box[1] + 0.4, l.box[2], l.box[3]] } : l) : item.layers;
  if (v.ground) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W2, H2);
  }
  const pad = 0.12 * PX_PER_IN;
  const keep = [];
  const texts = [];
  for (const l of parts) {
    if (l.type === "logo") {
      const b3 = px2(l.box);
      const ratio = l.part === "mark" ? markRatio() : logoRatio();
      const h = Math.min(b3.h, b3.w / ratio);
      const w = h * ratio;
      const more = Math.max(0, logoClear(h) - pad);
      keep.push({ x: (l.align === "left" ? b3.x : b3.x + (b3.w - w) / 2) - more, y: b3.y + (b3.h - h) / 2 - more, w: w + more * 2, h: h + more * 2 });
    } else if (l.type === "text") {
      const b3 = px2(l.box);
      const value = slots[l.slot] ?? "";
      if (!value.trim())
        continue;
      const style = l.face === "data" ? { family: fonts2.data, weight: 900, size: l.size * PX_PER_IN, tracking: 0.08, leading: 1.2, color: c.ink, caps: true, align: l.align ?? "center" } : { family: fonts2.sans, weight: 500, size: l.size * PX_PER_IN, tracking: -0.02, leading: 1.1, color: c.text, align: l.align ?? "center" };
      const f = fit(ctx, value, style, b3.w, l.maxLines ?? 2, 0.6, `${item.id} ${l.slot}`);
      texts.push({ f, box: b3, slot: l.slot, asked: value });
      keep.push({ x: l.align === "left" ? b3.x : b3.x + (b3.w - f.width) / 2, y: b3.y, w: f.width, h: f.height });
    }
  }
  let logos = 0;
  const logoId = () => logos++ ? `logo-${logos}` : "logo";
  for (const l of parts) {
    if (l.type !== "dots")
      continue;
    const b3 = px2(l.box);
    const ink = [];
    if (l.mode === "burst" || l.mode === "picture" && !req.picture) {
      const R = Math.sqrt(b3.w * b3.h) * (l.size ?? 1);
      drawBurst2(ctx, { width: W2, height: H2, cx: b3.x + (l.center?.[0] ?? 0.5) * b3.w, cy: b3.y + (l.center?.[1] ?? 0.5) * b3.h, R, fill: c.fill, ring: c.ring, keep, pad, ink, turn: req.seed ? (req.seed - 1) * 0.618 % 1 : 0 });
      if (ink.length)
        layers.push({ id: "art", kind: "art", box: { x: 0, y: 0, w: W2, h: H2 }, ink, bleeds: true, can: {} });
      continue;
    }
    const dot = (l.dot ?? 0.1) * PX_PER_IN;
    const gap = (l.gap ?? 0.08) * PX_PER_IN;
    const size = l.mask === "fade-down" ? (_x, y) => Math.min(1, Math.max(0, 1 - (y - b3.y) / (b3.h * 0.9))) : void 0;
    const mask = l.mask === "edges" ? (x, y) => {
      const d = Math.max(Math.abs(x - (b3.x + b3.w / 2)) / (b3.w / 2) * 1.1, Math.abs(y - (b3.y + b3.h / 2)) / (b3.h / 2) * 1.4);
      return (d - 0.55) / 0.35;
    } : l.mask === "band" ? (_x, y) => Math.abs((y - b3.y) / b3.h - 0.5) > 0.22 ? 1 : 0 : void 0;
    const area = v.ground ? { x: 0, y: 0, w: W2, h: H2 } : b3;
    const pic = l.mode === "picture" ? req.picture : null;
    const fieldMode = l.mode === "picture" ? v.ground ? "faint" : "none" : "faint";
    const colors = { ...c, field: l.mode === "field" ? c.fill : c.field, fieldOp: l.mode === "field" ? v.one ? 1 : 0.55 : c.fieldOp };
    ctx.save();
    ctx.translate(area.x, area.y);
    drawDotField(ctx, {
      width: area.w,
      height: area.h,
      dot,
      gap,
      colors,
      field: fieldMode,
      picture: pic,
      rect: pic ? placePicture(pic, { x: b3.x - area.x, y: b3.y - area.y, w: b3.w, h: b3.h }, 92) : void 0,
      keep: keep.map((k) => ({ ...k, x: k.x - area.x, y: k.y - area.y })),
      pad,
      mask: mask ? (x, y) => mask(x + area.x, y + area.y) : void 0,
      size: size ? (x, y) => size(x + area.x, y + area.y) : void 0,
      ink
    });
    ctx.restore();
    if (ink.length)
      layers.push({ id: layers.some((x) => x.id === "art") ? "field" : "art", kind: "art", box: area, ink: ink.map((r) => ({ ...r, x: r.x + area.x, y: r.y + area.y })), bleeds: true, can: {} });
  }
  for (const l of parts) {
    if (l.type !== "logo")
      continue;
    const b3 = px2(l.box);
    if (l.part === "mark") {
      const h = Math.min(b3.h, b3.w / markRatio());
      const r = { x: b3.x + (b3.w - h * markRatio()) / 2, y: b3.y + (b3.h - h) / 2, w: h * markRatio(), h };
      drawMark(ctx, r.x, r.y, h, c.mark);
      layers.push({ id: logoId(), kind: "logo", box: r, logo: { clear: logoClear(h), min: MIN_LOGO_IN * PX_PER_IN }, can: {} });
    } else {
      const h = Math.min(b3.h, b3.w / logoRatio());
      const w = h * logoRatio();
      const r = { x: l.align === "left" ? b3.x : b3.x + (b3.w - w) / 2, y: b3.y + (b3.h - h) / 2, w, h };
      drawLogo(ctx, r.x, r.y, h, c.mark, c.ink);
      layers.push({ id: logoId(), kind: "logo", box: r, logo: { clear: logoClear(h), min: MIN_LOGO_IN * PX_PER_IN }, can: {} });
    }
  }
  for (const t of texts) {
    const box = drawFitted(ctx, t.f, t.box.x, t.box.y, t.box.w);
    const ink = t.f.style.color ?? c.text;
    layers.push({ id: t.slot, kind: "text", box, text: { asked: t.asked, drawn: t.f.lines.join("\n"), size: t.f.size, color: ink, ground: [c.bg], ...merchDoc().own[t.slot] === t.asked ? { own: true } : {} }, can: {} });
  }
  if (req.guides) {
    ctx.save();
    ctx.strokeStyle = tokenColor("chart-series-1");
    ctx.lineWidth = 3;
    if (item.bleed)
      ctx.strokeRect(o, o, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN);
    const s = item.safe * PX_PER_IN;
    ctx.setLineDash([18, 12]);
    ctx.strokeRect(o + s, o + s, item.size[0] * PX_PER_IN - 2 * s, item.size[1] * PX_PER_IN - 2 * s);
    ctx.restore();
  }
  return { variant, width: W2, height: H2, layers, ground: c.bg };
}
function cutPath(item) {
  if (!item.cut)
    return "";
  const o = item.bleed * PX_PER_IN;
  const w = item.size[0] * PX_PER_IN;
  const h = item.size[1] * PX_PER_IN;
  const r = item.cut.radius * PX_PER_IN;
  const d = `M${o + r} ${o}H${o + w - r}A${r} ${r} 0 0 1 ${o + w} ${o + r}V${o + h - r}A${r} ${r} 0 0 1 ${o + w - r} ${o + h}H${o + r}A${r} ${r} 0 0 1 ${o} ${o + h - r}V${o + r}A${r} ${r} 0 0 1 ${o + r} ${o}Z`;
  return `<g id="CutContour"><path d="${d}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>`;
}
function renderItem(item, req = {}) {
  const widthIn = item.size[0] + 2 * item.bleed;
  const heightIn = item.size[1] + 2 * item.bleed;
  const W2 = Math.round(widthIn * PX_PER_IN);
  const H2 = Math.round(heightIn * PX_PER_IN);
  const dpi = req.dpi ?? PX_PER_IN;
  const out = { layers: [], variant: "", width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
  if (req.png !== false || req.pdf) {
    const s = surface(W2, H2, { scale: dpi / PX_PER_IN });
    const r = drawItem(s.ctx, item, req);
    out.variant = r.variant;
    out.layers = r.layers;
    if (req.png !== false)
      out.png = toPng(s, { dpi });
    if (req.pdf) {
      const px2 = pixelsOf(s);
      const [br, bg, bb] = [1, 3, 5].map((i) => Number.parseInt(r.ground.slice(i, i + 2), 16));
      const rgb2 = Buffer.alloc(px2.width * px2.height * 3);
      for (let i = 0, j = 0; i < px2.data.length; i += 4, j += 3) {
        const a = px2.data[i + 3] / 255;
        rgb2[j] = Math.round(px2.data[i] * a + br * (1 - a));
        rgb2[j + 1] = Math.round(px2.data[i + 1] * a + bg * (1 - a));
        rgb2[j + 2] = Math.round(px2.data[i + 2] * a + bb * (1 - a));
      }
      out.pdf = imagesToPdf([{ rgb: rgb2, width: px2.width, height: px2.height }], widthIn * 72);
    }
  }
  if (req.svg) {
    const s = surface(W2, H2, { svg: true });
    const r = drawItem(s.ctx, item, req);
    out.variant = r.variant;
    out.layers = r.layers;
    out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>
`);
  }
  return out;
}

// dist/assets/video.js
import { spawn, spawnSync } from "node:child_process";
import { existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync9 } from "node:fs";
import { dirname as dirname3, join as join3 } from "node:path";
import { Path2D as Path2D5 } from "@napi-rs/canvas";

// dist/review/capture.js
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join as join2 } from "node:path";
function cachedChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join2(homedir(), "Library", "Caches", "ms-playwright"), join2(homedir(), ".cache", "ms-playwright")].filter((r) => !!r && existsSync2(r));
  const candidates = [
    ["chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"],
    ["chrome-mac", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"],
    ["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"],
    ["chrome-linux", "chrome"],
    ["chrome-linux64", "chrome"],
    ["chrome-headless-shell-mac-arm64", "chrome-headless-shell"],
    ["chrome-headless-shell-linux64", "chrome-headless-shell"]
  ];
  for (const root of roots) {
    for (const dir of readdirSync(root).filter((d) => /^chromium/.test(d)).sort().reverse()) {
      for (const parts of candidates) {
        const path = join2(root, dir, ...parts);
        if (existsSync2(path))
          return path;
      }
    }
  }
  return void 0;
}
async function launch() {
  const { chromium } = await import("playwright-core").catch(() => {
    throw new Error("playwright-core is not installed. Run: npm i -D playwright-core && npx playwright install chromium");
  });
  const cached = cachedChromium();
  for (const opts of [{}, ...cached ? [{ executablePath: cached }] : [], { channel: "chrome" }, { channel: "msedge" }]) {
    try {
      return await chromium.launch(opts);
    } catch {
    }
  }
  throw new Error("No Chromium found. Run: npx playwright install chromium");
}

// dist/assets/video.js
var doc5;
var videoDoc = () => doc5 ??= JSON.parse(readFileSync9(pkgPath("brand", "assets", "video.json"), "utf8"));
var loopTemplates = () => Object.keys(videoDoc().loops.templates);
function hasFfmpeg() {
  if (process.env.DS_NO_FFMPEG)
    return false;
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}
function videoCatalog() {
  const d = videoDoc();
  return {
    reel: { id: "reel", seconds: d.reel.seconds, width: d.reel.width, height: d.reel.height, fps: d.reel.fps, copy: Object.keys(d.reel.copy), needs: "Chromium (playwright-core), as review does", notes: d.reel.notes },
    loops: {
      templates: loopTemplates().map((id) => ({ id, ...d.loops.templates[id] })),
      sizes: Object.entries(d.loops.sizes).map(([id, [width, height]]) => ({ id, width, height })),
      seconds: d.loops.seconds,
      fps: d.loops.fps
    },
    formats: ["mp4", "webm", "frames", "all"],
    encoder: "ffmpeg (H.264 MP4, VP9 WebM) when installed; otherwise PNG frames."
  };
}
function noise(x, y, seed = 7) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function drawLoopFrame(ctx, o, p) {
  const t = pick("template", o.template, loopTemplates());
  const pal = paletteOf({ palette: o.palette ? pick("palette", o.palette, palettes().map((x) => x.name)) : videoDoc().loops.templates[t].palette });
  const { width: W2, height: H2 } = o;
  const seed = o.seed ?? 0;
  const k = Math.min(W2, H2) / 1080;
  const TAU = Math.PI * 2;
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W2, H2);
  const pitch = (t === "edges" ? 16 : t === "ripple" ? 30 : 48) * k * (t === "edges" ? 1.5 : 1);
  const cols = Math.ceil(W2 / pitch);
  const rows = Math.ceil(H2 / pitch);
  const r0 = pitch * (t === "edges" ? 0.32 : t === "ripple" ? 0.22 : 0.075);
  const keepBox = t === "logo" ? logoBox2(W2, H2, o.headline, ctx) : void 0;
  const base = new Path2D5();
  const bright = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const cx = col * pitch + pitch / 2;
      const cy = row * pitch + pitch / 2;
      const n = noise(col, row, 7 + seed);
      if (keepBox && cx > keepBox.x - pitch && cx < keepBox.x + keepBox.w + pitch && cy > keepBox.y - pitch && cy < keepBox.y + keepBox.h + pitch)
        continue;
      if (t === "edges") {
        const edge = Math.min(cx, W2 - cx) / W2;
        const breathe = 0.5 + 0.5 * Math.sin(TAU * (p + noise(col, row, 11 + seed) * 0.25));
        if (n > 0.35 + edge * (4.5 - 1.2 * breathe)) {
          base.moveTo(cx + r0, cy);
          base.arc(cx, cy, r0, 0, TAU);
        }
      } else if (t === "ripple") {
        const d = Math.hypot(cx - W2 / 2, cy - H2 / 2) / (Math.max(W2, H2) * 0.5);
        const wave = Math.max(0, Math.sin(TAU * (d * 1.6 - p * 2)));
        const r = r0 * (0.55 + 0.9 * wave ** 3);
        if (wave > 0.6)
          bright.push({ x: cx, y: cy, r, a: 1 });
        else {
          base.moveTo(cx + r, cy);
          base.arc(cx, cy, r, 0, TAU);
        }
      } else {
        if (n < 0.07) {
          const beats = 1 + Math.floor(noise(col, row, 3 + seed) * 3);
          const pulse = Math.max(0, Math.sin(TAU * (p * beats + noise(col, row, 5 + seed))));
          bright.push({ x: cx, y: cy, r: r0 * 1.2 * (1 + 0.9 * pulse), a: 0.35 + 0.65 * pulse });
        } else {
          base.moveTo(cx + r0 * 1.2, cy);
          base.arc(cx, cy, r0 * 1.2, 0, TAU);
        }
      }
    }
  ctx.save();
  if (t === "edges") {
    ctx.globalAlpha = pal.bg === tokenColor("white") ? 0.14 : 0.3;
    ctx.fillStyle = pal.ink;
  } else if (t === "ripple") {
    ctx.globalAlpha = 1;
    ctx.fillStyle = pal.field;
  } else {
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = pal.ink;
  }
  ctx.fill(base);
  ctx.restore();
  for (const b3 of bright) {
    ctx.save();
    ctx.globalAlpha = b3.a;
    ctx.fillStyle = t === "ripple" ? pal.fill : pal.ink;
    ctx.beginPath();
    ctx.arc(b3.x, b3.y, b3.r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  if (keepBox) {
    drawLogo(ctx, keepBox.logo.x, keepBox.logo.y, keepBox.logo.h, pal.mark, pal.ink);
    if (keepBox.line)
      drawFitted(ctx, { ...keepBox.line, style: { ...keepBox.line.style, color: pal.ink } }, 0, keepBox.logo.y + keepBox.logo.h + 44 * k, W2);
  }
}
function logoBox2(W2, H2, headline, ctx) {
  const k = Math.min(W2, H2) / 1080;
  const lh = 96 * k;
  const lw = logoRatio() * lh;
  const fonts2 = brandFonts();
  const line = headline ? fit(ctx, headline, { family: fonts2.sans, weight: 500, size: 46 * k, tracking: -0.02, leading: 1.2, align: "center" }, W2 * 0.8, 2, 0.6, "headline") : void 0;
  const h = lh + (line ? 44 * k + line.height : 0);
  const y = (H2 - h) / 2;
  return { x: Math.min((W2 - lw) / 2, line ? (W2 - line.width) / 2 : Infinity), y, w: Math.max(lw, line?.width ?? 0), h, logo: { x: (W2 - lw) / 2, y, h: lh }, line };
}
function* loopFrames(o) {
  const count = Math.round(o.seconds * o.fps);
  for (let i = 0; i < count; i++) {
    const s = surface(o.width, o.height);
    drawLoopFrame(s.ctx, o, i / count);
    yield { index: i, rgba: pixelsOf(s).data, png: () => toPng(s, { opaque: true }) };
  }
}
async function encode(frames, o) {
  for (const out of o.outputs)
    mkdirSync3(dirname3(out.path), { recursive: true });
  const args = ["-y", "-loglevel", "error"];
  if (o.input === "rgba")
    args.push("-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${o.width}x${o.height}`, "-r", String(o.fps), "-i", "-");
  else
    args.push("-f", "image2pipe", "-framerate", String(o.fps), "-c:v", "png", "-i", "-");
  for (const out of o.outputs) {
    args.push("-map_metadata", "-1", "-fflags", "+bitexact", "-flags:v", "+bitexact");
    if (out.format === "mp4")
      args.push("-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-threads", "1", "-movflags", "+faststart", out.path);
    else
      args.push("-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28", "-pix_fmt", out.alpha ? "yuva420p" : "yuv420p", ...out.alpha ? ["-auto-alt-ref", "0"] : [], "-row-mt", "0", "-threads", "1", out.path);
  }
  const ff = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  ff.stderr.on("data", (d) => err += d);
  const done = new Promise((res) => ff.on("close", (code2) => res(code2 ?? 1)));
  let closed = false;
  ff.stdin.on("error", () => closed = true);
  ff.on("close", () => closed = true);
  for await (const f of frames) {
    if (closed)
      break;
    if (!ff.stdin.write(f))
      await Promise.race([new Promise((r) => ff.stdin.once("drain", r)), done]);
  }
  ff.stdin.end();
  const code = await done;
  if (code !== 0)
    throw new Error(`ffmpeg failed: ${err.trim() || `exit ${code}`}`);
  return o.outputs.map((x) => ({ path: x.path, format: x.format }));
}
function reelHtml(copy = {}) {
  const d = videoDoc().reel;
  const js = pkgPath("build", "assets", "reel.js");
  if (!existsSync3(js))
    throw new Error("build/assets/reel.js is missing: run the build first.");
  const colors = Object.fromEntries(Object.entries(d.colors).map(([k, v]) => [k, tokenColor(v)]));
  const face = (w) => `@font-face{font-family:"Rethink Sans";font-weight:${w};src:url(data:font/ttf;base64,${readFileSync9(pkgPath("brand", "fonts", `rethink-sans-${w}.ttf`)).toString("base64")})}`;
  const reel = { colors, copy: { ...d.copy, ...copy } };
  return `<!doctype html><html><head><meta charset="utf-8"><style>${face(400)}${face(500)}:root{--cx-ground:${colors.ground}}${readFileSync9(pkgPath("build", "assets", "reel.css"), "utf8")}</style></head><body><div id="cx-stage"></div><script>window.__reel=${JSON.stringify(reel).replace(/</g, "\\u003c")}</script><script>${readFileSync9(js, "utf8")}</script></body></html>`;
}
async function reelFrames(copy, fps, each, times) {
  const d = videoDoc().reel;
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: 1 });
    await page.setContent(reelHtml(copy), { waitUntil: "load" });
    await page.waitForFunction(() => window.__reelReady === true);
    const stage = page.locator("#cx-stage");
    const list = times ?? Array.from({ length: Math.round(d.seconds * fps) }, (_, i) => i / fps);
    for (const [i, t] of list.entries()) {
      await page.evaluate((at3) => window.__seek(at3), t);
      await each(await stage.screenshot({ type: "png", animations: "disabled" }), i);
    }
  } finally {
    await browser.close();
  }
}
export {
  PX_PER_IN,
  RING2 as RING,
  SHADER_DEFAULTS,
  TEMPLATES,
  brandFonts,
  compactSvg,
  cutout,
  deckCatalog,
  designFor,
  designOf,
  display,
  dotIcon,
  dotText,
  drawBurst2 as drawBurst,
  drawDesign,
  drawDotField,
  drawFitted,
  drawItem,
  drawLogo,
  drawLoopFrame,
  drawMark,
  drawSlide,
  encode,
  encodePng,
  findItem,
  fit,
  frameOf,
  grid,
  hasFfmpeg,
  hexLightness,
  imageCatalog,
  imageDoc,
  imageSizes,
  imagesToPdf,
  lightnessOf,
  logoRatio,
  loopFrames,
  loopTemplates,
  markRatio,
  merchCatalog,
  merchItems,
  num,
  paletteOf,
  palettes,
  pick,
  pictureFor,
  pictureFrom,
  pictureKind,
  pictureOf,
  pixelsOf,
  placePicture,
  readPicture,
  reelFrames,
  reelHtml,
  renderDesign,
  renderItem,
  renderSlide,
  sampleNames,
  samplePicture,
  scratch,
  setFont,
  shade,
  sizeId,
  slideTypes,
  suggest,
  surface,
  toPng,
  toSvg,
  tokenColor,
  unknown,
  videoCatalog,
  wrap2 as wrap,
  write
};

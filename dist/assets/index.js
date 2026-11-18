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
  const rgb = raw.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[/,]\s*([\d.]+))?/);
  if (!rgb)
    return void 0;
  const hex = [rgb[1], rgb[2], rgb[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase();
  return rgb[4] === void 0 ? `#${hex}` : `#${hex}${Math.round(Number(rgb[4]) * 255).toString(16).padStart(2, "0").toUpperCase()}`;
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
  const px = pixelsOf(s);
  if (!opts.opaque)
    return encodePng(px.data, px.width, px.height, 4, opts.dpi);
  const rgb = Buffer.alloc(px.width * px.height * 3);
  for (let i = 0, j = 0; i < px.data.length; i += 4, j += 3) {
    rgb[j] = px.data[i];
    rgb[j + 1] = px.data[i + 1];
    rgb[j + 2] = px.data[i + 2];
  }
  return encodePng(rgb, px.width, px.height, 3, opts.dpi);
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
var clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
var toLin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
var LIN = new Float32Array(256).map((_, i) => toLin(i));
var lightness = (r, g, b) => Math.cbrt(0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[b]);
function oklab(r, g, b) {
  r = LIN[r];
  g = LIN[g];
  b = LIN[b];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
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
  const key = [img.key, mode, keyTol].join("|");
  const hit = cutCache.get(key);
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
        let b = 0;
        let bd = 1e9;
        cen.forEach((c2, k) => {
          const q2 = dist(p, c2);
          if (q2 < bd) {
            bd = q2;
            b = k;
          }
        });
        asg[i] = b;
        const a = acc[b];
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
      const px = p % w;
      const py = p / w | 0;
      for (const n of [
        px > 0 ? p - 1 : -1,
        px < w - 1 ? p + 1 : -1,
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
      const px = p % w;
      const py = p / w | 0;
      let nb = 0;
      let t = 0;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const X = px + dx;
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
  cutCache.set(key, out);
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
  const key = [
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
  if (last && last.key === key)
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
    es.sort((a, b) => a - b);
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
    idx.sort((a, b) => v[a] - v[b]);
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
  last = { key, st };
  return st;
}

// dist/assets/dots.js
import { Path2D as Path2D3 } from "@napi-rs/canvas";

// dist/assets/og.js
import { readFileSync as readFileSync4 } from "node:fs";
import { Path2D as Path2D2 } from "@napi-rs/canvas";

// dist/assets/cards.js
function parseCards(src) {
  return src.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map((block) => {
    const [title, ...rest] = block.split("\n");
    return { title: title.trim(), body: rest.join(" ").replace(/\s+/g, " ").trim() };
  });
}
function wrap(ctx, text, max) {
  const out = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
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
var BASE = { pad: 30, badge: 13, heading: 25, body: 17, gapX: 30, gapY: 18 };
function layoutCards(ctx, W2, H2, k, c, st) {
  const mx = Math.max(W2 * 0.071, 32 * k);
  const top = H2 * 0.07;
  let size = c.titleSize;
  let lines = [];
  for (let i = 0; i < 12; i++) {
    ctx.font = `${st.titleWeight} ${size}px ${st.display}`;
    ctx.letterSpacing = `${st.titleTrack * size}px`;
    lines = c.title.trim() ? wrap(ctx, c.title, W2 - mx * 2) : [];
    if (lines.length <= 3)
      break;
    size *= 0.9;
  }
  const titleW = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
  ctx.letterSpacing = "0px";
  const titleH = lines.length * size * 1.15;
  const title = {
    lines,
    size,
    y: top,
    rect: { x: mx, y: top, w: W2 - mx * 2, h: titleH }
  };
  const footerH = c.logo || c.footer.trim() ? 30 * k : 0;
  const footer = { x: mx, y: H2 - H2 * 0.055 - footerH, w: W2 - mx * 2, h: footerH };
  const areaTop = top + titleH + (titleH ? H2 * 0.065 : 0);
  const areaBottom = footerH ? footer.y - H2 * 0.065 : H2 - H2 * 0.07;
  const list = parseCards(c.cards);
  const n = list.length;
  const cols = n <= 1 ? 1 : W2 / H2 < 0.65 ? 1 : 2;
  const rows = Math.max(1, Math.ceil(n / cols));
  const gapX = BASE.gapX * k;
  const gapY = BASE.gapY * k;
  const cw = (W2 - mx * 2 - gapX * (cols - 1)) / cols;
  const ch = Math.max(40 * k, (areaBottom - areaTop - gapY * (rows - 1)) / rows);
  let s = 1;
  let tallest = 0;
  let cards = [];
  for (let attempt = 0; attempt < 14; attempt++) {
    const pad = BASE.pad * k * s;
    const badge = BASE.badge * k * s;
    const hs = BASE.heading * k * s;
    const bs = BASE.body * k * s;
    tallest = 0;
    cards = list.map((card, i) => {
      const r = Math.floor(i / cols);
      const inRow = Math.min(cols, n - r * cols);
      const rowW = inRow * cw + (inRow - 1) * gapX;
      const x = (W2 - rowW) / 2 + i % cols * (cw + gapX);
      const y = areaTop + r * (ch + gapY);
      ctx.font = `500 ${hs}px ${st.display}`;
      ctx.letterSpacing = `${st.headingTrack * hs}px`;
      const heading = wrap(ctx, card.title, cw - pad * 2 - badge * 2 - 14 * k * s);
      ctx.font = `400 ${bs}px ${st.text}`;
      ctx.letterSpacing = "0px";
      const body = card.body ? wrap(ctx, card.body, cw - pad * 2) : [];
      const need2 = pad * 2 + Math.max(badge * 2, heading.length * hs * 1.2) + (body.length ? 14 * k * s + body.length * bs * 1.45 : 0);
      tallest = Math.max(tallest, need2);
      return { rect: { x, y, w: cw, h: ch }, n: i + 1, heading, body };
    });
    if (tallest <= ch || s < 0.45)
      break;
    s *= Math.max(0.8, Math.min(0.97, ch / tallest));
  }
  const need = Math.min(ch, tallest * 1.18);
  const lift = (ch - need) * rows / 2;
  cards = cards.map((cd, i) => ({
    ...cd,
    rect: {
      ...cd.rect,
      y: areaTop + lift + Math.floor(i / cols) * (need + gapY),
      h: need
    }
  }));
  ctx.letterSpacing = "0px";
  const ink = [
    { x: W2 / 2 - titleW / 2, y: top, w: titleW, h: titleH }
  ];
  if (footerH) {
    if (c.logo)
      ink.push({ x: footer.x, y: footer.y, w: st.logoW(ctx, footerH), h: footerH });
    if (c.footer.trim()) {
      ctx.font = `500 ${21 * k}px ${st.display}`;
      const fw = ctx.measureText(c.footer.trim()).width;
      ink.push({ x: footer.x + footer.w - fw, y: footer.y, w: fw, h: footerH });
    }
  }
  return { title, cards, s, pad: BASE.pad * k * s, footer, ink, k };
}
function drawCards(ctx, L, c, st) {
  const { k, s } = L;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillStyle = st.title;
  ctx.font = `${st.titleWeight} ${L.title.size}px ${st.display}`;
  ctx.letterSpacing = `${st.titleTrack * L.title.size}px`;
  L.title.lines.forEach((l, i) => ctx.fillText(l, L.title.rect.x + L.title.rect.w / 2, L.title.y + L.title.size * 0.9 + i * L.title.size * 1.15));
  ctx.letterSpacing = "0px";
  const pad = L.pad;
  const badge = BASE.badge * k * s;
  const hs = BASE.heading * k * s;
  const bs = BASE.body * k * s;
  const rad = st.card.radius * k;
  for (const cd of L.cards) {
    const r = cd.rect;
    if (st.card.offset) {
      ctx.fillStyle = st.card.offset.color;
      ctx.beginPath();
      ctx.roundRect(r.x + st.card.offset.d * k, r.y + st.card.offset.d * k, r.w, r.h, rad);
      ctx.fill();
    }
    ctx.save();
    if (st.card.shadow) {
      ctx.shadowColor = st.card.shadow.color;
      ctx.shadowBlur = st.card.shadow.blur * k;
      ctx.shadowOffsetY = st.card.shadow.y * k;
    }
    ctx.fillStyle = st.card.fill;
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, rad);
    ctx.fill();
    ctx.restore();
    if (st.card.edge) {
      ctx.strokeStyle = st.card.edge;
      ctx.lineWidth = k;
      ctx.beginPath();
      ctx.roundRect(r.x + k / 2, r.y + k / 2, r.w - k, r.h - k, rad);
      ctx.stroke();
    }
    const hTop = r.y + pad;
    const headH = Math.max(badge * 2, cd.heading.length * hs * 1.2);
    const bcx = r.x + pad + badge;
    const bcy = hTop + (cd.heading.length > 1 ? badge : headH / 2);
    ctx.fillStyle = st.badge.fill;
    ctx.beginPath();
    ctx.arc(bcx, bcy, badge, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = st.badge.ink;
    ctx.font = `500 ${badge * 1.1}px ${st.text}`;
    ctx.textAlign = "center";
    ctx.fillText(String(cd.n), bcx, bcy + badge * 0.38);
    ctx.textAlign = "left";
    ctx.fillStyle = st.heading;
    ctx.font = `500 ${hs}px ${st.display}`;
    ctx.letterSpacing = `${st.headingTrack * hs}px`;
    const hx = r.x + pad + badge * 2 + 14 * k * s;
    const firstBase = cd.heading.length > 1 ? hTop + hs * 0.95 : bcy + hs * 0.35;
    cd.heading.forEach((l, i) => ctx.fillText(l, hx, firstBase + i * hs * 1.2));
    ctx.letterSpacing = "0px";
    ctx.fillStyle = st.body;
    ctx.font = `400 ${bs}px ${st.text}`;
    const bTop = hTop + headH + 14 * k * s;
    cd.body.forEach((l, i) => ctx.fillText(l, r.x + pad, bTop + bs * 1.05 + i * bs * 1.45));
  }
  const f = L.footer;
  if (f.h) {
    const cy = f.y + f.h / 2;
    if (c.logo)
      st.logo(ctx, f.x, cy, f.h);
    if (c.footer.trim()) {
      ctx.fillStyle = st.footer;
      ctx.font = `500 ${21 * k}px ${st.display}`;
      ctx.textAlign = "right";
      ctx.fillText(c.footer.trim(), f.x + f.w, cy + 21 * k * 0.36);
      ctx.textAlign = "left";
    }
  }
}
function cardsKeep(L) {
  return [...L.ink, ...L.cards.map((c) => c.rect)];
}

// dist/assets/logo.js
import { readFileSync as readFileSync3 } from "node:fs";
import { Path2D } from "@napi-rs/canvas";
var doc;
var logoDoc = () => doc ??= JSON.parse(readFileSync3(pkgPath("brand", "assets", "logo.json"), "utf8"));
var logoRatio = () => logoDoc().width / logoDoc().height;
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
function drawMark(ctx, x, y, h, color, pop = 1) {
  ctx.save();
  ctx.translate(x, y);
  drawMarkUnits(ctx, h, color, pop);
  ctx.restore();
}
function drawMarkUnits(ctx, h, color, pop = 1) {
  const l = logoDoc();
  ctx.save();
  ctx.scale(h / l.mark.height, h / l.mark.height);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(l.mark.path), "evenodd");
  const { cx, cy, r } = l.mark.circle;
  ctx.beginPath();
  ctx.arc(cx + 260.5 * (1 - pop), cy - 19.36 * (1 - pop), r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// dist/assets/og.js
var TEMPLATES = ["banner", "products", "social", "cards", "customer"];
var doc2;
var imageDoc = () => doc2 ??= JSON.parse(readFileSync4(pkgPath("brand", "assets", "image.json"), "utf8"));
function layoutOf(label, w, h) {
  const wide = w / h >= 1.2;
  return {
    label,
    w,
    h,
    u: Math.sqrt(w * h) / 900,
    text: wide ? { x: 0.04, y: 0.2, size: Math.round(64 * h / 630), width: 0.45 } : { x: 0.06, y: 0.12, size: Math.round(72 * w / 1080), width: 0.8 },
    image: wide ? { x: 0.72, y: 0.58, scale: 105 } : { x: 0.55, y: 0.66, scale: 75 }
  };
}
function shareSizes() {
  return Object.fromEntries(Object.entries(imageDoc().sizes).map(([id, s]) => [id, { ...s, label: `${s.label} \xB7 ${s.w} \xD7 ${s.h}` }]));
}
function socialSizes() {
  return Object.fromEntries(Object.entries(imageDoc().social).map(([id, s]) => [id, layoutOf(`${s.label} \xB7 ${s.w} \xD7 ${s.h}`, s.w, s.h)]));
}
var clampDim = (n) => Math.round(Math.min(4e3, Math.max(200, n || 0)));
function frameOf(d) {
  return shareSizes()[d.size] ?? socialSizes()[d.size] ?? layoutOf("Custom", clampDim(d.w), clampDim(d.h));
}
function palettes() {
  return imageDoc().palettes.map((p) => ({
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
function layoutFor(size, template, dims = { w: 1200, h: 675 }) {
  const L = frameOf({ size, ...dims });
  const { w: W2, h: H2 } = L;
  const at = { size, w: dims.w, h: dims.h };
  if (template === "cards")
    return {
      ...at,
      textX: 0.5,
      textY: 0.5,
      textSize: Math.round(38 * Math.sqrt(W2 * H2 / (1200 * 630))),
      textWidth: 0.86,
      imgX: 0.5,
      imgY: 0.5,
      imgScale: 100
    };
  if (template === "customer") {
    const wide = W2 / H2 >= 1.2;
    return {
      ...at,
      textX: wide ? 0.035 : 0.06,
      textY: wide ? 0.21 : 0.16,
      textSize: Math.round(wide ? 94 * H2 / 630 : (W2 / H2 < 0.7 ? 120 : 100) * (W2 / 1080)),
      textWidth: wide ? 0.55 : 0.86,
      imgX: wide ? 1.02 : 0.95,
      imgY: wide ? 0.5 : 0.8,
      imgScale: 100
    };
  }
  if (template === "social")
    return {
      ...at,
      textX: 0.5,
      textY: 0.085,
      /* 110px on a 1200 × 675 post, growing with the post's area. */
      textSize: Math.round(110 * Math.sqrt(W2 * H2) / 900),
      textWidth: W2 / H2 >= 1.2 ? 0.72 : 0.86,
      imgX: 0.5,
      imgY: 0.5,
      imgScale: 92
    };
  const products = template === "products";
  return {
    ...at,
    textX: L.text.x,
    textY: L.text.y,
    textSize: products ? Math.round(W2 / H2 >= 1.4 ? 46 * H2 / 630 : 54 * W2 / 1080) : L.text.size,
    textWidth: L.text.width,
    imgX: products ? 0.82 : L.image.x,
    imgY: products ? 0.78 : L.image.y,
    imgScale: products ? 70 : L.image.scale
  };
}
function designFor(template, size, dims) {
  const t = imageDoc().templates[template];
  const at = size ?? t.size;
  return { template, ...imageDoc().base, ...t.set, ...layoutFor(at, template, dims) };
}
function imageRect(d, img, area) {
  const { w: W2, h: H2 } = frameOf(d);
  const a = area ?? { x: 0, y: 0, w: W2, h: H2 };
  const iw = img.width;
  const ih = img.height;
  const sc = Math.min(a.w / iw, a.h / ih) * d.imgScale / 100;
  const w = iw * sc;
  const h = ih * sc;
  return {
    x: a.x + d.imgX * a.w - w / 2,
    y: a.y + d.imgY * a.h - h / 2,
    w,
    h
  };
}
var RING = 1.2;
var LOGO_W = logoRatio() * 32;
function drawLogo2(ctx, x, y, h, p, mark = p.mark, ink = p.ink) {
  drawLogo(ctx, x, y, h, mark, ink);
}
var newCanvas = (w = 1, h = 1) => scratch(w, h).canvas;
function wrap2(ctx, text, max) {
  const out = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
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
function drawDesign(canvas, d, img, fonts2) {
  const { w: W2, h: H2, u } = frameOf(d);
  const p = paletteOf(d);
  const ctx = canvas.getContext("2d");
  const s = canvas.width / W2;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W2, H2);
  if (d.template === "products")
    return drawProducts(ctx, d, img, fonts2);
  if (d.template === "social")
    return drawSocial(ctx, d, img, fonts2);
  if (d.template === "cards")
    return drawContextCards(ctx, d, fonts2);
  if (d.template === "customer")
    return drawCustomer(ctx, d, img, fonts2);
  const sans = fonts2.sans;
  ctx.font = `500 ${d.textSize}px ${sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  const lines = wrap2(ctx, d.headline, d.textWidth * W2);
  const lh = d.textSize * 1.2;
  const tx = d.textX * W2;
  const ty = d.textY * H2;
  const tw = Math.max(1, ...lines.map((l) => ctx.measureText(l).width));
  const text = { x: tx, y: ty, w: tw, h: lines.length * lh };
  const logoBox2 = { x: 32 * u, y: 36 * u, w: 190 * u, h: 32 * u };
  const covered = (x, y, r) => [text, ...d.logo ? [logoBox2] : []].some((b) => x + r > b.x - 12 && x - r < b.x + b.w + 12 && y + r > b.y - 12 && y - r < b.y + b.h + 12);
  drawDots(ctx, d, p, img, covered);
  ctx.textBaseline = "alphabetic";
  if (d.logo)
    drawLogo2(ctx, logoBox2.x, logoBox2.y, 32 * u, p);
  ctx.font = `500 ${d.textSize}px ${sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  ctx.fillStyle = p.text;
  lines.forEach((l, i) => ctx.fillText(l, tx, ty + i * lh + d.textSize * 0.92));
  ctx.letterSpacing = "0px";
  return { text };
}
function drawDots(ctx, d, p, img, covered, area) {
  const { w: W2, h: H2 } = frameOf(d);
  const g = grid(W2, H2, d.dot, d.gap);
  const st = img ? shade(img, g, imageRect(d, img, area), shaderOpts(d, p.fill, p.bg)) : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const filled = new Path2D2();
  const hollow = new Path2D2();
  const field = new Path2D2();
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const v = st[r * g.cols + c];
      if (v === 3)
        continue;
      const x = g.ox + (c + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      if (covered(x, y, rad))
        continue;
      if (v === 2) {
        filled.moveTo(x + rad, y);
        filled.arc(x, y, rad, 0, Math.PI * 2);
      } else if (v === 1 && d.field !== "faint") {
        hollow.moveTo(x + ringR, y);
        hollow.arc(x, y, ringR, 0, Math.PI * 2);
      } else if (d.field !== "none") {
        const fr = d.field === "rings" ? ringR : rad;
        field.moveTo(x + fr, y);
        field.arc(x, y, fr, 0, Math.PI * 2);
      }
    }
  ctx.globalAlpha = p.fieldOp;
  if (d.field === "rings") {
    ctx.strokeStyle = p.field;
    ctx.lineWidth = RING;
    ctx.stroke(field);
  } else {
    ctx.fillStyle = p.field;
    ctx.fill(field);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = p.ring;
  ctx.lineWidth = RING;
  ctx.stroke(hollow);
  ctx.fillStyle = p.fill;
  ctx.fill(filled);
}
function drawContextCards(ctx, d, fonts2) {
  const { w: W2, h: H2 } = frameOf(d);
  const p = paletteOf(d);
  const k = Math.sqrt(W2 * H2 / (1200 * 630));
  const light = hexLightness(p.bg) > 0.9;
  const cs = imageDoc().cards;
  const st = {
    display: fonts2.sans,
    text: fonts2.sans,
    title: p.text,
    titleWeight: 500,
    titleTrack: -0.02,
    footer: p.text,
    card: {
      fill: tokenColor(cs.fill),
      radius: cs.radius,
      edge: light ? tokenColor(cs.edge) : void 0,
      shadow: cs.shadow
    },
    heading: tokenColor(cs.heading),
    headingTrack: -0.01,
    body: tokenColor(cs.body),
    badge: { fill: tokenColor(cs.badge), ink: tokenColor(cs.badgeInk) },
    logo: (c, x, cy, h) => {
      drawLogo2(c, x, cy - h / 2, h, p);
      return LOGO_W / 32 * h;
    },
    logoW: (_c, h) => LOGO_W / 32 * h
  };
  const content = {
    title: d.headline,
    cards: d.cards,
    footer: d.footer,
    logo: d.logo,
    titleSize: d.textSize
  };
  const L = layoutCards(ctx, W2, H2, k, content, st);
  const keep = cardsKeep(L);
  const pad = 10 * k;
  drawDots(ctx, d, p, null, (x, y, r) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad));
  drawCards(ctx, L, content, st);
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
}
var logoCuts = /* @__PURE__ */ new Map();
function logoCut(img, ink) {
  const key = [img.key, ink].join("|");
  const hit = logoCuts.get(key);
  if (hit)
    return hit;
  const sc = Math.min(1, 800 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * sc));
  const h = Math.max(2, Math.round(img.height * sc));
  const c = newCanvas(w, h);
  const x = c.getContext("2d");
  x.drawImage(img.canvas, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h);
  const px = id.data;
  const border = [];
  for (let i = 0; i < w; i++)
    border.push(i, (h - 1) * w + i);
  for (let j = 0; j < h; j++)
    border.push(j * w, j * w + w - 1);
  const solid = border.filter((p) => px[p * 4 + 3] > 200);
  if (solid.length > border.length * 0.5) {
    const mean = [0, 1, 2].map((k) => solid.reduce((n, p) => n + px[p * 4 + k], 0) / solid.length);
    for (let p = 0; p < w * h; p++) {
      const dist = Math.hypot(px[p * 4] - mean[0], px[p * 4 + 1] - mean[1], px[p * 4 + 2] - mean[2]);
      const keep = Math.min(1, Math.max(0, (dist - 24) / 70));
      px[p * 4 + 3] = Math.min(px[p * 4 + 3], keep * 255);
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
  logoCuts.set(key, out);
  return out;
}
function drawBurst(ctx, d, p, covered) {
  const { w: W2, h: H2 } = frameOf(d);
  const cx = d.imgX * W2;
  const cy = d.imgY * H2;
  const R = Math.sqrt(W2 * H2) * d.imgScale / 100;
  const rays = 44;
  const step = Math.PI * 2 / rays;
  const far = R * 0.78;
  const filled = new Path2D2();
  const hollow = new Path2D2();
  let ring = 0;
  for (let r = R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const lit = (1 + Math.sin(a)) / 2;
      const grow = Math.min(1, r / (R * 0.7));
      const rad = Math.min(r * step * 0.4, R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow);
      if (rad < 1.2)
        continue;
      if (x + rad < 0 || x - rad > W2 || y + rad < 0 || y - rad > H2)
        continue;
      if (covered(x, y, rad))
        continue;
      if (lit < 0.3 || grow < 0.35) {
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
          const px = Math.round(gx + ox * pitch);
          const py = Math.round(gy + oy * pitch);
          n++;
          if (px >= 0 && py >= 0 && px < w && py < h && a[(py * w + px) * 4 + 3] > 127)
            ink++;
        }
      if (ink / n < 0.4)
        continue;
      dots.moveTo(x + gx + r, top + gy);
      dots.arc(x + gx, top + gy, r, 0, Math.PI * 2);
    }
  ctx.fill(dots);
}
function drawCustomer(ctx, d, img, fonts2) {
  const { w: W2, h: H2, u } = frameOf(d);
  const p = paletteOf(d);
  const m = 32 * u;
  ctx.textBaseline = "alphabetic";
  const big = d.textSize;
  const statSize = big * 2;
  const max = d.textWidth * W2;
  ctx.font = `700 ${statSize}px ${fonts2.sans}`;
  ctx.letterSpacing = `${0.03 * statSize}px`;
  const stat = d.stat.trim() ? wrap2(ctx, d.stat, Math.max(max, W2 - 2 * m)) : [];
  const statW = stat.map((l) => ctx.measureText(l).width);
  ctx.font = `500 ${big}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.03 * big}px`;
  const head = d.headline.trim() ? wrap2(ctx, d.headline, max) : [];
  const headW = head.map((l) => ctx.measureText(l).width);
  const statLh = statSize * 0.86;
  const headLh = big * 1.04;
  const gap = stat.length && head.length ? big * 0.12 : 0;
  const tx = d.textX * W2;
  const ty = d.textY * H2;
  const text = {
    x: tx,
    y: ty,
    w: Math.max(1, ...statW, ...headW),
    h: stat.length * statLh + gap + head.length * headLh
  };
  const ph = d.partnerSize * u;
  const cut = img ? logoCut(img, d.partnerWhite ? p.ink : null) : null;
  let partnerBox = null;
  const name = d.partnerName.trim();
  if (cut) {
    const pw = Math.min(cut.width / cut.height * ph, W2 * 0.4);
    const h = pw / cut.width * cut.height;
    partnerBox = { x: W2 - m - pw, y: m + (ph - h) / 2, w: pw, h };
  } else if (name) {
    ctx.font = `600 ${ph}px ${fonts2.sans}`;
    ctx.letterSpacing = `${-0.02 * ph}px`;
    const nw = ctx.measureText(name).width;
    partnerBox = { x: W2 - m - nw, y: m, w: nw, h: ph };
  }
  const logoBox2 = { x: m, y: m, w: LOGO_W / 32 * 32 * u, h: 32 * u };
  const keep = [text, ...d.logo ? [logoBox2] : [], ...partnerBox ? [partnerBox] : []];
  const pad = 16 * u;
  const covered = (x, y, r) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad);
  if (d.field !== "none")
    drawDots(ctx, d, p, null, covered);
  if (d.burst)
    drawBurst(ctx, d, p, covered);
  if (d.logo)
    drawLogo2(ctx, logoBox2.x, logoBox2.y, logoBox2.h, p, p.ink);
  if (cut && partnerBox)
    ctx.drawImage(cut, partnerBox.x, partnerBox.y, partnerBox.w, partnerBox.h);
  else if (partnerBox) {
    ctx.fillStyle = p.ink;
    ctx.font = `600 ${ph}px ${fonts2.sans}`;
    ctx.letterSpacing = `${-0.02 * ph}px`;
    ctx.fillText(name, partnerBox.x, partnerBox.y + ph * 0.84);
  }
  ctx.fillStyle = p.text;
  stat.forEach((l, i) => dotText(ctx, l, tx, ty + i * statLh, statSize, statLh, fonts2.sans));
  const headTop = ty + stat.length * statLh + gap;
  ctx.font = `500 ${big}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.03 * big}px`;
  head.forEach((l, i) => ctx.fillText(l, tx, headTop + big * 0.9 + i * headLh));
  ctx.letterSpacing = "0px";
  return { text };
}
var BODY = 0.33;
function drawSocial(ctx, d, img, fonts2) {
  const { w: W2, h: H2, u } = frameOf(d);
  const p = paletteOf(d);
  const max = d.textWidth * W2;
  const cx = d.textX * W2;
  const top = d.textY * H2;
  const big = d.textSize;
  const small = big * BODY;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.font = `400 ${big}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.01 * big}px`;
  const head = d.headline.trim() ? wrap2(ctx, d.headline, max) : [];
  const headW = head.map((l) => ctx.measureText(l).width);
  ctx.font = `400 ${small}px ${fonts2.sans}`;
  ctx.letterSpacing = "0px";
  const body = d.body.trim() ? wrap2(ctx, d.body, max) : [];
  const bodyW = body.map((l) => ctx.measureText(l).width);
  const headLh = big * 1.08;
  const bodyLh = small * 1.45;
  const gap = head.length && body.length ? small * 1.1 : 0;
  const headBase = (i) => top + big * 0.92 + i * headLh;
  const bodyTop = top + head.length * headLh + gap;
  const bodyBase = (i) => bodyTop + small * 0.92 + i * bodyLh;
  const h = head.length * headLh + gap + body.length * bodyLh;
  const w = Math.max(1, ...headW, ...bodyW);
  const text = { x: cx - w / 2, y: top, w, h };
  const below = top + h + 0.04 * H2;
  const area = {
    x: 0.06 * W2,
    y: Math.min(below, H2 * 0.8),
    w: 0.88 * W2,
    h: Math.max(H2 * 0.94 - below, H2 * 0.14)
  };
  const logoBox2 = { x: 32 * u, y: 32 * u, w: 190 * u, h: 32 * u };
  const keep = [text, ...d.logo ? [logoBox2] : []];
  const pad = 0.4 * small;
  drawDots(ctx, d, p, img, (x, y, r) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad), area);
  if (d.logo)
    drawLogo2(ctx, logoBox2.x, logoBox2.y, 32 * u, p);
  ctx.fillStyle = p.text;
  ctx.font = `400 ${big}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.01 * big}px`;
  head.forEach((l, i) => ctx.fillText(l, cx, headBase(i)));
  ctx.font = `400 ${small}px ${fonts2.sans}`;
  ctx.letterSpacing = "0px";
  body.forEach((l, i) => ctx.fillText(l, cx, bodyBase(i)));
  ctx.textAlign = "left";
  return { text, area };
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
function dotIcon(ctx, label, x, cy, size, color) {
  let bits = hashOf(label) & 511;
  const count = (n) => n.toString(2).replace(/0/g, "").length;
  while (count(bits) < 3)
    bits |= 1 << hashOf(label + bits) % 9;
  while (count(bits) > 7)
    bits &= ~(1 << hashOf(label + bits) % 9);
  const step = size / 3;
  const r = step * 0.34;
  const lit = new Path2D2();
  const dim = new Path2D2();
  for (let i = 0; i < 9; i++) {
    const px = x + (i % 3 + 0.5) * step;
    const py = cy + (Math.floor(i / 3) - 1) * step;
    const path = bits & 1 << i ? lit : dim;
    path.moveTo(px + r, py);
    path.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.32;
  ctx.fill(dim);
  ctx.globalAlpha = 1;
  ctx.fill(lit);
}
function drawProducts(ctx, d, img, fonts2) {
  const { w: W2, h: H2 } = frameOf(d);
  const p = paletteOf(d);
  const across = W2 / H2 >= 1.4;
  const k = across ? H2 / 630 : W2 / 1e3;
  const m = 24 * k;
  const panel = across ? { x: W2 * 0.49, y: m, w: W2 - W2 * 0.49 - m, h: H2 - 2 * m } : { x: m, y: H2 * 0.42, w: W2 - 2 * m, h: H2 - H2 * 0.42 - m };
  const side = across ? { x: 0, y: 0, w: panel.x, h: H2 } : { x: 0, y: 0, w: W2, h: panel.y };
  const panelBg = p.fill;
  const panelInk = p.bg;
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 ${d.textSize}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  const lines = wrap2(ctx, d.headline, side.w * (across ? 0.7 : 0.78));
  const lh = d.textSize * 1.18;
  const logoH = 30 * k;
  const ctaH = d.cta ? 44 * k : 0;
  const blockH = (d.logo ? logoH + 38 * k : 0) + lines.length * lh + (d.cta ? 30 * k + ctaH : 0);
  let y = side.y + (side.h - blockH) / 2;
  const cx = side.x + side.w / 2;
  if (d.logo) {
    const lw = LOGO_W / 32 * logoH;
    drawLogo2(ctx, cx - lw / 2, y, logoH, p);
    y += logoH + 38 * k;
  }
  ctx.font = `500 ${d.textSize}px ${fonts2.sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh + d.textSize * 0.92));
  y += lines.length * lh;
  if (d.cta) {
    y += 30 * k;
    const fs = 17 * k;
    ctx.font = `500 ${fs}px ${fonts2.sans}`;
    ctx.letterSpacing = "0px";
    const bw = ctx.measureText(d.cta).width + 44 * k;
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, y, bw, ctaH, ctaH / 2);
    ctx.fill();
    ctx.fillStyle = p.bg;
    ctx.fillText(d.cta, cx, y + ctaH / 2 + fs * 0.36);
  }
  ctx.textAlign = "left";
  const groups = parseLists(d.lists);
  const total = groups.reduce((n, g2) => n + g2.items.length + 1, 0);
  const cols = [[], []];
  let run = 0;
  for (const g2 of groups) {
    (run < total / 2 || !cols[0].length ? cols[0] : cols[1]).push(g2);
    run += g2.items.length + 1;
  }
  const chipH = 30 * k;
  const chipFs = 16 * k;
  const itemFs = 18 * k;
  const itemLh = 37 * k;
  const groupGap = 26 * k;
  const colH = (c) => c.reduce((h, g2, i) => h + (g2.title ? chipH + 12 * k : 0) + g2.items.length * itemLh + (i ? groupGap : 0), 0);
  const contentH = Math.max(colH(cols[0]), colH(cols[1]));
  const colW = Math.min(250 * k, (panel.w - 80 * k) / 2);
  const gapX = 40 * k;
  const contentW = cols[1].length ? colW * 2 + gapX : colW;
  const ox = panel.x + (panel.w - contentW) / 2;
  const oy = panel.y + (panel.h - contentH) / 2;
  const inks = [];
  const boxes = [];
  cols.forEach((c, ci) => {
    let cy = oy;
    const x = ox + ci * (colW + gapX);
    c.forEach((g2, gi) => {
      if (gi)
        cy += groupGap;
      if (g2.title) {
        ctx.font = `900 ${chipFs}px ${fonts2.data}`;
        ctx.letterSpacing = `${0.08 * chipFs}px`;
        const label = g2.title.toUpperCase();
        const w = ctx.measureText(label).width + 26 * k;
        inks.push({ kind: "chip", x, y: cy, text: label, w });
        boxes.push({ x, y: cy, w, h: chipH });
        cy += chipH + 12 * k;
      }
      ctx.font = `400 ${itemFs}px ${fonts2.sans}`;
      ctx.letterSpacing = "0px";
      for (const it of g2.items) {
        const w = 30 * k + ctx.measureText(it).width;
        inks.push({ kind: "item", x, y: cy, text: it, w });
        boxes.push({ x, y: cy, w, h: itemLh });
        cy += itemLh;
      }
    });
  });
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 16 * k);
  ctx.fillStyle = panelBg;
  ctx.fill();
  ctx.clip();
  const g = grid(W2, H2, d.dot, d.gap);
  const st = img ? shade(img, g, imageRect(d, img), shaderOpts(d, panelInk, panelBg)) : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const pad = 6 * k;
  const under = (x, y2) => boxes.some((b) => x + rad > b.x - pad && x - rad < b.x + b.w + pad && y2 + rad > b.y - pad && y2 - rad < b.y + b.h + pad);
  const filled = new Path2D2();
  const hollow = new Path2D2();
  const field = new Path2D2();
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const x = g.ox + (c + 0.5) * g.pitch;
      const yy = g.oy + (r + 0.5) * g.pitch;
      if (x - rad < panel.x + 8 * k || x + rad > panel.x + panel.w - 8 * k || yy - rad < panel.y + 8 * k || yy + rad > panel.y + panel.h - 8 * k || under(x, yy))
        continue;
      const v = st[r * g.cols + c];
      if (v === 2) {
        filled.moveTo(x + rad, yy);
        filled.arc(x, yy, rad, 0, Math.PI * 2);
      } else if (v === 1) {
        hollow.moveTo(x + ringR, yy);
        hollow.arc(x, yy, ringR, 0, Math.PI * 2);
      } else if (d.field !== "none") {
        const fr = d.field === "rings" ? ringR : rad;
        field.moveTo(x + fr, yy);
        field.arc(x, yy, fr, 0, Math.PI * 2);
      }
    }
  ctx.globalAlpha = d.field === "rings" ? 0.3 : 0.16;
  if (d.field === "rings") {
    ctx.strokeStyle = panelInk;
    ctx.lineWidth = RING;
    ctx.stroke(field);
  } else {
    ctx.fillStyle = panelInk;
    ctx.fill(field);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = panelInk;
  ctx.lineWidth = RING;
  ctx.stroke(hollow);
  ctx.fillStyle = panelInk;
  ctx.fill(filled);
  for (const t of inks) {
    if (t.kind === "chip") {
      ctx.fillStyle = panelInk;
      ctx.beginPath();
      ctx.roundRect(t.x, t.y, t.w, chipH, chipH / 2);
      ctx.fill();
      ctx.font = `900 ${chipFs}px ${fonts2.data}`;
      ctx.letterSpacing = `${0.08 * chipFs}px`;
      ctx.fillStyle = panelBg;
      ctx.fillText(t.text, t.x + 13 * k, t.y + chipH / 2 + chipFs * 0.36);
    } else {
      const mid = t.y + itemLh / 2;
      dotIcon(ctx, t.text, t.x + 1 * k, mid, 15 * k, panelInk);
      ctx.font = `400 ${itemFs}px ${fonts2.sans}`;
      ctx.letterSpacing = "0px";
      ctx.fillStyle = panelInk;
      ctx.fillText(t.text, t.x + 30 * k, mid + itemFs * 0.36);
    }
  }
  ctx.restore();
  ctx.letterSpacing = "0px";
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
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
  const covered = (x, y, r) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad);
  const filled = new Path2D3();
  const hollow = new Path2D3();
  const faint = new Path2D3();
  for (let r = 0; r < g.rows; r++)
    for (let q = 0; q < g.cols; q++) {
      const v = st[r * g.cols + q];
      if (v === 3)
        continue;
      const x = g.ox + (q + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      if (o.clip && (x - rad < o.clip.x || x + rad > o.clip.x + o.clip.w || y - rad < o.clip.y || y + rad > o.clip.y + o.clip.h))
        continue;
      if (covered(x, y, rad))
        continue;
      if (o.mask && o.mask(x, y) < 0.5)
        continue;
      const k = o.size ? Math.max(0, o.size(x, y)) : 1;
      if (k <= 0.02)
        continue;
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
  const covered = (x, y, r) => keep.some((b) => x + r > b.x - pad && x - r < b.x + b.w + pad && y + r > b.y - pad && y - r < b.y + b.h + pad);
  const filled = new Path2D3();
  const hollow = new Path2D3();
  let ring = 0;
  for (let r = o.R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off;
      const x = o.cx + Math.cos(a) * r;
      const y = o.cy + Math.sin(a) * r;
      const lit = (1 + Math.sin(a)) / 2;
      const grow = Math.min(1, r / (o.R * 0.7));
      const rad = Math.min(r * step * 0.4, o.R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow);
      if (rad < 1.2)
        continue;
      if (x + rad < 0 || x - rad > o.width || y + rad < 0 || y - rad > o.height)
        continue;
      if (covered(x, y, rad))
        continue;
      if (lit < 0.3 || grow < 0.35) {
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
function wrap3(ctx, text, max) {
  const out = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
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
    const lines = wrap3(ctx, value, max);
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
import { readFileSync as readFileSync5 } from "node:fs";
import { isAbsolute, resolve as resolve2 } from "node:path";
import { loadImage } from "@napi-rs/canvas";
var KINDS = [
  ["png", (b) => b.length > 8 && b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71],
  ["jpeg", (b) => b.length > 3 && b[0] === 255 && b[1] === 216],
  ["webp", (b) => b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP"],
  ["gif", (b) => b.length > 6 && b.toString("ascii", 0, 3) === "GIF"],
  ["svg", (b) => /<svg[\s>]/i.test(b.toString("utf8", 0, Math.min(b.length, 4096)))]
];
function pictureKind(data) {
  return KINDS.find(([, test]) => test(data))?.[0];
}
async function pictureFrom(data, max = 1e3) {
  const kind = pictureKind(data);
  if (!kind)
    throw new Error("Use a PNG, JPEG, WebP, GIF or SVG picture.");
  const img = await loadImage(data);
  const iw = img.width || max;
  const ih = img.height || (img.width ? max : iw);
  const k = Math.min(1, max / Math.max(iw, ih));
  const w = Math.max(1, Math.round(iw * k));
  const h = Math.max(1, Math.round(ih * k));
  const { canvas, ctx } = scratch(w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, width: w, height: h, key: createHash("sha1").update(data).update(String(max)).digest("hex") };
}
async function readPicture(cwd, path, max = 1e3) {
  const abs = isAbsolute(path) ? path : resolve2(cwd, path);
  let data;
  try {
    data = readFileSync5(abs);
  } catch {
    throw new Error(`No picture at ${path}.`);
  }
  if (!pictureKind(data))
    throw new Error(`${path} is not a PNG, JPEG, WebP, GIF or SVG picture.`);
  return pictureFrom(data, max);
}
function pictureOf(width, height, draw, key) {
  const { canvas, ctx } = scratch(width, height);
  draw(ctx);
  return { canvas, width, height, key: `drawn:${key}` };
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
  const key = Object.keys(SAMPLES).find((k) => k.toLowerCase() === name.replace(/^sample:/i, "").toLowerCase());
  if (!key)
    return void 0;
  const [w, h] = SAMPLE_SIZE[key] ?? [600, 600];
  return pictureOf(w, h, SAMPLES[key], `sample:${key}`);
}

// dist/assets/io.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname as dirname2, isAbsolute as isAbsolute2, relative } from "node:path";
var normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}
function suggest(typed, pool, max = 3) {
  const t = normalize(typed);
  return [...new Set(pool)].map((name) => {
    const n = normalize(name);
    return { name, d: n && (n.includes(t) || t.includes(n)) ? Math.abs(n.length - t.length) * 0.3 : distance(t, n) };
  }).filter((s) => s.d <= Math.max(2, t.length * 0.4)).sort((a, b) => a.d - b.d || a.name.length - b.name.length).slice(0, max).map((s) => s.name);
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
  return [
    ...Object.entries(doc6.sizes).map(([id, s]) => ({ id, kind: "share", label: s.label, width: s.w, height: s.h, aliases: [] })),
    ...Object.entries(doc6.social).map(([id, s]) => ({ id, kind: "social", label: s.label, width: s.w, height: s.h, aliases: [s.label] }))
  ];
}
function sizeId(typed) {
  const t = typed.trim().toLowerCase();
  if (t === "custom")
    return "custom";
  const hit = imageSizes().find((s) => s.id === t || s.aliases.includes(t));
  if (!hit)
    throw unknown("size", typed, [...imageSizes().map((s) => s.id), "custom"]);
  return hit.id;
}
function designOf(req) {
  const template = pick("template", req.template, TEMPLATES);
  const kind = req.kind ? pick("kind", req.kind, ["share", "social"]) : void 0;
  const size = req.size ? sizeId(req.size) : kind === "social" ? Object.keys(imageDoc().social)[0] : imageDoc().templates[template].size;
  if (size === "custom" && (!req.width || !req.height))
    throw new Error("A custom size needs --width and --height (200 to 4000).");
  if (size !== "custom" && (req.width || req.height))
    throw new Error(`--width and --height go with --size custom, not ${size}.`);
  const dims = size === "custom" ? { w: clampDim(req.width), h: clampDim(req.height) } : void 0;
  const d = { ...designFor(template, size, dims), ...stripUndefined(req.set ?? {}) };
  if (d.palette)
    d.palette = pick("palette", d.palette, palettes().map((p) => p.name));
  d.render = pick("render", d.render, RENDERS);
  d.dither = pick("dither", d.dither, DITHERS);
  d.field = pick("field", d.field, FIELDS);
  d.cutout = pick("cutout", d.cutout, ["auto", "whole"]);
  return d;
}
function stripUndefined(o) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== void 0));
}
async function pictureFor(d, cwd, partner) {
  if (d.template === "customer")
    return partner ? readPicture(cwd, partner, 800) : null;
  if (!d.image || d.image === "none")
    return null;
  if (d.image.toLowerCase().startsWith("sample:")) {
    const s = samplePicture(d.image);
    if (!s)
      throw unknown("sample picture", d.image.slice(7), sampleNames());
    return s;
  }
  return readPicture(cwd, d.image);
}
function renderDesign(d, picture, opts = { png: true }) {
  const L = frameOf(d);
  const out = { width: Math.round(L.w * (opts.scale ?? 1)), height: Math.round(L.h * (opts.scale ?? 1)) };
  if (opts.png !== false) {
    const s = surface(L.w, L.h, { scale: opts.scale ?? 1 });
    drawDesign(s.canvas, d, picture, brandFonts());
    out.png = toPng(s);
  }
  if (opts.svg) {
    const s = surface(L.w, L.h, { svg: true });
    drawDesign(s.canvas, d, picture, brandFonts());
    out.svg = toSvg(s);
  }
  return out;
}
function imageCatalog() {
  const doc6 = imageDoc();
  return {
    kinds: Object.entries(doc6.kinds).map(([id, k]) => ({ id, label: k.label, templates: k.templates, sizes: Object.keys(k.sizes === "sizes" ? doc6.sizes : doc6.social), custom: k.custom })),
    templates: TEMPLATES.map((id) => {
      const t = doc6.templates[id];
      const d = designFor(id);
      return { id, name: t.label, description: t.description, defaultSize: t.size, palette: d.palette, slots: slotsOf(id), picture: id === "customer" ? "partner (the customer logo, only when passed)" : id === "cards" ? "none" : "image (any picture, through the dot shader)" };
    }),
    sizes: [...imageSizes().map(({ aliases, ...s }) => ({ ...s, aliases })), { id: "custom", kind: "social", label: "Custom", width: 0, height: 0, aliases: [], note: "--width and --height, 200 to 4000" }],
    palettes: palettes().map((p) => ({ name: p.name, bg: p.bg, dots: p.fill, text: p.text })),
    samples: sampleNames().map((n) => `sample:${n}`),
    renders: RENDERS,
    dithers: DITHERS,
    fields: FIELDS,
    notes: doc6.notes
  };
}
function slotsOf(t) {
  switch (t) {
    case "banner":
      return ["headline"];
    case "products":
      return ["headline", "cta", "lists"];
    case "social":
      return ["headline", "body"];
    case "cards":
      return ["headline", "cards", "footer"];
    case "customer":
      return ["headline", "stat", "partner-name"];
  }
}

// dist/assets/deck.js
import { readFileSync as readFileSync6 } from "node:fs";
var doc3;
var deckDoc = () => doc3 ??= JSON.parse(readFileSync6(pkgPath("brand", "assets", "deck.json"), "utf8"));
var slideTypes = () => Object.keys(deckDoc().slides);
function deckCatalog() {
  const d = deckDoc();
  return {
    size: { width: d.width, height: d.height },
    slides: slideTypes().map((id) => ({ id, name: d.slides[id].name, description: d.slides[id].description, palette: d.slides[id].palette, slots: d.slides[id].slots })),
    palettes: palettes().map((p) => p.name)
  };
}
function slotsFor(type, given) {
  const def = deckDoc().slides[type].slots;
  const out = { ...def };
  for (const [k, v] of Object.entries(given)) {
    if (["type", "palette", "picture", "image"].includes(k) && !(k in def))
      continue;
    if (!(k in def))
      throw new Error(`A ${type} slide does not take "${k}". It takes ${Object.keys(def).map((s) => `"${s}"`).join(", ")}.`);
    if (Array.isArray(v) && v.every((x) => typeof x === "string"))
      out[k] = v.join(" | ");
    else if (typeof v === "string")
      out[k] = v;
    else
      throw new Error(`A ${type} slide's "${k}" takes text.`);
  }
  return out;
}
var W = 1920;
var H = 1080;
var U = Math.sqrt(W * H) / 900;
var M = 32 * U;
var LOGO = { x: M, y: 36 * U, w: logoRatio() * 32 * U, h: 32 * U };
function drawSlide(ctx, slide, fonts2 = brandFonts()) {
  const type = pick("slide type", slide.type, slideTypes());
  const slots = slotsFor(type, slide);
  const p = paletteOf({ palette: slide.palette ? pick("palette", slide.palette, palettes().map((x) => x.name)) : deckDoc().slides[type].palette });
  const pic = slide.picture ?? null;
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  const head = (size) => ({ family: fonts2.sans, weight: 500, size, tracking: -0.02, leading: 1.2, color: p.text });
  const body = (size, color = p.ink) => ({ family: fonts2.sans, weight: 400, size, tracking: 0, leading: 1.45, color });
  switch (type) {
    case "cover": {
      const t = fit(ctx, slots.title, { ...head(150), tracking: -0.03, leading: 1.04 }, W * 0.56, 3, 0.5, "title");
      const b = slots.body ? fit(ctx, slots.body, body(46), W * 0.5, 3, 0.6, "body") : void 0;
      const blockH = t.height + (b ? 40 + b.height : 0);
      const top = Math.max(LOGO.y + LOGO.h + 80, (H - blockH) / 2 + 30);
      const keep = [LOGO, { x: M, y: top, w: t.width, h: t.height }];
      if (b)
        keep.push({ x: M, y: top + t.height + 40, w: b.width, h: b.height });
      if (pic)
        drawDotField(ctx, { width: W, height: H, dot: 7.6, gap: 3.8, colors: p, picture: pic, rect: placePicture(pic, { x: W * 0.5, y: 0, w: W * 0.5, h: H }, 92), keep, pad: 16 * U });
      else
        drawBurst2(ctx, { width: W, height: H, cx: W * 1.02, cy: H * 0.5, R: Math.sqrt(W * H), fill: p.fill, ring: p.ring, keep, pad: 16 * U });
      drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
      drawFitted(ctx, t, M, top);
      if (b)
        drawFitted(ctx, b, M, top + t.height + 40);
      break;
    }
    case "section": {
      const n = slots.number ?? "";
      const statSize = 230;
      setFont(ctx, { family: fonts2.sans, weight: 700, size: statSize, tracking: 0.03 });
      const nw = n ? ctx.measureText(n).width : 0;
      ctx.letterSpacing = "0px";
      const t = fit(ctx, slots.title, head(120), W * 0.7, 2, 0.5, "title");
      const nh = n ? statSize * 0.86 : 0;
      const top = (H - (nh + 24 + t.height)) / 2 + 20;
      const keep = [LOGO, { x: M * 2, y: top, w: nw, h: nh }, { x: M * 2, y: top + nh + 24, w: t.width, h: t.height }];
      drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: "rings", keep, pad: 24 * U });
      drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
      ctx.fillStyle = p.text;
      if (n)
        dotText(ctx, n, M * 2, top, statSize, statSize * 0.86, fonts2.sans);
      drawFitted(ctx, t, M * 2, top + nh + 24);
      break;
    }
    case "statement": {
      const t = fit(ctx, slots.title, { ...head(96), color: p.text, align: "center", leading: 1.16 }, W * 0.72, 4, 0.5, "title");
      const top = (H - t.height) / 2;
      const box = { x: (W - t.width) / 2, y: top, w: t.width, h: t.height };
      const mask = (x, y) => {
        const d = Math.max(Math.abs(x - W / 2) / (W / 2) * 1.1, Math.abs(y - H / 2) / (H / 2) * 1.4);
        return Math.min(1, Math.max(0, (d - 0.55) / 0.35));
      };
      drawDotField(ctx, { width: W, height: H, dot: 8.8, gap: 31.2, colors: { ...p, field: p.fill, fieldOp: 1 }, field: "faint", keep: [box, LOGO], pad: 24 * U, mask });
      drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
      drawFitted(ctx, t, 0, top, W);
      break;
    }
    case "bullets": {
      const items = (slots.items ?? "").split("|").map((s) => s.trim()).filter(Boolean);
      if (items.length > 8)
        throw new Error(`A bullets slide holds up to 8 points; it was given ${items.length}. Split it.`);
      const t = fit(ctx, slots.title, head(88), W - M * 4, 2, 0.6, "title");
      const top = LOGO.y + LOGO.h + 110;
      const cols = items.length > 4 ? 2 : 1;
      const colW = (W - M * 4 - (cols - 1) * 80) / cols;
      const itemSize = 46;
      const fitted = items.map((it) => fit(ctx, it, body(itemSize, p.ink), colW - 70, 2, 0.7, "point"));
      const size = Math.min(...fitted.map((f) => f.size));
      const listTop = top + t.height + 80;
      const keep = [LOGO, { x: M * 2, y: top, w: t.width, h: t.height }];
      const placed = fitted.map((f, i) => {
        const col = cols === 2 ? Math.floor(i / Math.ceil(items.length / 2)) : 0;
        const row = cols === 2 ? i % Math.ceil(items.length / 2) : i;
        const g = fit(ctx, items[i], body(size, p.ink), colW - 70, 2, 1, "point");
        const y = listTop + row * (size * 1.45 * 2 + 28);
        const x = M * 2 + col * (colW + 80);
        keep.push({ x, y, w: 70 + g.width, h: g.height });
        return { g, x, y };
      });
      drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: "rings", keep, pad: 20 * U, clip: { x: W * 0.62, y: 0, w: W * 0.38, h: H }, picture: pic, rect: pic ? placePicture(pic, { x: W * 0.62, y: H * 0.2, w: W * 0.36, h: H * 0.7 }, 92) : void 0 });
      drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
      drawFitted(ctx, t, M * 2, top);
      for (const { g, x, y } of placed) {
        dotIcon(ctx, g.lines.join(" "), x, y + size * 0.6, size * 0.8, p.fill);
        drawFitted(ctx, g, x + 70, y);
      }
      break;
    }
    case "stat":
    case "image": {
      const template = type === "stat" ? "customer" : "social";
      const d = { ...designFor(template, "custom", { w: W, h: H }), palette: p.name, headline: slots.title ?? "" };
      if (type === "stat")
        Object.assign(d, { stat: slots.stat ?? "", partnerName: "" });
      else
        Object.assign(d, { body: slots.body ?? "", image: pic ? "picture" : "none", textSize: 96, textY: 0.13, logo: true });
      const k = ctx.getTransform().a;
      const fake = { width: W * k, height: H * k, getContext: () => ctx };
      drawDesign(fake, d, type === "image" ? pic : null, fonts2);
      break;
    }
    case "quote": {
      const q = fit(ctx, slots.quote, { family: fonts2.sans, weight: 400, size: 76, tracking: -0.025, leading: 1.16, color: p.ink }, W * 0.76, 5, 0.5, "quote");
      const markSize = 220;
      const a = slots.attribution ? fit(ctx, slots.attribution, { family: fonts2.data, weight: 900, size: 34, tracking: 0.08, leading: 1.2, color: tokenColor("text-muted"), caps: true }, W * 0.76, 1, 0.6, "attribution") : void 0;
      const blockH = 110 + q.height + (a ? 64 + a.height : 0);
      const top = Math.max(LOGO.y + LOGO.h + 60, (H - blockH) / 2);
      const x = W * 0.12;
      const keep = [LOGO, { x, y: top, w: Math.max(q.width, a?.width ?? 0), h: blockH }];
      drawDotField(ctx, { width: W, height: H, dot: 6, gap: 10, colors: p, field: "rings", keep, pad: 24 * U, mask: (px, py) => px / W + py / H > 1.45 ? 1 : 0 });
      drawLogo(ctx, LOGO.x, LOGO.y, LOGO.h, p.mark, p.ink);
      setFont(ctx, { family: fonts2.sans, weight: 500, size: markSize });
      ctx.fillStyle = p.text;
      ctx.fillText("\u201C", x - 8, top + markSize * 0.72);
      drawFitted(ctx, q, x, top + 110);
      if (a)
        drawFitted(ctx, a, x, top + 110 + q.height + 64);
      break;
    }
    case "closing": {
      const lh = 112;
      const lw = logoRatio() * lh;
      const t = slots.title ? fit(ctx, slots.title, { ...head(56), color: p.ink, align: "center" }, W * 0.7, 2, 0.6, "title") : void 0;
      const blockH = lh + (t ? 48 + t.height : 0);
      const top = (H - blockH) / 2 - 20;
      const url = slots.url ? fit(ctx, slots.url, { family: fonts2.data, weight: 900, size: 32, tracking: 0.08, leading: 1.2, color: p.ink, caps: true, align: "center" }, W * 0.8, 1, 0.6, "url") : void 0;
      const keep = [{ x: (W - lw) / 2, y: top, w: lw, h: lh }];
      if (t)
        keep.push({ x: (W - t.width) / 2, y: top + lh + 48, w: t.width, h: t.height });
      if (url)
        keep.push({ x: (W - url.width) / 2, y: H - 120, w: url.width, h: url.height });
      drawDotField(ctx, { width: W, height: H, dot: 7.2, gap: 40.8, colors: p, field: "faint", keep, pad: 40 * U });
      drawLogo(ctx, (W - lw) / 2, top, lh, p.mark, p.ink);
      if (t)
        drawFitted(ctx, t, 0, top + lh + 48, W);
      if (url)
        drawFitted(ctx, url, 0, H - 120, W);
      break;
    }
  }
}
function renderSlide(slide, opts = { png: true }) {
  const out = { width: W * (opts.scale ?? 1), height: H * (opts.scale ?? 1) };
  if (opts.png !== false) {
    const s = surface(W, H, { scale: opts.scale ?? 1 });
    drawSlide(s.ctx, slide);
    out.png = toPng(s, { opaque: true });
    const px = pixelsOf(s).data;
    const rgb = Buffer.alloc(px.length / 4 * 3);
    for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
      rgb[j] = px[i];
      rgb[j + 1] = px[i + 1];
      rgb[j + 2] = px[i + 2];
    }
    out.rgb = rgb;
  }
  if (opts.svg) {
    const s = surface(W, H, { svg: true });
    drawSlide(s.ctx, slide);
    out.svg = toSvg(s);
  }
  return out;
}

// dist/assets/merch.js
import { readFileSync as readFileSync7 } from "node:fs";
var PX_PER_IN = 300;
var doc4;
var merchDoc = () => doc4 ??= JSON.parse(readFileSync7(pkgPath("brand", "assets", "merch.json"), "utf8"));
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
      slots: [...new Set(i.layers.flatMap((l) => l.type === "text" ? [l.slot] : []))],
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
function drawItem(ctx, item, req = {}) {
  const variant = pick(`variant for ${item.id}`, req.variant ?? item.variants[0], item.variants);
  const v = merchDoc().variants[variant];
  const c = colorsOf(v);
  const o = item.bleed * PX_PER_IN;
  const W2 = (item.size[0] + 2 * item.bleed) * PX_PER_IN;
  const H2 = (item.size[1] + 2 * item.bleed) * PX_PER_IN;
  const px = (b) => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
  const takes = new Set(item.layers.flatMap((l) => l.type === "text" ? [l.slot] : []));
  for (const k of Object.keys(req.slots ?? {}))
    if (!takes.has(k))
      throw new Error(`${item.id} does not draw --${k}.${takes.size ? ` It takes ${[...takes].map((s) => `--${s}`).join(", ")}.` : " It takes no text."}`);
  if (req.picture && !item.layers.some((l) => l.type === "dots" && l.mode === "picture"))
    throw new Error(`${item.id} holds no picture; --image goes with poster.`);
  const slots = { ...merchDoc().slots, ...req.slots };
  const fonts2 = brandFonts();
  if (v.ground) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W2, H2);
  }
  const keep = [];
  const texts = [];
  for (const l of item.layers) {
    if (l.type === "logo") {
      const b = px(l.box);
      const ratio = l.part === "mark" ? markRatio() : logoRatio();
      const h = Math.min(b.h, b.w / ratio);
      const w = h * ratio;
      keep.push({ x: l.align === "left" ? b.x : b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h });
    } else if (l.type === "text") {
      const b = px(l.box);
      const value = slots[l.slot] ?? "";
      if (!value.trim())
        continue;
      const style = l.face === "data" ? { family: fonts2.data, weight: 900, size: l.size * PX_PER_IN, tracking: 0.08, leading: 1.2, color: c.ink, caps: true, align: l.align ?? "center" } : { family: fonts2.sans, weight: 500, size: l.size * PX_PER_IN, tracking: -0.02, leading: 1.1, color: c.text, align: l.align ?? "center" };
      const f = fit(ctx, value, style, b.w, l.maxLines ?? 2, 0.6, `${item.id} ${l.slot}`);
      texts.push({ f, box: b });
      keep.push({ x: l.align === "left" ? b.x : b.x + (b.w - f.width) / 2, y: b.y, w: f.width, h: f.height });
    }
  }
  const pad = 0.12 * PX_PER_IN;
  for (const l of item.layers) {
    if (l.type !== "dots")
      continue;
    const b = px(l.box);
    if (l.mode === "burst" || l.mode === "picture" && !req.picture) {
      const R = Math.sqrt(b.w * b.h) * (l.size ?? 1);
      drawBurst2(ctx, { width: W2, height: H2, cx: b.x + (l.center?.[0] ?? 0.5) * b.w, cy: b.y + (l.center?.[1] ?? 0.5) * b.h, R, fill: c.fill, ring: c.ring, keep, pad });
      continue;
    }
    const dot = (l.dot ?? 0.1) * PX_PER_IN;
    const gap = (l.gap ?? 0.08) * PX_PER_IN;
    const size = l.mask === "fade-down" ? (_x, y) => Math.min(1, Math.max(0, 1 - (y - b.y) / (b.h * 0.9))) : void 0;
    const mask = l.mask === "edges" ? (x, y) => {
      const d = Math.max(Math.abs(x - (b.x + b.w / 2)) / (b.w / 2) * 1.1, Math.abs(y - (b.y + b.h / 2)) / (b.h / 2) * 1.4);
      return (d - 0.55) / 0.35;
    } : l.mask === "band" ? (_x, y) => Math.abs((y - b.y) / b.h - 0.5) > 0.22 ? 1 : 0 : void 0;
    const area = v.ground ? { x: 0, y: 0, w: W2, h: H2 } : b;
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
      rect: pic ? placePicture(pic, { x: b.x - area.x, y: b.y - area.y, w: b.w, h: b.h }, 92) : void 0,
      keep: keep.map((k) => ({ ...k, x: k.x - area.x, y: k.y - area.y })),
      pad,
      mask: mask ? (x, y) => mask(x + area.x, y + area.y) : void 0,
      size: size ? (x, y) => size(x + area.x, y + area.y) : void 0
    });
    ctx.restore();
  }
  for (const l of item.layers) {
    if (l.type !== "logo")
      continue;
    const b = px(l.box);
    if (l.part === "mark") {
      const h = Math.min(b.h, b.w / markRatio());
      drawMark(ctx, b.x + (b.w - h * markRatio()) / 2, b.y + (b.h - h) / 2, h, c.mark);
    } else {
      const h = Math.min(b.h, b.w / logoRatio());
      const w = h * logoRatio();
      drawLogo(ctx, l.align === "left" ? b.x : b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, h, c.mark, c.ink);
    }
  }
  for (const t of texts)
    drawFitted(ctx, t.f, t.box.x, t.box.y, t.box.w);
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
  return { variant, width: W2, height: H2 };
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
  const out = { variant: "", width: Math.round(widthIn * dpi), height: Math.round(heightIn * dpi), widthIn, heightIn, dpi };
  if (req.png !== false) {
    const s = surface(W2, H2, { scale: dpi / PX_PER_IN });
    out.variant = drawItem(s.ctx, item, req).variant;
    out.png = toPng(s, { dpi });
  }
  if (req.svg) {
    const s = surface(W2, H2, { svg: true });
    out.variant = drawItem(s.ctx, item, req).variant;
    out.svg = toSvg(s, { widthIn, heightIn }).replace(/<\/svg>\s*$/, `${cutPath(item)}</svg>
`);
  }
  return out;
}

// dist/assets/video.js
import { spawn, spawnSync } from "node:child_process";
import { existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync8 } from "node:fs";
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
var videoDoc = () => doc5 ??= JSON.parse(readFileSync8(pkgPath("brand", "assets", "video.json"), "utf8"));
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
  const keepBox = t === "logo" ? logoBox(W2, H2, o.headline, ctx) : void 0;
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
  for (const b of bright) {
    ctx.save();
    ctx.globalAlpha = b.a;
    ctx.fillStyle = t === "ripple" ? pal.fill : pal.ink;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  if (keepBox) {
    drawLogo(ctx, keepBox.logo.x, keepBox.logo.y, keepBox.logo.h, pal.mark, pal.ink);
    if (keepBox.line)
      drawFitted(ctx, { ...keepBox.line, style: { ...keepBox.line.style, color: pal.ink } }, 0, keepBox.logo.y + keepBox.logo.h + 44 * k, W2);
  }
}
function logoBox(W2, H2, headline, ctx) {
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
      args.push("-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28", "-pix_fmt", "yuv420p", "-row-mt", "0", "-threads", "1", out.path);
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
  const face = (w) => `@font-face{font-family:"Rethink Sans";font-weight:${w};src:url(data:font/ttf;base64,${readFileSync8(pkgPath("brand", "fonts", `rethink-sans-${w}.ttf`)).toString("base64")})}`;
  const reel = { colors, copy: { ...d.copy, ...copy } };
  return `<!doctype html><html><head><meta charset="utf-8"><style>${face(400)}${face(500)}:root{--cx-ground:${colors.ground}}${readFileSync8(pkgPath("build", "assets", "reel.css"), "utf8")}</style></head><body><div id="cx-stage"></div><script>window.__reel=${JSON.stringify(reel).replace(/</g, "\\u003c")}</script><script>${readFileSync8(js, "utf8")}</script></body></html>`;
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
      await page.evaluate((at) => window.__seek(at), t);
      await each(await stage.screenshot({ type: "png", animations: "disabled" }), i);
    }
  } finally {
    await browser.close();
  }
}

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
  let at = parts[0].length;
  objects.forEach((body, i) => {
    const head = Buffer.from(`${i + 1} 0 obj
`, "latin1");
    const tail = Buffer.from("\nendobj\n", "latin1");
    offsets.push(at);
    parts.push(head, body, tail);
    at += head.length + body.length + tail.length;
  });
  const xref = [`xref
0 ${objects.length + 1}
0000000000 65535 f 
`, ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n 
`)].join("");
  parts.push(Buffer.from(`${xref}trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${at}
%%EOF
`, "latin1"));
  return Buffer.concat(parts);
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
  layoutFor,
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
  wrap3 as wrap,
  write
};

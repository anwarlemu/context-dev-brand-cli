import { readFileSync } from "node:fs";
import { Path2D, type Canvas } from "@napi-rs/canvas";
import { contrast, platformOf, SMALL_FLOOR, zonePx, type Anchor, type DrawnLayer, type LayerEdit } from "../design/index.js";
import { pkgPath } from "../lib/paths.js";
import { scratch, tokenColor, type AnyCanvas, type Ctx, type Fonts } from "./canvas.js";
import { assertGlyphs } from "./glyphs.js";
import { drawLogo as drawBrandLogo, drawMark, logoClear, logoMin, logoRatio, markRatio } from "./logo.js";
import type { Picture } from "./picture.js";
import { cutout, grid, hexLightness, shade, type Dither, type Grid, type Rect, type Render } from "./shader.js";

/*
 * Share images and social posts, from the share-image editor (agd-playground src/components/context-og/draw.ts), drawn
 * headless on a Skia canvas. The dots, the burst, the dot letters and the palettes are the editor's; the layout is
 * ours, because the editor was steered by hand and this has to hold any words at any size. It keeps to four rules:
 * words are whole (they wrap, then shrink to a readable floor, then the command fails saying what to shorten), only
 * what was passed is drawn, nothing overlaps, and nothing is cut off hard (pictures are placed whole or fade out).
 * Every layer it draws is reported as it was drawn, and layer edits (src/design) are applied here, so words re-wrap and
 * dots keep clear of them. Everything is laid out in the image's own pixels, then scaled to the canvas.
 */

export type Size = string;
export type Template = "banner" | "products" | "social" | "cards" | "customer" | "mark";
export const TEMPLATES: Template[] = ["banner", "products", "social", "cards", "customer", "mark"];

export type Layout = { label: string; w: number; h: number };

export type Palette = {
  name: string;
  bg: string;
  fill: string;
  ring: string;
  field: string;
  fieldOp: number;
  text: string;
  ink: string;
  mark: string;
};

export type Field = "none" | "faint" | "rings";

export type Design = {
  template: Template;
  size: Size;
  /* Width and height when the size is "custom". */
  w: number;
  h: number;
  palette: string;
  logo: boolean;
  /* Copy: only what was passed. An empty slot is left out and the layout closes up. */
  headline: string;
  body: string;
  badge: string;
  /* Cards only: blank-line-separated cards, heading first, and the footer's address (the brand's own by default). */
  cards: string;
  footer: string;
  /* Customer only: the big number in dots, their name when there's no logo, whether the logo is recolored to the
     palette's ink, its height in the image's pixels, and whether the burst of dots is drawn (centered at imgX, imgY,
     sized by imgScale). The customer's logo itself is the picture passed to drawDesign. */
  stat: string;
  partnerName: string;
  partnerWhite: boolean;
  partnerSize: number;
  burst: boolean;
  /* Products only: the button, and the lists as "# Group" then items. */
  cta: string;
  lists: string;
  /* Left unset, the layout decides: the headline's starting size in the image's pixels, its wrap width as a share of
     the width, and its top left as shares of the width and height. */
  textSize?: number;
  textWidth?: number;
  textX?: number;
  textY?: number;
  /* A picture path, "sample:<name>" for a built-in picture, or "none". */
  image: string;
  /* Left unset, the picture is placed whole in the room the words leave. Center as shares of the width and height, and
     percent of the size that just fits inside the frame (of that room, when only the scale is given). */
  imgX?: number;
  imgY?: number;
  imgScale?: number;
  dot: number;
  gap: number;
  render: Render;
  fillPct: number;
  hollowPct: number;
  dither: Dither;
  invert: boolean;
  cutout: "auto" | "whole";
  keyTol: number;
  field: Field;
  /* Which built-in picture or burst, when nothing else says. */
  seed: number;
  /* A carousel's page number ("2 / 5"), set along the foot. */
  page?: string;
};

export type SizeDoc = { label: string; w: number; h: number; u?: number };
export type ImageDoc = {
  palettes: Palette[];
  notes: string[];
  sizes: Record<string, SizeDoc>;
  aliases: Record<string, string>;
  kinds: Record<"share" | "social", { label: string; templates: Template[]; sizes: string[]; custom: boolean }>;
  cards: { fill: string; radius: number; edge: string; shadow: { color: string; blur: number; y: number }; heading: string; body: string; badge: string; badgeInk: string };
  base: Partial<Design>;
  templates: Record<Template, { label: string; description: string; size: string; sizes: string[]; required: string[]; set: Partial<Design>; sample: Record<string, string> }>;
};

let doc: ImageDoc | undefined;
export const imageDoc = (): ImageDoc => (doc ??= JSON.parse(readFileSync(pkgPath("brand", "assets", "image.json"), "utf8")) as ImageDoc);

export const clampDim = (n: number) =>
  Math.round(Math.min(4000, Math.max(200, n || 0)));

/* The frame a design is drawn in: a named size, or its own width and height. */
export function frameOf(d: Pick<Design, "size" | "w" | "h">): Layout & { u?: number } {
  return imageDoc().sizes[d.size] ?? { label: "Custom", w: clampDim(d.w), h: clampDim(d.h) };
}

/* Palettes with their token names resolved to colors. */
let resolved: Palette[] | undefined;
export function palettes(): Palette[] {
  return (resolved ??= imageDoc().palettes.map((p) => ({
    ...p,
    bg: tokenColor(p.bg),
    fill: tokenColor(p.fill),
    ring: tokenColor(p.ring),
    field: tokenColor(p.field),
    text: tokenColor(p.text),
    ink: tokenColor(p.ink),
    mark: tokenColor(p.mark),
  })));
}

export const paletteOf = (d: Pick<Design, "palette">) => {
  const all = palettes();
  return all.find((p) => p.name.toLowerCase() === d.palette.toLowerCase()) ?? all[0];
};

/* What words on the palette's fill (a panel, a button) are drawn in: the ground's color, or where that fails 4.5:1
   on the fill, the nearest brand color that passes, white. */
export const onFill = (p: Palette) => (contrast(p.bg, p.fill) >= 4.5 ? p.bg : tokenColor("white"));

/* A template's opening design at a size: the brand's settings and no copy but the brand's own address. */
export function designFor(template: Template, size?: Size, dims: { w: number; h: number } = { w: 1200, h: 675 }): Design {
  const t = imageDoc().templates[template];
  return { template, ...imageDoc().base, ...t.set, size: size ?? t.size, w: dims.w, h: dims.h } as Design;
}

export const RING = 1.2;

/* A canvas for masks and cut-outs (the editor's document.createElement("canvas")). */
const newCanvas = (w = 1, h = 1) => scratch(w, h).canvas;

/* ---- What can be edited, per template ---- */

const CORNERS: Anchor[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
export type Can = DrawnLayer["can"];
const LOGO: Can = { anchors: CORNERS, scale: [0.75, 1.6], hide: true };
const HEAD: Can = { move: true, scale: [0.5, 1.5], align: true };
const BODY_CAN: Can = { move: true, scale: [0.7, 1.4] };
const ART: Can = { move: true, scale: [0.4, 1.6], hide: true };
const FIXED: Can = {};
export const CAN: Record<Template, Record<string, Can>> = {
  banner: { logo: LOGO, badge: FIXED, headline: HEAD, body: BODY_CAN, art: ART, field: FIXED },
  products: { logo: { scale: [0.75, 1.6], hide: true }, headline: { scale: [0.5, 1.5], align: true }, cta: FIXED, panel: FIXED, lists: FIXED, art: ART, field: FIXED },
  social: { logo: LOGO, badge: FIXED, headline: HEAD, body: BODY_CAN, art: ART, field: FIXED },
  cards: { logo: { scale: [0.75, 1.3], hide: true }, headline: { scale: [0.6, 1.4], align: true }, cards: FIXED, numbers: FIXED, panels: FIXED, footer: { hide: true }, field: FIXED },
  customer: { logo: { scale: [0.75, 1.6], hide: true }, partner: { scale: [0.6, 1.6] }, stat: { scale: [0.6, 1.3] }, headline: HEAD, art: { move: true, scale: [0.4, 1.6], hide: true }, field: FIXED },
  mark: { logo: { scale: [0.5, 1.3] }, field: FIXED },
};

/* Where the headline landed, the area the picture is placed in, and every layer as drawn. */
export type Drawn = { text: Rect; area?: Rect; layers: DrawnLayer[] };

/* ---- The page a design is laid out on ---- */

export type Pen = {
  ctx: Ctx;
  d: Design;
  W: number;
  H: number;
  /* Where words and the logo may go: the frame without what the platform covers or crops. */
  S: Rect;
  /* Corners inside S the platform covers (a profile picture). */
  cuts: Rect[];
  /* Scale of the logo and margins against the 1500 × 500 banner, and the margin. */
  u: number;
  m: number;
  /* The smallest words that still read where the picture is shown. */
  floor: number;
  p: Palette;
  fonts: Fonts;
  edits: Record<string, LayerEdit>;
  layers: DrawnLayer[];
  /* What each layer can do here, as reported with it. */
  can: Record<string, Can>;
  /* Boxes no dot may touch. */
  keep: Rect[];
  /* Boxes no dot may touch whatever the layout keeps (a page number). */
  hold?: Rect[];
};

const right = (r: Rect) => r.x + r.w;
const bottom = (r: Rect) => r.y + r.h;
export const grow = (r: Rect, by: number): Rect => ({ x: r.x - by, y: r.y - by, w: r.w + by * 2, h: r.h + by * 2 });
const hits = (a: Rect, b: Rect) => a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;
export const union = (rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map(right)) - x, h: Math.max(...rs.map(bottom)) - y };
};

/* The part of a frame the platform leaves free, and the corners of it that it covers. */
export function stageOf(size: string, W: number, H: number): { S: Rect; cuts: Rect[] } {
  const pf = platformOf(size, W, H);
  if (pf.safe) return { S: zonePx(pf.safe, W, H), cuts: [] };
  let S: Rect = { x: 0, y: 0, w: W, h: H };
  const cuts: Rect[] = [];
  for (const z of pf.avoid) {
    const r = zonePx(z, W, H);
    if (r.w > W - 1) S = r.y < 1 ? { ...S, y: bottom(r), h: bottom(S) - bottom(r) } : { ...S, h: r.y - S.y };
    else if (r.h > H - 1) S = r.x < 1 ? { ...S, x: right(r), w: right(S) - right(r) } : { ...S, w: r.x - S.x };
    else cuts.push(r);
  }
  return { S, cuts: cuts.filter((c) => hits(c, S)) };
}

/* The palest a picture's shape is: what is left after its background is cut out, as shares of the picture. */
const extents = new Map<string, Rect>();
function contentOf(img: Picture, d: Design): Rect {
  const key = [img.key, d.cutout, d.keyTol].join("|");
  const hit = extents.get(key);
  if (hit) return hit;
  const c = cutout(img, d.cutout, d.keyTol);
  const { width: w, height: h } = c;
  const a = c.getContext("2d").getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (a[(y * w + x) * 4 + 3] > 60) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const r = x1 < 0 ? { x: 0, y: 0, w: 1, h: 1 } : { x: x0 / w, y: y0 / h, w: (x1 - x0 + 1) / w, h: (y1 - y0 + 1) / h };
  if (extents.size > 40) extents.clear();
  extents.set(key, r);
  return r;
}

/* Where the picture lands: whole inside `area` by its own shape, unless the design says otherwise. */
function pictureRect(d: Design, img: Picture, area: Rect, W: number, H: number, e: LayerEdit): Rect {
  const c = contentOf(img, d);
  const cw = img.width * c.w;
  const ch = img.height * c.h;
  let sc = Math.min(area.w / cw, area.h / ch);
  if (d.imgScale !== undefined) sc = d.imgX !== undefined || d.imgY !== undefined ? (Math.min(W / img.width, H / img.height) * d.imgScale) / 100 : (sc * d.imgScale) / 100;
  sc *= e.scale ?? 1;
  const cx = (d.imgX !== undefined ? d.imgX * W : area.x + area.w / 2) + (e.dx ?? 0) * W;
  const cy = (d.imgY !== undefined ? d.imgY * H : area.y + area.h / 2) + (e.dy ?? 0) * H;
  /* By the shape's own center, unless the center was given for the picture as a whole. */
  const whole = d.imgX !== undefined || d.imgY !== undefined;
  const ox = whole ? img.width / 2 : img.width * (c.x + c.w / 2);
  const oy = whole ? img.height / 2 : img.height * (c.y + c.h / 2);
  return { x: cx - ox * sc, y: cy - oy * sc, w: img.width * sc, h: img.height * sc };
}

/* ---- Words ---- */

export function wrap(ctx: Ctx, text: string, max: number) {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(next).width > max) {
        out.push(line);
        line = w;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

export type Face = { family: string; weight: number; tracking: number; leading: number; caps?: boolean; data?: boolean };
export type Block = { face: Face; size: number; lines: string[]; widths: number[]; w: number; h: number; asked: string };

export function setFace(ctx: Ctx, f: Face, size: number) {
  ctx.font = `${f.weight} ${size}px ${f.family}`;
  ctx.letterSpacing = `${f.tracking * size}px`;
}

/* Text at one size, its lines evened out (the narrowest width that keeps the same number of lines). */
export function setBlock(ctx: Ctx, text: string, f: Face, size: number, max: number): Block {
  setFace(ctx, f, size);
  const value = f.caps ? text.toUpperCase() : text;
  let lines = wrap(ctx, value, max);
  if (lines.length > 1 && !value.includes("\n")) {
    let lo = max * 0.5;
    let hi = max;
    for (let i = 0; i < 9; i++) {
      const mid = (lo + hi) / 2;
      const l = wrap(ctx, value, mid);
      if (l.length <= lines.length && l.every((x) => ctx.measureText(x).width <= mid)) hi = mid;
      else lo = mid;
    }
    lines = wrap(ctx, value, hi);
  }
  const widths = lines.map((l) => ctx.measureText(l).width);
  ctx.letterSpacing = "0px";
  return { face: f, size, lines, widths, w: Math.max(0, ...widths), h: lines.length * size * f.leading, asked: text };
}

/* The biggest size from `from` down to `least` at which the words fit the width and height, whole. Undefined when none does. */
export function fitBlock(ctx: Ctx, text: string, f: Face, from: number, least: number, maxW: number, maxH: number): Block | undefined {
  for (let size = from; ; size *= 0.965) {
    const at = Math.max(size, least);
    const b = setBlock(ctx, text, f, at, maxW);
    if (b.w <= maxW + 0.5 && b.h <= maxH + 0.5) return b;
    if (at <= least) return undefined;
  }
}

export const tooLong = (what: string, size: string) => new Error(`The ${what} is too long for this layout at ${size}. Shorten it, or use a bigger size.`);

/* Draws a block with its first line's top at `top` and reports what it drew. */
export function drawBlock(ctx: Ctx, b: Block, x: number, top: number, align: "left" | "center" | "right", width: number, color: string): { box: Rect; ink: Rect[] } {
  setFace(ctx, b.face, b.size);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const lh = b.size * b.face.leading;
  const ink = b.lines.map((l, i) => {
    const lx = align === "center" ? x + (width - b.widths[i]) / 2 : align === "right" ? x + width - b.widths[i] : x;
    const base = top + i * lh + lh / 2 + b.size * 0.34;
    const m = ctx.measureText(l);
    ctx.fillText(l, lx, base);
    return { x: lx, y: base - m.actualBoundingBoxAscent, w: b.widths[i], h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent };
  });
  ctx.letterSpacing = "0px";
  const box = union(ink);
  return { box: { x: box.x, y: top, w: box.w, h: b.h }, ink };
}

export const headFace = (fonts: Fonts): Face => ({ family: fonts.sans, weight: 500, tracking: -0.02, leading: 1.18 });
export const bodyFace = (fonts: Fonts): Face => ({ family: fonts.sans, weight: 400, tracking: 0, leading: 1.42 });
export const chipFace = (fonts: Fonts): Face => ({ family: fonts.data, weight: 900, tracking: 0.08, leading: 1, caps: true, data: true });

/* ---- The logo ---- */

/* Drawn unless the design or an edit leaves it out; an edit can also ask for it where the layout has none. */
const logoOn = (q: Pen) => (q.edits.logo?.hidden === undefined ? q.d.logo : !q.edits.logo.hidden);

/* The logo's box at a corner of the stage, moved past anything the platform covers there. */
export function logoBox(q: Pen, anchor: Anchor): Rect | undefined {
  const e = q.edits.logo ?? {};
  if (!logoOn(q)) return undefined;
  const h = 32 * q.u * (e.scale ?? 1);
  const w = logoRatio() * h;
  const at = e.anchor ?? anchor;
  const area = { x: q.S.x + q.m, y: q.S.y + q.m, w: q.S.w - q.m * 2, h: q.S.h - q.m * 2 };
  const r: Rect = {
    x: at.endsWith("left") ? area.x : at.endsWith("right") ? right(area) - w : area.x + (area.w - w) / 2,
    y: at.startsWith("top") ? area.y : at.startsWith("bottom") ? bottom(area) - h : area.y + (area.h - h) / 2,
    w,
    h,
  };
  for (const c of q.cuts) if (hits(grow(r, logoClear(h)), c)) r.x = c.x < q.W / 2 ? right(c) + q.m * 0.5 : c.x - w - q.m * 0.5;
  return r;
}

export function putLogo(q: Pen, r: Rect | undefined, can: Can = q.can.logo ?? FIXED, ink = q.p.ink) {
  if (!r) return;
  drawBrandLogo(q.ctx, r.x, r.y, r.h, q.p.mark, ink);
  q.layers.push({ id: "logo", kind: "logo", box: r, logo: { clear: logoClear(r.h), min: logoMin(q.W, platformOf(q.d.size, q.W, q.H).shown) }, can });
}

/* ---- Dots ---- */

/* Dots in a row that run on, as boxes: enough for the check to see where the art really is. */
export class Runs {
  readonly rects: Rect[] = [];
  private cur: Rect | undefined;
  constructor(private readonly pitch: number) {}
  add(x: number, y: number, r: number) {
    const c = this.cur;
    if (c && Math.abs(c.y + c.h / 2 - y) < 0.01 && x - r - right(c) <= this.pitch) c.w = x + r - c.x;
    else this.rects.push((this.cur = { x: x - r, y: y - r, w: r * 2, h: r * 2 }));
  }
}

export const covered = (keep: Rect[], x: number, y: number, r: number) => keep.some((b) => x + r > b.x && x - r < right(b) && y + r > b.y && y - r < bottom(b));

/* How much of a dot is left where the picture runs off the frame: it fades out over the last stretch. */
function fadeFor(box: Rect, W: number, H: number) {
  const band = { x: Math.min(box.w, W) * 0.3, y: Math.min(box.h, H) * 0.3 };
  const off = { l: box.x < -1, r: right(box) > W + 1, t: box.y < -1, b: bottom(box) > H + 1 };
  if (!off.l && !off.r && !off.t && !off.b) return undefined;
  const ease = (v: number) => {
    const k = Math.min(1, Math.max(0, v));
    return k * k * (3 - 2 * k);
  };
  return (x: number, y: number) => ease(off.l ? x / band.x : 1) * ease(off.r ? (W - x) / band.x : 1) * ease(off.t ? y / band.y : 1) * ease(off.b ? (H - y) / band.y : 1);
}

/* The dot field: the picture shaded into the grid, the grid behind it, and no dot wherever the words are. */
export function drawDots(q: Pen, img: Picture | null, area: Rect | undefined, over: { fill?: string; ring?: string; field?: string; fieldOp?: number; ground?: string; clip?: Rect; on?: string; mask?: (x: number, y: number) => boolean; id?: string } = {}) {
  const { ctx, d, p, W, H } = q;
  const keep = [...q.keep, ...(q.hold ?? [])];
  const id = over.id ?? "art";
  const e = q.edits[id] ?? {};
  const pic = e.hidden ? null : img;
  if (!pic && d.field === "none") return;
  const fill = over.fill ?? p.fill;
  const g: Grid = grid(W, H, d.dot, d.gap);
  const rect = pic && area ? pictureRect(d, pic, area, W, H, e) : undefined;
  const st = pic && rect
    ? shade(pic, g, rect, shaderOpts(d, fill, over.ground ?? p.bg))
    : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const content = pic && rect ? contentOf(pic, d) : undefined;
  const box = content && rect ? { x: rect.x + content.x * rect.w, y: rect.y + content.y * rect.h, w: content.w * rect.w, h: content.h * rect.h } : undefined;
  const frame = over.clip;
  const local = box && frame ? { x: box.x - frame.x, y: box.y - frame.y, w: box.w, h: box.h } : box;
  const fadeAt = local ? (frame ? fadeFor(local, frame.w, frame.h) : fadeFor(local, W, H)) : undefined;
  const fade = fadeAt ? (x: number, y: number) => (frame ? fadeAt(x - frame.x, y - frame.y) : fadeAt(x, y)) : undefined;
  /* One path per level of the fade (a single one when nothing fades). */
  const LEVELS = fade ? 12 : 1;
  const filled = Array.from({ length: LEVELS }, () => new Path2D());
  const hollow = Array.from({ length: LEVELS }, () => new Path2D());
  const field = new Path2D();
  const art = new Runs(g.pitch);
  const ground = new Runs(g.pitch);
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const v = st[r * g.cols + c];
      if (v === 3) continue;
      const x = g.ox + (c + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      if (frame && (x - rad < frame.x + 1 || x + rad > right(frame) - 1 || y - rad < frame.y + 1 || y + rad > bottom(frame) - 1)) continue;
      /* No dot ever sits under the words. */
      if (covered(keep, x, y, rad)) continue;
      if (over.mask && !over.mask(x, y)) continue;
      if (v === 2 || (v === 1 && d.field !== "faint")) {
        const a = fade ? fade(x, y) : 1;
        const level = Math.min(LEVELS - 1, Math.ceil(a * LEVELS) - 1);
        if (fade && (level < 0 || a < 0.04)) continue;
        const path = v === 2 ? filled[level] : hollow[level];
        const rr = v === 2 ? rad : ringR;
        path.moveTo(x + rr, y);
        path.arc(x, y, rr, 0, Math.PI * 2);
        art.add(x, y, rad);
      } else if (d.field !== "none") {
        /* The faint grid is two-level: the subject's rings join the field. */
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
  if (ground.rects.length) q.layers.push({ id: over.id ? `${id}-field` : "field", kind: "art", box: frame ?? { x: 0, y: 0, w: W, h: H }, ink: ground.rects, bleeds: true, ...on, can: FIXED });
  if (box && art.rects.length) q.layers.push({ id, kind: "art", box, ink: art.rects, ...(fade ? { fades: true } : {}), ...on, can: q.can[id] ?? FIXED });
}

export function shaderOpts(d: Design, fill: string, bg: string) {
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
    dotsLight: hexLightness(fill) > hexLightness(bg),
  };
}

/* ---- Drawing ---- */

/*
 * Draws the design onto the canvas, at whatever multiple of the image's size the canvas is, with its layer edits.
 * Returns where the headline landed and every layer as drawn.
 */
export function drawDesign(canvas: AnyCanvas, d: Design, img: Picture | null, fonts: Fonts, edits: Record<string, LayerEdit> = {}): Drawn {
  const f = frameOf(d);
  const { w: W, h: H } = f;
  const { S, cuts } = stageOf(d.size, W, H);
  const p = paletteOf(d);
  const ctx = canvas.getContext("2d");
  const s = canvas.width / W;
  const u = f.u ?? (Math.sqrt(S.w * Math.min(S.h, S.w * 1.6)) / 900) * (S.w / S.h > 2.2 ? 1.05 : 1.2);
  const floor = (SMALL_FLOOR * W) / platformOf(d.size, W, H).shown;
  const q: Pen = { ctx, d, W, H, S, cuts, u, m: 32 * u, floor: Math.ceil(floor), p, fonts, edits, layers: [], can: CAN[d.template], keep: [] };
  for (const [what, text] of Object.entries({ headline: d.headline, body: d.body, cards: d.cards, footer: d.footer, "partner name": d.partnerName, lists: d.lists, cta: d.cta, stat: d.stat })) if (text) assertGlyphs(what, text);
  if (d.badge) assertGlyphs("badge", d.badge.toUpperCase(), "data");
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  /* A carousel's page number takes a strip along the foot, so nothing else goes there. */
  let page: { block: Block; x: number; y: number } | undefined;
  if (d.page) {
    const block = setBlock(ctx, d.page, chipFace(fonts), Math.max(q.floor, 13 * u), S.w);
    const y = bottom(S) - q.m * 0.8 - block.h;
    page = { block, x: right(S) - q.m - block.w, y };
    q.S = { ...S, h: y - q.m * 0.4 - S.y };
    q.hold = [grow({ x: page.x, y, w: block.w, h: block.h }, 12)];
  }
  const draw = { banner: drawBanner, products: drawProducts, social: drawSocial, cards: drawCardsPost, customer: drawCustomer, mark: drawMarkOnly }[d.template];
  const out = draw(q, img);
  if (page) {
    const r = drawBlock(ctx, page.block, page.x, page.y, "left", page.block.w, p.ink);
    q.layers.push({ id: "page", kind: "text", box: r.box, ink: r.ink, text: { asked: d.page!, drawn: page.block.lines.join(" "), size: page.block.size, color: p.ink, ground: [p.bg], own: true }, can: FIXED });
  }
  ctx.globalAlpha = 1;
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
  return { ...out, layers: q.layers };
}

const sizeName = (q: Pen) => `${q.d.size === "custom" ? "" : `${q.d.size} `}${q.W}x${q.H}`;

/* The words of a layout as one column: an optional chip, the headline, and the line under it. */
type Column = { badge?: Block; head?: Block; body?: Block; h: number; w: number; gapA: number; gapB: number };

function column(q: Pen, o: { size: number; body: number; maxW: number; maxH: number; least?: number; headFace?: Face }): Column | undefined {
  const { ctx, d, fonts } = q;
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const hf = o.headFace ?? headFace(fonts);
  const least = Math.max(q.floor, o.least ?? q.floor * 1.15);
  const make = (size: number, k: number): Column | undefined => {
    const badge = d.badge.trim() ? setBlock(ctx, d.badge.trim(), chipFace(fonts), Math.max(q.floor, size * 0.26), o.maxW) : undefined;
    if (badge && (badge.lines.length > 1 || badge.w > o.maxW - badge.size * 1.8)) return undefined;
    const head = d.headline.trim() ? setBlock(ctx, d.headline.trim(), hf, size * k, o.maxW) : undefined;
    const bodySize = Math.max(q.floor, Math.min(o.body, size * 0.62)) * (eb.scale ?? 1);
    const body = d.body.trim() ? setBlock(ctx, d.body.trim(), bodyFace(fonts), bodySize, o.maxW) : undefined;
    if ((head && head.w > o.maxW + 0.5) || (body && body.w > o.maxW + 0.5)) return undefined;
    if (body && body.size < q.floor - 0.01) return undefined;
    const gapA = badge ? badge.size * 0.95 : 0;
    const gapB = head && body ? Math.max(body.size * 0.45, size * 0.22) : 0;
    return { badge, head, body, gapA, gapB, w: Math.max(head?.w ?? 0, body?.w ?? 0, badge ? badge.w + badge.size * 1.8 : 0), h: (badge ? badge.size * 1.9 + gapA : 0) + (head?.h ?? 0) + gapB + (body?.h ?? 0) };
  };
  /* The layout's own size first; an edit scales that, and has to fit as it is. */
  for (let size = o.size; ; size *= 0.965) {
    const at = Math.max(size, least);
    const c = make(at, 1);
    if (c && c.h <= o.maxH + 0.5) {
      const k = eh.scale ?? 1;
      if (k === 1) return c;
      const scaled = make(at, k);
      if (!scaled || scaled.h > o.maxH + 0.5 || (scaled.head && scaled.head.size < q.floor - 0.01)) return undefined;
      return scaled;
    }
    if (at <= least) return undefined;
  }
}

/* Draws a column and reports its layers. `x` and `w` are the column's, `top` its first line's top. */
function putColumn(q: Pen, c: Column, x: number, top: number, w: number, align: "left" | "center" | "right") {
  const { ctx, d, p } = q;
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const a = eh.align ?? align;
  const dx = (eh.dx ?? 0) * q.W;
  let y = top + (eh.dy ?? 0) * q.H;
  if (c.badge) {
    const b = c.badge;
    const bw = b.w + b.size * 1.8;
    const bh = b.size * 1.9;
    const bx = (a === "center" ? x + (w - bw) / 2 : a === "right" ? x + w - bw : x) + dx;
    const ink = onFill(p);
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.roundRect(bx, y, bw, bh, bh / 2);
    ctx.fill();
    const r = drawBlock(ctx, b, bx + b.size * 0.9 + b.size * 0.04, y + (bh - b.h) / 2, "left", b.w, ink);
    q.layers.push({ id: "badge", kind: "text", box: { x: bx, y, w: bw, h: bh }, ink: [{ x: bx, y, w: bw, h: bh }], text: { asked: d.badge.trim(), drawn: b.lines.join("\n"), size: b.size, color: ink, ground: [p.fill] }, can: q.can.badge ?? FIXED });
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

/* The boxes a column's words take, before it is drawn, so the dots can keep clear. */
function columnBoxes(q: Pen, c: Column, x: number, top: number, w: number, align: "left" | "center" | "right"): Rect[] {
  const eh = q.edits.headline ?? {};
  const eb = q.edits.body ?? {};
  const a = eh.align ?? align;
  const at = (bw: number) => (a === "center" ? x + (w - bw) / 2 : a === "right" ? x + w - bw : x) + (eh.dx ?? 0) * q.W;
  let y = top + (eh.dy ?? 0) * q.H;
  const out: Rect[] = [];
  if (c.badge) {
    const bw = c.badge.w + c.badge.size * 1.8;
    out.push({ x: at(bw), y, w: bw, h: c.badge.size * 1.9 });
    y += c.badge.size * 1.9 + c.gapA;
  }
  if (c.head) {
    out.push({ x: at(c.head.w), y, w: c.head.w, h: c.head.h });
    y += c.head.h + c.gapB;
  }
  if (c.body) out.push({ x: at(c.body.w) + (eb.dx ?? 0) * q.W, y: y + (eb.dy ?? 0) * q.H, w: c.body.w, h: c.body.h });
  return out;
}

/* Two ways to place words beside something the platform covers: above it, or clear of it to the side. */
function regions(q: Pen, area: Rect): Rect[] {
  const cut = q.cuts.find((c) => hits(area, c));
  if (!cut) return [area];
  const gap = q.m * 0.5;
  const out: Rect[] = [];
  const above = { ...area, h: cut.y - gap * 0.5 - area.y };
  if (above.h > q.floor * 1.3) out.push(above);
  const side = cut.x < q.W / 2 ? { ...area, x: right(cut) + gap, w: right(area) - right(cut) - gap } : { ...area, w: cut.x - gap - area.x };
  if (side.w > q.W * 0.15) out.push(side);
  return out.length ? out : [area];
}

/* The area left when the logo takes its corner. */
function clearOfLogo(q: Pen, area: Rect, logo: Rect | undefined): Rect {
  if (!logo) return area;
  const l = grow(logo, logoClear(logo.h) + q.m * 0.3);
  if (!hits(area, l)) return area;
  const mid = logo.y + logo.h / 2 < area.y + area.h / 2;
  return mid ? { ...area, y: bottom(l), h: bottom(area) - bottom(l) } : { ...area, h: l.y - area.y };
}

/*
 * Banner: the logo in a corner, the headline in the brand color beside or above the picture in dots.
 */
function drawBanner(q: Pen, img: Picture | null): Omit<Drawn, "layers"> {
  const { d, S, W, H, m } = q;
  const ratio = S.w / S.h;
  const wide = ratio >= 1.2;
  const strip = ratio >= 2.2;
  const hasArt = !!img && !q.edits.art?.hidden;
  const size = d.textSize ?? (strip ? Math.max(0.15 * S.h, q.floor * 1.6) : wide ? (64 * S.h) / 630 : (80 * W) / 1080);
  const share = d.textWidth ?? (wide ? (hasArt ? (strip ? 0.6 : 0.45) : 0.8) : 1);
  let logo = logoBox(q, "top-left");
  const area: Rect = { x: S.x + m, y: S.y + m, w: Math.min(S.w - m * 2, wide ? S.w * share : (S.w - m * 2) * share), h: S.h - m * 2 };
  if (d.textX !== undefined) area.x = d.textX * W;
  const tall = !wide && hasArt;
  const body = size * 0.42;
  type Pick = { c: Column; r: Rect };
  let best: Pick | undefined;
  const aside = logo ? regions(q, { ...area, y: area.y }) : regions(q, area);
  for (let raw of aside) {
    /* Beside a covered corner the words may go on further: the picture needs only its own square. */
    if (raw.x > area.x + 1 && strip && hasArt && d.textWidth === undefined) raw = { ...raw, w: S.x + S.w * 0.68 - raw.x };
    /* Shifted clear of a covered corner, the logo goes with the words. */
    const shifted = raw.x > area.x + 1;
    const l = shifted && logo && !q.edits.logo?.anchor ? { ...logo, x: raw.x } : logo;
    const r = clearOfLogo(q, raw, l);
    /* Above a picture, the words take at most three fifths of the room. */
    const c = column(q, { size, body, maxW: r.w, maxH: tall ? Math.min(r.h, S.h * 0.5) : r.h });
    if (!c) continue;
    const s = c.head?.size ?? c.body?.size ?? 1;
    const was = best && (best.c.head?.size ?? best.c.body?.size ?? 1);
    if (!best || s > was! * 1.12) {
      best = { c, r };
      if (l !== logo) best.r = { ...r, x: raw.x };
    }
  }
  if (!best) throw tooLong(d.headline.length >= d.body.length ? "headline" : "body", sizeName(q));
  const { c, r } = best;
  if (logo && r.x > area.x + 1 && !q.edits.logo?.anchor) logo = { ...logo, x: r.x };
  /* A third of the way down where there is room, as on the editor's link preview. */
  const pref = d.textY !== undefined ? d.textY * H : tall || strip ? r.y + (strip ? Math.max(0, (r.h - c.h) * 0.3) : 0) : S.y + S.h * 0.3;
  const top = d.textY !== undefined ? pref : Math.max(r.y, Math.min(pref, bottom(r) - c.h));
  const boxes = columnBoxes(q, c, r.x, top, r.w, "left");
  const words = boxes.length ? union(boxes) : { x: r.x, y: r.y, w: 0, h: 0 };
  q.keep = [...boxes.map((b) => grow(b, 12)), ...(logo ? [grow(logo, Math.max(12, logoClear(logo.h)))] : [])];
  const gap = m * 0.9;
  const room: Rect = wide
    ? { x: Math.max(right(words) + gap, S.x + S.w * 0.46), y: S.y + m * 0.55, w: 0, h: S.h - m * 1.1 }
    : { x: S.x + m, y: bottom(words) + gap, w: S.w - m * 2, h: bottom(S) - m - bottom(words) - gap };
  if (wide) room.w = right(S) - m * 0.8 - room.x;
  if (logo && hits(grow(logo, logoClear(logo.h)), room)) {
    const l = grow(logo, logoClear(logo.h) + 6);
    if (logo.y > q.H / 2) room.h = l.y - room.y;
    else if (wide) {
      room.h -= bottom(l) - room.y;
      room.y = bottom(l);
    }
  }
  drawDots(q, img, room.w > 40 && room.h > 40 ? room : { x: S.x + m, y: S.y + m, w: S.w - m * 2, h: S.h - m * 2 });
  putLogo(q, logo);
  putColumn(q, c, r.x, top, r.w, "left");
  return { text: words, area: room };
}

/* Whether the words leave the picture a third of the height under them; otherwise it goes beside them. */
function socialStacks(q: Pen, size: number) {
  const { S, m, fonts } = q;
  // Decided on the words as the layout sets them, so an edit to their size never flips the layout.
  const c = column({ ...q, edits: {} }, { size, body: size * BODY * 1.1, maxW: S.w * 0.8, maxH: S.h * 0.56, headFace: { family: fonts.sans, weight: 400, tracking: -0.01, leading: 1.1 } });
  return !!c && S.h - m - Math.max(m, S.h * 0.075) - c.h > S.h * 0.4;
}

/*
 * The social post: a big headline and a line under it, centred, and the picture in dots in the room left (below, or
 * beside on a wide strip).
 */
export const BODY = 0.33;
function drawSocial(q: Pen, img: Picture | null): Omit<Drawn, "layers"> {
  const { d, S, W, H, m, fonts } = q;
  const ratio = S.w / S.h;
  const hasArt = !!img && !q.edits.art?.hidden;
  const size = d.textSize ?? (110 * Math.sqrt(S.w * Math.min(S.h, S.w * 1.4))) / 900;
  const strip = ratio >= 2.2 || (ratio >= 1.2 && hasArt && d.textX === undefined && !socialStacks(q, size));
  const head: Face = { family: fonts.sans, weight: 400, tracking: -0.01, leading: 1.1 };
  const logo = logoBox(q, "top-left");
  const share = d.textWidth ?? (strip ? (hasArt ? 0.58 : 0.8) : ratio >= 1.2 ? 0.8 : 0.88);
  let area: Rect = { x: S.x + (S.w * (1 - share)) / 2, y: S.y + m, w: S.w * share, h: S.h - m * 2 };
  if (strip) area = { x: S.x + m, y: S.y + m, w: S.w * share, h: S.h - m * 2 };
  if (d.textX !== undefined) area.x = d.textX * W - area.w / 2;
  /* The area is trimmed for the logo only where they meet. */
  area = clearOfLogo(q, area, logo);
  let best: { c: Column; r: Rect } | undefined;
  for (const r of regions(q, area)) {
    const maxH = hasArt && !strip ? Math.min(r.h, S.h * (ratio >= 1.2 ? 0.56 : 0.6)) : r.h;
    const c = column(q, { size, body: size * BODY * 1.1, maxW: r.w, maxH, headFace: head });
    if (c && (!best || (c.head?.size ?? 0) > (best.c.head?.size ?? 0) * 1.12)) best = { c, r };
  }
  if (!best) throw tooLong(d.headline.length >= d.body.length ? "headline" : "body", sizeName(q));
  const { c, r } = best;
  const below = !strip && hasArt;
  const top = d.textY !== undefined ? d.textY * H : below ? Math.max(r.y, S.y + S.h * 0.075) : Math.max(r.y, r.y + (r.h - c.h) / 2);
  const boxes = columnBoxes(q, c, r.x, top, r.w, "center");
  const words = boxes.length ? union(boxes) : { x: r.x, y: r.y, w: 0, h: 0 };
  const pad = Math.max(12, 0.13 * size);
  q.keep = [...boxes.map((b) => grow(b, pad)), ...(logo ? [grow(logo, Math.max(12, logoClear(logo.h)))] : [])];
  const gap = Math.max(pad, 0.035 * S.h);
  let room: Rect = strip
    ? { x: Math.max(right(words) + gap * 2, S.x + S.w * 0.6), y: S.y + m * 0.6, w: 0, h: S.h - m * 1.2 }
    : { x: S.x + 0.06 * S.w, y: bottom(words) + gap, w: 0.88 * S.w, h: bottom(S) - Math.max(m * 0.8, 0.04 * S.h) - bottom(words) - gap };
  if (strip) room.w = right(S) - m * 0.8 - room.x;
  if (logo && hits(grow(logo, logoClear(logo.h)), room)) {
    const l = grow(logo, logoClear(logo.h) + 6);
    room = logo.y > S.y + S.h / 2 ? { ...room, h: l.y - room.y } : { ...room, y: bottom(l), h: bottom(room) - bottom(l) };
  }
  drawDots(q, img, room.w > 40 && room.h > 40 ? room : undefined);
  putLogo(q, logo);
  putColumn(q, c, r.x, top, r.w, "center");
  return { text: words, area: room };
}

/* The mark alone on the palette's ground: a profile picture. */
function drawMarkOnly(q: Pen): Omit<Drawn, "layers"> {
  const { ctx, S, p } = q;
  const e = q.edits.logo ?? {};
  const side = Math.min(S.w, S.h);
  const w = side * 0.62 * (e.scale ?? 1);
  const h = w / markRatio();
  const r = { x: S.x + (S.w - w) / 2, y: S.y + (S.h - h) / 2, w, h };
  q.keep = [grow(r, logoClear(h))];
  drawDots(q, null, undefined);
  drawMark(ctx, r.x, r.y, h, p.mark === p.bg ? p.ink : p.mark);
  q.layers.push({ id: "logo", kind: "logo", box: r, logo: { clear: logoClear(h), min: logoMin(q.W, platformOf(q.d.size, q.W, q.H).shown) }, can: CAN.mark.logo });
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
}

/*
 * The burst: rays of dots spreading from a point, small rings near it and up top, growing into solid dots further out
 * and lower down, like light catching a sphere. It runs off the frame on purpose.
 */
export function drawBurst(q: Pen) {
  const { ctx, d, p, W, H, S } = q;
  const keep = [...q.keep, ...(q.hold ?? [])];
  const e = q.edits.art ?? {};
  if (!d.burst || e.hidden) return;
  const wide = S.w / S.h >= 1.2;
  const cx = (d.imgX ?? (wide ? 1.02 : 0.95)) * W + (e.dx ?? 0) * W;
  const cy = (d.imgY !== undefined ? d.imgY * H : wide ? S.y + S.h * 0.5 : S.y + S.h * 0.8) + (e.dy ?? 0) * H;
  const R = ((Math.sqrt(W * S.h) * (d.imgScale ?? 100)) / 100) * (e.scale ?? 1);
  const rays = 44;
  const step = (Math.PI * 2) / rays;
  /* Another seed turns it. */
  const turn = (((d.seed || 1) - 1) * step * 0.618) % step;
  /* It ends in a round edge, so it reads as one shape. */
  const far = R * 0.78;
  const filled = new Path2D();
  const hollow = new Path2D();
  const ink: Rect[] = [];
  let ring = 0;
  for (let r = R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off + turn;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      /* Lower down is lit: 0 straight up, 1 straight down. */
      const lit = (1 + Math.sin(a)) / 2;
      const lift = Math.min(1, r / (R * 0.7));
      const rad = Math.min(r * step * 0.4, R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * lift);
      if (rad < 1.2) continue;
      if (x + rad < 0 || x - rad > W || y + rad < 0 || y - rad > H) continue;
      if (covered(keep, x, y, rad)) continue;
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
  if (ink.length) q.layers.push({ id: "art", kind: "art", box: { x: cx - far, y: cy - far, w: far * 2, h: far * 2 }, ink, bleeds: true, can: q.can.art ?? FIXED });
}

/*
 * A customer's logo, its background taken away: kept as it is when it
 * already has a clear one, otherwise keyed on its border colour, which also
 * clears that colour from inside letters. Optionally recoloured to one ink.
 */
const logoCuts = new Map<string, Canvas>();
function logoCut(img: Picture, ink: string | null) {
  const key = [img.key, ink].join("|");
  const hit = logoCuts.get(key);
  if (hit) return hit;
  const sc = Math.min(1, 800 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * sc));
  const h = Math.max(2, Math.round(img.height * sc));
  const c = newCanvas(w, h);
  const x = c.getContext("2d");
  x.drawImage(img.canvas, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h);
  const px = id.data;
  const border: number[] = [];
  for (let i = 0; i < w; i++) border.push(i, (h - 1) * w + i);
  for (let j = 0; j < h; j++) border.push(j * w, j * w + w - 1);
  const solid = border.filter((p) => px[p * 4 + 3] > 200);
  if (solid.length > border.length * 0.5) {
    const mean = [0, 1, 2].map(
      (k) => solid.reduce((n, p) => n + px[p * 4 + k], 0) / solid.length,
    );
    for (let p = 0; p < w * h; p++) {
      const dist = Math.hypot(
        px[p * 4] - mean[0],
        px[p * 4 + 1] - mean[1],
        px[p * 4 + 2] - mean[2],
      );
      /* Clear near the border's colour, eased back in across the edge. */
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
  /* Trimmed to what's left, so it lines up by its ink, not its margins. */
  const t = x.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++)
    for (let xx = 0; xx < w; xx++)
      if (t[(y * w + xx) * 4 + 3] > 24) {
        if (xx < x0) x0 = xx;
        if (xx > x1) x1 = xx;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  let out = c;
  if (x1 >= x0 && (x0 > 0 || y0 > 0 || x1 < w - 1 || y1 < h - 1)) {
    out = newCanvas(x1 - x0 + 1, y1 - y0 + 1);
    out.getContext("2d").drawImage(c, -x0, -y0);
  }
  if (logoCuts.size > 12) logoCuts.clear();
  logoCuts.set(key, out);
  return out;
}

/*
 * Words set in round dots: the letters drawn bold into a mask, then a dot
 * wherever a cell of the grid is mostly ink. Drawn in the current fill.
 */
export function dotText(
  ctx: Ctx,
  line: string,
  x: number,
  top: number,
  size: number,
  lh: number,
  sans: string,
) {
  /* About eight dots up a capital. */
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
  const dots = new Path2D();
  const r = pitch * 0.4;
  for (let gy = pitch / 2; gy < h; gy += pitch)
    for (let gx = pitch / 2; gx < w; gx += pitch) {
      /* The share of the cell's middle that is ink. */
      let ink = 0;
      let n = 0;
      for (let oy = -0.3; oy <= 0.31; oy += 0.15)
        for (let ox = -0.3; ox <= 0.31; ox += 0.15) {
          const px = Math.round(gx + ox * pitch);
          const py = Math.round(gy + oy * pitch);
          n++;
          if (px >= 0 && py >= 0 && px < w && py < h && a[(py * w + px) * 4 + 3] > 127) ink++;
        }
      if (ink / n < 0.4) continue;
      dots.moveTo(x + gx + r, top + gy);
      dots.arc(x + gx, top + gy, r, 0, Math.PI * 2);
    }
  ctx.fill(dots);
}


/*
 * A customer story: the brand logo top left, the customer's logo top right, a big number in dots with a line or two
 * under it, and a burst of dots behind.
 */
function drawCustomer(q: Pen, img: Picture | null): Omit<Drawn, "layers"> {
  const { ctx, d, S, W, H, m, u, p, fonts } = q;
  const eh = q.edits.headline ?? {};
  const ep = q.edits.partner ?? {};
  const es = q.edits.stat ?? {};
  let logo = logoBox(q, "top-left");
  const wide = S.w / S.h >= 1.2;

  /* The customer's logo, or their name, top right. */
  const ph = d.partnerSize * u * (ep.scale ?? 1);
  const cut = img ? logoCut(img, d.partnerWhite ? p.ink : null) : null;
  const name = d.partnerName.trim();
  let partner: Rect | null = null;
  let nameBlock: Block | undefined;
  const roomRight = S.w - m * 2 - (logo ? logo.w + m * 2 : 0);
  if (cut) {
    const pw = Math.min((cut.width / cut.height) * ph, S.w * 0.4, roomRight);
    const h = (pw / cut.width) * cut.height;
    partner = { x: right(S) - m - pw, y: S.y + m + ((logo?.h ?? ph) - h) / 2, w: pw, h };
    if (partner.y < S.y + m * 0.4) partner.y = S.y + m * 0.4;
  } else if (name) {
    nameBlock = fitBlock(ctx, name, { family: fonts.sans, weight: 600, tracking: -0.02, leading: 1.1 }, ph, q.floor, roomRight, ph * 1.2);
    if (!nameBlock) throw tooLong("partner name", sizeName(q));
    partner = { x: right(S) - m - nameBlock.w, y: S.y + m + ((logo?.h ?? nameBlock.h) - nameBlock.h) / 2, w: nameBlock.w, h: nameBlock.h };
  }

  /* The words, measured first so the dots keep clear of them. */
  const statText = d.stat.trim();
  const headText = d.headline.trim();
  const headTop = Math.max(S.y + m, logo ? bottom(logo) + logoClear(logo.h) + m * 0.4 : 0, partner ? bottom(partner) + m * 0.4 : 0);
  const start = d.textSize ?? (wide ? (94 * S.h) / 630 : (S.w / S.h < 0.7 ? 120 : 100) * (S.w / 1080));
  const area: Rect = { x: S.x + (wide ? m : Math.max(m, 0.06 * S.w)), y: headTop, w: S.w * (d.textWidth ?? (wide ? 0.58 : 0.86)), h: bottom(S) - m - headTop };
  if (d.textX !== undefined) area.x = d.textX * W;
  const hf: Face = { family: fonts.sans, weight: 500, tracking: -0.03, leading: 1.06 };
  type Words = { big: number; statSize: number; stat: string[]; head?: Block; h: number; w: number; statW: number; gap: number; statLh: number };
  const measure = (big: number, r: Rect, hk: number, sk: number): Words | undefined => {
    const statSize = big * 2 * sk;
    setFace(ctx, { family: fonts.sans, weight: 700, tracking: 0.03, leading: 1 }, statSize);
    const stat = statText ? wrap(ctx, statText, Math.max(r.w, right(S) - m - r.x)) : [];
    const statW = stat.map((l) => ctx.measureText(l).width);
    ctx.letterSpacing = "0px";
    if (statW.some((w) => w > right(S) - m - r.x)) return undefined;
    const head = headText ? setBlock(ctx, headText, hf, big * hk, r.w) : undefined;
    if (head && head.w > r.w + 0.5) return undefined;
    const statLh = statSize * 0.86;
    const gap = stat.length && head ? big * 0.12 : 0;
    return { big, statSize, stat, head, statLh, gap, h: stat.length * statLh + gap + (head?.h ?? 0), w: Math.max(0, ...statW, head?.w ?? 0), statW: Math.max(0, ...statW) };
  };
  let best: { w: Words; r: Rect } | undefined;
  for (const r of regions(q, area)) {
    for (let big = start; ; big *= 0.965) {
      const at = Math.max(big, q.floor * 1.15);
      const w = measure(at, r, 1, 1);
      if (w && w.h <= r.h + 0.5) {
        if (!best || at > best.w.big * 1.12) {
          const edited = (eh.scale ?? 1) !== 1 || (es.scale ?? 1) !== 1 ? measure(at, r, eh.scale ?? 1, es.scale ?? 1) : w;
          if (edited && edited.h <= r.h + 0.5 && (!edited.head || edited.head.size >= q.floor - 0.01)) best = { w: edited, r };
        }
        break;
      }
      if (at <= q.floor * 1.15) break;
    }
  }
  if (!best) throw tooLong(headText ? "headline" : "stat", sizeName(q));
  const { w, r } = best;
  if (logo && r.x > area.x + 1) logo = { ...logo, x: r.x };
  const pref = d.textY !== undefined ? d.textY * H : S.y + S.h * (wide ? 0.21 : 0.16);
  const ty = (d.textY !== undefined ? pref : Math.max(r.y, Math.min(pref, bottom(r) - w.h))) + (eh.dy ?? 0) * H;
  const tx = r.x + (eh.dx ?? 0) * W;
  const statH = w.stat.length * w.statLh;
  const statBox: Rect | undefined = w.stat.length ? { x: tx, y: ty, w: w.statW, h: statH } : undefined;
  const headAt = ty + statH + w.gap;
  const text: Rect = { x: tx, y: ty, w: Math.max(1, w.w), h: w.h };
  const pad = 16 * u;
  q.keep = [grow(text, pad), ...(logo ? [grow(logo, Math.max(pad, logoClear(logo.h)))] : []), ...(partner ? [grow(partner, pad)] : [])];
  if (d.field !== "none") drawDots(q, null, undefined);
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
    w.stat.forEach((l, i) => dotText(ctx, l, tx, ty + i * w.statLh, w.statSize, w.statLh, fonts.sans));
    q.layers.push({ id: "stat", kind: "text", box: statBox, ink: w.stat.map((_, i) => ({ x: tx, y: ty + i * w.statLh + w.statSize * 0.06, w: w.statW, h: w.statSize * 0.78 })), text: { asked: statText, drawn: w.stat.join("\n"), size: w.statSize, color: p.text, ground: [p.bg], bold: true }, can: CAN.customer.stat });
  }
  if (w.head) {
    const out = drawBlock(ctx, w.head, tx, headAt, eh.align ?? "left", r.w, p.text);
    q.layers.push({ id: "headline", kind: "text", box: out.box, ink: out.ink, text: { asked: headText, drawn: w.head.lines.join("\n"), size: w.head.size, color: p.text, ground: [p.bg] }, can: CAN.customer.headline });
  }
  return { text };
}

/*
 * The products template: logo, headline and a button on one side; on the other, a panel in the brand colour with a ring
 * grid, the product lists under Doto labels, and the picture (if any) shaded into the panel's grid.
 */
function drawProducts(q: Pen, img: Picture | null): Omit<Drawn, "layers"> {
  const { ctx, d, S, W, H, p, fonts } = q;
  const across = S.w / S.h >= 1.4;
  /* One unit: the 1200 × 630 link preview's pixel. */
  const k = across ? Math.max(S.h / 630, 0.72) : S.w / 1000;
  const m = Math.min(24 * k, S.h * 0.06);
  const cut = q.cuts[0];
  const left = across && cut && cut.x < W / 2 ? right(cut) - S.x : 0;
  const fullest = left ? [Math.max(0.6, (left + S.w * 0.28) / S.w)] : [0.49, 0.42, 0.36];
  const full = across && left ? { y: 0, h: H } : { y: S.y, h: S.h };
  const panelBg = p.fill;
  const panelInk = onFill(p);
  const eh = q.edits.headline ?? {};
  const el = q.edits.logo ?? {};

  /* The panel's contents first, as big as they fit: columns, then size, then a wider panel. */
  const groups = parseLists(d.lists);
  let panel: Rect | undefined;
  let lists: FittedLists | undefined;
  for (const split of fullest) {
    panel = across
      ? { x: S.x + S.w * split, y: full.y + m, w: S.w * (1 - split) - m, h: full.h - 2 * m }
      : { x: S.x + m, y: S.y + S.h * 0.4, w: S.w - 2 * m, h: S.h * 0.6 - m };
    const inner = grow(panel, -Math.max(22 * k, q.floor * 0.9));
    /* Words inside the panel stay where the platform shows it. */
    const safe: Rect = { x: Math.max(inner.x, S.x), y: Math.max(inner.y, S.y + 4), w: Math.min(right(inner), right(S)) - Math.max(inner.x, S.x), h: Math.min(bottom(inner), bottom(S) - 4) - Math.max(inner.y, S.y + 4) };
    lists = fitLists(q, groups, safe, 18 * k);
    if (lists) break;
  }
  if (!lists || !panel) throw tooLong("list", sizeName(q));
  const side: Rect = across
    ? { x: S.x + left, y: S.y, w: panel.x - S.x - left, h: S.h }
    : { x: S.x, y: S.y, w: S.w, h: panel.y - S.y };

  /* The other side, centred as one block. */
  const maxW = side.w * (across ? 0.82 : 0.84);
  const withLogo = logoOn(q);
  const logoH0 = Math.max(30 * k * (el.scale ?? 1), logoMin(W, platformOf(d.size, W, H).shown));
  const lw0 = logoRatio() * logoH0;
  const logoH = lw0 > side.w - m * 2 ? (logoH0 * (side.w - m * 2)) / lw0 : logoH0;
  const gapLogo = Math.max(38 * k, logoClear(logoH) * 1.4) * (side.h < 300 ? 0.6 : 1);
  const ctaText = d.cta.trim();
  const fs = Math.max(17 * k, q.floor);
  const cta = ctaText ? fitBlock(ctx, ctaText, { family: fonts.sans, weight: 500, tracking: 0, leading: 1.2 }, fs, q.floor, maxW - fs * 2.6, fs * 1.3) : undefined;
  if (ctaText && !cta) throw tooLong("button", sizeName(q));
  const ctaH = cta ? cta.size * 2.6 : 0;
  const gapCta = cta ? 28 * k : 0;
  const start = d.textSize ?? (across ? (46 * S.h) / 630 : (58 * S.w) / 1080);
  const left0 = side.h - m * 2 - (withLogo ? logoH + gapLogo : 0) - gapCta - ctaH;
  const least = q.floor * 1.15;
  const base = d.headline.trim() ? fitBlock(ctx, d.headline.trim(), headFace(fonts), Math.max(start, least), least, maxW, left0) : undefined;
  if (d.headline.trim() && !base) throw tooLong("headline", sizeName(q));
  const head = base && (eh.scale ?? 1) !== 1 ? setBlock(ctx, d.headline.trim(), headFace(fonts), base.size * eh.scale!, maxW) : base;
  if (head && (head.w > maxW + 0.5 || head.h > left0 + 0.5 || head.size < q.floor - 0.01)) throw tooLong("headline", `${sizeName(q)} at that size`);
  const blockH = (withLogo ? logoH + (head || cta ? gapLogo : 0) : 0) + (head?.h ?? 0) + gapCta + ctaH;
  let y = side.y + (side.h - blockH) / 2;
  const cx = side.x + side.w / 2;

  /* The panel and its grid: rings across it, the picture shaded into it in solid dots and rings, nothing under the words. */
  ctx.fillStyle = panelBg;
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 16 * k);
  ctx.fill();
  q.layers.push({ id: "panel", kind: "panel", box: panel, can: FIXED });
  const pad = 6 * k;
  q.keep = lists.boxes.map((b) => grow(b, pad));
  const free: Rect = { x: panel.x + panel.w * 0.45, y: panel.y + panel.h * 0.5, w: panel.w * 0.5, h: panel.h * 0.45 };
  drawDots(q, img, free, { fill: panelInk, ring: panelInk, field: panelInk, fieldOp: d.field === "rings" ? 0.3 : 0.16, ground: panelBg, clip: grow(panel, -8 * k), on: "panel" });
  for (const t of lists.inks) {
    if (t.kind === "chip") {
      ctx.fillStyle = panelInk;
      ctx.beginPath();
      ctx.roundRect(t.x, t.y, t.w, lists.chipH, lists.chipH / 2);
      ctx.fill();
      drawBlock(ctx, { face: chipFace(fonts), size: lists.chipFs, lines: [t.text.toUpperCase()], widths: [t.tw], w: t.tw, h: lists.chipH, asked: t.text }, t.x + lists.chipFs * 0.85, t.y + (lists.chipH - lists.chipFs) / 2, "left", t.tw, panelBg);
    } else {
      const mid = t.y + lists.itemLh / 2;
      dotIcon(ctx, t.text, t.x + lists.fs * 0.06, mid, lists.fs * 0.84, panelInk);
      ctx.font = `400 ${lists.fs}px ${fonts.sans}`;
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
    y += logoH + (head || cta ? gapLogo : 0);
  }
  let text: Rect = { x: cx, y, w: 0, h: 0 };
  if (head) {
    const r = drawBlock(ctx, head, cx - maxW / 2, y, eh.align ?? "center", maxW, p.ink);
    text = r.box;
    q.layers.push({ id: "headline", kind: "text", box: r.box, ink: r.ink, text: { asked: d.headline.trim(), drawn: head.lines.join("\n"), size: head.size, color: p.ink, ground: [p.bg] }, can: CAN.products.headline });
    y += head.h;
  }
  if (cta) {
    y += gapCta;
    const bw = cta.w + cta.size * 2.6;
    const bx = (eh.align === "left" ? cx - maxW / 2 : eh.align === "right" ? cx + maxW / 2 - bw : cx - bw / 2);
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

type ListInk = { kind: "chip" | "item"; x: number; y: number; text: string; w: number; tw: number };
type FittedLists = { inks: ListInk[]; boxes: Rect[]; fs: number; chipFs: number; chipH: number; itemLh: number };

/* The lists in as many columns as fit best, groups kept in order, at the biggest size that holds every item whole. */
function fitLists(q: Pen, groups: ReturnType<typeof parseLists>, area: Rect, want: number): FittedLists | undefined {
  const { ctx, fonts } = q;
  if (!groups.length) return { inks: [], boxes: [], fs: want, chipFs: want, chipH: 0, itemLh: 0 };
  for (let fs = Math.max(want * 1.35, q.floor); ; fs *= 0.96) {
    const at = Math.max(fs, q.floor);
    const chipFs = Math.max(at * 0.89, q.floor);
    const chipH = chipFs * 1.85;
    const itemLh = at * 1.9;
    const groupGap = at * 1.2;
    const tall = (g: (typeof groups)[number]) => (g.title ? chipH + at * 0.6 : 0) + g.items.length * itemLh;
    for (let cols = 1; cols <= Math.min(4, groups.reduce((n, g) => n + g.items.length + 1, 0)); cols++) {
      /* Groups fill a column until it is full; one that is too tall runs on into the next. */
      const rows: ListInk[][] = [[]];
      const hs = [0];
      let ok = true;
      const total = groups.reduce((n, g) => n + tall(g), 0) + groupGap * (groups.length - 1);
      const target = Math.min(area.h, Math.max(total / cols, 0) * 1.12 + itemLh);
      for (const g of groups) {
        let lines: ListInk[] = [];
        const put = (t: ListInk, h: number, before: number) => {
          let c = rows.length - 1;
          const gap = hs[c] ? before : 0;
          if (hs[c] + gap + h > area.h + 0.5) {
            rows.push([]);
            hs.push(0);
            c++;
          }
          const y = hs[c] + (hs[c] ? before : 0);
          rows[c].push({ ...t, y });
          hs[c] = y + h;
        };
        /* Start a new column when this group would not fit in what is left of the balanced height. */
        const c = rows.length - 1;
        if (hs[c] && hs[c] + groupGap + tall(g) > target && rows.length < cols) {
          rows.push([]);
          hs.push(0);
        }
        if (g.title) {
          setFace(ctx, chipFace(fonts), chipFs);
          const tw = ctx.measureText(g.title.toUpperCase()).width;
          lines.push({ kind: "chip", x: 0, y: 0, text: g.title, tw, w: tw + chipFs * 1.7 });
        }
        ctx.font = `400 ${at}px ${fonts.sans}`;
        ctx.letterSpacing = "0px";
        for (const it of g.items) {
          const tw = ctx.measureText(it).width;
          lines.push({ kind: "item", x: 0, y: 0, text: it, tw, w: at * 1.65 + tw });
        }
        lines.forEach((t, i) => put(t, t.kind === "chip" ? chipH : itemLh, i === 0 ? groupGap : t.kind === "item" && lines[i - 1].kind === "chip" ? at * 0.6 : 0));
      }
      if (rows.length > cols) ok = false;
      const widths = rows.map((r) => Math.max(0, ...r.map((t) => t.w)));
      const gapX = at * 2.2;
      const w = widths.reduce((a, b) => a + b, 0) + gapX * (rows.length - 1);
      const h = Math.max(...hs);
      if (!ok || w > area.w + 0.5 || h > area.h + 0.5) continue;
      const inks: ListInk[] = [];
      let x = area.x + (area.w - w) / 2;
      const y0 = area.y + (area.h - h) / 2;
      rows.forEach((r, i) => {
        for (const t of r) inks.push({ ...t, x, y: y0 + t.y });
        x += widths[i] + gapX;
      });
      return { inks, boxes: inks.map((t) => ({ x: t.x, y: t.y, w: t.w, h: t.kind === "chip" ? chipH : itemLh })), fs: at, chipFs, chipH, itemLh };
    }
    if (at <= q.floor) return undefined;
  }
}

/*
 * The numbered cards on Context's ground: the palette's colour with its dot grid kept clear of the words, white cards
 * with the blue number, and the logo and address along the bottom.
 */
function drawCardsPost(q: Pen): Omit<Drawn, "layers"> {
  const { ctx, d, S, W, p, fonts } = q;
  const cs = imageDoc().cards;
  const list = parseCards(d.cards);
  const strip = S.w / S.h >= 2.2;
  const k = Math.sqrt((S.w * S.h) / (1200 * 630));
  const eh = q.edits.headline ?? {};
  const ef = q.edits.footer ?? {};
  const el = q.edits.logo ?? {};
  const cut = q.cuts[0];
  let area: Rect = { x: S.x + Math.max(S.w * 0.05, 24 * k), y: S.y + Math.max(S.h * 0.06, 18 * k), w: 0, h: 0 };
  area.w = S.w - (area.x - S.x) * 2;
  area.h = S.h - (area.y - S.y) * 2;
  if (cut && hits(area, cut)) area = cut.x < W / 2 ? { ...area, x: right(cut) + 24 * k, w: right(area) - right(cut) - 24 * k } : { ...area, w: cut.x - area.x - 24 * k };

  /* The title, whole, in at most a third of the room. */
  const tf = headFace(fonts);
  const least = q.floor * 1.15;
  const start = Math.max(least, d.textSize ?? 40 * k * (strip ? 0.9 : 1));
  const title0 = d.headline.trim() ? fitBlock(ctx, d.headline.trim(), tf, start, least, area.w, area.h * 0.34) : undefined;
  if (d.headline.trim() && !title0) throw tooLong("headline", sizeName(q));
  const title = title0 && (eh.scale ?? 1) !== 1 ? setBlock(ctx, d.headline.trim(), tf, title0.size * eh.scale!, area.w) : title0;
  if (title && (title.w > area.w + 0.5 || title.h > area.h * 0.45 || title.size < q.floor - 0.01)) throw tooLong("headline", `${sizeName(q)} at that size`);
  const titleH = title?.h ?? 0;

  /* The footer: the logo on the left, the address on the right. */
  const withLogo = logoOn(q);
  const address = ef.hidden ? "" : d.footer.trim();
  const fh = Math.max(30 * k * (strip ? 0.85 : 1), logoMin(W, platformOf(d.size, W, q.H).shown)) * (el.scale ?? 1);
  const addressBlock = address ? fitBlock(ctx, address, { family: fonts.sans, weight: 500, tracking: 0, leading: 1.2 }, Math.max(21 * k, q.floor), q.floor, area.w - (withLogo ? logoRatio() * fh + fh * 2 : 0), fh * 1.6) : undefined;
  if (address && !addressBlock) throw tooLong("footer", sizeName(q));
  const footH = withLogo ? fh : (addressBlock?.h ?? 0);
  const clear = withLogo ? logoClear(fh) : 0;
  const gapT = titleH ? S.h * (strip ? 0.05 : 0.05) : 0;
  const gapF = footH ? Math.max(S.h * 0.045, clear + 8 * k) : 0;
  const top = area.y + titleH + gapT;
  const room: Rect = { x: area.x, y: top, w: area.w, h: bottom(area) - footH - gapF - top };

  const n = list.length;
  const cardSet = n ? fitCards(q, list, room, k, strip) : { cards: [], s: 1, h: 0, bs: 0, hs: 0, badge: 0, pad: 0 };
  if (!cardSet) throw tooLong("card text", sizeName(q));
  const footY = bottom(area) - footH;
  /* Tall posts: the title and cards as one group in the middle, rather than a title far above. */
  const lift = Math.max(0, (room.h - cardSet.h) / 2);
  const titleY = area.y + (cardSet.h && S.h / S.w > 1.15 ? lift * 0.75 : 0);
  const shift = S.h / S.w > 1.15 ? lift * 0.75 : lift;
  for (const c of cardSet.cards) c.rect.y += shift - 0;
  const a = eh.align ?? "center";
  const tx = (w: number) => (a === "left" ? area.x : a === "right" ? right(area) - w : area.x + (area.w - w) / 2);
  const logo: Rect | undefined = withLogo ? { x: area.x, y: footY, w: logoRatio() * fh, h: fh } : undefined;
  const addressAt = addressBlock ? { x: right(area) - addressBlock.w, y: footY + (footH - addressBlock.h) / 2, w: addressBlock.w, h: addressBlock.h } : undefined;
  const pad = 10 * k;
  q.keep = [
    ...(title ? [grow({ x: tx(title.w), y: titleY, w: title.w, h: title.h }, pad)] : []),
    ...cardSet.cards.map((c) => grow(c.rect, pad)),
    ...(logo ? [grow(logo, Math.max(pad, logoClear(fh)))] : []),
    ...(addressAt ? [grow(addressAt, pad)] : []),
  ];
  drawDots(q, null, undefined);
  let text: Rect = { x: 0, y: 0, w: 0, h: 0 };
  if (title) {
    const r = drawBlock(ctx, title, area.x, titleY, a, area.w, p.text);
    text = r.box;
    q.layers.push({ id: "headline", kind: "text", box: r.box, ink: r.ink, text: { asked: d.headline.trim(), drawn: title.lines.join("\n"), size: title.size, color: p.text, ground: [p.bg] }, can: CAN.cards.headline });
  }
  const light = hexLightness(p.bg) > 0.9;
  const fill = tokenColor(cs.fill);
  const inkRects: Rect[] = [];
  const drawnWords: string[] = [];
  const numbers: Rect[] = [];
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
    /* The number in its circle, the heading beside it, the lines below. */
    const hTop = r.y + cardSet.pad;
    const headH = Math.max(badge * 2, cd.heading.h);
    const bcx = r.x + cardSet.pad + badge;
    const bcy = hTop + (cd.heading.lines.length > 1 ? Math.max(badge, (hs * cd.heading.face.leading) / 2) : headH / 2);
    ctx.fillStyle = badgeFill;
    ctx.beginPath();
    ctx.arc(bcx, bcy, badge, 0, Math.PI * 2);
    ctx.fill();
    const num = String(i + 1);
    const nb = setBlock(ctx, num, { family: fonts.sans, weight: 500, tracking: 0, leading: 1 }, badge * 1.2, badge * 2);
    drawBlock(ctx, nb, bcx - nb.w / 2, bcy - nb.size / 2, "left", nb.w, badgeInk);
    numbers.push({ x: bcx - badge, y: bcy - badge, w: badge * 2, h: badge * 2 });
    const hx = r.x + cardSet.pad + badge * 2 + 14 * k * cardSet.s;
    const h = drawBlock(ctx, cd.heading, hx, cd.heading.lines.length > 1 ? hTop : hTop + (headH - cd.heading.h) / 2, "left", cd.heading.w, tokenColor(cs.heading));
    inkRects.push(...h.ink);
    drawnWords.push(...cd.heading.lines);
    if (cd.body) {
      const b = drawBlock(ctx, cd.body, r.x + cardSet.pad, hTop + headH + 12 * k * cardSet.s, "left", cd.body.w, tokenColor(cs.body));
      inkRects.push(...b.ink);
      drawnWords.push(...cd.body.lines);
    }
  }
  if (cardSet.cards.length) {
    /* One layer for the cards' faces (each stays whole), one for their words. */
    q.layers.push({ id: "panels", kind: "panel", box: union(cardSet.cards.map((c) => c.rect)), ink: cardSet.cards.map((c) => c.rect), can: FIXED });
    q.layers.push({ id: "cards", kind: "text", box: union(inkRects), ink: inkRects, over: ["panels"], text: { asked: list.map((c) => `${c.title}\n${c.body}`).join("\n"), drawn: drawnWords.join("\n"), size: Math.min(hs, bs), color: tokenColor(cs.body), ground: [fill] }, can: FIXED });
    q.layers.push({ id: "numbers", kind: "key", box: union(numbers), ink: numbers, over: ["panels"], can: FIXED });
  }
  putLogo(q, logo);
  if (addressBlock && addressAt) {
    const r = drawBlock(ctx, addressBlock, addressAt.x, addressAt.y, "left", addressBlock.w, p.text);
    q.layers.push({ id: "footer", kind: "text", box: r.box, ink: r.ink, text: { asked: address, drawn: address, size: addressBlock.size, color: p.text, ground: [p.bg], own: d.footer === imageDoc().base.footer }, can: CAN.cards.footer });
  }
  return { text };
}

type Card = { title: string; body: string };
/* Blank lines separate cards; each card's first line is its heading. */
export function parseCards(src: string): Card[] {
  return src
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const [title, ...rest] = b.split("\n");
      return { title: title.trim(), body: rest.join(" ").replace(/\s+/g, " ").trim() };
    });
}

type CardSet = { cards: { rect: Rect; heading: Block; body?: Block }[]; s: number; h: number; hs: number; bs: number; badge: number; pad: number };

/* One scale for every card, the biggest at which the tallest holds its words; every column count that makes sense is tried. */
function fitCards(q: Pen, list: Card[], room: Rect, k: number, strip: boolean): CardSet | undefined {
  const { ctx, fonts } = q;
  const n = list.length;
  const hf: Face = { family: fonts.sans, weight: 500, tracking: -0.01, leading: 1.2 };
  const bf: Face = { family: fonts.sans, weight: 400, tracking: 0, leading: 1.4 };
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
        const body = c.body ? setBlock(ctx, c.body, bf, bs, cw - pad * 2) : undefined;
        if (heading.w > maxH + 0.5 || (body && body.w > cw - pad * 2 + 0.5)) fits = false;
        tallest = Math.max(tallest, pad * 2 + Math.max(badge * 2, heading.h) + (body ? 12 * k * s + body.h : 0));
        return { heading, body };
      });
      if (!fits || tallest > ch + 0.5) continue;
      const h = Math.min(ch, tallest * 1.12);
      const cards = blocks.map((b, i) => {
        const r = Math.floor(i / cols);
        const inRow = Math.min(cols, n - r * cols);
        /* A short last row sits in the middle. */
        const rowW = inRow * cw + (inRow - 1) * gapX;
        return { ...b, rect: { x: room.x + (room.w - rowW) / 2 + (i % cols) * (cw + gapX), y: room.y + r * (h + gapY), w: cw, h } };
      });
      return { cards, s, h: rows * h + (rows - 1) * gapY, hs, bs, badge, pad };
    }
  return undefined;
}

/* "# Group" starts a group; every other line is an item in it. */
export function parseLists(src: string) {
  const groups: { title: string; items: string[] }[] = [];
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#"))
      groups.push({ title: line.replace(/^#+\s*/, ""), items: [] });
    else {
      if (!groups.length) groups.push({ title: "", items: [] });
      groups[groups.length - 1].items.push(line);
    }
  }
  return groups;
}

function hashOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/* Each item gets a 3 × 3 dot glyph of its own, picked from its name. */
export function dotIcon(
  ctx: Ctx,
  label: string,
  x: number,
  cy: number,
  size: number,
  color: string,
) {
  let bits = hashOf(label) & 511;
  /* Never empty, never solid: three to seven lit. */
  const count = (n: number) => n.toString(2).replace(/0/g, "").length;
  /* From the hashed spot, the next dot that changes anything (the same spot again would never end). */
  for (let n = 0; count(bits) < 3; n++) {
    const h = hashOf(label + bits + n) % 9;
    for (let k = 0; k < 9; k++) if (!(bits & (1 << ((h + k) % 9)))) { bits |= 1 << ((h + k) % 9); break; }
  }
  for (let n = 0; count(bits) > 7; n++) {
    const h = hashOf(label + bits + n) % 9;
    for (let k = 0; k < 9; k++) if (bits & (1 << ((h + k) % 9))) { bits &= ~(1 << ((h + k) % 9)); break; }
  }
  const step = size / 3;
  const r = step * 0.34;
  const lit = new Path2D();
  const dim = new Path2D();
  for (let i = 0; i < 9; i++) {
    const px = x + (i % 3 + 0.5) * step;
    const py = cy + (Math.floor(i / 3) - 1) * step;
    const path = bits & (1 << i) ? lit : dim;
    path.moveTo(px + r, py);
    path.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.32;
  ctx.fill(dim);
  ctx.globalAlpha = 1;
  ctx.fill(lit);
}


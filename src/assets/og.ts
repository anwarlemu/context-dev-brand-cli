import { readFileSync } from "node:fs";
import { Path2D, type Canvas } from "@napi-rs/canvas";
import { pkgPath } from "../lib/paths.js";
import { scratch, tokenColor, type AnyCanvas, type Ctx, type Fonts } from "./canvas.js";
import {
  cardsKeep,
  drawCards,
  layoutCards,
  type CardsStyle,
} from "./cards.js";
import { drawLogo as drawBrandLogo, logoRatio } from "./logo.js";
import type { Picture } from "./picture.js";
import {
  grid,
  hexLightness,
  shade,
  type Dither,
  type Rect,
  type Render,
} from "./shader.js";

/*
 * Share images and social posts, ported from the share-image editor (agd-playground src/components/context-og/draw.ts)
 * to draw headless on a Skia canvas. The drawing code below the marked line is the editor's own, kept in its
 * formatting so the two diff cleanly; above it, the parts the editor kept inline now come from brand/assets/image.json
 * (sizes, palettes as tokens, each template's opening copy) and brand/assets/logo.json (the logo). A design is a field
 * of dots made from any picture by the dot shader, the logo, and the words. Everything is laid out in the image's own
 * pixels, then scaled to the canvas.
 */

export type Size = string;
export type Template = "banner" | "products" | "social" | "cards" | "customer";
export const TEMPLATES: Template[] = ["banner", "products", "social", "cards", "customer"];

export type Layout = {
  label: string;
  w: number;
  h: number;
  /* Scale of the logo and margins against the 1500 × 500 banner. */
  u: number;
  text: { x: number; y: number; size: number; width: number };
  image: { x: number; y: number; scale: number };
};

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
  headline: string;
  /* Social only: the line under the headline. */
  body: string;
  /* Cards only: blank-line-separated cards, heading first, and the footer's address. */
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
  textSize: number;
  /* Wrap width, as a share of the image's width. */
  textWidth: number;
  /* Top-left of the headline, as shares of the width and height. */
  textX: number;
  textY: number;
  /* A picture path, "sample:<name>" for a built-in picture, or "none". */
  image: string;
  /* Center of the picture, as shares of the width and height (of its area, when the template gives one). */
  imgX: number;
  imgY: number;
  /* Percent of the size that just fits inside the frame. */
  imgScale: number;
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
};

type SizeDoc = { label: string; w: number; h: number; u?: number; text?: Layout["text"]; image?: Layout["image"] };
export type ImageDoc = {
  palettes: Palette[];
  notes: string[];
  sizes: Record<string, Required<SizeDoc>>;
  social: Record<string, SizeDoc>;
  kinds: Record<"share" | "social", { label: string; templates: Template[]; sizes: "sizes" | "social"; custom: boolean }>;
  cards: { fill: string; radius: number; edge: string; shadow: { color: string; blur: number; y: number }; heading: string; body: string; badge: string; badgeInk: string };
  base: Partial<Design>;
  templates: Record<Template, { label: string; description: string; size: string; set: Partial<Design> }>;
};

let doc: ImageDoc | undefined;
export const imageDoc = (): ImageDoc => (doc ??= JSON.parse(readFileSync(pkgPath("brand", "assets", "image.json"), "utf8")) as ImageDoc);

/* Banner-style defaults for a frame of any shape. */
function layoutOf(label: string, w: number, h: number): Layout {
  const wide = w / h >= 1.2;
  return {
    label,
    w,
    h,
    u: Math.sqrt(w * h) / 900,
    text: wide
      ? { x: 0.04, y: 0.2, size: Math.round((64 * h) / 630), width: 0.45 }
      : { x: 0.06, y: 0.12, size: Math.round((72 * w) / 1080), width: 0.8 },
    image: wide ? { x: 0.72, y: 0.58, scale: 105 } : { x: 0.55, y: 0.66, scale: 75 },
  };
}

/* The share sizes, laid out by hand. */
export function shareSizes(): Record<string, Layout> {
  return Object.fromEntries(Object.entries(imageDoc().sizes).map(([id, s]) => [id, { ...s, label: `${s.label} · ${s.w} × ${s.h}` }]));
}

/* Social posts: the common shapes, and "custom" for any other. */
export function socialSizes(): Record<string, Layout> {
  return Object.fromEntries(Object.entries(imageDoc().social).map(([id, s]) => [id, layoutOf(`${s.label} · ${s.w} × ${s.h}`, s.w, s.h)]));
}

export const clampDim = (n: number) =>
  Math.round(Math.min(4000, Math.max(200, n || 0)));

/* The frame a design is drawn in: a named size, or its own width and height. */
export function frameOf(d: Pick<Design, "size" | "w" | "h">): Layout {
  return (
    shareSizes()[d.size] ??
    socialSizes()[d.size] ??
    layoutOf("Custom", clampDim(d.w), clampDim(d.h))
  );
}

/* Palettes with their token names resolved to colors. */
export function palettes(): Palette[] {
  return imageDoc().palettes.map((p) => ({
    ...p,
    bg: tokenColor(p.bg),
    fill: tokenColor(p.fill),
    ring: tokenColor(p.ring),
    field: tokenColor(p.field),
    text: tokenColor(p.text),
    ink: tokenColor(p.ink),
    mark: tokenColor(p.mark),
  }));
}

export const paletteOf = (d: Pick<Design, "palette">) => {
  const all = palettes();
  return all.find((p) => p.name.toLowerCase() === d.palette.toLowerCase()) ?? all[0];
};

/* Where every size-dependent setting starts, for a size and template (the editor's layoutFor). */
export function layoutFor(
  size: Size,
  template: Template,
  dims: { w: number; h: number } = { w: 1200, h: 675 },
) {
  const L = frameOf({ size, ...dims });
  const { w: W, h: H } = L;
  const at = { size, w: dims.w, h: dims.h };
  if (template === "cards")
    return {
      ...at,
      textX: 0.5,
      textY: 0.5,
      textSize: Math.round(38 * Math.sqrt((W * H) / (1200 * 630))),
      textWidth: 0.86,
      imgX: 0.5,
      imgY: 0.5,
      imgScale: 100,
    };
  if (template === "customer") {
    const wide = W / H >= 1.2;
    return {
      ...at,
      textX: wide ? 0.035 : 0.06,
      textY: wide ? 0.21 : 0.16,
      textSize: Math.round(wide ? (94 * H) / 630 : (W / H < 0.7 ? 120 : 100) * (W / 1080)),
      textWidth: wide ? 0.55 : 0.86,
      imgX: wide ? 1.02 : 0.95,
      imgY: wide ? 0.5 : 0.8,
      imgScale: 100,
    };
  }
  if (template === "social")
    return {
      ...at,
      textX: 0.5,
      textY: 0.085,
      /* 110px on a 1200 × 675 post, growing with the post's area. */
      textSize: Math.round((110 * Math.sqrt(W * H)) / 900),
      textWidth: W / H >= 1.2 ? 0.72 : 0.86,
      imgX: 0.5,
      imgY: 0.5,
      imgScale: 92,
    };
  /* Products sizes its headline against the panel, not the banner. */
  const products = template === "products";
  return {
    ...at,
    textX: L.text.x,
    textY: L.text.y,
    textSize: products
      ? Math.round(W / H >= 1.4 ? (46 * H) / 630 : (54 * W) / 1080)
      : L.text.size,
    textWidth: L.text.width,
    imgX: products ? 0.82 : L.image.x,
    imgY: products ? 0.78 : L.image.y,
    imgScale: products ? 70 : L.image.scale,
  };
}

/* A template's opening design at a size: the brand's copy and settings, then the size's layout. */
export function designFor(template: Template, size?: Size, dims?: { w: number; h: number }): Design {
  const t = imageDoc().templates[template];
  const at = size ?? t.size;
  return { template, ...imageDoc().base, ...t.set, ...layoutFor(at, template, dims) } as Design;
}

/* Where the picture lands: placed within an area, the whole frame unless a template gives it a stage of its own. */
export function imageRect(d: Design, img: Picture, area?: Rect): Rect {
  const { w: W, h: H } = frameOf(d);
  const a = area ?? { x: 0, y: 0, w: W, h: H };
  const iw = img.width;
  const ih = img.height;
  const sc = (Math.min(a.w / iw, a.h / ih) * d.imgScale) / 100;
  const w = iw * sc;
  const h = ih * sc;
  return {
    x: a.x + d.imgX * a.w - w / 2,
    y: a.y + d.imgY * a.h - h / 2,
    w,
    h,
  };
}

export const RING = 1.2;

/* The full logo, mark and wordmark, h tall with its top-left at (x, y). */
const LOGO_W = logoRatio() * 32;
function drawLogo(ctx: Ctx, x: number, y: number, h: number, p: Palette, mark = p.mark, ink = p.ink) {
  drawBrandLogo(ctx, x, y, h, mark, ink);
}

/* A canvas for masks and cut-outs (the editor's document.createElement("canvas")). */
const newCanvas = (w = 1, h = 1) => scratch(w, h).canvas;

/* ---- The editor's drawing code (agd-playground src/components/context-og/draw.ts) ---- */

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
    out.push(line);
  }
  return out;
}

/* Where the headline landed, and the area the picture is placed in. */
export type Drawn = { text: Rect; area?: Rect };

/*
 * Draws the design onto the canvas, at whatever multiple of the image's size
 * the canvas is. Returns where the headline landed, for dragging.
 */
export function drawDesign(
  canvas: AnyCanvas,
  d: Design,
  img: Picture | null,
  fonts: Fonts,
): Drawn {
  const { w: W, h: H, u } = frameOf(d);
  const p = paletteOf(d);
  const ctx = canvas.getContext("2d");
  const s = canvas.width / W;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  if (d.template === "products") return drawProducts(ctx, d, img, fonts);
  if (d.template === "social") return drawSocial(ctx, d, img, fonts);
  if (d.template === "cards") return drawContextCards(ctx, d, fonts);
  if (d.template === "customer") return drawCustomer(ctx, d, img, fonts);
  const sans = fonts.sans;

  /* The headline's box first: the dots keep clear of it and the logo. */
  ctx.font = `500 ${d.textSize}px ${sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  const lines = wrap(ctx, d.headline, d.textWidth * W);
  const lh = d.textSize * 1.2;
  const tx = d.textX * W;
  const ty = d.textY * H;
  const tw = Math.max(1, ...lines.map((l) => ctx.measureText(l).width));
  const text: Rect = { x: tx, y: ty, w: tw, h: lines.length * lh };

  const logoBox: Rect = { x: 32 * u, y: 36 * u, w: 190 * u, h: 32 * u };
  const covered = (x: number, y: number, r: number) =>
    [text, ...(d.logo ? [logoBox] : [])].some(
      (b) =>
        x + r > b.x - 12 &&
        x - r < b.x + b.w + 12 &&
        y + r > b.y - 12 &&
        y - r < b.y + b.h + 12,
    );

  drawDots(ctx, d, p, img, covered);

  ctx.textBaseline = "alphabetic";
  if (d.logo) drawLogo(ctx, logoBox.x, logoBox.y, 32 * u, p);

  ctx.font = `500 ${d.textSize}px ${sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  ctx.fillStyle = p.text;
  lines.forEach((l, i) =>
    ctx.fillText(l, tx, ty + i * lh + d.textSize * 0.92),
  );
  ctx.letterSpacing = "0px";
  return { text };
}

/* The dot field: the picture shaded into the grid, the grid behind it, and
   no dot wherever `covered` says the words are. */
function drawDots(
  ctx: Ctx,
  d: Design,
  p: Palette,
  img: Picture | null,
  covered: (x: number, y: number, r: number) => boolean,
  area?: Rect,
) {
  const { w: W, h: H } = frameOf(d);
  const g = grid(W, H, d.dot, d.gap);
  const st = img
    ? shade(img, g, imageRect(d, img, area), shaderOpts(d, p.fill, p.bg))
    : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const filled = new Path2D();
  const hollow = new Path2D();
  const field = new Path2D();
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const v = st[r * g.cols + c];
      if (v === 3) continue;
      const x = g.ox + (c + 0.5) * g.pitch;
      const y = g.oy + (r + 0.5) * g.pitch;
      /* No dot ever sits under the words. */
      if (covered(x, y, rad)) continue;
      if (v === 2) {
        filled.moveTo(x + rad, y);
        filled.arc(x, y, rad, 0, Math.PI * 2);
      } else if (v === 1 && d.field !== "faint") {
        hollow.moveTo(x + ringR, y);
        hollow.arc(x, y, ringR, 0, Math.PI * 2);
      } else if (d.field !== "none") {
        /* The faint grid is two-level: the subject's rings join the field. */
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

/*
 * The numbered cards on Context's ground: the palette's colour with its dot
 * grid kept clear of the words, white cards with the blue number, and the
 * logo and address along the bottom.
 */
function drawContextCards(
  ctx: Ctx,
  d: Design,
  fonts: Fonts,
): Drawn {
  const { w: W, h: H } = frameOf(d);
  const p = paletteOf(d);
  const k = Math.sqrt((W * H) / (1200 * 630));
  const light = hexLightness(p.bg) > 0.9;
  const cs = imageDoc().cards;
  const st: CardsStyle = {
    display: fonts.sans,
    text: fonts.sans,
    title: p.text,
    titleWeight: 500,
    titleTrack: -0.02,
    footer: p.text,
    card: {
      fill: tokenColor(cs.fill),
      radius: cs.radius,
      edge: light ? tokenColor(cs.edge) : undefined,
      shadow: cs.shadow,
    },
    heading: tokenColor(cs.heading),
    headingTrack: -0.01,
    body: tokenColor(cs.body),
    badge: { fill: tokenColor(cs.badge), ink: tokenColor(cs.badgeInk) },
    logo: (c, x, cy, h) => {
      drawLogo(c, x, cy - h / 2, h, p);
      return (LOGO_W / 32) * h;
    },
    logoW: (_c, h) => (LOGO_W / 32) * h,
  };
  const content = {
    title: d.headline,
    cards: d.cards,
    footer: d.footer,
    logo: d.logo,
    titleSize: d.textSize,
  };
  const L = layoutCards(ctx, W, H, k, content, st);
  const keep = cardsKeep(L);
  const pad = 10 * k;
  drawDots(ctx, d, p, null, (x, y, r) =>
    keep.some(
      (b) =>
        x + r > b.x - pad &&
        x - r < b.x + b.w + pad &&
        y + r > b.y - pad &&
        y - r < b.y + b.h + pad,
    ),
  );
  drawCards(ctx, L, content, st);
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
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
 * The burst: rays of dots spreading from a point, small rings near it and
 * up top, growing into solid dots further out and lower down, like light
 * catching a sphere.
 */
function drawBurst(
  ctx: Ctx,
  d: Design,
  p: Palette,
  covered: (x: number, y: number, r: number) => boolean,
) {
  const { w: W, h: H } = frameOf(d);
  const cx = d.imgX * W;
  const cy = d.imgY * H;
  const R = (Math.sqrt(W * H) * d.imgScale) / 100;
  const rays = 44;
  const step = (Math.PI * 2) / rays;
  /* It ends in a round edge, so it reads as one shape. */
  const far = R * 0.78;
  const filled = new Path2D();
  const hollow = new Path2D();
  let ring = 0;
  for (let r = R * 0.12; r < far; r *= 1.14, ring++) {
    const off = ring % 2 ? step / 2 : 0;
    for (let i = 0; i < rays; i++) {
      const a = i * step + off;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      /* Lower down is lit: 0 straight up, 1 straight down. */
      const lit = (1 + Math.sin(a)) / 2;
      const grow = Math.min(1, r / (R * 0.7));
      const rad = Math.min(r * step * 0.4, R * 0.036) * (0.35 + 0.65 * lit) * (0.45 + 0.55 * grow);
      if (rad < 1.2) continue;
      if (x + rad < 0 || x - rad > W || y + rad < 0 || y - rad > H) continue;
      if (covered(x, y, rad)) continue;
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
 * A customer story: the brand logo top left, the customer's logo top
 * right, a big number in dots with a line or two under it, and a burst of
 * dots behind. The words drag together; elsewhere drags the burst.
 */
function drawCustomer(
  ctx: Ctx,
  d: Design,
  img: Picture | null,
  fonts: Fonts,
): Drawn {
  const { w: W, h: H, u } = frameOf(d);
  const p = paletteOf(d);
  const m = 32 * u;
  ctx.textBaseline = "alphabetic";

  /* The words, measured first so the dots keep clear of them. */
  const big = d.textSize;
  const statSize = big * 2;
  const max = d.textWidth * W;
  ctx.font = `700 ${statSize}px ${fonts.sans}`;
  ctx.letterSpacing = `${0.03 * statSize}px`;
  const stat = d.stat.trim() ? wrap(ctx, d.stat, Math.max(max, W - 2 * m)) : [];
  const statW = stat.map((l) => ctx.measureText(l).width);
  ctx.font = `500 ${big}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.03 * big}px`;
  const head = d.headline.trim() ? wrap(ctx, d.headline, max) : [];
  const headW = head.map((l) => ctx.measureText(l).width);
  const statLh = statSize * 0.86;
  const headLh = big * 1.04;
  const gap = stat.length && head.length ? big * 0.12 : 0;
  const tx = d.textX * W;
  const ty = d.textY * H;
  const text: Rect = {
    x: tx,
    y: ty,
    w: Math.max(1, ...statW, ...headW),
    h: stat.length * statLh + gap + head.length * headLh,
  };

  /* The customer's logo, or their name, top right. */
  const ph = d.partnerSize * u;
  const cut = img ? logoCut(img, d.partnerWhite ? p.ink : null) : null;
  let partnerBox: Rect | null = null;
  const name = d.partnerName.trim();
  if (cut) {
    const pw = Math.min((cut.width / cut.height) * ph, W * 0.4);
    const h = (pw / cut.width) * cut.height;
    partnerBox = { x: W - m - pw, y: m + (ph - h) / 2, w: pw, h };
  } else if (name) {
    ctx.font = `600 ${ph}px ${fonts.sans}`;
    ctx.letterSpacing = `${-0.02 * ph}px`;
    const nw = ctx.measureText(name).width;
    partnerBox = { x: W - m - nw, y: m, w: nw, h: ph };
  }
  const logoBox: Rect = { x: m, y: m, w: (LOGO_W / 32) * 32 * u, h: 32 * u };
  const keep = [text, ...(d.logo ? [logoBox] : []), ...(partnerBox ? [partnerBox] : [])];
  const pad = 16 * u;
  const covered = (x: number, y: number, r: number) =>
    keep.some(
      (b) =>
        x + r > b.x - pad &&
        x - r < b.x + b.w + pad &&
        y + r > b.y - pad &&
        y - r < b.y + b.h + pad,
    );
  if (d.field !== "none") drawDots(ctx, d, p, null, covered);
  if (d.burst) drawBurst(ctx, d, p, covered);

  if (d.logo) drawLogo(ctx, logoBox.x, logoBox.y, logoBox.h, p, p.ink);
  if (cut && partnerBox)
    ctx.drawImage(cut, partnerBox.x, partnerBox.y, partnerBox.w, partnerBox.h);
  else if (partnerBox) {
    ctx.fillStyle = p.ink;
    ctx.font = `600 ${ph}px ${fonts.sans}`;
    ctx.letterSpacing = `${-0.02 * ph}px`;
    ctx.fillText(name, partnerBox.x, partnerBox.y + ph * 0.84);
  }

  ctx.fillStyle = p.text;
  stat.forEach((l, i) =>
    dotText(ctx, l, tx, ty + i * statLh, statSize, statLh, fonts.sans),
  );
  const headTop = ty + stat.length * statLh + gap;
  ctx.font = `500 ${big}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.03 * big}px`;
  head.forEach((l, i) => ctx.fillText(l, tx, headTop + big * 0.9 + i * headLh));
  ctx.letterSpacing = "0px";
  return { text };
}

/* The social headline's second voice: this share of the headline's size. */
export const BODY = 0.33;

/*
 * The social post: a big headline and a line under it, centred at the top,
 * and the picture in dots filling the room left below. The picture is placed
 * within that room, so it stays put whatever the post's shape.
 */
function drawSocial(
  ctx: Ctx,
  d: Design,
  img: Picture | null,
  fonts: Fonts,
): Drawn {
  const { w: W, h: H, u } = frameOf(d);
  const p = paletteOf(d);
  const max = d.textWidth * W;
  const cx = d.textX * W;
  const top = d.textY * H;
  const big = d.textSize;
  const small = big * BODY;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  ctx.font = `400 ${big}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.01 * big}px`;
  const head = d.headline.trim() ? wrap(ctx, d.headline, max) : [];
  const headW = head.map((l) => ctx.measureText(l).width);
  ctx.font = `400 ${small}px ${fonts.sans}`;
  ctx.letterSpacing = "0px";
  const body = d.body.trim() ? wrap(ctx, d.body, max) : [];
  const bodyW = body.map((l) => ctx.measureText(l).width);

  const headLh = big * 1.08;
  const bodyLh = small * 1.45;
  const gap = head.length && body.length ? small * 1.1 : 0;
  const headBase = (i: number) => top + big * 0.92 + i * headLh;
  const bodyTop = top + head.length * headLh + gap;
  const bodyBase = (i: number) => bodyTop + small * 0.92 + i * bodyLh;
  const h = head.length * headLh + gap + body.length * bodyLh;
  const w = Math.max(1, ...headW, ...bodyW);
  const text: Rect = { x: cx - w / 2, y: top, w, h };

  /* The room below the words, where the picture is placed. */
  const below = top + h + 0.04 * H;
  const area: Rect = {
    x: 0.06 * W,
    y: Math.min(below, H * 0.8),
    w: 0.88 * W,
    h: Math.max(H * 0.94 - below, H * 0.14),
  };

  const logoBox: Rect = { x: 32 * u, y: 32 * u, w: 190 * u, h: 32 * u };
  const keep = [text, ...(d.logo ? [logoBox] : [])];
  const pad = 0.4 * small;
  drawDots(
    ctx,
    d,
    p,
    img,
    (x, y, r) =>
      keep.some(
        (b) =>
          x + r > b.x - pad &&
          x - r < b.x + b.w + pad &&
          y + r > b.y - pad &&
          y - r < b.y + b.h + pad,
      ),
    area,
  );

  if (d.logo) drawLogo(ctx, logoBox.x, logoBox.y, 32 * u, p);
  ctx.fillStyle = p.text;
  ctx.font = `400 ${big}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.01 * big}px`;
  head.forEach((l, i) => ctx.fillText(l, cx, headBase(i)));
  ctx.font = `400 ${small}px ${fonts.sans}`;
  ctx.letterSpacing = "0px";
  body.forEach((l, i) => ctx.fillText(l, cx, bodyBase(i)));
  ctx.textAlign = "left";
  return { text, area };
}

function shaderOpts(d: Design, fill: string, bg: string) {
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
  while (count(bits) < 3) bits |= 1 << (hashOf(label + bits) % 9);
  while (count(bits) > 7) bits &= ~(1 << (hashOf(label + bits) % 9));
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

/*
 * The products template: logo, headline and a button on one side; on the
 * other, a panel in the brand colour with a ring grid, the product lists under
 * Doto labels, and the picture (if any) shaded into the panel's grid.
 */
function drawProducts(
  ctx: Ctx,
  d: Design,
  img: Picture | null,
  fonts: Fonts,
): Drawn {
  const { w: W, h: H } = frameOf(d);
  const p = paletteOf(d);
  const across = W / H >= 1.4;
  /* One unit: the 1200 × 630 link preview's pixel. */
  const k = across ? H / 630 : W / 1000;
  const m = 24 * k;
  const panel: Rect = across
    ? { x: W * 0.49, y: m, w: W - W * 0.49 - m, h: H - 2 * m }
    : { x: m, y: H * 0.42, w: W - 2 * m, h: H - H * 0.42 - m };
  const side: Rect = across
    ? { x: 0, y: 0, w: panel.x, h: H }
    : { x: 0, y: 0, w: W, h: panel.y };
  const panelBg = p.fill;
  const panelInk = p.bg;

  /* The left side, measured first so it can sit centred as one block. */
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 ${d.textSize}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  const lines = wrap(ctx, d.headline, side.w * (across ? 0.7 : 0.78));
  const lh = d.textSize * 1.18;
  const logoH = 30 * k;
  const ctaH = d.cta ? 44 * k : 0;
  const blockH =
    (d.logo ? logoH + 38 * k : 0) +
    lines.length * lh +
    (d.cta ? 30 * k + ctaH : 0);
  let y = side.y + (side.h - blockH) / 2;
  const cx = side.x + side.w / 2;
  if (d.logo) {
    const lw = (LOGO_W / 32) * logoH;
    drawLogo(ctx, cx - lw / 2, y, logoH, p);
    y += logoH + 38 * k;
  }
  ctx.font = `500 ${d.textSize}px ${fonts.sans}`;
  ctx.letterSpacing = `${-0.02 * d.textSize}px`;
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh + d.textSize * 0.92));
  y += lines.length * lh;
  if (d.cta) {
    y += 30 * k;
    const fs = 17 * k;
    ctx.font = `500 ${fs}px ${fonts.sans}`;
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

  /* The panel's contents, laid out before the dots so the dots avoid them. */
  const groups = parseLists(d.lists);
  const total = groups.reduce((n, g) => n + g.items.length + 1, 0);
  const cols: (typeof groups)[] = [[], []];
  let run = 0;
  for (const g of groups) {
    (run < total / 2 || !cols[0].length ? cols[0] : cols[1]).push(g);
    run += g.items.length + 1;
  }
  const chipH = 30 * k;
  const chipFs = 16 * k;
  const itemFs = 18 * k;
  const itemLh = 37 * k;
  const groupGap = 26 * k;
  const colH = (c: typeof groups) =>
    c.reduce(
      (h, g, i) =>
        h + (g.title ? chipH + 12 * k : 0) + g.items.length * itemLh + (i ? groupGap : 0),
      0,
    );
  const contentH = Math.max(colH(cols[0]), colH(cols[1]));
  const colW = Math.min(250 * k, (panel.w - 80 * k) / 2);
  const gapX = 40 * k;
  const contentW = cols[1].length ? colW * 2 + gapX : colW;
  const ox = panel.x + (panel.w - contentW) / 2;
  const oy = panel.y + (panel.h - contentH) / 2;

  type Ink = { kind: "chip" | "item"; x: number; y: number; text: string; w: number };
  const inks: Ink[] = [];
  const boxes: Rect[] = [];
  cols.forEach((c, ci) => {
    let cy = oy;
    const x = ox + ci * (colW + gapX);
    c.forEach((g, gi) => {
      if (gi) cy += groupGap;
      if (g.title) {
        ctx.font = `900 ${chipFs}px ${fonts.data}`;
        ctx.letterSpacing = `${0.08 * chipFs}px`;
        const label = g.title.toUpperCase();
        const w = ctx.measureText(label).width + 26 * k;
        inks.push({ kind: "chip", x, y: cy, text: label, w });
        boxes.push({ x, y: cy, w, h: chipH });
        cy += chipH + 12 * k;
      }
      ctx.font = `400 ${itemFs}px ${fonts.sans}`;
      ctx.letterSpacing = "0px";
      for (const it of g.items) {
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

  /* Grid: rings across the panel, the picture shaded into it in solid dots
     and rings, and nothing under the words. */
  const g = grid(W, H, d.dot, d.gap);
  const st = img
    ? shade(img, g, imageRect(d, img), shaderOpts(d, panelInk, panelBg))
    : new Uint8Array(g.cols * g.rows);
  const rad = d.dot / 2;
  const ringR = Math.max(0.1, rad - RING / 2);
  const pad = 6 * k;
  const under = (x: number, y: number) =>
    boxes.some(
      (b) =>
        x + rad > b.x - pad &&
        x - rad < b.x + b.w + pad &&
        y + rad > b.y - pad &&
        y - rad < b.y + b.h + pad,
    );
  const filled = new Path2D();
  const hollow = new Path2D();
  const field = new Path2D();
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) {
      const x = g.ox + (c + 0.5) * g.pitch;
      const yy = g.oy + (r + 0.5) * g.pitch;
      if (
        x - rad < panel.x + 8 * k ||
        x + rad > panel.x + panel.w - 8 * k ||
        yy - rad < panel.y + 8 * k ||
        yy + rad > panel.y + panel.h - 8 * k ||
        under(x, yy)
      )
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
      ctx.font = `900 ${chipFs}px ${fonts.data}`;
      ctx.letterSpacing = `${0.08 * chipFs}px`;
      ctx.fillStyle = panelBg;
      ctx.fillText(t.text, t.x + 13 * k, t.y + chipH / 2 + chipFs * 0.36);
    } else {
      const mid = t.y + itemLh / 2;
      dotIcon(ctx, t.text, t.x + 1 * k, mid, 15 * k, panelInk);
      ctx.font = `400 ${itemFs}px ${fonts.sans}`;
      ctx.letterSpacing = "0px";
      ctx.fillStyle = panelInk;
      ctx.fillText(t.text, t.x + 30 * k, mid + itemFs * 0.36);
    }
  }
  ctx.restore();
  ctx.letterSpacing = "0px";
  return { text: { x: 0, y: 0, w: 0, h: 0 } };
}

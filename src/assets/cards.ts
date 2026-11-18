import type { Ctx } from './canvas.js';

/*
 * Ported from agd-playground src/components/context-og/cards.ts (kept in its own formatting so the two diff cleanly).
 * The numbered-cards post every brand can make: a title across the top, a
 * grid of cards (a number, a heading, a few lines), and a footer with the
 * logo on the left and an address on the right. The layout is shared; each
 * brand supplies its colours, faces and logo. Text is fitted so nothing is
 * ever cut off: if a card's words don't fit, everything shrinks together.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type Card = { title: string; body: string };

/* Blank lines separate cards; each card's first line is its heading. */
export function parseCards(src: string): Card[] {
  return src
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [title, ...rest] = block.split("\n");
      return { title: title.trim(), body: rest.join(" ").replace(/\s+/g, " ").trim() };
    });
}

export type CardsStyle = {
  display: string;
  text: string;
  /* The title on the ground, and the footer's address. */
  title: string;
  titleWeight: number;
  titleTrack: number;
  footer: string;
  card: {
    fill: string;
    radius: number;
    edge?: string;
    /* A soft drop, and/or a hard offset like a raised plan. */
    shadow?: { color: string; blur: number; y: number };
    offset?: { color: string; d: number };
  };
  heading: string;
  headingTrack: number;
  body: string;
  badge: { fill: string; ink: string };
  /* Draws the logo with its left edge at x, centred on cy, h tall; returns
     its width. */
  logo: (ctx: Ctx, x: number, cy: number, h: number) => number;
  /* The logo's width at a height, without drawing it. */
  logoW: (ctx: Ctx, h: number) => number;
};

export type CardsContent = {
  title: string;
  cards: string;
  footer: string;
  logo: boolean;
  /* The title's size, in the image's pixels. */
  titleSize: number;
};

export type CardsLayout = {
  title: { lines: string[]; size: number; y: number; rect: Rect };
  cards: {
    rect: Rect;
    n: number;
    heading: string[];
    body: string[];
  }[];
  s: number;
  pad: number;
  footer: Rect;
  /* Just the inked parts of the title and footer, for backgrounds. */
  ink: Rect[];
  k: number;
};

function wrap(ctx: Ctx, text: string, max: number) {
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

/* Sizes at scale 1, in units of the 1200 × 630 preview's pixels. */
const BASE = { pad: 30, badge: 13, heading: 25, body: 17, gapX: 30, gapY: 18 };

/* Works out where everything goes, shrinking the cards' text until the
   tallest card fits its box. */
export function layoutCards(
  ctx: Ctx,
  W: number,
  H: number,
  k: number,
  c: CardsContent,
  st: CardsStyle,
): CardsLayout {
  const mx = Math.max(W * 0.071, 32 * k);
  const top = H * 0.07;

  /* The title, shrunk if it would need more than three lines. */
  let size = c.titleSize;
  let lines: string[] = [];
  for (let i = 0; i < 12; i++) {
    ctx.font = `${st.titleWeight} ${size}px ${st.display}`;
    ctx.letterSpacing = `${st.titleTrack * size}px`;
    lines = c.title.trim() ? wrap(ctx, c.title, W - mx * 2) : [];
    if (lines.length <= 3) break;
    size *= 0.9;
  }
  const titleW = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
  ctx.letterSpacing = "0px";
  const titleH = lines.length * size * 1.15;
  const title = {
    lines,
    size,
    y: top,
    rect: { x: mx, y: top, w: W - mx * 2, h: titleH },
  };

  const footerH = c.logo || c.footer.trim() ? 30 * k : 0;
  const footer = { x: mx, y: H - H * 0.055 - footerH, w: W - mx * 2, h: footerH };
  const areaTop = top + titleH + (titleH ? H * 0.065 : 0);
  const areaBottom = footerH ? footer.y - H * 0.065 : H - H * 0.07;

  const list = parseCards(c.cards);
  const n = list.length;
  const cols = n <= 1 ? 1 : W / H < 0.65 ? 1 : 2;
  const rows = Math.max(1, Math.ceil(n / cols));
  const gapX = BASE.gapX * k;
  const gapY = BASE.gapY * k;
  const cw = (W - mx * 2 - gapX * (cols - 1)) / cols;
  const ch = Math.max(40 * k, (areaBottom - areaTop - gapY * (rows - 1)) / rows);

  /* Fit: one scale for every card, so they all read alike. */
  let s = 1;
  let tallest = 0;
  let cards: CardsLayout["cards"] = [];
  for (let attempt = 0; attempt < 14; attempt++) {
    const pad = BASE.pad * k * s;
    const badge = BASE.badge * k * s;
    const hs = BASE.heading * k * s;
    const bs = BASE.body * k * s;
    tallest = 0;
    cards = list.map((card, i) => {
      const r = Math.floor(i / cols);
      const inRow = Math.min(cols, n - r * cols);
      /* A short last row sits in the middle. */
      const rowW = inRow * cw + (inRow - 1) * gapX;
      const x = (W - rowW) / 2 + (i % cols) * (cw + gapX);
      const y = areaTop + r * (ch + gapY);
      ctx.font = `500 ${hs}px ${st.display}`;
      ctx.letterSpacing = `${st.headingTrack * hs}px`;
      const heading = wrap(ctx, card.title, cw - pad * 2 - badge * 2 - 14 * k * s);
      ctx.font = `400 ${bs}px ${st.text}`;
      ctx.letterSpacing = "0px";
      const body = card.body ? wrap(ctx, card.body, cw - pad * 2) : [];
      const need =
        pad * 2 +
        Math.max(badge * 2, heading.length * hs * 1.2) +
        (body.length ? 14 * k * s + body.length * bs * 1.45 : 0);
      tallest = Math.max(tallest, need);
      return { rect: { x, y, w: cw, h: ch }, n: i + 1, heading, body };
    });
    if (tallest <= ch || s < 0.45) break;
    s *= Math.max(0.8, Math.min(0.97, ch / tallest));
  }

  /* Cards no taller than their words need, with the grid centred in the
     room, so tall posts don't get long empty cards. */
  const need = Math.min(ch, tallest * 1.18);
  const lift = (ch - need) * rows / 2;
  cards = cards.map((cd, i) => ({
    ...cd,
    rect: {
      ...cd.rect,
      y: areaTop + lift + Math.floor(i / cols) * (need + gapY),
      h: need,
    },
  }));
  ctx.letterSpacing = "0px";

  const ink: Rect[] = [
    { x: W / 2 - titleW / 2, y: top, w: titleW, h: titleH },
  ];
  if (footerH) {
    if (c.logo) ink.push({ x: footer.x, y: footer.y, w: st.logoW(ctx, footerH), h: footerH });
    if (c.footer.trim()) {
      ctx.font = `500 ${21 * k}px ${st.display}`;
      const fw = ctx.measureText(c.footer.trim()).width;
      ink.push({ x: footer.x + footer.w - fw, y: footer.y, w: fw, h: footerH });
    }
  }
  return { title, cards, s, pad: BASE.pad * k * s, footer, ink, k };
}

export function drawCards(
  ctx: Ctx,
  L: CardsLayout,
  c: CardsContent,
  st: CardsStyle,
) {
  const { k, s } = L;
  ctx.textBaseline = "alphabetic";

  /* The title, centred. */
  ctx.textAlign = "center";
  ctx.fillStyle = st.title;
  ctx.font = `${st.titleWeight} ${L.title.size}px ${st.display}`;
  ctx.letterSpacing = `${st.titleTrack * L.title.size}px`;
  L.title.lines.forEach((l, i) =>
    ctx.fillText(
      l,
      L.title.rect.x + L.title.rect.w / 2,
      L.title.y + L.title.size * 0.9 + i * L.title.size * 1.15,
    ),
  );
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

    /* The number in its circle, the heading beside it, the lines below. */
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
    const firstBase =
      cd.heading.length > 1
        ? hTop + hs * 0.95
        : bcy + hs * 0.35;
    cd.heading.forEach((l, i) => ctx.fillText(l, hx, firstBase + i * hs * 1.2));
    ctx.letterSpacing = "0px";

    ctx.fillStyle = st.body;
    ctx.font = `400 ${bs}px ${st.text}`;
    const bTop = hTop + headH + 14 * k * s;
    cd.body.forEach((l, i) =>
      ctx.fillText(l, r.x + pad, bTop + bs * 1.05 + i * bs * 1.45),
    );
  }

  /* The footer: the logo on the left, the address on the right. */
  const f = L.footer;
  if (f.h) {
    const cy = f.y + f.h / 2;
    if (c.logo) st.logo(ctx, f.x, cy, f.h);
    if (c.footer.trim()) {
      ctx.fillStyle = st.footer;
      ctx.font = `500 ${21 * k}px ${st.display}`;
      ctx.textAlign = "right";
      ctx.fillText(c.footer.trim(), f.x + f.w, cy + 21 * k * 0.36);
      ctx.textAlign = "left";
    }
  }
}

/* Everything the cards layout occupies, for backgrounds to keep clear of. */
export function cardsKeep(L: CardsLayout): Rect[] {
  return [...L.ink, ...L.cards.map((c) => c.rect)];
}

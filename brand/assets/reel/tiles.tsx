/*
 * Ported from agd-playground src/components/context-reel/tiles.tsx for the video command (bundled at build, drawn in
 * headless Chromium frame by frame). Changes from the original: colors come from the tokens (C, see tokens.ts), the
 * copy from the command's flags (COPY, defaults in brand/assets/video.json), type from the tokens' faces (Rethink Sans
 * for the sans and the mono, as tokens.css sets the site), and no third-party names or real people.
 *
 * The tiles. Each is one frame of the Context.dev system, drawn at 1920 by
 * 1080 exactly as the Figma boards are, and animated by `lt`, its own
 * time in seconds. They are pure: the same time always draws the same
 * picture, which is what lets the reel be rendered frame by frame.
 */

import type { CSSProperties, ReactNode } from "react";
import {
  clamp,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  hash,
  lerp,
  loop,
  span,
} from "./motion";
import { C, COPY } from "./tokens";

export const BLUE = C.brand;
const PALE = C.blue20;

type TileProps = { lt: number };

function Frame({
  bg,
  children,
  style,
}: {
  bg: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, ...style }}>
      {children}
    </div>
  );
}

/* A field of dots across the whole frame, some of which twinkle. */
function DotField({
  lt,
  color,
  gap = 48,
  r = 3.5,
  twinkle = 0,
  seed = 1,
  mask,
}: {
  lt: number;
  color: string;
  gap?: number;
  r?: number;
  twinkle?: number;
  seed?: number;
  /* 0..1 visibility for a dot at x, y. */
  mask?: (x: number, y: number) => number;
}) {
  const dots: ReactNode[] = [];
  const cols = Math.floor(1920 / gap);
  const rows = Math.floor(1080 / gap);
  const ox = (1920 - (cols - 1) * gap) / 2;
  const oy = (1080 - (rows - 1) * gap) / 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = ox + i * gap;
      const y = oy + j * gap;
      const id = seed * 10007 + j * 131 + i;
      const m = mask ? mask(x, y) : 1;
      if (m <= 0.01) continue;
      let o = 1;
      let rr = r;
      if (twinkle > 0 && hash(id) < twinkle) {
        /* Each twinkler blinks on its own slow beat. */
        const period = 1.6 + hash(id + 7) * 2.4;
        const ph = loop(lt + hash(id + 3) * period, period) / period;
        const pulse = Math.max(0, Math.sin(ph * Math.PI * 2));
        o = 1;
        rr = r * (1 + 0.9 * pulse);
        dots.push(
          <circle
            key={id}
            cx={x}
            cy={y}
            r={rr}
            fill={C.white}
            opacity={(0.35 + 0.65 * pulse) * m}
          />,
        );
        continue;
      }
      dots.push(
        <circle key={id} cx={x} cy={y} r={rr} fill={color} opacity={o * m} />,
      );
    }
  }
  return (
    <svg
      width={1920}
      height={1080}
      className="cx-abs"
      style={{ left: 0, top: 0 }}
    >
      {dots}
    </svg>
  );
}

/* ------------------------------------------------------------------ logo -- */

const SQUARE_WITH_HOLE =
  "M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z";

/*
 * The Context.dev mark and wordmark. `p` runs 0 to 1: at 0 the circle sits
 * in the square's hole, as it does when the site's logo is hovered; it pops
 * out to the left to rest, and the wordmark follows it in.
 */
export function Logo({
  p,
  height,
  color = C.white,
  word = true,
}: {
  p: number;
  height: number;
  color?: string;
  word?: boolean;
}) {
  const w = (772.32 / 531.2) * height;
  /* The mark arrives first, whole, with a small overshoot. */
  const markIn = easeOutBack(span(p, 0, 0.14));
  const move = easeInOutCubic(span(p, 0.1, 0.62));
  const lift = easeOutBack(span(p, 0.1, 0.62));
  const tx = 260.5 * (1 - move);
  const ty = -19.36 * (1 - lift);
  const wordIn = easeOutCubic(span(p, 0.45, 1));
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <svg
        width={w}
        height={height}
        viewBox="0 0 772.32 531.2"
        style={{
          overflow: "visible",
          opacity: Math.min(1, markIn * 1.4),
          transform: `scale(${0.6 + 0.4 * markIn})`,
        }}
      >
        <path fill={color} fillRule="evenodd" d={SQUARE_WITH_HOLE} />
        <circle cx={153.55 + tx} cy={377.64 + ty} r={153.55} fill={color} />
      </svg>
      {word ? (
        /* The word opens out from the mark: its column grows from nothing to
           its own width, so the whole logo stays centred as it does. */
        <div style={{ display: "grid", gridTemplateColumns: `${wordIn}fr` }}>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <span
              style={{
                display: "block",
                paddingLeft: height * 0.34,
                color,
                fontSize: height * 0.98,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                opacity: wordIn,
                transform: `translateX(${(1 - wordIn) * -height * 0.5}px)`,
              }}
            >
              {COPY.name}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- cover -- */

export function Cover({ lt }: TileProps) {
  return (
    <Frame bg={BLUE}>
      <DotField
        lt={lt}
        color="rgba(255,255,255,0.32)"
        gap={48}
        r={3.6}
        twinkle={0.06}
        seed={3}
      />
      <div
        className="cx-abs"
        style={{ inset: 0, display: "grid", placeItems: "center" }}
      >
        <div
          style={{
            padding: "44px 64px",
            background: BLUE,
            borderRadius: 40,
          }}
        >
          <Logo p={span(lt, 0.15, 1.35)} height={104} />
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------- pipeline -- */

const PILLS = COPY.pills;
const PILL_X = [520, 960, 1400];

export function Pipeline({ lt }: TileProps) {
  const t = loop(lt, 3);
  /* A packet runs Web → Scrape, then Scrape → Markdown. */
  const legs = [
    { from: 0, to: 1, a: 0.35, b: 1.15 },
    { from: 1, to: 2, a: 1.45, b: 2.25 },
  ];
  const active = t < 1.15 ? 0 : t < 2.25 ? 1 : 2;
  const connector: ReactNode[] = [];
  legs.forEach((leg, li) => {
    const x0 = PILL_X[leg.from] + 110;
    const x1 = PILL_X[leg.to] - 110;
    const n = Math.floor((x1 - x0) / 16);
    const head = easeInOutCubic(span(t, leg.a, leg.b)) * (n + 6);
    for (let k = 0; k <= n; k++) {
      const x = x0 + ((x1 - x0) * k) / n;
      const d = head - k;
      const lit = d >= 0 && d < 6 ? 1 - d / 6 : 0;
      connector.push(
        <circle
          key={`${li}-${k}`}
          cx={x}
          cy={540}
          r={3.4 + lit * 3}
          fill={C.white}
          opacity={0.28 + 0.72 * lit}
        />,
      );
    }
  });
  return (
    <Frame bg={C.black}>
      <svg
        width={1920}
        height={1080}
        className="cx-abs"
        style={{ left: 0, top: 0 }}
      >
        {connector}
        {/* The faint vertical guides of the dark board. */}
        {[PILL_X[0], PILL_X[2]].map((x, i) =>
          Array.from({ length: 22 }, (_, k) => (
            <circle
              key={`v${i}-${k}`}
              cx={x}
              cy={i === 0 ? 120 + k * 16 : 620 + k * 16}
              r={2.4}
              fill={C.white}
              opacity={0.18}
            />
          )),
        )}
      </svg>
      {PILLS.map((label, i) => {
        const on = i === active;
        const arrive =
          i === 0
            ? span(t, 0, 0.3)
            : span(t, legs[i - 1].b - 0.05, legs[i - 1].b + 0.25);
        const pop = i === 0 ? 0 : Math.sin(Math.PI * clamp(arrive)) * 0.08;
        return (
          <div
            key={label}
            className="cx-abs"
            style={{
              left: PILL_X[i],
              top: 540,
              transform: `translate(-50%, -50%) scale(${1 + pop})`,
              padding: "22px 44px",
              borderRadius: 999,
              background: on || i < active ? BLUE : C.neutral90,
              border: `2px solid ${on || i < active ? BLUE : C.neutral80}`,
              color: C.white,
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              boxShadow: on ? `0 0 0 10px ${C.brandRing}` : "none",
            }}
          >
            {label}
          </div>
        );
      })}
    </Frame>
  );
}

/* ------------------------------------------------------------------ stat -- */

export function Stat({ lt }: TileProps) {
  const t = loop(lt, 4.2);
  const n = Math.round(COPY.statValue * easeOutCubic(span(t, 0.2, 1.9)));
  const dots: ReactNode[] = [];
  const g = 44;
  const x0 = 470;
  const y0 = 342;
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      const k = j * 10 + i;
      const on = k < n;
      dots.push(
        <circle
          key={k}
          cx={x0 + i * g}
          cy={y0 + j * g}
          r={on ? 11 : 8}
          fill={C.white}
          opacity={on ? 1 : 0.28}
        />,
      );
    }
  }
  return (
    <Frame bg={BLUE}>
      <DotField lt={lt} color="rgba(255,255,255,0.14)" gap={48} r={3.2} />
      <svg
        width={1920}
        height={1080}
        className="cx-abs"
        style={{ left: 0, top: 0 }}
      >
        {dots}
      </svg>
      <div className="cx-abs" style={{ left: 980, top: 420, color: C.white }}>
        <div
          style={{
            fontSize: 230,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n}%
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 36,
            lineHeight: 1.25,
            maxWidth: 520,
            opacity: 0.9,
          }}
        >
          {COPY.statLabel}
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------- markdown -- */

export function MarkdownTile({ lt }: TileProps) {
  const t = loop(lt, 4.4);
  const rows = 10;
  const g = 62;
  const dots: ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i <= j; i++) {
      /* Right-aligned rows, the longest at the bottom. */
      const x = 1700 - (j - i) * g;
      const y = 460 + j * g;
      const d = rows - 1 - j + (j - i);
      const p = easeOutBack(
        span(t, 0.25 + (18 - d) * 0.05, 0.6 + (18 - d) * 0.05),
      );
      dots.push(
        <circle
          key={`${i}-${j}`}
          cx={x}
          cy={y}
          r={Math.max(0, 15 * p)}
          fill={BLUE}
        />,
      );
    }
  }
  const words = COPY.markdown.split(
    " ",
  );
  return (
    <Frame bg={C.white}>
      <div
        className="cx-abs"
        style={{
          left: 120,
          top: 120,
          width: 1000,
          fontSize: 88,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: C.black,
        }}
      >
        {words.map((w, i) => {
          const p = easeOutCubic(span(t, 0.05 + i * 0.05, 0.5 + i * 0.05));
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.26em",
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <svg
        width={1920}
        height={1080}
        className="cx-abs"
        style={{ left: 0, top: 0 }}
      >
        {dots}
      </svg>
    </Frame>
  );
}

/* ------------------------------------------------------------- benchmark -- */

/* Rows as passed ("name share"), each share 0 to 100 of the row's dots; the first is the brand's own. */
const BENCH = COPY.bench.map((row, i) => {
  const m = /^(.*\S)\s+(\d+)$/.exec(row)!;
  return { name: m[1], share: Number(m[2]), color: i ? C.neutral90 : BLUE, logo: i === 0 };
});

export function Bench({ lt }: TileProps) {
  const t = loop(lt, 4.4);
  const total = 62;
  return (
    <Frame bg={BLUE}>
      <DotField lt={lt} color="rgba(255,255,255,0.14)" gap={48} r={3.2} />
      <div
        className="cx-abs"
        style={{
          left: 200,
          top: 250,
          width: 1520,
          height: 580,
          borderRadius: 28,
          background: C.white,
        }}
      >
        {BENCH.map((row, ri) => {
          const target = Math.round((total * row.share) / 100);
          const n = Math.round(
            target * easeOutCubic(span(t, 0.2 + ri * 0.18, 1.8 + ri * 0.18)),
          );
          return (
            <div
              key={row.name}
              className="cx-abs"
              style={{
                left: 70,
                top: 92 + ri * 150,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 300,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 40,
                  fontWeight: 500,
                  color: C.black,
                }}
              >
                {row.logo ? (
                  <Logo p={1} height={34} color={BLUE} word={false} />
                ) : null}
                {row.name}
              </div>
              <svg width={total * 18} height={40}>
                {Array.from({ length: total }, (_, k) => (
                  <circle
                    key={k}
                    cx={10 + k * 18}
                    cy={20}
                    r={k < n ? 7 : 5}
                    fill={k < n ? row.color : C.neutral10}
                  />
                ))}
              </svg>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------- two cards -- */

/* The blue card's grid: 13 x 8 dots that light up one by one, `n` of them so
   far. */
function FillDots({ n }: { n: number }) {
  const cols = 13;
  const rows = 8;
  const dots: ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const on = k < n;
      dots.push(
        <circle
          key={k}
          cx={56 + i * 36}
          cy={250 + j * 36}
          r={9}
          fill={on ? C.blue10 : "rgba(255,255,255,0.22)"}
        />,
      );
    }
  }
  return <>{dots}</>;
}

/* The white card's field: two triangles either side of the diagonal, as on
   the board. Where each dot sits never changes, so it is laid out once. */
const TRIANGLE_DOTS = Array.from({ length: 17 * 17 }, (_, id) => ({
  id,
  i: id % 17,
  j: Math.floor(id / 17),
}))
  .filter(({ i, j }) => i + j < 10 || i + j > 22)
  .map(({ id, i, j }) => ({
    id,
    cx: 34 + i * 27,
    cy: 34 + j * 27,
    /* A tenth of them blink blue, each on its own period and phase. */
    accent: hash(id + 91) < 0.1,
    period: 2.2 + hash(id) * 1.6,
    phase: hash(id + 5),
  }));

function TriangleDots({ t }: { t: number }) {
  return (
    <>
      {TRIANGLE_DOTS.map(({ id, cx, cy, accent, period, phase }) => {
        const blink = accent
          ? 0.5 + 0.5 * Math.sin(((t + phase * period) / period) * Math.PI * 2)
          : 0;
        return (
          <circle
            key={id}
            cx={cx}
            cy={cy}
            r={7}
            fill={accent ? BLUE : PALE}
            opacity={accent ? 0.45 + 0.55 * blink : 1}
          />
        );
      })}
    </>
  );
}

export function TwoCards({ lt }: TileProps) {
  const t = loop(lt, 4.6);
  const n = Math.round(76 * easeOutCubic(span(t, 0.3, 2.2)));
  const diag = easeInOutCubic(span(t, 0.2, 1.8));
  return (
    <Frame bg={C.black}>
      <div
        className="cx-abs"
        style={{
          left: 440,
          top: 290,
          width: 500,
          height: 500,
          borderRadius: 16,
          background: BLUE,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 30,
            width: 440,
            color: C.white,
            fontSize: 36,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
          }}
        >
          {COPY.cardBlue}
        </div>
        <svg
          width={500}
          height={500}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <FillDots n={n} />
        </svg>
      </div>
      <div
        className="cx-abs"
        style={{
          left: 980,
          top: 290,
          width: 500,
          height: 500,
          borderRadius: 16,
          background: C.white,
          overflow: "hidden",
        }}
      >
        <svg
          width={500}
          height={500}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <TriangleDots t={t} />
          {Array.from({ length: 24 }, (_, k) => {
            const p = k / 23;
            return (
              <circle
                key={`d${k}`}
                cx={lerp(120, 380, p)}
                cy={lerp(400, 120, p)}
                r={3.2}
                fill={PALE}
                opacity={p <= diag ? 1 : 0}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            right: 30,
            top: 24,
            textAlign: "right",
            fontSize: 36,
            lineHeight: 1.15,
            color: C.black,
          }}
        >
          {COPY.cardTop[0]}
          <br />
          {COPY.cardTop[1]}
        </div>
        <div
          style={{
            position: "absolute",
            left: 30,
            bottom: 26,
            fontSize: 36,
            lineHeight: 1.15,
            color: C.black,
          }}
        >
          {COPY.cardBottom[0]}
          <br />
          {COPY.cardBottom[1]}
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------------- tagline -- */

export function Tagline({ lt }: TileProps) {
  const t = loop(lt, 4.4);
  /* Words wrapped in asterisks are set in the brand blue. */
  const words: { w: string; blue?: boolean }[] = COPY.tagline
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.startsWith("*") && w.endsWith("*") && w.length > 2 ? { w: w.slice(1, -1), blue: true } : { w }));
  /* Dots gather at the edges and thin out towards the words. */
  const mask = (x: number, y: number) => {
    const dx = Math.abs(x - 960) / 960;
    const dy = Math.abs(y - 540) / 540;
    const d = Math.max(dx * 1.1, dy * 1.4);
    return clamp((d - 0.55) / 0.35);
  };
  return (
    <Frame bg={C.white}>
      <DotField lt={lt} color={BLUE} gap={40} r={4.4} mask={mask} />
      <div
        className="cx-abs"
        style={{ inset: 0, display: "grid", placeItems: "center" }}
      >
        <div
          style={{
            fontSize: 104,
            letterSpacing: "-0.035em",
            color: C.black,
            whiteSpace: "nowrap",
          }}
        >
          {words.map((x, i) => {
            const p = easeOutCubic(span(t, 0.1 + i * 0.08, 0.6 + i * 0.08));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.24em",
                  color: x.blue ? BLUE : C.black,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 30}px)`,
                }}
              >
                {x.w}
              </span>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

/* ----------------------------------------------------------- testimonial -- */

export function Testimonial({ lt }: TileProps) {
  const t = loop(lt, 5);
  const quote = COPY.quote;
  const words = quote.split(" ");
  return (
    <Frame bg={C.white}>
      <div className="cx-abs" style={{ left: 200, top: 250, width: 1500 }}>
        <div
          style={{ fontSize: 150, lineHeight: 0.6, color: BLUE, height: 90 }}
        >
          &ldquo;
        </div>
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.16,
            letterSpacing: "-0.025em",
            color: C.black,
          }}
        >
          {words.map((w, i) => {
            const p = easeOutCubic(span(t, 0.1 + i * 0.04, 0.5 + i * 0.04));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.25em",
                  opacity: 0.12 + 0.88 * p,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div
          className="cx-mono"
          style={{
            marginTop: 56,
            fontSize: 30,
            color: C.textMuted,
            letterSpacing: "0.02em",
          }}
        >
          {COPY.attribution.toUpperCase()}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------ black logo -- */

export function CoverDark({ lt }: TileProps) {
  const t = loop(lt, 4.8);
  return (
    <Frame bg={C.black}>
      <DotField
        lt={lt}
        color="rgba(255,255,255,0.16)"
        gap={48}
        r={3.2}
        twinkle={0.05}
        seed={11}
      />
      <div
        className="cx-abs"
        style={{ inset: 0, display: "grid", placeItems: "center" }}
      >
        <div
          style={{ padding: "40px 60px", background: C.black, borderRadius: 36 }}
        >
          <Logo p={span(t, 0.2, 1.4)} height={100} color={C.white} />
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------------- end card -- */

export function EndCard({ lt }: TileProps) {
  /* The dots arrive as a ripple from the centre, then the mark, then the line. */
  const ripple = (x: number, y: number) => {
    const d = Math.hypot(x - 960, y - 540) / 1100;
    return easeOutCubic(span(lt, d * 0.7, d * 0.7 + 0.35));
  };
  const line = easeOutCubic(span(lt, 0.75, 1.25));
  const url = easeOutCubic(span(lt, 0.95, 1.45));
  return (
    <Frame bg={BLUE}>
      <DotField
        lt={lt}
        color="rgba(255,255,255,0.3)"
        gap={48}
        r={3.6}
        twinkle={0.05}
        seed={21}
        mask={ripple}
      />
      <div
        className="cx-abs"
        style={{ inset: 0, display: "grid", placeItems: "center" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
            padding: "56px 80px",
            background: BLUE,
            borderRadius: 40,
          }}
        >
          <Logo p={span(lt, 0.1, 1.1)} height={112} />
          <div
            style={{
              fontSize: 52,
              color: C.white,
              letterSpacing: "-0.02em",
              opacity: line,
              transform: `translateY(${(1 - line) * 18}px)`,
            }}
          >
            {COPY.headline}
          </div>
        </div>
      </div>
      <div
        className="cx-abs cx-mono"
        style={{
          left: 0,
          right: 0,
          bottom: 84,
          textAlign: "center",
          fontSize: 28,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.78)",
          opacity: url,
        }}
      >
        {COPY.url.toUpperCase()}
      </div>
    </Frame>
  );
}

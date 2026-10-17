"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { HERO_DATA_FLOW_ANCHOR_ATTRIBUTE } from "./hero-data-flow-anchor";

/** What the flow tells: raw bytes scraped into clean output, or sources read into a cited answer. */
export type HeroDataFlowVariant = "scrape" | "answers";

const MIN_SIDE_WIDTH = 120;
const PORT_GAP = 28;
const DOT_RADIUS = 2.4;
const RING_STROKE_OPACITY = 0.55;
const HOLLOW_EVERY = 5;
const ARC_STEPS = 160;

const STRANDS_PER_SIDE = 6;
const STRAND_DOT_SPACING = 17;
const STRAND_SPEED = 36;
const STRAND_CONVERGE_FROM = 0.7;

const PORT_SPAN_MAX = 250;
const PORT_SPAN_SIDE_SHARE = 0.62;

const PORT_HALO_RADIUS = 16;

const GLYPH_SIZE = 11;
// Doto is monospaced, each letter three fifths of its size wide.
const GLYPH_ADVANCE = GLYPH_SIZE * 0.6;
const GLYPH_PITCH_X = 11;
const GLYPH_PITCH_Y = 13;
const GLYPH_OPACITY = 0.5;
const GLYPH_ZERO_SHARE = 0.8;
const CLUSTER_FADE_IN_S = 0.8;
const CLUSTER_FADE_OUT_S = 1;
const CLUSTER_DRIFT = 4;
const CLUSTERS_PER_SIDE: Record<HeroDataFlowVariant, Record<Side, number>> = {
  scrape: { inflow: 3, outflow: 3 },
  answers: { inflow: 2, outflow: 2 },
};

const DEFAULT_SOURCES = ["docs", "blog", "news", "changelog", "github", "reviews"];
const SOURCE_READ_INTERVAL_S = 1.1;
const SOURCE_CHIP = { height: 20, paddingX: 9, marker: 3, markerGap: 7, dotGap: 4 };
const SOURCE_SPREAD = 1.15;
const SOURCE_BEND = 0.25;
const SOURCE_LIT_SECONDS = 1.7;

const CITATION_STRANDS = 3;
const CITATION_RATE = 0.07;
const CITATION_CHIP = { height: 16, paddingX: 5 };

const TYPE_RATE = 22;
const TYPED_HOLD_S = 2.6;
const CURSOR_BLINK_S = 0.5;
const DEFAULT_REQUESTS = [["> How does Mintlify", "  use Context.dev?"], ["> what do they build", "  with it?"], ["> cite every source"]];
// The fields the story on the demo writes, so the answer leaving it is the one it shows.
const DEFAULT_ANSWER = ['"company": "Mintlify",', '"uses": "brand context",', '"for": "branded docs sites",', '"sources": 3'];

/** The words the `answers` flow shows: the sources it reads, the questions it types, the answer fields it sends on. */
interface FlowCopy {
  sources: string[];
  requests: string[][];
  answer: string[];
}

type Side = "inflow" | "outflow";

interface Point {
  x: number;
  y: number;
}

interface FlowGeometry {
  width: number;
  height: number;
  midY: number;
  inPort: Point;
  outPort: Point;
  amplitude: number;
  portSpan: number;
}

interface Strand {
  amplitude: number;
  frequency: number;
  phase: number;
  drift: number;
  offset: number;
  size: number;
  flow: number;
}

interface Glyph {
  x: number;
  y: number;
  char: string;
  appearsAt: number;
  /** When a binary digit next flips; typed text never does. */
  nextFlipAt?: number;
}

interface GlyphCluster {
  side: Side;
  bornAt: number;
  diesAt: number;
  glyphs: Glyph[];
  /** Where the typing cursor sits after each glyph, for text that is typed out rather than scattered. */
  typed?: boolean;
  /** The text a typed cluster spells, so the same line is never typed twice at once. */
  lines?: string[];
}

interface Source {
  label: string;
  strand: Strand;
  /** Where the source's fiber leaves its chip: the chip's right edge, halfway down. */
  anchor: Point;
  chipLeft: number;
  readAt: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const randomSign = () => (Math.random() < 0.5 ? -1 : 1);
const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

// The demo the flow runs through: the element marked with the anchor attribute, or a library Hero's media frame.
function findAnchor(scope: HTMLElement) {
  return scope.querySelector(`[${HERO_DATA_FLOW_ANCHOR_ATTRIBUTE}]`) ?? scope.querySelector("[data-slot='hero-media']");
}

function measureGeometry(section: HTMLElement, scope: HTMLElement): FlowGeometry | null {
  const anchor = findAnchor(scope);
  if (!anchor) return null;
  const origin = section.getBoundingClientRect();
  const card = anchor.getBoundingClientRect();
  const left = card.left - origin.left;
  const right = card.right - origin.left;
  if (left < MIN_SIDE_WIDTH || origin.width - right < MIN_SIDE_WIDTH) return null;
  const midY = card.top - origin.top + card.height / 2;
  const sideWidth = Math.min(left, origin.width - right);
  const portSpan = Math.min(card.height * 0.55, sideWidth * PORT_SPAN_SIDE_SHARE, PORT_SPAN_MAX);
  return {
    width: origin.width,
    height: origin.height,
    midY,
    inPort: { x: left - PORT_GAP, y: midY },
    outPort: { x: right + PORT_GAP, y: midY },
    amplitude: portSpan * 0.85,
    portSpan,
  };
}

// Every strand rides its own wave, so the braid comes from the overlap of clean dotted lines rather than from jitter.
function createStrands(): Strand[] {
  const strands: Strand[] = [];
  for (let index = 0; index < STRANDS_PER_SIDE; index++) {
    const offset = randomBetween(-0.4, 0.4);
    strands.push({
      amplitude: randomBetween(0.4, 1 - Math.abs(offset)) * randomSign(),
      frequency: randomBetween(0.45, 0.75),
      phase: randomBetween(0, Math.PI * 2),
      drift: randomBetween(0.12, 0.28) * randomSign(),
      offset,
      size: randomBetween(0.8, 1.15),
      flow: randomBetween(0, STRAND_DOT_SPACING * HOLLOW_EVERY),
    });
  }
  return strands;
}

const chipWidth = (label: string) => SOURCE_CHIP.paddingX * 2 + SOURCE_CHIP.marker * 2 + SOURCE_CHIP.markerGap + label.length * GLYPH_ADVANCE;

// The chips stack down the left side in a staggered column, top to bottom, so their fibers fan into the port like a bundle.
function placeSources(labels: string[], geometry: FlowGeometry, strands: Strand[], previous: Source[]): Source[] {
  const side = geometry.inPort.x;
  return labels.map((label, index) => {
    const width = chipWidth(label);
    const stagger = index % 2 === 0 ? 0.3 : 0.48;
    const right = Math.min(Math.max(side * stagger, width + 12), side - geometry.portSpan * 0.6);
    const y = geometry.midY + geometry.amplitude * SOURCE_SPREAD * (labels.length > 1 ? (index / (labels.length - 1)) * 2 - 1 : 0);
    return { label, strand: strands[index], anchor: { x: right, y }, chipLeft: right - width, readAt: previous[index]?.readAt ?? -Infinity };
  });
}

// u runs from the hero's outer edge (0) to the port (1), on both sides, and every strand gathers into the port near the end.
function strandPoint(strand: Strand, u: number, port: Point, outerX: number, geometry: FlowGeometry, time: number): Point {
  const waveY = geometry.midY + geometry.amplitude * (strand.offset + strand.amplitude * Math.sin(2 * Math.PI * strand.frequency * u + strand.phase + strand.drift * time));
  return { x: lerp(outerX, port.x, u), y: lerp(waveY, port.y, smoothstep((u - STRAND_CONVERGE_FROM) / (1 - STRAND_CONVERGE_FROM)) ** 1.5) };
}

// A source's fiber leaves its chip and enters the port level, easing between their heights, with a slow sway in between.
function sourcePoint(source: Source, u: number, port: Point, geometry: FlowGeometry, time: number): Point {
  const { anchor, strand } = source;
  const sway = Math.sin(Math.PI * u) * geometry.amplitude * SOURCE_BEND * strand.amplitude * Math.sin(2 * Math.PI * strand.frequency * u + strand.phase + strand.drift * time);
  return { x: lerp(anchor.x, port.x, u), y: lerp(anchor.y, port.y, smoothstep(u)) + sway };
}

function strandOpacity(u: number) {
  return (0.3 + 0.7 * smoothstep(u / 0.35)) * (1 - 0.6 * smoothstep((u - 0.85) / 0.15));
}

function sourceOpacity(u: number) {
  return (0.35 + 0.65 * smoothstep(u / 0.2)) * (1 - 0.6 * smoothstep((u - 0.85) / 0.15));
}

function drawDot(context: CanvasRenderingContext2D, point: Point, radius: number, opacity: number, hollow = false) {
  if (opacity <= 0.01) return;
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  if (hollow) {
    context.globalAlpha = opacity * RING_STROKE_OPACITY;
    context.stroke();
  } else {
    context.globalAlpha = opacity;
    context.fill();
  }
}

// Dots are laid along the wave by arc length, so a strand reads as an evenly dotted line whether it runs flat or steep.
function drawStrandDots(context: CanvasRenderingContext2D, strand: Strand, spacing: number, pointAt: (u: number) => Point, opacityAt: (u: number) => number) {
  const stepU = 1 / ARC_STEPS;
  const firstId = -Math.floor(strand.flow / spacing);
  let previous = pointAt(0);
  let travelled = 0;
  let nextAt = strand.flow % spacing;
  let index = 0;
  for (let step = 1; step <= ARC_STEPS; step++) {
    const u = step * stepU;
    const point = pointAt(u);
    const segment = Math.hypot(point.x - previous.x, point.y - previous.y);
    while (segment > 0 && travelled + segment >= nextAt) {
      const t = (nextAt - travelled) / segment;
      const hollow = (((firstId + index) % HOLLOW_EVERY) + HOLLOW_EVERY) % HOLLOW_EVERY === 0;
      drawDot(context, { x: lerp(previous.x, point.x, t), y: lerp(previous.y, point.y, t) }, DOT_RADIUS * strand.size, opacityAt(u - stepU + stepU * t), hollow);
      index++;
      nextAt += spacing;
    }
    travelled += segment;
    previous = point;
  }
}

// A dotted capsule, its dots made from a round-capped dash so they sit evenly whatever the capsule's size.
function drawDottedCapsule(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, opacity: number) {
  context.save();
  context.globalAlpha = opacity;
  context.lineWidth = 1.8;
  context.lineCap = "round";
  context.setLineDash([0, SOURCE_CHIP.dotGap]);
  context.beginPath();
  context.roundRect(left, top, width, height, height / 2);
  context.stroke();
  context.restore();
}

function drawPort(context: CanvasRenderingContext2D, port: Point) {
  drawDot(context, port, PORT_HALO_RADIUS, 0.1);
  drawDot(context, port, 4.5, 1);
  drawDot(context, port, 8.5, 1, true);
}

// A source lights while it is being read: its marker fills and its outline firms up, then both ease back.
function drawSources(context: CanvasRenderingContext2D, sources: Source[], port: Point, geometry: FlowGeometry, time: number) {
  for (const source of sources) {
    drawStrandDots(context, source.strand, STRAND_DOT_SPACING, (u) => sourcePoint(source, u, port, geometry, time), sourceOpacity);
    const reading = clamp01(1 - (time - source.readAt) / SOURCE_LIT_SECONDS);
    const top = source.anchor.y - SOURCE_CHIP.height / 2;
    const width = source.anchor.x - source.chipLeft;
    context.clearRect(source.chipLeft, top, width, SOURCE_CHIP.height);
    drawDottedCapsule(context, source.chipLeft, top, width, SOURCE_CHIP.height, 0.35 + 0.65 * reading);
    const marker = { x: source.chipLeft + SOURCE_CHIP.paddingX + SOURCE_CHIP.marker, y: source.anchor.y };
    if (reading > 0) drawDot(context, marker, SOURCE_CHIP.marker, 0.4 + 0.6 * reading);
    else drawDot(context, marker, SOURCE_CHIP.marker, 1, true);
    context.globalAlpha = 0.55 + 0.45 * reading;
    context.textAlign = "left";
    context.fillText(source.label, marker.x + SOURCE_CHIP.marker + SOURCE_CHIP.markerGap, source.anchor.y);
    context.textAlign = "center";
  }
}

// Citation tags ride three of the outgoing strands, so the answer leaving the monitor carries its sources with it.
function drawCitations(context: CanvasRenderingContext2D, strands: Strand[], port: Point, outerX: number, geometry: FlowGeometry, time: number) {
  strands.slice(0, CITATION_STRANDS).forEach((strand, index) => {
    const u = 1 - ((index / CITATION_STRANDS + time * CITATION_RATE) % 1);
    const point = strandPoint(strand, u, port, outerX, geometry, time);
    const opacity = smoothstep(u / 0.15) * smoothstep((0.92 - u) / 0.12);
    if (opacity <= 0.01) return;
    const label = `[${index + 1}]`;
    const width = label.length * GLYPH_ADVANCE + CITATION_CHIP.paddingX * 2;
    const left = point.x - width / 2;
    const top = point.y - CITATION_CHIP.height / 2;
    context.clearRect(left, top, width, CITATION_CHIP.height);
    drawDottedCapsule(context, left, top, width, CITATION_CHIP.height, opacity);
    context.globalAlpha = opacity;
    context.fillText(label, point.x, point.y);
  });
}

function sideBounds(side: Side, geometry: FlowGeometry) {
  return side === "inflow" ? { left: 0, right: geometry.inPort.x } : { left: geometry.outPort.x, right: geometry.width };
}

function spawnBinaryCluster(side: Side, geometry: FlowGeometry, now: number): GlyphCluster {
  const bounds = sideBounds(side, geometry);
  const center = {
    x: lerp(bounds.left, bounds.right, randomBetween(0.1, 0.8)),
    y: geometry.midY + randomBetween(-1.35, 0.9) * geometry.amplitude,
  };
  const radiusX = Math.round(randomBetween(3, 7));
  const radiusY = Math.round(randomBetween(2, 4));
  const glyphs: Glyph[] = [];
  for (let row = -radiusY; row <= radiusY; row++) {
    for (let column = -radiusX; column <= radiusX; column++) {
      const distance = Math.hypot(column / radiusX, row / radiusY) + (Math.random() - 0.5) * 0.6;
      if (distance > 1 || Math.random() < 0.45) continue;
      const x = center.x + column * GLYPH_PITCH_X;
      if (x < bounds.left + GLYPH_PITCH_X || x > bounds.right - GLYPH_PITCH_X) continue;
      glyphs.push({
        x,
        y: center.y + row * GLYPH_PITCH_Y,
        char: Math.random() < GLYPH_ZERO_SHARE ? "0" : "1",
        appearsAt: now + randomBetween(0, 1),
        nextFlipAt: now + randomBetween(0.6, 3),
      });
    }
  }
  return { side, bornAt: now, diesAt: now + randomBetween(4, 7), glyphs };
}

// Text typed out a letter at a time, held, then faded: the question on the way in, fields of the answer on the way out.
function spawnTypedCluster(copy: FlowCopy, side: Side, geometry: FlowGeometry, now: number, others: GlyphCluster[]): GlyphCluster | null {
  const showing = new Set(others.filter((other) => other.side === side).map((other) => other.lines?.[0]));
  const options = side === "inflow" ? copy.requests.filter((request) => !showing.has(request[0])) : copy.answer.length ? [pickAnswerLines(copy.answer)] : [];
  if (options.length === 0) return null;
  const lines = pickRandom(options);
  const bounds = sideBounds(side, geometry);
  const width = Math.max(...lines.map((line) => line.length)) * GLYPH_ADVANCE;
  const room = bounds.right - bounds.left - width - 24;
  if (room < 0) return null;
  const height = lines.length * GLYPH_PITCH_Y;
  // Above or below the flow's thickest part, never across the port, and clear of any text already showing. On the way
  // in that means beyond the column of source chips, so the question never sits on a source.
  const reach = side === "inflow" ? SOURCE_SPREAD * geometry.amplitude + SOURCE_CHIP.height + randomBetween(4, 24) : randomBetween(1.05, 1.4) * geometry.amplitude;
  const band = randomSign() * reach;
  const top = geometry.midY + band - (band < 0 ? height : 0);
  if (others.some((other) => other.side === side && Math.abs(other.glyphs[0].y - top) < height + GLYPH_PITCH_Y * 2)) return null;
  const left = bounds.left + 12 + Math.random() * room;
  const glyphs: Glyph[] = [];
  let typedAt = now + 0.3;
  lines.forEach((line, row) => {
    [...line].forEach((char, column) => {
      typedAt += 1 / TYPE_RATE;
      if (char !== " ") glyphs.push({ x: left + (column + 0.5) * GLYPH_ADVANCE, y: top + (row + 0.5) * GLYPH_PITCH_Y, char, appearsAt: typedAt });
    });
    typedAt += 0.25;
  });
  return { side, bornAt: now, diesAt: typedAt + TYPED_HOLD_S, glyphs, typed: true, lines };
}

function pickAnswerLines(answer: string[]) {
  const start = Math.floor(Math.random() * Math.max(1, answer.length - 1));
  return answer.slice(start, start + 2);
}

function updateClusters(clusters: GlyphCluster[], geometry: FlowGeometry, now: number, variant: HeroDataFlowVariant, copy: FlowCopy) {
  const alive = clusters.filter((cluster) => cluster.diesAt > now);
  for (const side of ["inflow", "outflow"] as const) {
    const count = alive.filter((cluster) => cluster.side === side).length;
    if (count >= CLUSTERS_PER_SIDE[variant][side] || Math.random() >= 0.02) continue;
    const cluster = variant === "scrape" ? spawnBinaryCluster(side, geometry, now) : spawnTypedCluster(copy, side, geometry, now, alive);
    if (cluster && cluster.glyphs.length > 0) alive.push(cluster);
  }
  for (const cluster of alive) {
    for (const glyph of cluster.glyphs) {
      if (glyph.nextFlipAt === undefined || now < glyph.nextFlipAt) continue;
      glyph.char = glyph.char === "0" ? "1" : "0";
      glyph.nextFlipAt = now + randomBetween(0.5, 2.5);
    }
  }
  return alive;
}

function drawClusters(context: CanvasRenderingContext2D, clusters: GlyphCluster[], now: number) {
  for (const cluster of clusters) {
    const presence = smoothstep((now - cluster.bornAt) / CLUSTER_FADE_IN_S) * smoothstep((cluster.diesAt - now) / CLUSTER_FADE_OUT_S);
    const drift = cluster.typed ? 0 : (now - cluster.bornAt) * CLUSTER_DRIFT;
    let cursor: Glyph | null = null;
    for (const glyph of cluster.glyphs) {
      if (now < glyph.appearsAt) continue;
      context.globalAlpha = GLYPH_OPACITY * (cluster.typed ? 1.4 : 1) * presence;
      context.fillText(glyph.char, glyph.x + drift, glyph.y);
      cursor = glyph;
    }
    const lastGlyph = cluster.glyphs[cluster.glyphs.length - 1];
    const blinkOn = Math.floor(now / CURSOR_BLINK_S) % 2 === 0;
    if (cluster.typed && cursor && (cursor !== lastGlyph || blinkOn)) {
      context.globalAlpha = presence * 0.8;
      context.fillRect(cursor.x + GLYPH_ADVANCE / 2 + 1, cursor.y - GLYPH_SIZE / 2, GLYPH_ADVANCE - 1, GLYPH_SIZE);
    }
  }
}

function startFlow(canvas: HTMLCanvasElement, section: HTMLElement, scope: HTMLElement, variant: HeroDataFlowVariant, copy: FlowCopy, reducedMotion: boolean) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const style = getComputedStyle(canvas);
  let geometry: FlowGeometry | null = null;
  const inflow = createStrands();
  const outflow = createStrands();
  let sources: Source[] = [];
  let clusters: GlyphCluster[] = [];
  let nextReadAt = 0.6;
  let readOrder: number[] = [];
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let onScreen = false;

  const draw = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!geometry) return;
    const flowGeometry = geometry;
    context.fillStyle = style.color;
    context.strokeStyle = style.color;
    context.lineWidth = 1;
    context.font = `800 ${GLYPH_SIZE}px ${style.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    const { inPort, outPort, width } = flowGeometry;
    drawPort(context, inPort);
    drawPort(context, outPort);
    drawClusters(context, clusters, elapsed);
    if (variant === "answers") drawSources(context, sources, inPort, flowGeometry, elapsed);
    else for (const strand of inflow) drawStrandDots(context, strand, STRAND_DOT_SPACING, (u) => strandPoint(strand, u, inPort, 0, flowGeometry, elapsed), strandOpacity);
    for (const strand of outflow) drawStrandDots(context, strand, STRAND_DOT_SPACING, (u) => strandPoint(strand, u, outPort, width, flowGeometry, elapsed), strandOpacity);
    if (variant === "answers") drawCitations(context, outflow, outPort, width, flowGeometry, elapsed);
    context.globalAlpha = 1;
  };

  // Sources are read one at a time, in a fresh shuffled order each round, like the answers story's "Reading 3 sources".
  const readNextSource = () => {
    if (readOrder.length === 0) readOrder = [...copy.sources.keys()].sort(() => Math.random() - 0.5);
    const index = readOrder.pop();
    if (index !== undefined && sources[index]) sources[index].readAt = elapsed;
    nextReadAt = elapsed + SOURCE_READ_INTERVAL_S;
  };

  const advance = (seconds: number) => {
    if (!geometry) return;
    const cycle = STRAND_DOT_SPACING * HOLLOW_EVERY;
    for (const strand of inflow) strand.flow = (strand.flow + seconds * STRAND_SPEED * strand.size) % cycle;
    // The outflow's u also starts at the outer edge, so its dots step back along u to travel away from the card.
    for (const strand of outflow) strand.flow = (((strand.flow - seconds * STRAND_SPEED * strand.size) % cycle) + cycle) % cycle;
    if (variant === "answers" && elapsed >= nextReadAt) readNextSource();
    clusters = updateClusters(clusters, geometry, elapsed, variant, copy);
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const seconds = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
    lastTime = now;
    elapsed += seconds;
    advance(seconds);
    draw();
  };

  // The loop only runs while the flow is on screen and the tab is showing.
  const sync = () => {
    const shouldPlay = !reducedMotion && onScreen && !document.hidden;
    if (shouldPlay && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    } else if (!shouldPlay && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const fillStill = (flowGeometry: FlowGeometry) => {
    elapsed = 4;
    for (const side of ["inflow", "outflow"] as const) {
      for (let count = 0; count < CLUSTERS_PER_SIDE[variant][side]; count++) {
        const cluster = variant === "scrape" ? spawnBinaryCluster(side, flowGeometry, 0) : spawnTypedCluster(copy, side, flowGeometry, -60, clusters);
        if (cluster) clusters.push({ ...cluster, diesAt: Infinity });
      }
    }
  };

  const relayout = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(section.clientWidth * pixelRatio);
    canvas.height = Math.round(section.clientHeight * pixelRatio);
    geometry = measureGeometry(section, scope);
    sources = geometry && variant === "answers" ? placeSources(copy.sources, geometry, inflow, sources) : [];
    clusters = [];
    if (reducedMotion && geometry) fillStill(geometry);
    draw();
    canvas.dataset.ready = geometry ? "true" : "false";
  };

  relayout();
  const resizeObserver = new ResizeObserver(relayout);
  resizeObserver.observe(section);
  const anchor = findAnchor(scope);
  if (anchor) resizeObserver.observe(anchor);
  // The hero's entrance moves the card without resizing it, so the ports are measured again once it settles.
  scope.addEventListener("animationend", relayout);
  void document.fonts.load(`800 ${GLYPH_SIZE}px ${style.fontFamily}`).then(draw);

  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  visibility.observe(section);
  document.addEventListener("visibilitychange", sync);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibility.disconnect();
    document.removeEventListener("visibilitychange", sync);
    scope.removeEventListener("animationend", relayout);
  };
}

/**
 * The hero's data-flow backdrop, on either side of the demo (the element marked with the anchor attribute, or a
 * library Hero's media frame); on screens too narrow to leave room beside it, nothing is drawn. `scrape`: braided
 * dotted strands and flickering binary run in from the left edge and out to the right. `answers`: labeled sources are
 * read one at a time, each lighting up as dots run down its own fiber into the demo while the question types itself
 * out; the answer leaves on the right as strands carrying citation tags, with its fields typed beside them. It draws in
 * `currentColor`, in the data face, and shows a still frame under reduced motion.
 */
export function HeroDataFlow({
  variant = "scrape",
  sources = DEFAULT_SOURCES,
  requests = DEFAULT_REQUESTS,
  answer = DEFAULT_ANSWER,
  className,
}: {
  variant?: HeroDataFlowVariant;
  /** With `answers`: the sources read on the left, one chip each. */
  sources?: string[];
  /** With `answers`: the questions typed on the left, each a list of lines. */
  requests?: string[][];
  /** With `answers`: the answer's fields, two at a time typed on the right. */
  answer?: string[];
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const copyKey = JSON.stringify([sources, requests, answer]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return;
    const scope = section.closest<HTMLElement>("[data-slot='hero'], section") ?? section;
    const [copySources, copyRequests, copyAnswer] = JSON.parse(copyKey) as [string[], string[][], string[]];
    const copy = variant === "answers" ? { sources: copySources, requests: copyRequests, answer: copyAnswer } : { sources: [], requests: [], answer: [] };
    return startFlow(canvas, section, scope, variant, copy, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [variant, copyKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-ready="false"
      className={cn(
        "pointer-events-none absolute inset-0 size-full font-data text-brand opacity-0 transition-opacity duration-700 ease-out data-[ready=true]:opacity-100 motion-reduce:transition-none",
        className,
      )}
    />
  );
}

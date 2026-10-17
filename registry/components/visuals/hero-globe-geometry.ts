export const RADIUS = 100;
const MERIDIAN_STEP_DEGREES = 15;
// Only the crown shows under the hero, so the parallels are listed for it rather than stepped round the whole sphere.
const PARALLEL_LATITUDES = [75, 60, 50];
const SAMPLES = 96;
export const VIEWBOX_SIZE = RADIUS * 2 + 2;
export const WIDTH = "min(106rem,200vw)";

/**
 * How high the globe's crown rises into the hero. Set on the hero (or anything around the globe and its stats) to place
 * other layers against the crown; HeroGlobe and HeroGlobeStats carry it themselves by default.
 */
export const HERO_GLOBE_RISE_CLASS = "[--hero-globe-rise:11rem] sm:[--hero-globe-rise:15rem]";

interface Projected {
  x: number;
  y: number;
  facing: boolean;
}

// Orthographic projection seen side-on at the equator: the pole sits on the silhouette's crown, the meridians arc down
// from it and the parallels flatten into straight lines.
function project(latitude: number, longitude: number): Projected {
  const x = RADIUS * Math.cos(latitude) * Math.sin(longitude);
  const y = -RADIUS * Math.sin(latitude);
  return { x, y, facing: Math.cos(longitude) >= 0 };
}

// Only the side facing the viewer is drawn; each run of visible samples becomes its own subpath.
function visiblePath(points: Projected[]) {
  let path = "";
  let drawing = false;
  for (const point of points) {
    if (!point.facing) {
      drawing = false;
      continue;
    }
    path += `${drawing ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    drawing = true;
  }
  return path;
}

function degrees(value: number) {
  return (value * Math.PI) / 180;
}

function sample(count: number, from: number, to: number) {
  return Array.from({ length: count + 1 }, (_, index) => from + ((to - from) * index) / count);
}

const MERIDIANS = sample(360 / MERIDIAN_STEP_DEGREES - 1, 0, 360 - MERIDIAN_STEP_DEGREES).map((longitude) =>
  visiblePath(sample(SAMPLES, -90, 90).map((latitude) => project(degrees(latitude), degrees(longitude)))),
);

const PARALLELS = PARALLEL_LATITUDES.map((latitude) => visiblePath(sample(SAMPLES * 2, -180, 180).map((longitude) => project(degrees(latitude), degrees(longitude)))));

export const GLOBE_PATH = [...MERIDIANS, ...PARALLELS].join("");

export interface GridPoint {
  latitude: number;
  longitude: number;
}

// Each trace runs along one grid line, from its first point to its last, so it lies on the wireframe the whole way.
const TRACES: GridPoint[][] = [
  [
    { latitude: 90, longitude: -15 },
    { latitude: 60, longitude: -15 },
  ],
  [
    { latitude: 60, longitude: -45 },
    { latitude: 60, longitude: -15 },
  ],
  [
    { latitude: 60, longitude: 0 },
    { latitude: 50, longitude: 0 },
  ],
  [
    { latitude: 60, longitude: 45 },
    { latitude: 50, longitude: 45 },
  ],
  [
    { latitude: 50, longitude: -45 },
    { latitude: 60, longitude: -45 },
  ],
  [
    { latitude: 60, longitude: 0 },
    { latitude: 60, longitude: 45 },
  ],
];

function pointOnGlobe({ latitude, longitude }: GridPoint) {
  return project(degrees(latitude), degrees(longitude));
}

function tracePath([from, to]: GridPoint[]) {
  const points = sample(SAMPLES / 2, 0, 1).map((t) =>
    pointOnGlobe({ latitude: from.latitude + (to.latitude - from.latitude) * t, longitude: from.longitude + (to.longitude - from.longitude) * t }),
  );
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join("");
}

export const TRACE_SHAPES = TRACES.map((trace) => ({ path: tracePath(trace), from: pointOnGlobe(trace[0]), to: pointOnGlobe(trace[1]) }));

export const NODES = Array.from(new Map(TRACES.flat().map((point) => [`${point.latitude === 90 ? 90 : `${point.latitude}:${point.longitude}`}`, pointOnGlobe(point)])).values());

/** Where a grid point lands in the hero: its distance in from the hero's center line and up from the hero's foot. */
export function heroGlobePointPlacement(point: GridPoint) {
  const { x, y } = pointOnGlobe(point);
  const unit = `(${WIDTH} / ${VIEWBOX_SIZE})`;
  return {
    fromCenter: `(${Math.abs(x).toFixed(2)} * ${unit})`,
    fromFoot: `(var(--hero-globe-rise) - ${(y + RADIUS + 1).toFixed(2)} * ${unit})`,
  };
}

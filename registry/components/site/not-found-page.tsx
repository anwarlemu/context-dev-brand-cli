"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The site's 404: a black page with the logo in its corner and, centered, the status code in large blue dots, a white
// title, a muted line, a "Did you mean" suggestion for a mistyped address, two white outline pills and a quiet line of
// index links. `overlay` covers the whole window above any layout chrome, as the site's does.

// Doto's own digit grids, read from the font and drawn as round dots (the brand's dots are round).
const DIGITS: Record<string, string[]> = {
  "0": ["..#..", ".#.#.", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "1": ["..#..", ".##..", "#.#..", "..#..", "..#..", "..#..", "#####"],
  "2": [".###.", "#...#", "....#", "..##.", ".#...", "#....", "#####"],
  "3": ["#####", "....#", "...#.", "..##.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "#.##.", "##..#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "#.##.", "##..#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "...#.", "..#..", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#..##", ".##.#", "....#", "...#.", ".##.."],
};
const COLUMNS = 5;
const ROWS = 7;
const ADVANCE = COLUMNS + 1;
const DOT_RADIUS = 0.4;

/** A number in round dots (digits only), in the current color. It fills its width; size it with a class. */
function DotNumber({ value, className }: { value: string; className?: string }) {
  const characters = [...value].filter((character) => Object.hasOwn(DIGITS, character));
  const columns = Math.max(1, characters.length * ADVANCE - 1);
  return (
    <svg role="img" aria-label={value} viewBox={`0 0 ${columns} ${ROWS}`} className={cn("h-auto shrink-0", className)}>
      <g fill="currentColor">
        {characters.flatMap((character, index) =>
          DIGITS[character].flatMap((line, row) =>
            [...line].flatMap((mark, column) => (mark === "#" ? [<circle key={`${index}-${row}-${column}`} cx={index * ADVANCE + column + 0.5} cy={row + 0.5} r={DOT_RADIUS} />] : [])),
          ),
        )}
      </g>
    </svg>
  );
}

// Long paths are capped so a slug a few words off (another article) is never offered as the page that was meant.
const MAX_EDITS = 3;
// A shorthand like "wk" for "work" drops letters rather than changing them; it must keep enough of the word.
const MIN_ABBREVIATION_SHARE = 0.4;

function normalizePath(path: string) {
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // A malformed escape is matched as typed.
  }
  return decoded.toLowerCase().replace(/\/{2,}/g, "/").replace(/^\/|\/$/g, "");
}

/** Edits to turn one string into the other, counting a swap of two neighboring letters as one edit. */
function editDistance(from: string, to: string) {
  const rows = Array.from({ length: from.length + 1 }, (_, row) => [row, ...Array<number>(to.length).fill(0)]);
  for (let column = 1; column <= to.length; column++) rows[0][column] = column;
  for (let row = 1; row <= from.length; row++) {
    for (let column = 1; column <= to.length; column++) {
      const substitution = from[row - 1] === to[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + substitution);
      if (row > 1 && column > 1 && from[row - 1] === to[column - 2] && from[row - 2] === to[column - 1]) rows[row][column] = Math.min(rows[row][column], rows[row - 2][column - 2] + 1);
    }
  }
  return rows[from.length][to.length];
}

function isAbbreviationOf(typed: string, target: string) {
  if (typed.length < 2 || typed.length < target.length * MIN_ABBREVIATION_SHARE || typed[0] !== target[0]) return false;
  let position = 0;
  for (const letter of target) if (letter === typed[position]) position++;
  return position === typed.length;
}

/**
 * The known page a mistyped path most likely meant, or null when nothing is close enough. Catches swapped, missing,
 * extra and wrong letters (/pricng, /prcing, /priceing) and shorthands (/wk for /work); on a tie the earlier path in
 * `knownPaths` wins, so list the more important pages first.
 */
function findClosestPath(requested: string, knownPaths: readonly string[]): string | null {
  const typed = normalizePath(requested);
  if (!typed) return null;
  let best: { path: string; edits: number } | null = null;
  for (const path of knownPaths) {
    const target = normalizePath(path);
    if (!target) continue;
    if (target === typed) return path;
    const allowed = Math.min(MAX_EDITS, Math.max(1, Math.floor(target.length / 3)));
    const edits = editDistance(typed, target);
    if ((edits <= allowed || isAbbreviationOf(typed, target)) && (!best || edits < best.edits)) best = { path, edits };
  }
  return best?.path ?? null;
}

const INDEX_LINKS = "[&_a]:text-white/70 [&_a]:underline [&_a]:decoration-white/30 [&_a]:underline-offset-4 [&_a]:transition-[color,text-decoration-color] [&_a]:duration-150 [&_a]:ease-out [&_a:hover]:text-white [&_a:hover]:decoration-white motion-reduce:[&_a]:transition-none";

/**
 * The 404 page. `knownPaths` are the site's pages, most important first; the closest one to the requested path
 * (`pathname`, or the browser's address once mounted) is offered as "Did you mean". The suggestion's line keeps its
 * height either way, so nothing shifts when one appears. Pass two `pill-on-brand` buttons as `actions`, the second with
 * `border-white/40`.
 */
function NotFoundPage({
  code = "404",
  title,
  description,
  knownPaths = [],
  pathname,
  suggestionLabel = "Did you mean",
  actions,
  note,
  logo,
  homeHref = "/",
  homeLabel = "Home",
  overlay = false,
  className,
}: {
  code?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  knownPaths?: readonly string[];
  /** The requested path; read from the address bar after mount when left out. */
  pathname?: string;
  suggestionLabel?: React.ReactNode;
  actions?: React.ReactNode;
  /** The quiet line at the foot (links to the sitemap and indexes); its links are underlined. */
  note?: React.ReactNode;
  /** The logo mark, in white (it inherits the text color). */
  logo?: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
  /** Covers the window, above any layout chrome. */
  overlay?: boolean;
  className?: string;
}) {
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  React.useEffect(() => {
    setSuggestion(findClosestPath(pathname ?? window.location.pathname, knownPaths));
  }, [pathname, knownPaths]);

  return (
    <div
      data-slot="not-found-page"
      className={cn("isolate flex flex-col bg-inverse text-white", overlay ? "fixed inset-0 z-2000 overflow-y-auto" : "relative min-h-svh w-full", className)}
    >
      {logo && (
        <a
          href={homeHref}
          aria-label={homeLabel}
          className="absolute top-6 left-6 rounded-card text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-16 md:left-18 [&>img]:h-[calc(var(--spacing)*9.2)] [&>img]:w-auto [&>svg]:h-[calc(var(--spacing)*9.2)] [&>svg]:w-auto"
        >
          {logo}
        </a>
      )}
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-24 text-center">
        <DotNumber value={code} className="my-3 w-[min(calc(var(--spacing)*123),80vw)] text-fg-brand" />
        <h1 className="text-[calc(var(--ds-text-h4)+var(--ds-space-1))] leading-heading font-normal tracking-snug text-balance text-white md:text-[calc(var(--ds-text-h3)+var(--ds-space-1))]">{title}</h1>
        <div className="flex flex-col items-center gap-2">
          {description && <p className="max-w-(--ds-layout-text) text-body-lg leading-normal text-pretty text-white/70 md:text-h5">{description}</p>}
          <p aria-live="polite" className="h-6 text-body leading-6 text-white/70">
            {suggestion && (
              <>
                {suggestionLabel}{" "}
                <a href={suggestion} className="text-white underline decoration-white/40 underline-offset-4 transition-[text-decoration-color] duration-150 ease-out hover:decoration-white motion-reduce:transition-none">
                  {suggestion}
                </a>
                ?
              </>
            )}
          </p>
        </div>
        {actions && <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">{actions}</div>}
        {note && <p className={cn("max-w-176 pt-4 text-body leading-normal text-pretty text-white/50", INDEX_LINKS)}>{note}</p>}
      </div>
    </div>
  );
}

export { NotFoundPage, DotNumber, findClosestPath };

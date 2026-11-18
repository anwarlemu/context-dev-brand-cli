/* The reel's colors and copy, handed in by the video command before the bundle runs (window.__reel): colors resolved
   from tokens.css, copy from brand/assets/video.json and the command's flags. */

type Reel = {
  colors: Record<"brand" | "brandRing" | "blue10" | "blue20" | "white" | "black" | "neutral10" | "neutral80" | "neutral90" | "textMuted" | "ground", string>;
  copy: {
    name: string;
    headline: string;
    url: string;
    tagline: string;
    markdown: string;
    quote: string;
    attribution: string;
    statValue: number;
    statLabel: string;
    cardBlue: string;
    cardTop: [string, string];
    cardBottom: [string, string];
    pills: string[];
  };
};

const reel = (globalThis as unknown as { __reel: Reel }).__reel;
export const C = reel.colors;
export const COPY = reel.copy;

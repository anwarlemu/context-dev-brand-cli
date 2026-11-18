/* The reel page the video command opens in headless Chromium: window.__seek(t) draws the frame at t seconds and
   resolves once it is painted. */

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Frame } from "./frame";

const root = createRoot(document.getElementById("cx-stage")!);
const w = window as unknown as { __seek: (t: number) => Promise<void>; __reelReady: boolean };
w.__seek = (t: number) =>
  new Promise((resolve) => {
    flushSync(() => root.render(<Frame t={t} />));
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
document.fonts.ready.then(() => {
  w.__reelReady = true;
});

import { Path2D } from "@napi-rs/canvas";
import type { Ctx } from "./canvas.js";
import { pictureOf, type Picture } from "./picture.js";

/* The editor's built-in pictures (agd-playground src/components/context-og/draw.ts), drawn rather than shipped, so a
   design can show the dot shader without a picture of its own. */

/* Built-in pictures, drawn rather than shipped. */
export const SAMPLES: Record<string, (x: Ctx) => void> = {
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
    const L = (y: number, c: string) => {
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
    const k = new Path2D();
    k.arc(150, 150, 130, 0, Math.PI * 2);
    k.moveTo(205, 150);
    k.arc(150, 150, 55, 0, Math.PI * 2);
    k.rect(262, 124, 600, 48);
    k.rect(638, 172, 44, 64);
    k.rect(718, 172, 44, 46);
    k.rect(800, 172, 62, 84);
    x.fill(k, "evenodd");
    /* A lighter rim on the bow so the shading has something to hold. */
    x.strokeStyle = "#a9b6d4";
    x.lineWidth = 14;
    x.beginPath();
    x.arc(150, 150, 92, Math.PI * 0.9, Math.PI * 1.75);
    x.stroke();
  },
};

/* Samples are 600 square unless they say otherwise. */
export const SAMPLE_SIZE: Record<string, [number, number]> = { Key: [900, 300] };

/* A sample by name ("Globe" or "sample:Globe"), case-insensitive. */
export function sampleNames(): string[] {
  return Object.keys(SAMPLES);
}
export function samplePicture(name: string): Picture | undefined {
  const key = Object.keys(SAMPLES).find((k) => k.toLowerCase() === name.replace(/^sample:/i, "").toLowerCase());
  if (!key) return undefined;
  const [w, h] = SAMPLE_SIZE[key] ?? [600, 600];
  return pictureOf(w, h, SAMPLES[key], `sample:${key}`);
}

"use client";

import * as React from "react";
import { Check, Copy, Download, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { DotShaderImage } from "@/components/visuals/dot-shader-image";
import {
  countDots,
  type DotShaderSurface,
  type DotStates,
  dotsSvg,
  loadShaderImage,
  parseShadedDots,
  resolveSurfaceColors,
  SHADER_HEIGHT,
  SHADER_WIDTH,
  shadeImage,
  shadeImageSrc,
} from "@/components/visuals/image-dot-shader";

/**
 * The brand page's "Shader Graphics" playground: a large preview of the picked picture on a white, blue or black
 * surface, with copy SVG and SVG or PNG downloads under it, and a panel to switch the surface, pick a sample or shade
 * your own image (upload, drop it on the preview or paste it). Everything is shaded in the browser.
 */
export type DotShaderSample = {
  id: string;
  label: string;
  /** An SVG the shader wrote (its `filled` and `hollow` paths are read back), or any image to shade. */
  src?: string;
  /** The SVG's text, instead of fetching `src`. */
  svg?: string;
};

const SURFACE_OPTIONS: { surface: DotShaderSurface; label: string }[] = [
  { surface: "white", label: "White" },
  { surface: "blue", label: "Blue" },
  { surface: "black", label: "Black" },
];

const TILE: Record<DotShaderSurface, string> = { white: "bg-white ring-1 ring-hairline", blue: "bg-brand", black: "bg-black" };
const ON_SURFACE_TEXT: Record<DotShaderSurface, string> = { white: "text-fg-brand", blue: "text-on-brand", black: "text-white" };
const RING = "-m-2 rounded-card bg-ring-tint p-2";
const PANEL = "flex h-full min-w-0 flex-col gap-6 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8";
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring";
const OPTION_TILE = cn(
  "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-shell transition-shadow duration-200 ease-out motion-reduce:transition-none",
  FOCUS,
);
const SELECTED_TILE = "ring-2 ring-brand ring-offset-2";
const ACTION = "h-10 min-w-0 gap-2 px-3 [&_svg]:size-4";

const UPLOAD = "upload";
const PNG_SCALE = 2;

const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("unreadable file"));
    reader.readAsDataURL(file);
  });
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  // Safari ignores a programmatic click on an <a download> that is not in the document.
  document.body.append(link);
  link.click();
  link.remove();
  // Safari and Firefox start the download after click() returns, so revoking straight away can cancel it.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function svgToPngBlob(svg: string) {
  const image = await loadShaderImage(svgDataUrl(svg));
  const canvas = document.createElement("canvas");
  canvas.width = SHADER_WIDTH * PNG_SCALE;
  canvas.height = SHADER_HEIGHT * PNG_SCALE;
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png export failed"))), "image/png"));
}

function baseName(filename: string) {
  return (
    filename
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "image"
  );
}

function firstImageFile(files: Iterable<File> | ArrayLike<File> | null | undefined) {
  return Array.from(files ?? []).find((file) => file.type.startsWith("image/"));
}

// Safari and Firefox often leave clipboardData.files empty for copied screenshots and page images, and only expose
// them as items.
function clipboardFiles(clipboard: DataTransfer | null) {
  const itemFiles = Array.from(clipboard?.items ?? [])
    .flatMap((item) => (item.kind === "file" ? [item.getAsFile()] : []))
    .filter((file): file is File => file !== null);
  return [...Array.from(clipboard?.files ?? []), ...itemFiles];
}

// A sample is an SVG the shader wrote, read straight back into dots; anything else is shaded like an upload.
async function loadSample(sample: DotShaderSample): Promise<DotStates | null> {
  const text = sample.svg ?? (sample.src && /\.svg(\?|#|$)/i.test(sample.src) ? await fetch(sample.src).then((response) => (response.ok ? response.text() : "")) : "");
  const parsed = text ? parseShadedDots(text) : null;
  if (parsed && countDots(parsed) > 0) return parsed;
  return sample.src ? shadeImageSrc(sample.src) : null;
}

export function DotShaderPlayground({
  samples,
  defaultSample,
  defaultSurface = "blue",
  title = "Shade your own image",
  description = "Start from a sample or upload a logo, icon or product shot, then download it for a post or deck.",
  className,
}: {
  samples: DotShaderSample[];
  /** The sample shown first (its id); the first sample by default. */
  defaultSample?: string;
  defaultSurface?: DotShaderSurface;
  title?: string;
  description?: string;
  className?: string;
}) {
  const root = React.useRef<HTMLDivElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const latestShade = React.useRef(0);
  const [sampleDots, setSampleDots] = React.useState<Record<string, DotStates>>({});
  const [upload, setUpload] = React.useState<{ name: string; states: DotStates } | null>(null);
  const [selection, setSelection] = React.useState(defaultSample ?? samples[0]?.id ?? UPLOAD);
  const [surface, setSurface] = React.useState<DotShaderSurface>(defaultSurface);
  const [isDragging, setIsDragging] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const { hasCopied, copy } = useCopy();

  // Keyed on the samples' content, so a parent that passes a new array each render does not refetch them.
  const sampleKey = samples.map((sample) => `${sample.id}:${sample.src ?? ""}:${sample.svg?.length ?? 0}`).join("|");
  const latestSamples = React.useRef(samples);
  React.useEffect(() => {
    latestSamples.current = samples;
  }, [samples]);
  React.useEffect(() => {
    let current = true;
    for (const sample of latestSamples.current) {
      loadSample(sample)
        .then((states) => current && states && setSampleDots((loaded) => ({ ...loaded, [sample.id]: states })))
        .catch(() => {
          if (current) setMessage("A sample image could not be loaded. Try another sample or upload an image.");
        });
    }
    return () => {
      current = false;
    };
  }, [sampleKey]);

  const selectedStates = selection === UPLOAD ? upload?.states : sampleDots[selection];
  const selectedName = selection === UPLOAD ? (upload?.name ?? "image") : (samples.find((sample) => sample.id === selection)?.label ?? selection);
  const filename = `${baseName(selection === UPLOAD ? selectedName : selection)}-dots-on-${surface}`;
  // A file leaves the page, so it carries plain colors read from the brand tokens at the moment it is made.
  const fileSvg = () => (selectedStates ? dotsSvg(selectedStates, resolveSurfaceColors(surface, root.current ?? document.body)) : null);

  const shadeFile = React.useCallback(async (file: File | undefined) => {
    if (!file) {
      setMessage("Choose a PNG, JPG, SVG or WebP image.");
      return;
    }
    const request = ++latestShade.current;
    try {
      const image = await loadShaderImage(await readAsDataUrl(file));
      if (request !== latestShade.current) return;
      const states = shadeImage(image, image.naturalWidth || SHADER_WIDTH, image.naturalHeight || SHADER_HEIGHT);
      setMessage(countDots(states) === 0 ? "Nothing to shade. Try an image with a clear subject." : null);
      setUpload({ name: file.name, states });
      setSelection(UPLOAD);
    } catch {
      if (request === latestShade.current) setMessage("That image could not be read.");
    }
  }, []);

  React.useEffect(() => {
    const shadePastedImage = (event: ClipboardEvent) => {
      const file = firstImageFile(clipboardFiles(event.clipboardData));
      if (file) void shadeFile(file);
    };
    window.addEventListener("paste", shadePastedImage);
    return () => window.removeEventListener("paste", shadePastedImage);
  }, [shadeFile]);

  const downloadSvg = () => {
    const svg = fileSvg();
    if (svg) saveBlob(new Blob([svg], { type: "image/svg+xml" }), `${filename}.svg`);
  };

  const downloadPng = async () => {
    const svg = fileSvg();
    if (!svg) return;
    try {
      saveBlob(await svgToPngBlob(svg), `${filename}.png`);
    } catch {
      setMessage("The PNG could not be exported.");
    }
  };

  const copySvg = () => {
    const svg = fileSvg();
    if (svg) void copy(svg);
  };

  const pillOnSurface = (selected: boolean) => cn(ACTION, selected && "bg-blue-10");

  return (
    <div ref={root} data-slot="dot-shader-playground" className={cn("grid grid-cols-1 items-start gap-6 lg:grid-cols-3", className)}>
      <div className={cn(RING, "lg:col-span-2")}>
        <div className="flex flex-col gap-3">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void shadeFile(firstImageFile(event.dataTransfer.files));
            }}
            className={cn(
              "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card transition-shadow duration-200 ease-out motion-reduce:transition-none",
              TILE[surface],
              isDragging && "ring-2 ring-brand ring-offset-2",
            )}
          >
            <DotShaderImage states={selectedStates ?? null} surface={surface} alt={selectedStates ? `${selectedName} drawn in dots` : undefined} className="pointer-events-none size-full" />
            {isDragging && <span className={cn("pointer-events-none absolute text-body", ON_SURFACE_TEXT[surface])}>Drop to shade your image</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="pill-outline" size="sm" onClick={copySvg} disabled={!selectedStates} aria-label="Copy SVG code" className={ACTION}>
              {hasCopied ? <Check aria-hidden /> : <Copy aria-hidden />}
              <span aria-live="polite">{hasCopied ? "Copied" : "Copy SVG"}</span>
            </Button>
            <Button variant="pill-outline" size="sm" onClick={downloadSvg} disabled={!selectedStates} aria-label="Download as SVG" className={ACTION}>
              <Download aria-hidden />
              SVG
            </Button>
            <Button variant="pill-outline" size="sm" onClick={downloadPng} disabled={!selectedStates} aria-label="Download as PNG" className={ACTION}>
              <Download aria-hidden />
              PNG
            </Button>
          </div>
        </div>
      </div>
      <div className={RING}>
        <div className={PANEL}>
          <div className="flex flex-col gap-2">
            <h3 className="text-h4 font-normal text-fg">{title}</h3>
            <p className="text-body-sm text-fg-muted">{description}</p>
          </div>
          <fieldset>
            <legend className="mb-3 text-body-sm text-fg-muted">Background</legend>
            <div className="grid grid-cols-3 gap-2">
              {SURFACE_OPTIONS.map((option) => (
                <Button
                  key={option.surface}
                  variant="pill-outline"
                  size="sm"
                  aria-pressed={surface === option.surface}
                  onClick={() => setSurface(option.surface)}
                  className={pillOnSurface(surface === option.surface)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-body-sm text-fg-muted">Image</legend>
            <div className="grid grid-cols-3 gap-2">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  aria-pressed={selection === sample.id}
                  aria-label={sample.label}
                  title={sample.label}
                  onClick={() => setSelection(sample.id)}
                  className={cn(OPTION_TILE, TILE[surface], selection === sample.id && SELECTED_TILE)}
                >
                  <DotShaderImage states={sampleDots[sample.id] ?? null} surface={surface} className="size-full" />
                </button>
              ))}
              {upload && (
                <button
                  type="button"
                  aria-pressed={selection === UPLOAD}
                  aria-label={upload.name}
                  title={upload.name}
                  onClick={() => setSelection(UPLOAD)}
                  className={cn(OPTION_TILE, TILE[surface], selection === UPLOAD && SELECTED_TILE)}
                >
                  <DotShaderImage states={upload.states} surface={surface} className="size-full" />
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={cn(OPTION_TILE, "flex-col gap-1 bg-white text-fg-brand ring-1 ring-hairline transition-[background-color,box-shadow] hover:bg-blue-10")}
              >
                <ImagePlus className="size-5" aria-hidden />
                <span className="text-caption">{upload ? "Upload another" : "Upload"}</span>
              </button>
            </div>
          </fieldset>
          <div className="mt-auto flex flex-col gap-2">
            {message && (
              <p role="status" className="text-body-sm text-fg">
                {message}
              </p>
            )}
            <p className="text-caption text-fg-subtle">Drop an image on the preview or paste one. It stays in your browser. A PNG with a transparent background works best.</p>
          </div>
          <input
            ref={fileInput}
            tabIndex={-1}
            aria-hidden="true"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void shadeFile(firstImageFile(event.target.files));
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}

import { DotShaderPlayground, type DotShaderSample } from "@/components/visuals/dot-shader-playground";

// The brand page's samples: shader SVGs the playground reads back into dots.
const SAMPLES: DotShaderSample[] = [
  { id: "logomark", label: "Logomark", src: "/dot-shader/logomark.svg" },
  { id: "orbit", label: "Orbit", src: "/dot-shader/orbit.svg" },
  { id: "extract", label: "Extract", src: "/dot-shader/extract.svg" },
  { id: "pages", label: "Pages", src: "/dot-shader/pages.svg" },
  { id: "integration", label: "Integration", src: "/dot-shader/integration.svg" },
];

export function Site() {
  return <DotShaderPlayground samples={SAMPLES} defaultSample="integration" className="w-full" />;
}

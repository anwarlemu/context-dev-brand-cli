import { DotShaderImage } from "@/components/visuals/dot-shader-image";

const LOGOMARK = "/dot-shader/logomark-source.svg";

export function Site() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      <DotShaderImage src={LOGOMARK} surface="white" alt="The logomark drawn in dots" className="rounded-card ring-1 ring-hairline" />
      <DotShaderImage src={LOGOMARK} surface="blue" className="rounded-card" />
      <DotShaderImage src={LOGOMARK} surface="black" className="rounded-card" />
    </div>
  );
}

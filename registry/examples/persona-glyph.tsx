import { MenuGlyph, PersonaGlyph } from "@/components/visuals/persona-glyph";

const NAMES = ["scrape", "batches", "monitor", "theme", "team", "generate"] as const;

export function Site() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-3">
        {NAMES.map((name, i) => (
          <PersonaGlyph key={name} name={name} index={i} />
        ))}
      </div>
      <div className="flex gap-3">
        {NAMES.map((name) => (
          <MenuGlyph key={name} name={name} />
        ))}
      </div>
    </div>
  );
}

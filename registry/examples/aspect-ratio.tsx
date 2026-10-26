import { AspectRatio } from "@/components/ui/aspect-ratio";

// A page capture held at 16:9 while it loads, framed as the brand frames screenshots.
export function Site() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-card bg-subtle shadow-card">
        <div className="grid size-full place-items-center p-6 text-center">
          <div className="grid gap-1">
            <p className="text-body text-fg">stripe.com</p>
            <p className="text-body-sm text-fg-subtle">Screenshot captured at 1440 by 810</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}

// Logo tiles at 1:1 in a brand result.
export function Product() {
  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      {["Acme", "Globex", "Initech"].map((name) => (
        <AspectRatio key={name} ratio={1} className="overflow-hidden rounded-card bg-surface shadow-card">
          <div className="grid size-full place-items-center text-body-sm text-fg-muted">{name}</div>
        </AspectRatio>
      ))}
    </div>
  );
}

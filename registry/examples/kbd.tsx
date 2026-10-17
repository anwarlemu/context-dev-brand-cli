import { Kbd } from "@/components/ui/kbd";

export function Product() {
  return (
    <p className="flex items-center gap-1.5 text-body-sm text-fg-muted">
      Search with <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </p>
  );
}

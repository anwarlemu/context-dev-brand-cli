import { ScrollArea } from "@/components/ui/scroll-area";

export function Product() {
  return (
    <div className="flex h-48 w-64 flex-col rounded-card bg-surface shadow-card">
      <ScrollArea className="px-3 py-2 text-body-sm">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="py-1 text-fg-muted">
            Request {i + 1}
          </p>
        ))}
      </ScrollArea>
    </div>
  );
}

import { ScrollArea } from "@/components/ui/scroll-area";

export function Product() {
  return (
    <ScrollArea className="h-40 w-64 rounded-card bg-surface shadow-card">
      <div className="p-3 text-body-sm">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="py-1 text-fg-muted">
            Request {i + 1}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}

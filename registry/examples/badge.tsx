import { Badge } from "@/components/ui/badge";

export function Product() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Draft</Badge>
      <Badge variant="brand">Pro</Badge>
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning">Queued</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">v2</Badge>
    </div>
  );
}

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="chip">Fresh sources for RAG</Badge>
      <Badge variant="chip">Company news</Badge>
      <Badge variant="chip">Agent web search</Badge>
    </div>
  );
}

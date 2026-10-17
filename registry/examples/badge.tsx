import { Badge } from "@/components/ui/badge";

export function Product() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>paused</Badge>
      <Badge variant="brand">running</Badge>
      <Badge variant="success">completed</Badge>
      <Badge variant="warning">skipped</Badge>
      <Badge variant="destructive">failed</Badge>
      <Badge variant="tag">pricing</Badge>
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

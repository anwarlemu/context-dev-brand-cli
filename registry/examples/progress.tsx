import { Progress } from "@/components/ui/progress";

export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="flex justify-between text-caption text-fg-muted">
        <span>Credits used</span>
        <span className="tabular-nums">6,420 / 10,000</span>
      </div>
      <Progress value={64} />
    </div>
  );
}

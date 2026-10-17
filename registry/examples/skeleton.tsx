import { Skeleton } from "@/components/ui/skeleton";

export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

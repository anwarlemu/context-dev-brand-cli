import { CopyButton } from "@/components/ui/copy-button";

export function Product() {
  return (
    <div className="flex items-center gap-2 rounded-control bg-neutral-5 py-1 pr-1 pl-3 font-mono text-caption text-fg-muted">
      npm install context.dev
      <CopyButton value="npm install context.dev" label="Copy command" />
    </div>
  );
}

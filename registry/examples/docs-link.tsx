import { DocsLink } from "@/components/ui/docs-link";

export function Product() {
  return (
    <div className="flex flex-col gap-1">
      <DocsLink href="https://docs.context.dev" />
      <DocsLink href="https://docs.context.dev/monitors">Monitors guide</DocsLink>
    </div>
  );
}

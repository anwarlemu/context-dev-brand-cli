import { RingBackdrop } from "@/components/visuals/ring-backdrop";

export function Site() {
  return (
    <div className="relative mx-auto h-56 w-full max-w-xl overflow-hidden rounded-panel bg-brand">
      <RingBackdrop className="inset-3 rounded-[calc(var(--ds-radius-panel)-var(--ds-space-3))] text-white" />
      <div data-ring-clear="" className="absolute inset-x-12 top-1/2 h-16 -translate-y-1/2 rounded-card bg-surface" />
    </div>
  );
}

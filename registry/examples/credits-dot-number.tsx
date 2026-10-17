import { CreditsDotNumber } from "@/components/visuals/credits-dot-number";

export function Site() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-card bg-surface p-8 text-center shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]">
      <CreditsDotNumber value="1,000" className="w-full max-w-80" />
      <p className="text-body text-fg-muted">1,000 free credits every month. No card needed.</p>
    </div>
  );
}

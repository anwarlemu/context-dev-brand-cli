import * as React from "react";

import { cn } from "@/lib/utils";

// Never a blank panel: a glyph, the title at h4, one line of muted text (at most 480px), then the one next action.
function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="empty-state" className={cn("flex flex-col items-center px-8 py-16 text-center", className)}>
      {icon && <div className="mb-5 text-brand [&_svg]:size-10">{icon}</div>}
      <h3 className="text-h4 font-normal text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-120 text-body-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { EmptyState };

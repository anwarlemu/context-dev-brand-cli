import * as React from "react";

import { cn } from "@/lib/utils";

// The dashboard's page banner: a notice across the top of a page, blue 10 for news (`info`) or a soft red for trouble
// (`alert`), its title in medium weight, actions at the end.
const TONES = {
  info: "border-line bg-blue-10",
  alert: "border-alert/30 bg-alert/6",
} as const;

function Banner({
  tone = "info",
  title,
  actions,
  role,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & { tone?: keyof typeof TONES; title: React.ReactNode; actions?: React.ReactNode; role?: "status" | "alert" }) {
  return (
    <div
      role={role ?? (tone === "alert" ? "alert" : "status")}
      data-slot="banner"
      className={cn("flex flex-col gap-3 rounded-card border px-4 py-3 text-body-sm text-fg sm:flex-row sm:items-center sm:justify-between", TONES[tone], className)}
      {...props}
    >
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {children && <div className="mt-0.5 text-fg-muted">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export { Banner };

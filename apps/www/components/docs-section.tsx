import type { ComponentProps } from "react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { cn } from "@/lib/utils";

// The docs share one reading rhythm without changing the components shown in the library.
export function DocsSection({ className, ...props }: ComponentProps<typeof SiteSection>) {
  return <SiteSection className={cn("py-16 md:py-20", className)} {...props} />;
}

export function DocsHeading({ className, ...props }: ComponentProps<typeof SectionHeading>) {
  return <SectionHeading className={cn("gap-4", className)} {...props} />;
}

export function DocsSectionRule({ className, ...props }: ComponentProps<typeof SectionHeaderRule>) {
  return <SectionHeaderRule className={cn("mt-8 mb-8 md:mt-10 md:mb-10", className)} {...props} />;
}

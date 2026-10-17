import Link from "next/link";

import { Button } from "@/components/ui/button";
import { registryName } from "@www/lib/registry";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-surface/85 backdrop-blur-[var(--ds-space-4)]">
      <div className="mx-auto flex h-16 max-w-(--ds-layout-column-wide) items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-body text-fg">
          <span aria-hidden className="grid size-5 grid-cols-2 gap-0.5">
            <span className="rounded-sm bg-brand" />
            <span className="rounded-sm bg-brand/40" />
            <span className="rounded-sm bg-brand/40" />
            <span className="rounded-sm bg-brand" />
          </span>
          {registryName} UI
        </Link>
        <nav className="flex items-center gap-6 text-body-sm text-fg-nav">
          <Link href="/components" className="transition-colors duration-150 hover:text-fg">Components</Link>
          <Link href="/theme" className="transition-colors duration-150 hover:text-fg">Theme</Link>
          <Link href="/cli" className="transition-colors duration-150 hover:text-fg">CLI</Link>
          <Button asChild variant="pill" size="sm">
            <a href="https://github.com/anwarlemu/context-dev-brand-cli">GitHub</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

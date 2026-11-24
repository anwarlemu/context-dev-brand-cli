"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Hero } from "@/components/site/hero";
import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A careers page. The site has none, so it is built from library items only: the white Hero, then a SiteSection with a
// SectionHeading over the rule and the open roles as cards in the product grid's style (a white card in the soft blue
// ring, the title beside an outline pill, a line of description and hairline chips), grouped by team.

export type CareersRole = {
  title: string;
  team: string;
  location: string;
  /** Full time, contract... */
  type?: string;
  description?: string;
  href: string;
};

function RoleCard({ role, applyLabel }: { role: CareersRole; applyLabel: React.ReactNode }) {
  const details = [role.location, role.type].filter(Boolean) as string[];
  return (
    <li data-slot="careers-role" className="flex rounded-card bg-ring-tint p-2">
      <article className="flex flex-1 flex-col gap-4 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h4 className="min-w-0 text-h5 leading-snug font-normal text-fg">{role.title}</h4>
          <Button asChild variant="pill-outline" size="sm" className="shrink-0">
            <a href={role.href}>
              {applyLabel}
              <span className="sr-only"> for {role.title}</span>
              {/* The arrow stays where it is on hover; only the pill's fill changes. */}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
        {role.description && <p className="text-body leading-snug text-fg-secondary">{role.description}</p>}
        {details.length > 0 && (
          <ul aria-label="Details" className="mt-auto flex flex-wrap gap-1.5 leading-snug">
            {details.map((detail) => (
              <li key={detail}>
                <Badge variant="chip">{detail}</Badge>
              </li>
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

/**
 * The careers page: a hero (`title`, its blue `accent` phrases, `description`, `actions`), then the open roles grouped
 * by `team` in the order they first appear. With no roles, `emptyMessage` shows in their place. `note` is a line under
 * the roles (an open application).
 */
function CareersPage({
  title,
  accent,
  description,
  actions,
  rolesTitle = "Open roles",
  rolesAccent,
  rolesDescription,
  roles,
  applyLabel = "Apply",
  emptyMessage = "There are no open roles right now. Check back soon.",
  note,
  rolesId = "roles",
  className,
}: {
  title: string;
  accent?: string | string[];
  description?: React.ReactNode;
  /** Pills under the hero text; link one to `#roles`. */
  actions?: React.ReactNode;
  rolesTitle?: React.ReactNode;
  rolesAccent?: React.ReactNode;
  rolesDescription?: React.ReactNode;
  roles: readonly CareersRole[];
  applyLabel?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  note?: React.ReactNode;
  /** The roles section's id, for the hero's link. */
  rolesId?: string;
  className?: string;
}) {
  const headingId = React.useId();
  const teams = React.useMemo(() => {
    const groups = new Map<string, CareersRole[]>();
    for (const role of roles) groups.set(role.team, [...(groups.get(role.team) ?? []), role]);
    return [...groups];
  }, [roles]);

  return (
    <div data-slot="careers-page" className={cn("w-full", className)}>
      {/* A shorter first screen than a product page's: the roles are what people came for. */}
      <Hero title={title} accent={accent ?? []} description={description} actions={actions} contentClassName="min-h-0 py-16 sm:py-20 lg:py-24" />
      <SiteSection id={rolesId} aria-labelledby={headingId} className="scroll-mt-(--header-offset,0px)">
        <SectionHeading title={<span id={headingId}>{rolesTitle}</span>} accent={rolesAccent} description={rolesDescription} />
        <SectionHeaderRule />
        {teams.length === 0 ? (
          <p className="text-body-lg leading-snug text-fg-muted">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col gap-12">
            {teams.map(([team, list]) => (
              <section key={team} aria-label={team} className="flex flex-col gap-6">
                <h3 className="flex items-baseline gap-3 text-h4 leading-heading font-normal tracking-snug text-fg">
                  {team}
                  <span className="text-body text-fg-subtle tabular-nums">{list.length}</span>
                </h3>
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {list.map((role) => (
                    <RoleCard key={role.href} role={role} applyLabel={applyLabel} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {note && <p className="mt-12 text-body leading-relaxed text-fg-muted [&_a]:text-fg-brand [&_a]:underline-offset-4 [&_a:hover]:underline">{note}</p>}
      </SiteSection>
    </div>
  );
}

export { CareersPage };

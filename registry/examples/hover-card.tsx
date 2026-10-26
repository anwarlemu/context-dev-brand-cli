import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function Member() {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-blue-10 text-body-sm text-fg-brand">MS</span>
      <div className="grid gap-0.5">
        <p className="text-body-sm text-fg">Maya Singh</p>
        <p className="text-caption text-fg-subtle">Admin · joined Mar 2026</p>
        <p className="mt-1.5 text-body-sm text-fg-muted">Created 12 API keys and 4 monitors in this workspace.</p>
      </div>
    </div>
  );
}

export function Site() {
  return (
    <p className="max-w-md text-body-sm text-fg-muted">
      Brand data for{" "}
      <HoverCard>
        <HoverCardTrigger href="#stripe" className="text-fg-brand underline-offset-4 hover:underline">
          stripe.com
        </HoverCardTrigger>
        <HoverCardContent>
          <p className="text-body-sm text-fg">Stripe</p>
          <p className="mt-0.5 text-caption text-fg-subtle">stripe.com · Financial services</p>
          <p className="mt-2 text-body-sm text-fg-muted">Logo, colors, fonts and 14 social profiles found in 380ms.</p>
        </HoverCardContent>
      </HoverCard>{" "}
      comes back as one JSON object.
    </p>
  );
}

export function Product() {
  return (
    <p className="text-body-sm text-fg-muted">
      Key created by{" "}
      <HoverCard>
        <HoverCardTrigger href="#maya" className="text-fg underline-offset-4 hover:underline">
          Maya Singh
        </HoverCardTrigger>
        <HoverCardContent>
          <Member />
        </HoverCardContent>
      </HoverCard>
    </p>
  );
}

export function Open() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger href="#maya" className="text-body-sm text-fg underline-offset-4 hover:underline">
        Maya Singh
      </HoverCardTrigger>
      <HoverCardContent side="bottom">
        <Member />
      </HoverCardContent>
    </HoverCard>
  );
}

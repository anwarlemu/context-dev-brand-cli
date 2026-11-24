"use client";

import { ErrorPage } from "@/components/site/error-page";
import { Button } from "@/components/ui/button";

function AcmeMark() {
  return (
    <svg viewBox="0 0 48 33" aria-hidden="true">
      <rect x="16" width="32" height="32" rx="2" fill="currentColor" />
      <circle cx="10" cy="23" r="10" fill="currentColor" />
    </svg>
  );
}

export function Site() {
  return (
    <ErrorPage
      logo={<AcmeMark />}
      homeHref="#home"
      homeLabel="Acme home"
      onRetry={() => new Promise((resolve) => setTimeout(resolve, 900))}
      secondaryAction={
        <Button asChild variant="pill-on-brand" className="border-white/40">
          <a href="#status">Check service status</a>
        </Button>
      }
      reference="7f3a9c21"
      note={
        <>
          If it keeps happening, <a href="#contact">contact support</a> with the reference.
        </>
      }
    />
  );
}

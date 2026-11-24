"use client";

import * as React from "react";

import { VerifyEmailPage, type VerifyEmailStatus } from "@/components/site/verify-email-page";

function AcmeMark() {
  return (
    <svg viewBox="0 0 48 33" aria-hidden="true">
      <rect x="16" width="32" height="32" rx="2" fill="currentColor" />
      <circle cx="10" cy="23" r="10" fill="currentColor" />
    </svg>
  );
}

export function Site() {
  const [status, setStatus] = React.useState<VerifyEmailStatus>("confirm");
  const [pending, setPending] = React.useState(false);

  return (
    <VerifyEmailPage
      status={status}
      email="jane@acme.dev"
      logo={<AcmeMark />}
      brandName="Acme"
      pending={pending}
      onConfirm={async () => {
        setPending(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setPending(false);
        setStatus("verified");
      }}
      actionHref="#dashboard"
    />
  );
}

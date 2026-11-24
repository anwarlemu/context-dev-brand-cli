"use client";

import * as React from "react";

import { AUTH_SUBMIT, AuthBrandMark } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RING_CLEAR_ATTRIBUTE, RingBackdrop } from "@/components/visuals/ring-backdrop";
import { cn } from "@/lib/utils";

// The page an emailed verification link opens: one white card on the blue panel of the sign in pages, on ruler hairlines
// that meet at grey nodes on all four corners, with a quiet line under it. Three states: asking to confirm (nothing is
// verified until the button is pressed), verified, and a link that did not work.

type VerifyEmailStatus = "confirm" | "verified" | "error";

const HAIRLINE = "absolute bg-rule";
const NODE = "absolute size-2 rounded-pill bg-node";
const RING_CLEAR = { [RING_CLEAR_ATTRIBUTE]: "" };
/** Long enough to read the confirmation, short enough that it never feels like a stop. */
const AUTO_PROCEED_MS = 1200;

const ICONS: Record<VerifyEmailStatus, React.ReactNode> = {
  confirm: (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 7.5L12 13L20 7.5M5.5 19H18.5C19.3284 19 20 18.3284 20 17.5V6.5C20 5.67157 19.3284 5 18.5 5H5.5C4.67157 5 4 5.67157 4 6.5V17.5C4 18.3284 4.67157 19 5.5 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    </svg>
  ),
  verified: (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  error: (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path d="M7 7L17 17M17 7L7 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
};
const STATUS_LABEL: Record<VerifyEmailStatus, string> = { confirm: "Email verification", verified: "Verified", error: "Error" };

/** The blue panel on its rulers, holding the step's card, with an optional line under it. */
function VerifyStage({ footer, children }: { footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main data-slot="verify-email-page" className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-clip bg-surface px-4 py-20 text-fg sm:px-8">
      <div className="relative w-fit max-w-full">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
          <div className={cn(HAIRLINE, "top-0 left-1/2 h-px w-[200vw] -translate-x-1/2")} />
          <div className={cn(HAIRLINE, "bottom-0 left-1/2 h-px w-[200vw] -translate-x-1/2")} />
          <div className={cn(HAIRLINE, "top-1/2 left-0 h-[200vh] w-px -translate-y-1/2")} />
          <div className={cn(HAIRLINE, "top-1/2 right-0 h-[200vh] w-px -translate-y-1/2")} />
          <span className={cn(NODE, "top-0 left-0 -translate-x-1/2 -translate-y-1/2")} />
          <span className={cn(NODE, "top-0 right-0 translate-x-1/2 -translate-y-1/2")} />
          <span className={cn(NODE, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2")} />
          <span className={cn(NODE, "right-0 bottom-0 translate-x-1/2 translate-y-1/2")} />
        </div>
        <div className="relative z-10 rounded-card bg-ring-tint p-2">
          <div className="relative rounded-card bg-brand p-3 sm:p-10">
            <RingBackdrop className="inset-2 rounded-card text-white md:inset-3" />
            <div {...RING_CLEAR} className="relative flex justify-center">
              {children}
            </div>
          </div>
        </div>
      </div>
      {footer && <div className="relative z-10 mt-4 max-w-135 text-center text-caption text-[var(--ds-color-neutral-50)] sm:text-body-sm">{footer}</div>}
    </main>
  );
}

/**
 * The whole page. `status` picks the state; each has the site's copy by default. On `confirm`, the button calls
 * `onConfirm` (spinning while it runs) and the app then sets `verified` or `error`. On the other two, the button is a
 * link to `actionHref`; with `autoProceed` a verified page calls `onProceed` after a moment, keeping the link as the
 * fallback.
 */
function VerifyEmailPage({
  status,
  email,
  logo,
  brandName,
  title,
  description,
  footer,
  onConfirm,
  pending = false,
  confirmLabel = "Verify email address",
  pendingLabel = "Verifying…",
  actionHref,
  actionLabel,
  autoProceed = false,
  onProceed,
  className,
}: {
  status: VerifyEmailStatus;
  /** The address being confirmed, shown in the confirm step's line. */
  email?: string;
  /** The logo mark in brand blue, beside `brandName` at the top of the card. */
  logo?: React.ReactNode;
  brandName?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** The quiet line under the panel. */
  footer?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  pending?: boolean;
  confirmLabel?: React.ReactNode;
  pendingLabel?: React.ReactNode;
  /** Where the verified or error button goes (the dashboard, or back to sign up). */
  actionHref?: string;
  actionLabel?: React.ReactNode;
  autoProceed?: boolean;
  onProceed?: () => void;
  className?: string;
}) {
  const proceed = React.useRef(onProceed);
  proceed.current = onProceed;
  React.useEffect(() => {
    if (status !== "verified" || !autoProceed) return;
    const timer = setTimeout(() => proceed.current?.(), AUTO_PROCEED_MS);
    return () => clearTimeout(timer);
  }, [status, autoProceed]);

  const copy = {
    confirm: {
      title: "Verify your email",
      description: (
        <>
          Confirm that <span className="font-medium break-all text-fg">{email}</span> is your email address.
        </>
      ),
      footer: "For your security, verification only happens after you press the button.",
      action: confirmLabel,
    },
    verified: {
      title: "Email verified",
      description: autoProceed ? "Taking you to your account…" : "Your email is verified. Continue to your dashboard to finish setup.",
      footer: "You can close this tab after continuing.",
      action: "Proceed to dashboard",
    },
    error: {
      title: "Verification link did not work",
      description: "Please close this tab and try again from the setup page.",
      footer: "Need a new link? Return to setup and resend the email.",
      action: "Back to signup",
    },
  }[status];

  return (
    <VerifyStage footer={footer ?? copy.footer}>
      <div className={cn("flex w-128 max-w-[calc(100vw-4.5rem)] flex-col gap-8 rounded-card bg-surface px-5 py-6 ring-1 ring-hairline sm:max-w-[calc(100vw-10rem)] sm:px-8 sm:py-8", className)}>
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          {brandName && <AuthBrandMark logo={logo}>{brandName}</AuthBrandMark>}
          <div className={cn("flex size-12 items-center justify-center rounded-pill ring-1 ring-hairline", status === "error" ? "bg-danger-soft text-danger" : "bg-blue-10 text-fg-brand")}>
            {ICONS[status]}
            <span className="sr-only">{STATUS_LABEL[status]}</span>
          </div>
          <div className="text-center">
            <h1 className="text-h4 font-normal tracking-tight text-balance text-fg sm:text-h3">{title ?? copy.title}</h1>
            <p role={status === "confirm" ? undefined : "status"} className="mt-2 text-body-sm text-fg-nav sm:mt-3 sm:text-body">
              {description ?? copy.description}
            </p>
          </div>
        </div>
        {status === "confirm" ? (
          <Button type="button" variant="pill" disabled={pending} onClick={() => void onConfirm?.()} className={AUTH_SUBMIT}>
            {pending && <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4" />}
            {pending ? pendingLabel : copy.action}
          </Button>
        ) : (
          actionHref && (
            <Button asChild variant="pill" className={AUTH_SUBMIT}>
              <a href={actionHref}>{actionLabel ?? copy.action}</a>
            </Button>
          )
        )}
      </div>
    </VerifyStage>
  );
}

export { VerifyEmailPage, type VerifyEmailStatus };

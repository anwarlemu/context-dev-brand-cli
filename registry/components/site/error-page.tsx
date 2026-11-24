"use client";

import * as React from "react";

import { NotFoundPage } from "@/components/site/not-found-page";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// A server error page. The site has none, so this is the 404 page (not-found-page) with a 500 in its dots: the same
// black page, logo, title and quiet line of links, with a retry pill first and no "Did you mean" suggestion.

/**
 * The 500 page. `onRetry` runs from the first pill (reset an error boundary, or reload); while a returned promise is
 * pending the pill spins and reads `retryingLabel`. `secondaryAction` is the second pill (home, or the status page);
 * give it `border-white/40` as on the 404. `reference` is the error's id, shown in the quiet line for support.
 */
function ErrorPage({
  code = "500",
  title = "Something went wrong on our side.",
  description = "The page could not be loaded. Try again, and if it keeps happening, let us know.",
  onRetry,
  retryLabel = "Try again",
  retryingLabel = "Trying again…",
  secondaryAction,
  reference,
  referenceLabel = "Error reference",
  note,
  logo,
  homeHref,
  homeLabel,
  overlay = false,
  className,
}: {
  code?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void | Promise<void>;
  retryLabel?: React.ReactNode;
  retryingLabel?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  reference?: string;
  referenceLabel?: React.ReactNode;
  /** The quiet line at the foot; its links are underlined. Follows the reference when both are given. */
  note?: React.ReactNode;
  logo?: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
  overlay?: boolean;
  className?: string;
}) {
  const [retrying, setRetrying] = React.useState(false);
  const retry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const footer =
    reference || note ? (
      <>
        {reference && (
          <>
            {referenceLabel} <code className="font-mono text-white/70">{reference}</code>.
          </>
        )}
        {reference && note && " "}
        {note}
      </>
    ) : undefined;

  return (
    <NotFoundPage
      code={code}
      title={title}
      description={description}
      knownPaths={[]}
      pathname=""
      logo={logo}
      homeHref={homeHref}
      homeLabel={homeLabel}
      overlay={overlay}
      className={className}
      note={footer}
      actions={
        onRetry || secondaryAction ? (
          <>
            {onRetry && (
              <Button variant="pill-on-brand" onClick={retry} disabled={retrying} aria-busy={retrying} className="gap-2 disabled:cursor-wait disabled:opacity-70">
                {retrying && <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4" />}
                {retrying ? retryingLabel : retryLabel}
              </Button>
            )}
            {secondaryAction}
          </>
        ) : undefined
      }
    />
  );
}

export { ErrorPage };

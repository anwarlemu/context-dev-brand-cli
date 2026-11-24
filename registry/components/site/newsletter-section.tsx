"use client";

import * as React from "react";
import { CircleCheck } from "lucide-react";

import { SectionHeading, SiteSection } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// A newsletter sign up band. The site has none, so it is built from library items only: a SiteSection with the
// SectionHeading on the left and, from lg, the form on the right in the contact page's card (white in a hairline ring,
// set in the soft blue ring): a Field with an Input and the black pill. Signing up swaps the form for a confirmation.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD = "h-auto min-h-11 rounded-card px-3 text-body";

/**
 * The newsletter band. `onSubmit` gets the trimmed address once it is valid; resolve to show `successTitle` and
 * `successDescription`, or throw an Error to show its message under the field. `privacy` is the line under the form.
 */
function NewsletterSection({
  title,
  accent,
  description,
  onSubmit,
  label = "Email",
  placeholder = "you@company.com",
  submitLabel = "Subscribe",
  sendingLabel = "Subscribing…",
  emptyMessage = "Enter your email.",
  invalidMessage = "Enter a valid email, like you@company.com.",
  failedMessage = "You could not be subscribed. Please try again.",
  successTitle = "You're subscribed.",
  successDescription,
  privacy,
  className,
}: {
  title: React.ReactNode;
  /** The heading's closing words, in brand blue. */
  accent?: React.ReactNode;
  description?: React.ReactNode;
  onSubmit: (email: string) => void | Promise<void>;
  label?: React.ReactNode;
  placeholder?: string;
  submitLabel?: React.ReactNode;
  sendingLabel?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  invalidMessage?: React.ReactNode;
  failedMessage?: React.ReactNode;
  successTitle?: React.ReactNode;
  /** The confirmation's text, from the address; by default it names the address. */
  successDescription?: (email: string) => React.ReactNode;
  privacy?: React.ReactNode;
  className?: string;
}) {
  const headingId = React.useId();
  const inputId = React.useId();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<React.ReactNode>();
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);
  const inFlight = React.useRef(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const address = email.trim();
    const problem = !address ? emptyMessage : !EMAIL_PATTERN.test(address) ? invalidMessage : undefined;
    setError(problem);
    if (problem) {
      document.getElementById(inputId)?.focus();
      return;
    }
    inFlight.current = true;
    setSending(true);
    try {
      await onSubmit(address);
      setSent(address);
    } catch (failure) {
      setError(failure instanceof Error && failure.message ? failure.message : failedMessage);
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  return (
    <SiteSection aria-labelledby={headingId} data-slot="newsletter-section" className={className}>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <SectionHeading title={<span id={headingId}>{title}</span>} accent={accent} description={description} />
        <div className="-m-2 rounded-card bg-ring-tint p-2">
          <div className="rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8">
            {sent ? (
              <div role="status" className="flex items-start gap-4">
                <CircleCheck aria-hidden="true" className="size-6 shrink-0 text-fg-brand" />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-h5 leading-snug text-fg">{successTitle}</p>
                  <p className="text-body leading-snug break-words text-fg-nav">
                    {successDescription ? (
                      successDescription(sent)
                    ) : (
                      <>
                        We will send the next issue to <strong className="font-normal text-fg">{sent}</strong>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate aria-busy={sending} aria-label="Newsletter sign up" className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Field label={label} error={error} className="min-w-0 flex-1">
                    <Input
                      id={inputId}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={placeholder}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError(undefined);
                      }}
                      className={FIELD}
                    />
                  </Field>
                  {/* Level with the input and as tall: the label's line and gap sit above the button on wide screens. */}
                  <Button
                    type="submit"
                    variant="pill"
                    disabled={sending}
                    className="w-full gap-2 disabled:cursor-wait disabled:opacity-60 sm:mt-[calc(var(--ds-text-body-sm)*var(--ds-leading-snug)+var(--ds-space-2))] sm:h-11 sm:w-auto sm:py-0"
                  >
                    {sending && <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4" />}
                    {sending ? sendingLabel : submitLabel}
                  </Button>
                </div>
                {privacy && <p className="text-body-sm leading-snug text-fg-nav [&_a]:text-fg-brand [&_a]:underline-offset-4 [&_a:hover]:underline">{privacy}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </SiteSection>
  );
}

export { NewsletterSection };

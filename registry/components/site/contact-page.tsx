"use client";

import * as React from "react";
import { ArrowUpRight, Check, CircleCheck, Copy, Loader2, Lock } from "lucide-react";

import { SectionHeaderRule, SectionHeading, SiteSection } from "@/components/site/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersonaGlyph } from "@/components/visuals/persona-glyph";
import { cn } from "@/lib/utils";

// The site's contact page: the first section under the header, a heading over the rule, then two columns from lg (two
// fifths and three fifths). On the left, three cards: the address (click to copy), the response time and a list of help
// links; on the right, the form in its own card. Every card is white in a hairline ring, set in the soft blue ring.
// Sending swaps the form for a confirmation card under the same heading.

type ContactValues = { name: string; email: string; company: string; message: string; website: string };
type ContactErrors = Partial<Record<"name" | "email" | "message" | "form", string>>;

const RING = "-m-2 rounded-card bg-ring-tint p-2";
const CARD = "rounded-card bg-surface p-6 ring-1 ring-hairline";
const FIELD = "h-auto min-h-11 rounded-card px-3 text-body";
const GLYPH = "size-10 rounded-card p-3";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactCard({ grow = false, className, children }: { grow?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(RING, grow && "flex flex-1 flex-col")}>
      <div className={cn(CARD, grow && "flex-1", className)}>{children}</div>
    </div>
  );
}

/**
 * The whole contact page. `onSubmit` gets the values once the name, a valid email and the message are filled; return
 * (or resolve) to show the confirmation, or throw an Error to show its message over the button. `website` is a hidden
 * honeypot field: anything in it came from a bot. `lockedEmail` fills and locks the email (a signed-in account's).
 */
function ContactPage({
  title,
  accent,
  description,
  email,
  emailDescription,
  responseTitle,
  responseDescription,
  helpTitle,
  helpLinks = [],
  onSubmit,
  lockedEmail,
  lockedEmailHint = "Using the email from your account.",
  privacy,
  requiredNote = "Company is optional. Every other field is required.",
  submitLabel = "Send message",
  sendingLabel = "Sending…",
  successTitle = "Message sent.",
  successDescription,
  homeHref = "/",
  homeLabel = "Back to home",
  emailIcon = <PersonaGlyph name="team" index={0} className={GLYPH} />,
  responseIcon = <PersonaGlyph name="history" index={1} className={GLYPH} />,
  className,
}: {
  title: React.ReactNode;
  /** The heading's closing words, in brand blue. */
  accent?: React.ReactNode;
  description?: React.ReactNode;
  /** The address in the first card; clicking it copies it. */
  email: string;
  emailDescription?: React.ReactNode;
  responseTitle?: React.ReactNode;
  responseDescription?: React.ReactNode;
  helpTitle?: React.ReactNode;
  helpLinks?: readonly { label: React.ReactNode; href: string; external?: boolean }[];
  onSubmit: (values: ContactValues) => void | Promise<void>;
  lockedEmail?: string;
  lockedEmailHint?: React.ReactNode;
  /** The line under the button (the privacy policy link). */
  privacy?: React.ReactNode;
  requiredNote?: React.ReactNode;
  submitLabel?: React.ReactNode;
  sendingLabel?: React.ReactNode;
  successTitle?: React.ReactNode;
  /** The confirmation's text, from the sent values; the site thanks the sender by first name. */
  successDescription?: (values: ContactValues) => React.ReactNode;
  homeHref?: string;
  homeLabel?: React.ReactNode;
  emailIcon?: React.ReactNode;
  responseIcon?: React.ReactNode;
  className?: string;
}) {
  const headingId = React.useId();
  const fieldId = React.useId();
  const [values, setValues] = React.useState<ContactValues>({ name: "", email: lockedEmail ?? "", company: "", message: "", website: "" });
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState<ContactValues | null>(null);
  const [copied, setCopied] = React.useState(false);
  const inFlight = React.useRef(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    if (lockedEmail) setValues((current) => ({ ...current, email: lockedEmail }));
  }, [lockedEmail]);
  React.useEffect(() => () => clearTimeout(copyTimer.current), []);

  const set = (key: keyof ContactValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const next: ContactErrors = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = "Enter a valid email, like you@company.com.";
    if (!values.message.trim()) next.message = "Enter a message.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = (["name", "email", "message"] as const).find((key) => next[key]);
      document.getElementById(`${fieldId}-${first}`)?.focus();
      return;
    }
    inFlight.current = true;
    setSending(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), company: values.company.trim() });
      setSent(values);
    } catch (error) {
      setErrors({ form: error instanceof Error && error.message ? error.message : "The message could not be sent. Please try again." });
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  return (
    <SiteSection lines header="below" aria-labelledby={headingId} data-slot="contact-page" className={className}>
      <SectionHeading
        as="h1"
        title={
          <span id={headingId}>
            {title}
            {accent && (
              <>
                {" "}
                <span className="text-fg-brand">{accent}</span>
              </>
            )}
          </span>
        }
        description={description}
      />
      <SectionHeaderRule />
      {sent ? (
        <div className="mx-auto max-w-2xl">
          <ContactCard className="sm:p-10">
            <CircleCheck aria-hidden="true" className="size-10 text-fg-brand" />
            <h2 className="mt-6 text-h3 leading-heading font-normal text-fg">{successTitle}</h2>
            <p role="status" className="mt-4 text-body-lg leading-relaxed break-words text-fg-nav">
              {successDescription ? (
                successDescription(sent)
              ) : (
                <>
                  Thanks for reaching out, <strong className="font-normal text-fg">{sent.name.trim().split(" ")[0]}</strong>. We will reply to{" "}
                  <strong className="font-normal text-fg">{sent.email.trim()}</strong>, usually within one business day.
                </>
              )}
            </p>
            <a href={homeHref} className={cn(buttonVariants({ variant: "pill-outline" }), "mt-7")}>
              {homeLabel}
            </a>
          </ContactCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <aside className="flex flex-col gap-6 lg:col-span-2">
            <ContactCard>
              <div className="flex items-center gap-4">
                {emailIcon}
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? "Email copied" : `Copy ${email} to the clipboard`}
                  className="group/email inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-card text-left text-h4 leading-snug font-normal text-fg outline-none transition-[color] duration-150 ease-out hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
                >
                  <span className="break-all">{email}</span>
                  <span className="relative inline-flex size-5 shrink-0 items-center justify-center text-fg/40 transition-[color] duration-150 ease-out group-hover/email:text-fg-brand motion-reduce:transition-none">
                    {/* The icons cross-fade in place; neither one moves. */}
                    <Copy aria-hidden="true" className={cn("absolute size-4 transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-[opacity]", copied ? "scale-90 opacity-0" : "scale-100 opacity-100")} />
                    <Check aria-hidden="true" className={cn("absolute size-4 text-fg-brand transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-[opacity]", copied ? "scale-100 opacity-100" : "scale-90 opacity-0")} />
                  </span>
                </button>
              </div>
              {emailDescription && <p className="mt-4 text-body leading-snug text-fg/65">{emailDescription}</p>}
              <p aria-live="polite" className="mt-1 text-body-sm leading-snug text-fg-nav">
                {copied ? "Copied to clipboard" : "Click the address to copy it"}
              </p>
            </ContactCard>

            {responseTitle && (
              <ContactCard>
                <div className="flex items-start gap-4">
                  {responseIcon}
                  <div className="flex flex-col gap-1">
                    <h2 className="text-h5 leading-snug font-normal text-fg">{responseTitle}</h2>
                    {responseDescription && <p className="text-body leading-snug text-fg/65">{responseDescription}</p>}
                  </div>
                </div>
              </ContactCard>
            )}

            {helpLinks.length > 0 && (
              <ContactCard grow>
                {helpTitle && <h2 className="text-h5 leading-snug font-normal text-fg">{helpTitle}</h2>}
                <ul className="mt-4 flex flex-col gap-1">
                  {helpLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                        className="group/link flex items-center justify-between gap-4 rounded-card py-1.5 text-body leading-snug text-fg-nav outline-none transition-[color] duration-150 ease-out hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
                      >
                        {link.label}
                        {/* The arrow takes the link's color on hover and stays where it is. */}
                        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-fg/35 transition-[color] duration-150 ease-out group-hover/link:text-fg-brand motion-reduce:transition-none" />
                      </a>
                    </li>
                  ))}
                </ul>
              </ContactCard>
            )}
          </aside>

          <div className="flex flex-col lg:col-span-3">
            <ContactCard grow className="md:p-8">
              <form onSubmit={submit} noValidate aria-label="Contact form" aria-busy={sending} className="grid gap-6">
                <div hidden>
                  <label htmlFor={`${fieldId}-website`}>Leave this empty</label>
                  <input id={`${fieldId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" error={errors.name} className="min-w-0">
                    <Input id={`${fieldId}-name`} name="name" type="text" placeholder="Your name" autoComplete="name" aria-required value={values.name} onChange={set("name")} className={FIELD} />
                  </Field>
                  {/* The lock sits outside the Field (which wires up each of its children), centered on the input. */}
                  <div className="relative min-w-0">
                    <Field label="Email" error={errors.email} help={lockedEmail ? lockedEmailHint : undefined}>
                      <Input
                        id={`${fieldId}-email`}
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        aria-required
                        readOnly={Boolean(lockedEmail)}
                        value={values.email}
                        onChange={set("email")}
                        className={cn(FIELD, lockedEmail && "cursor-not-allowed bg-neutral-5 pr-10 text-fg-nav")}
                      />
                    </Field>
                    {lockedEmail && (
                      <Lock
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[calc(var(--ds-text-body-sm)*var(--ds-leading-snug)+var(--ds-space-2)+var(--spacing)*5.5)] right-3 size-3.5 -translate-y-1/2 text-fg/40"
                      />
                    )}
                  </div>
                </div>

                <Field
                  label={
                    <>
                      Company <span className="text-fg-nav">(optional)</span>
                    </>
                  }
                >
                  <Input id={`${fieldId}-company`} name="company" type="text" placeholder="Your company" autoComplete="organization" value={values.company} onChange={set("company")} className={FIELD} />
                </Field>

                <Field label="Message" error={errors.message}>
                  <Textarea
                    id={`${fieldId}-message`}
                    name="message"
                    rows={6}
                    placeholder="What you are working on, what you need, or any questions you have."
                    aria-required
                    value={values.message}
                    onChange={set("message")}
                    className="rounded-card px-3 py-2 text-body"
                  />
                </Field>

                {requiredNote && <p className="text-body-sm leading-snug text-fg-nav">{requiredNote}</p>}

                {errors.form && (
                  <p role="alert" className="text-body-sm leading-snug text-danger">
                    {errors.form}
                  </p>
                )}

                <Button type="submit" variant="pill" disabled={sending} className="w-full gap-2 disabled:cursor-wait disabled:opacity-60">
                  {sending && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
                  {sending ? sendingLabel : submitLabel}
                </Button>

                {privacy && <p className="text-body-sm leading-snug text-fg-nav [&_a]:text-fg-brand [&_a]:underline-offset-4 [&_a:hover]:underline">{privacy}</p>}
              </form>
            </ContactCard>
          </div>
        </div>
      )}
    </SiteSection>
  );
}

export { ContactPage, type ContactValues };

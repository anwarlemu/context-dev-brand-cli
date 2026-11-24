"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";

import {
  AUTH_INPUT,
  AUTH_LINK,
  AUTH_MUTED_LINK,
  AUTH_NOTICE,
  AUTH_SUBMIT,
  AuthCard,
  AuthHeader,
  AuthLabel,
  AuthPageShell,
  AuthProofPanel,
  AuthSocialButtons,
  PasswordInput,
  type AuthProvider,
  type AuthTestimonial,
} from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// The site's sign in page, in two steps: the email first (with the providers under it), then the password, with a link
// to reset it and a way back. The app decides when to move to the password step (after looking up how the account
// signs in); the page checks that each field is filled and shows the app's errors under their fields.

type LoginStep = "email" | "password";
type LoginValues = { email: string; password: string; step: LoginStep };
type LoginErrors = { email?: React.ReactNode; password?: React.ReactNode };

/**
 * The whole sign in page. Inputs are controlled (`email`, `password` and their change handlers); `onSubmit` gets the
 * trimmed values once the current step's field is filled. `errors` from the app (a wrong password) show under their
 * fields; clear them in the change handlers, as the site does. `providers` are the round buttons under "or continue with" on the email step.
 */
function LoginPage({
  logo,
  title,
  subtitle,
  notice,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  step = "email",
  onBack,
  onSubmit,
  errors,
  pending = false,
  disabled = false,
  emailLocked = false,
  federatedNotice,
  providers = [],
  socialLabel,
  forgotPasswordHref,
  forgotPasswordLabel = "Forgot your password?",
  signupHref,
  signupPrompt = "Don't have an account?",
  signupLabel = "Sign up",
  continueLabel = "Continue",
  submitLabel = "Sign in",
  pendingLabel = "Signing in...",
  backLabel = "Go back",
  emailPlaceholder = "you@company.com",
  passwordPlaceholder = "Your password",
  emptyEmailMessage = "Enter your email address.",
  emptyPasswordMessage = "Enter your password.",
  legal,
  testimonials = [],
  className,
}: {
  /** The logo mark; with it the title shows as the brand mark (the plain sign in). */
  logo?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** A blue note under the heading (an invitation's address). */
  notice?: React.ReactNode;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  step?: LoginStep;
  /** Back from the password step to the email step. */
  onBack?: () => void;
  onSubmit: (values: LoginValues) => void | Promise<void>;
  errors?: LoginErrors;
  /** The submit is in flight: the button spins and reads `pendingLabel` on the password step. */
  pending?: boolean;
  /** Disables the form (a provider sign in is running). */
  disabled?: boolean;
  /** Locks the email (an invitation's). */
  emailLocked?: boolean;
  /** On the email step, a blue note under the email (an account that signs in only with a provider). */
  federatedNotice?: React.ReactNode;
  providers?: readonly AuthProvider[];
  socialLabel?: React.ReactNode;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: React.ReactNode;
  signupHref?: string;
  signupPrompt?: React.ReactNode;
  signupLabel?: React.ReactNode;
  continueLabel?: React.ReactNode;
  submitLabel?: React.ReactNode;
  pendingLabel?: React.ReactNode;
  backLabel?: React.ReactNode;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  emptyEmailMessage?: React.ReactNode;
  emptyPasswordMessage?: React.ReactNode;
  /** The line under the panel (the privacy policy and terms links). */
  legal?: React.ReactNode;
  /** Quotes for the right column from lg; none leaves the form alone in the page. */
  testimonials?: readonly AuthTestimonial[];
  className?: string;
}) {
  const fieldId = React.useId();
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const [checks, setChecks] = React.useState<LoginErrors>({});
  const isPasswordStep = step === "password";
  const busy = pending || disabled;

  React.useEffect(() => {
    if (isPasswordStep) requestAnimationFrame(() => passwordRef.current?.focus());
  }, [isPasswordStep]);

  const errorFor = (key: keyof LoginErrors) => checks[key] ?? errors?.[key];
  const clear = (key: keyof LoginErrors) => setChecks((current) => (current[key] ? { ...current, [key]: undefined } : current));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const trimmed = email.trim();
    const next: LoginErrors = {};
    if (!trimmed) next.email = emptyEmailMessage;
    if (isPasswordStep && !password) next.password = emptyPasswordMessage;
    setChecks(next);
    if (next.email || next.password) {
      document.getElementById(`${fieldId}-${next.email ? "email" : "password"}`)?.focus();
      return;
    }
    if (trimmed !== email) onEmailChange(trimmed);
    await onSubmit({ email: trimmed, password, step });
  };

  return (
    <AuthPageShell imageHeight={560} legal={legal} aside={testimonials.length > 0 ? <AuthProofPanel testimonials={testimonials} /> : undefined} className={className}>
      <AuthCard>
        <AuthHeader logo={logo} title={title} subtitle={subtitle} />
        {notice && <p className={cn(AUTH_NOTICE, "mx-auto mb-4 max-w-112")}>{notice}</p>}
        <div data-slot="login-page" className="mx-auto w-full max-w-112">
          <form onSubmit={submit} noValidate aria-busy={pending}>
            <div className="grid gap-4 sm:gap-5">
              <Field label={<AuthLabel>Email</AuthLabel>} error={errorFor("email")}>
                <Input
                  id={`${fieldId}-email`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(event) => {
                    onEmailChange(event.target.value);
                    clear("email");
                  }}
                  disabled={busy || emailLocked}
                  readOnly={emailLocked}
                  required
                  className={AUTH_INPUT}
                />
              </Field>
              {!isPasswordStep && federatedNotice && (
                <p role="status" className={AUTH_NOTICE}>
                  {federatedNotice}
                </p>
              )}
              {isPasswordStep && (
                // The reset link sits outside the Field (which wires up each of its children), level with the label.
                <div className="relative">
                  <Field label={<AuthLabel>Password</AuthLabel>} error={errorFor("password")}>
                    <PasswordInput
                      ref={passwordRef}
                      id={`${fieldId}-password`}
                      autoComplete="current-password"
                      placeholder={passwordPlaceholder}
                      value={password}
                      onChange={(event) => {
                        onPasswordChange(event.target.value);
                        clear("password");
                      }}
                      disabled={busy}
                      required
                      className={AUTH_INPUT}
                    />
                  </Field>
                  {forgotPasswordHref && (
                    <a href={forgotPasswordHref} className={cn(AUTH_MUTED_LINK, "absolute top-0 right-0 text-caption leading-snug sm:text-body-sm")}>
                      {forgotPasswordLabel}
                    </a>
                  )}
                </div>
              )}
              <Button type="submit" variant="pill" disabled={busy} className={cn(AUTH_SUBMIT, "sm:mt-1")}>
                {pending && <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4" />}
                {/* The email step can be pending too (the app looks up how the account signs in); it keeps reading "Continue". */}
                {isPasswordStep ? (pending ? pendingLabel : submitLabel) : continueLabel}
              </Button>
            </div>
          </form>

          {isPasswordStep ? (
            onBack && (
              <button type="button" onClick={onBack} disabled={busy} className={cn(AUTH_MUTED_LINK, "mx-auto mt-3 flex items-center gap-2 text-body-sm sm:mt-4 sm:text-body")}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {backLabel}
              </button>
            )
          ) : (
            <AuthSocialButtons providers={providers} disabled={busy} label={socialLabel} className="mt-3 sm:mt-4" />
          )}

          {!isPasswordStep && signupHref && (
            <p className="mt-6 text-center text-body-sm text-fg-nav sm:mt-8 sm:text-body">
              <span className="text-fg">{signupPrompt}</span>{" "}
              <a href={signupHref} className={AUTH_LINK}>
                {signupLabel}
              </a>
            </p>
          )}
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}

export { LoginPage, type LoginValues, type LoginErrors, type LoginStep };

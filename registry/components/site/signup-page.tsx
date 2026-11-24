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

// The site's sign up page, in two steps: the email (with the providers under it), then the name and a password. A blue
// note over the form says what the free plan includes. The button stays disabled until the step's fields are filled.

type SignupStep = "email" | "credentials";
type SignupValues = { email: string; name: string; password: string; step: SignupStep };
type SignupErrors = { email?: React.ReactNode; name?: React.ReactNode; password?: React.ReactNode };

/**
 * The whole sign up page. Inputs are controlled; `onSubmit` gets the trimmed values once the step's fields are filled,
 * and the app moves to the `credentials` step (after checking the address has no account yet). `errors` from the app
 * show under their fields; clear them in the change handlers.
 */
function SignupPage({
  logo,
  title,
  subtitle,
  notice,
  email,
  onEmailChange,
  name,
  onNameChange,
  password,
  onPasswordChange,
  step = "email",
  onBack,
  onSubmit,
  errors,
  pending = false,
  disabled = false,
  providers = [],
  socialLabel,
  loginHref,
  loginPrompt = "Already have an account?",
  loginLabel = "Sign in",
  footnote,
  continueLabel = "Continue",
  submitLabel = "Create account",
  pendingLabel = "Creating account...",
  backLabel = "Go back",
  emailPlaceholder = "jane@company.com",
  namePlaceholder = "Jane Doe",
  passwordPlaceholder = "••••••••••",
  emptyEmailMessage = "Enter your email address.",
  emptyNameMessage = "Enter your name.",
  emptyPasswordMessage = "Enter a password.",
  legal,
  testimonials = [],
  className,
}: {
  /** The logo mark; with it the title shows as the brand mark. */
  logo?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** The blue note over the form (what the free plan includes). */
  notice?: React.ReactNode;
  email: string;
  onEmailChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  step?: SignupStep;
  /** Back from the credentials step to the email step. */
  onBack?: () => void;
  onSubmit: (values: SignupValues) => void | Promise<void>;
  errors?: SignupErrors;
  pending?: boolean;
  disabled?: boolean;
  providers?: readonly AuthProvider[];
  socialLabel?: React.ReactNode;
  loginHref?: string;
  loginPrompt?: React.ReactNode;
  loginLabel?: React.ReactNode;
  /** A smaller line under the sign in link (the site points agents to its auth guide). */
  footnote?: React.ReactNode;
  continueLabel?: React.ReactNode;
  submitLabel?: React.ReactNode;
  pendingLabel?: React.ReactNode;
  backLabel?: React.ReactNode;
  emailPlaceholder?: string;
  namePlaceholder?: string;
  passwordPlaceholder?: string;
  emptyEmailMessage?: React.ReactNode;
  emptyNameMessage?: React.ReactNode;
  emptyPasswordMessage?: React.ReactNode;
  legal?: React.ReactNode;
  testimonials?: readonly AuthTestimonial[];
  className?: string;
}) {
  const fieldId = React.useId();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const [checks, setChecks] = React.useState<SignupErrors>({});
  const isCredentialsStep = step === "credentials";
  const busy = pending || disabled;
  const incomplete = isCredentialsStep ? !email.trim() || !name.trim() || !password : !email.trim();

  React.useEffect(() => {
    if (isCredentialsStep) requestAnimationFrame(() => nameRef.current?.focus());
  }, [isCredentialsStep]);

  const errorFor = (key: keyof SignupErrors) => checks[key] ?? errors?.[key];
  const clear = (key: keyof SignupErrors) => setChecks((current) => (current[key] ? { ...current, [key]: undefined } : current));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const next: SignupErrors = {};
    if (!trimmedEmail) next.email = emptyEmailMessage;
    if (isCredentialsStep && !trimmedName) next.name = emptyNameMessage;
    if (isCredentialsStep && !password) next.password = emptyPasswordMessage;
    setChecks(next);
    const first = (["email", "name", "password"] as const).find((key) => next[key]);
    if (first) {
      document.getElementById(`${fieldId}-${first}`)?.focus();
      return;
    }
    await onSubmit({ email: trimmedEmail, name: trimmedName, password, step });
  };

  return (
    <AuthPageShell imageHeight={696} imageMinHeight={648} legal={legal} aside={testimonials.length > 0 ? <AuthProofPanel testimonials={testimonials} /> : undefined} className={className}>
      <AuthCard>
        <AuthHeader logo={logo} title={title} subtitle={subtitle} />
        <div data-slot="signup-page" className="mx-auto w-full max-w-112">
          {notice && <div className={cn(AUTH_NOTICE, "mb-4 font-medium sm:mb-6")}>{notice}</div>}
          <form onSubmit={submit} noValidate aria-busy={pending}>
            <div className="grid gap-3 sm:gap-5">
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
                  disabled={busy}
                  required
                  className={AUTH_INPUT}
                />
              </Field>
              {isCredentialsStep && (
                <>
                  <Field label={<AuthLabel>Name</AuthLabel>} error={errorFor("name")}>
                    <Input
                      ref={nameRef}
                      id={`${fieldId}-name`}
                      type="text"
                      autoComplete="name"
                      placeholder={namePlaceholder}
                      value={name}
                      onChange={(event) => {
                        onNameChange(event.target.value);
                        clear("name");
                      }}
                      disabled={busy}
                      required
                      className={AUTH_INPUT}
                    />
                  </Field>
                  <Field label={<AuthLabel>Password</AuthLabel>} error={errorFor("password")}>
                    <PasswordInput
                      id={`${fieldId}-password`}
                      autoComplete="new-password"
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
                </>
              )}
              <Button type="submit" variant="pill" disabled={busy || incomplete} className={cn(AUTH_SUBMIT, "sm:mt-1")}>
                {pending && <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4" />}
                {isCredentialsStep ? (pending ? pendingLabel : submitLabel) : continueLabel}
              </Button>
              {!isCredentialsStep && <AuthSocialButtons providers={providers} disabled={busy} label={socialLabel} className="pt-1" />}
            </div>
          </form>

          {isCredentialsStep ? (
            onBack && (
              <button type="button" onClick={onBack} disabled={busy} className={cn(AUTH_MUTED_LINK, "mx-auto mt-3 flex items-center gap-2 text-body-sm sm:mt-4 sm:text-body")}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {backLabel}
              </button>
            )
          ) : (
            (loginHref || footnote) && (
              <div className="mt-6 space-y-2 text-center text-body-sm text-fg-nav sm:mt-8 sm:text-body">
                {loginHref && (
                  <p>
                    <span className="text-fg">{loginPrompt}</span>{" "}
                    <a href={loginHref} className={AUTH_LINK}>
                      {loginLabel}
                    </a>
                  </p>
                )}
                {footnote && <p className="text-body-sm [&_a]:rounded-sm [&_a]:text-fg-brand [&_a]:underline-offset-2 [&_a:hover]:underline">{footnote}</p>}
              </div>
            )
          )}
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}

export { SignupPage, type SignupValues, type SignupErrors, type SignupStep };

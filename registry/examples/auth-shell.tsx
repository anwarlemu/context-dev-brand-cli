"use client";

import * as React from "react";

import { AUTH_INPUT, AUTH_LINK, AUTH_SUBMIT, AuthCard, AuthHeader, AuthLabel, AuthPageShell, AuthProofPanel } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { ACME_TESTIMONIALS } from "./auth-samples";

// A reset password page in the same frame as sign in and sign up.
export function Site() {
  const [email, setEmail] = React.useState("");
  return (
    <AuthPageShell
      imageHeight={480}
      legal={
        <>
          By continuing you agree to our <a href="#privacy">Privacy Policy</a> and <a href="#terms">Terms of Service</a>
        </>
      }
      aside={<AuthProofPanel testimonials={ACME_TESTIMONIALS} />}
    >
      <AuthCard>
        <AuthHeader title="Reset your password" subtitle="We will email you a link to choose a new one." />
        <form onSubmit={(event) => event.preventDefault()} noValidate className="mx-auto grid w-full max-w-112 gap-4 sm:gap-5">
          <Field label={<AuthLabel>Email</AuthLabel>}>
            <Input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className={AUTH_INPUT} />
          </Field>
          <Button type="submit" variant="pill" className={AUTH_SUBMIT}>
            Send reset link
          </Button>
          <p className="text-center text-body-sm text-fg-nav sm:text-body">
            Remembered it? <a href="#login" className={AUTH_LINK}>Sign in</a>
          </p>
        </form>
      </AuthCard>
    </AuthPageShell>
  );
}

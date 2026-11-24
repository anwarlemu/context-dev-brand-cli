"use client";

import * as React from "react";
import { Building2, KeyRound } from "lucide-react";

import { LoginPage, type LoginErrors, type LoginStep } from "@/components/site/login-page";

import { ACME_TESTIMONIALS } from "./auth-samples";

function AcmeMark() {
  return (
    <svg viewBox="0 0 48 33" aria-hidden="true">
      <rect x="16" width="32" height="32" rx="2" fill="currentColor" />
      <circle cx="10" cy="23" r="10" fill="currentColor" />
    </svg>
  );
}

export function Site() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [step, setStep] = React.useState<LoginStep>("email");
  const [errors, setErrors] = React.useState<LoginErrors>({});
  const [pending, setPending] = React.useState(false);

  return (
    <LoginPage
      logo={<AcmeMark />}
      title="Acme"
      subtitle="Welcome back, dev."
      email={email}
      onEmailChange={(value) => {
        setEmail(value);
        setErrors((current) => ({ ...current, email: undefined }));
      }}
      password={password}
      onPasswordChange={(value) => {
        setPassword(value);
        setErrors((current) => ({ ...current, password: undefined }));
      }}
      step={step}
      onBack={() => setStep("email")}
      errors={errors}
      pending={pending}
      onSubmit={async ({ step: current }) => {
        setPending(true);
        await new Promise((resolve) => setTimeout(resolve, 700));
        setPending(false);
        if (current === "email") setStep("password");
        else setErrors({ password: "That password does not match this account. Try again or reset it." });
      }}
      providers={[
        { id: "sso", label: "single sign-on", icon: <Building2 strokeWidth={1.5} />, onClick: () => {} },
        { id: "passkey", label: "a passkey", icon: <KeyRound strokeWidth={1.5} />, onClick: () => {}, lastUsed: true },
      ]}
      forgotPasswordHref="#reset-password"
      signupHref="#signup"
      legal={
        <>
          By continuing you agree to our <a href="#privacy">Privacy Policy</a> and <a href="#terms">Terms of Service</a>
        </>
      }
      testimonials={ACME_TESTIMONIALS}
    />
  );
}

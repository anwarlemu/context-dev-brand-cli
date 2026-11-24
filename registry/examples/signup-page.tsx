"use client";

import * as React from "react";
import { Building2, KeyRound } from "lucide-react";

import { SignupPage, type SignupStep } from "@/components/site/signup-page";

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
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [step, setStep] = React.useState<SignupStep>("email");
  const [pending, setPending] = React.useState(false);

  return (
    <SignupPage
      logo={<AcmeMark />}
      title="Acme"
      subtitle="Integrate in 5 minutes"
      notice={
        <>
          Sign up free for <span className="tabular-nums">1,000 credits</span> a month.
        </>
      }
      email={email}
      onEmailChange={setEmail}
      name={name}
      onNameChange={setName}
      password={password}
      onPasswordChange={setPassword}
      step={step}
      onBack={() => setStep("email")}
      pending={pending}
      onSubmit={async ({ step: current }) => {
        if (current === "email") return setStep("credentials");
        setPending(true);
        await new Promise((resolve) => setTimeout(resolve, 900));
        setPending(false);
      }}
      providers={[
        { id: "sso", label: "single sign-on", icon: <Building2 strokeWidth={1.5} />, onClick: () => {} },
        { id: "passkey", label: "a passkey", icon: <KeyRound strokeWidth={1.5} />, onClick: () => {} },
      ]}
      loginHref="#login"
      footnote={
        <>
          Are you an AI agent? Use <a href="#auth-guide">the auth guide</a>
        </>
      }
      legal={
        <>
          By continuing you agree to our <a href="#privacy">Privacy Policy</a> and <a href="#terms">Terms of Service</a>
        </>
      }
      testimonials={ACME_TESTIMONIALS}
    />
  );
}

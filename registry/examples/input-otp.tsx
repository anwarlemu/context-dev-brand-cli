"use client";

import { useState } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp";

// On sign-in: the code from the email.
export function Site() {
  return (
    <div className="grid gap-3">
      <p id="code-label" className="text-body text-fg">Enter the code we emailed you</p>
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} aria-labelledby="code-label">
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

// Confirming a change to billing: two groups of three, a completed state, an invalid code and a disabled field.
export function Product() {
  const [code, setCode] = useState("");
  const done = code.length === 6;
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p id="confirm-label" className="text-body-sm text-fg">Confirmation code</p>
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={setCode} aria-labelledby="confirm-label">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p aria-live="polite" className="text-caption text-fg-subtle">{done ? "Code entered. Confirm to continue." : "Sent to anwar@acme.com."}</p>
      </div>
      <InputOTP maxLength={4} defaultValue="1234" aria-invalid aria-label="Invalid code">
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <InputOTP maxLength={4} disabled aria-label="Disabled code">
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

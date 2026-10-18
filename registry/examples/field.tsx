"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Product() {
  const [email, setEmail] = useState("anwar@");
  const [valid, setValid] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Field label="Webhook URL" htmlFor="hook" help="We POST every change here." required>
        <Input id="hook" type="url" placeholder="https://acme.com/hooks/context" />
      </Field>
      <Field label="Email" htmlFor="email" error={valid ? undefined : "Enter a valid email."} help="We'll send monitor updates here.">
        <Input id="email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setValid(event.target.validity.valid); }} />
      </Field>
    </div>
  );
}

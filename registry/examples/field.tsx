import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Field label="Webhook URL" htmlFor="hook" help="We POST every change here.">
        <Input id="hook" placeholder="https://acme.com/hooks/context" />
      </Field>
      <Field label="Email" htmlFor="email" error="Enter a valid email.">
        <Input id="email" defaultValue="anwar@" aria-invalid />
      </Field>
    </div>
  );
}

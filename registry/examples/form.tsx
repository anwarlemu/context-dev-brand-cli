"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Signup = { email: string };

// On the site: a sign-up with validation.
export function Site() {
  const form = useForm<Signup>({ defaultValues: { email: "" } });
  const [sent, setSent] = useState("");
  return (
    <Form {...form}>
      <form className="grid w-full max-w-sm gap-4" noValidate onSubmit={form.handleSubmit((v) => setSent(`We sent a sign-in link to ${v.email}.`))}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Enter your work email.", pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "That email does not look right." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="pill" className="w-fit">Start for free</Button>
        <p role="status" className="text-body-sm text-fg-muted empty:hidden">{sent}</p>
      </form>
    </Form>
  );
}

type Webhook = { name: string; url: string; retries: boolean };

// In the product: a webhook with a description, a URL check, a switch and a saving state.
export function Product() {
  const form = useForm<Webhook>({ defaultValues: { name: "Slack alerts", url: "", retries: true } });
  const [saved, setSaved] = useState("");
  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-md gap-5"
        noValidate
        onSubmit={form.handleSubmit(async (v) => {
          await new Promise((r) => setTimeout(r, 600));
          setSaved(`Saved ${v.name}.`);
        })}
      >
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name the webhook." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          rules={{ required: "Enter the URL to call.", pattern: { value: /^https:\/\//, message: "Use an https URL." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint URL</FormLabel>
              <FormControl>
                <Input placeholder="https://hooks.acme.com/context" {...field} />
              </FormControl>
              <FormDescription>Each monitor change is sent as a signed POST.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retries"
          render={({ field }) => (
            <FormItem className="flex-row items-center justify-between gap-4">
              <div className="grid gap-1">
                <FormLabel>Retry failed deliveries</FormLabel>
                <FormDescription>Up to five times over an hour.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save webhook"}
          </Button>
          <p role="status" className="text-body-sm text-fg-muted empty:hidden">{saved}</p>
        </div>
      </form>
    </Form>
  );
}

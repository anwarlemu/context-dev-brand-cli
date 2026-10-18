"use client";

import { useState } from "react";
import { UserMenu } from "@/components/product/user-menu";
import { Button } from "@/components/ui/button";
import { ExampleMessage, ExampleNameDialog } from "./demo-feedback";

export function Product() {
  const [name, setName] = useState("Ian Gerado");
  const [settings, setSettings] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  return <div className="grid w-64 gap-4">
    {loggedOut ? <><ExampleMessage>Signed out of this example.</ExampleMessage><Button variant="outline" onClick={() => setLoggedOut(false)}>Sign in again</Button></> : <UserMenu name={name} email="ian@acme.com" sections={[
      [{ label: "Settings", onSelect: () => setSettings(true) }, { label: "Share & get rewards", href: "https://context.dev/referrals", external: true }, { label: "Changelog", href: "https://context.dev/changelog", external: true }],
      [{ label: "Terms & conditions", href: "https://context.dev/terms", external: true }, { label: "Privacy policy", href: "https://context.dev/privacy", external: true }],
    ]} onLogOut={() => setLoggedOut(true)} />}
    <ExampleNameDialog title="Profile settings" label="Full name" open={settings} onOpenChange={setSettings} initial={name} onSave={setName} />
  </div>;
}

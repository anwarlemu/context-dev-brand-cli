"use client";

import * as React from "react";

import { SettingsDangerButton, SettingsField, SettingsNotice, SettingsRow, SettingsSection } from "@/components/product/settings-section";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function Product() {
  const [autoJoin, setAutoJoin] = React.useState(true);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-card">
        <SettingsField label="Organization name">{(id) => <Input id={id} defaultValue="Acme" />}</SettingsField>
      </section>
      <SettingsSection title="Auto-join by domain">
        <SettingsRow
          description={
            <>
              Anyone signing up with a verified <span className="text-fg">@acme.com</span> email can join as a Member.
            </>
          }
          action={<Switch checked={autoJoin} onCheckedChange={setAutoJoin} aria-label="Auto-join by domain" />}
        />
      </SettingsSection>
      <SettingsSection title="Danger zone">
        <SettingsRow title="Delete organization" description="Removes every teammate’s access and disables this organization’s API keys." action={<SettingsDangerButton>Delete organization</SettingsDangerButton>} />
      </SettingsSection>
      <SettingsNotice>Only the Owner can change domain auto-join and Enterprise SSO.</SettingsNotice>
    </div>
  );
}

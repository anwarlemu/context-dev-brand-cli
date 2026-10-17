"use client";

import * as React from "react";

import { SettingsDangerButton, SettingsField, SettingsNotice, SettingsRow, SettingsSection } from "@/components/product/settings-section";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function Product() {
  const [autoJoin, setAutoJoin] = React.useState(true);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <SettingsSection title="Organization">
        <SettingsRow>
          <SettingsField label="Organization name">{(id) => <Input id={id} defaultValue="Acme" />}</SettingsField>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="Members">
        <SettingsRow
          title="Auto-join by domain"
          description={
            <>
              Anyone signing up with a verified <span className="text-fg">@acme.com</span> email can join as a Member.
            </>
          }
          action={<Switch checked={autoJoin} onCheckedChange={setAutoJoin} aria-label="Auto-join by domain" />}
        />
        <SettingsRow muted title="Enterprise SSO" description="Members sign in through your identity provider." action={<Switch disabled aria-label="Enterprise SSO" />} />
      </SettingsSection>
      <SettingsNotice>Only the Owner can change domain auto-join and Enterprise SSO.</SettingsNotice>
      <SettingsSection title="Danger zone">
        <SettingsRow title="Delete organization" description="Removes every teammate’s access and disables this organization’s API keys." action={<SettingsDangerButton>Delete organization</SettingsDangerButton>} />
      </SettingsSection>
    </div>
  );
}

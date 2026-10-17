"use client";

import { AppShell } from "@/components/blocks/app-shell";
import { PageColumn, PageHeader, PageSection } from "@/components/product/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { HoldButton } from "@/components/ui/hold-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Settings: sections of fields on cards, each saved where it is; switches apply at once; the danger zone at the end
// asks for a hold.
export function SettingsPage() {
  return (
    <AppShell active="Settings">
      <PageColumn>
        <PageHeader title="Settings" description="Your workspace, notifications and billing." />
        <PageSection title="Workspace">
          <Card className="gap-5">
            <Field label="Name" htmlFor="ws-name">
              <Input id="ws-name" defaultValue="Acme" />
            </Field>
            <Field label="Default output" htmlFor="ws-format" help="Used when a request doesn't name a format.">
              <Select defaultValue="markdown">
                <SelectTrigger id="ws-format" appearance="field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end">
              <Button variant="black">Save</Button>
            </div>
          </Card>
        </PageSection>
        <PageSection title="Notifications">
          <Card className="gap-0 py-1">
            {[
              ["Monitor changes", "Email me when a page I watch changes.", true],
              ["Usage alerts", "Email me at 80% of my monthly credits.", true],
              ["Product updates", "A short note when something new ships.", false],
            ].map(([title, help, on], i) => (
              <div key={String(title)}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between gap-6 py-3">
                  <div>
                    <Label htmlFor={`n-${i}`}>{title}</Label>
                    <p className="text-caption text-fg-subtle">{help}</p>
                  </div>
                  <Switch id={`n-${i}`} defaultChecked={Boolean(on)} />
                </div>
              </div>
            ))}
          </Card>
        </PageSection>
        <PageSection title="Danger zone">
          <Card className="flex-row items-center justify-between gap-6">
            <div>
              <p className="text-body-sm text-fg">Delete this workspace</p>
              <p className="text-caption text-fg-subtle">Keys stop working at once. This cannot be undone.</p>
            </div>
            <HoldButton label="Delete workspace" onConfirm={() => {}} />
          </Card>
        </PageSection>
      </PageColumn>
    </AppShell>
  );
}

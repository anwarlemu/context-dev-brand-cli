"use client";

import * as React from "react";
import { CreditCard, ExternalLink, Info, Settings2, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/blocks/app-shell";
import { PageColumn, PageHeader } from "@/components/product/page";
import { SettingsDangerButton, SettingsField, SettingsRow, SettingsSection } from "@/components/product/settings-section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoldButton } from "@/components/ui/hold-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "personal", label: "Personal" },
  { value: "organization", label: "Organization" },
  { value: "billing", label: "Billing" },
  { value: "referrals", label: "Referrals" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const METER_DOTS = 20;
const INVOICES = [
  { number: "A1B2C3-0012", status: "paid", amount: "$49.00", created: "Oct 1, 2026" },
  { number: "A1B2C3-0011", status: "paid", amount: "$49.00", created: "Sep 1, 2026" },
  { number: "A1B2C3-0010", status: "open", amount: "$49.00", created: "Aug 1, 2026" },
];
const INVOICE_STATUS: Record<string, string> = { paid: "bg-success/10 text-success", open: "bg-warning/10 text-warning", uncollectible: "bg-danger/10 text-danger" };
const INVOICE_GRID = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_2rem]";

// Settings: the centered header, the four sections as tabs centered under it, then the open tab's cards. Each field
// saves on its own (a name when you leave the field, a switch at once); a danger zone ends Personal and Organization
// with a solid red button whose dialog asks for a hold. Referrals is a slot for your program's embed.
export function SettingsPage({ defaultTab = "personal", referrals }: { defaultTab?: Tab; referrals?: React.ReactNode }) {
  return (
    <AppShell active="Settings">
      <PageColumn className="gap-6">
        <PageHeader title="Settings" description="Manage your profile, organization details, subscription, billing, and referrals." />
        <Tabs defaultValue={defaultTab} className="gap-6">
          <TabsList aria-label="Settings section" className="self-center">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="personal" className="flex flex-col gap-6">
            <PersonalPanel />
          </TabsContent>
          <TabsContent value="organization" className="flex flex-col gap-6">
            <OrganizationPanel />
          </TabsContent>
          <TabsContent value="billing" className="flex flex-col gap-6">
            <BillingPanel />
          </TabsContent>
          <TabsContent value="referrals">{referrals ?? <p className="py-16 text-center text-body-sm text-fg-muted">Referrals are not available in this environment.</p>}</TabsContent>
        </Tabs>
      </PageColumn>
    </AppShell>
  );
}

function PersonalPanel() {
  const [editingEmail, setEditingEmail] = React.useState(false);
  const [nextEmail, setNextEmail] = React.useState("");
  const email = "ian@acme.com";
  const unchanged = nextEmail.trim().toLowerCase() === email;
  return (
    <>
      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-card">
        <SettingsField label="Full name">{(id) => <Input id={id} defaultValue="Ian Gerado" autoComplete="name" />}</SettingsField>
        <SettingsField
          label="Email"
          aside={
            !editingEmail && (
              <button type="button" onClick={() => setEditingEmail(true)} className="text-fg-brand outline-none hover:underline focus-visible:underline">
                Change
              </button>
            )
          }
        >
          {(id) =>
            editingEmail ? (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setEditingEmail(false);
                }}
              >
                <div className="flex gap-2">
                  <Input id={id} type="email" autoFocus required value={nextEmail} onChange={(e) => setNextEmail(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setEditingEmail(false)} placeholder="New email address" className="min-w-0 flex-1" />
                  <Button variant="ghost" size="md" onClick={() => setEditingEmail(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={!nextEmail.trim() || unchanged}>
                    Send link
                  </Button>
                </div>
                {nextEmail.trim() && unchanged && <p className="text-caption text-danger">That’s already your email.</p>}
              </form>
            ) : (
              <Input id={id} type="email" value={email} readOnly className="text-fg-muted" />
            )
          }
        </SettingsField>
        <SettingsField label="Time zone">
          {(id) => (
            <Select defaultValue="America/New_York">
              <SelectTrigger id={id} appearance="field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                <SelectItem value="Europe/London">Greenwich Mean Time (London)</SelectItem>
                <SelectItem value="Europe/Berlin">Central European Time (Berlin)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </SettingsField>
        <PhotoRow initials="IG" shape="circle" />
      </section>

      <DangerZone
        title="Delete account"
        description="Your account will be deactivated and removed from every organization. Organizations where you are the only member will be deleted, and their API keys will stop working immediately."
        dialogTitle="Delete your account?"
        dialogDescription="This deactivates your account, removes you from every organization, and deletes organizations where you are the only member. This cannot be undone from the dashboard."
        keepLabel="Keep my account"
        holdLabel="Hold to delete account"
      >
        <p className="text-body-sm text-fg-muted">
          This will permanently delete <span className="text-fg">{email}</span>.
        </p>
      </DangerZone>
    </>
  );
}

function PhotoRow({ initials, shape }: { initials: string; shape: "circle" | "rounded" }) {
  return (
    <div className="flex items-center gap-4">
      <span className={cn("grid size-16 shrink-0 place-items-center bg-brand text-h5 text-white", shape === "circle" ? "rounded-pill" : "rounded-card")}>{initials}</span>
      <div className="flex flex-col items-start gap-1.5">
        <Button variant="outline" size="sm">
          Upload photo
        </Button>
        {shape === "rounded" && <span className="text-caption text-fg-subtle">Square images work best.</span>}
      </div>
    </div>
  );
}

function OrganizationPanel() {
  const [autoJoin, setAutoJoin] = React.useState(true);
  return (
    <>
      <section className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-card">
        <SettingsField label="Organization name">{(id) => <Input id={id} defaultValue="Acme" placeholder="Enter organization name" autoComplete="organization" />}</SettingsField>
        <div className="flex flex-col gap-2">
          <span className="text-body-sm text-fg">Organization logo</span>
          <PhotoRow initials="A" shape="rounded" />
        </div>
      </section>

      <SettingsSection title="Auto-join by domain">
        <SettingsRow
          description={
            <>
              Anyone signing up with a verified <span className="text-fg">@acme.com</span> email can join as a Member. Removed teammates need a new invitation. Deactivated teammates must be reactivated.
            </>
          }
          action={<Switch checked={autoJoin} onCheckedChange={setAutoJoin} aria-label="Auto-join by domain" />}
        />
      </SettingsSection>

      <SettingsSection title="Zero data retention">
        <SettingsRow
          title={
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 shrink-0 text-success" strokeWidth={1.5} />
              Enabled
            </span>
          }
          description="Your API keys can send zdr=enabled on ZDR-capable endpoints. Contact support to make changes."
        />
      </SettingsSection>

      <DangerZone
        title="Delete organization"
        description="Removes every teammate’s access and disables this organization’s API keys and integrations. Your personal account stays active."
        dialogTitle="Delete Acme?"
        dialogDescription="All team access, API keys, and integrations for this organization will stop working. This cannot be undone from the dashboard."
        keepLabel="Keep my organization"
        holdLabel="Hold to delete organization"
      />
    </>
  );
}

function DangerZone({
  title,
  description,
  dialogTitle,
  dialogDescription,
  keepLabel,
  holdLabel,
  children,
}: {
  title: string;
  description: React.ReactNode;
  dialogTitle: string;
  dialogDescription: string;
  keepLabel: string;
  holdLabel: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <SettingsSection title="Danger zone">
      <SettingsRow title={title} description={description} action={<SettingsDangerButton onClick={() => setOpen(true)}>{title}</SettingsDangerButton>} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {children && <DialogBody>{children}</DialogBody>}
          <DialogFooter divider={false} className={cn(!children && "pt-5")}>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {keepLabel}
            </Button>
            <HoldButton label={holdLabel} onConfirm={() => setOpen(false)} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}

function BillingPanel() {
  const [autoTopup, setAutoTopup] = React.useState(true);
  const [spendAlerts, setSpendAlerts] = React.useState(false);
  const remaining = 41590;
  const total = 100000;
  const filled = Math.min(METER_DOTS, Math.max(1, Math.round((remaining / total) * METER_DOTS)));
  return (
    <>
      <section className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <GlyphTile name="upgrade" still className="size-10 p-1.5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm text-fg">Pro plan</p>
            <p className="flex flex-wrap items-center gap-x-1 text-body-sm text-fg-subtle tabular-nums">
              <span>Renews Nov 1 ·</span>
              <span>$49/month</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="brand" size="sm">
              Change plan
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Manage plan"
                className="grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover data-[state=open]:text-fg"
              >
                <Settings2 className="size-4" strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Billing portal</DropdownMenuItem>
                <DropdownMenuItem>Pause plan</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Cancel plan</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border-t border-line-subtle pt-5">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-body-sm text-fg-muted">Credits remaining</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-1.5 font-data leading-none tabular-nums">
                <span className="text-[calc(var(--ds-text-h5)*2+var(--ds-space-1))] text-fg-brand">{remaining.toLocaleString("en-US")}</span>
                <span className="font-sans text-body-sm font-normal text-fg-subtle">/{total.toLocaleString("en-US")}</span>
              </p>
            </div>
            <span className="flex h-7 shrink-0 items-center rounded-sm border border-line px-3 text-caption whitespace-nowrap text-fg-muted">Resets Nov 1</span>
          </div>
          <span className="mt-4 flex justify-between gap-0.5">
            <meter aria-label="Credits remaining" min={0} max={total} value={remaining} className="sr-only" />
            {Array.from({ length: METER_DOTS }, (_, i) => (
              <span key={i} aria-hidden className={cn("size-1.5 rounded-pill", i < filled ? "bg-brand" : "bg-blue-10")} />
            ))}
          </span>
          <div className="mt-2.5 flex justify-between gap-4 text-caption text-fg-subtle tabular-nums">
            <span>{(total - remaining).toLocaleString("en-US")} used this month</span>
            <span>{Math.round((remaining / total) * 100)}% left</span>
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line-subtle border-t border-line-subtle pt-4">
          <div className="pr-4">
            <dt className="text-caption text-fg-subtle">Monthly credits</dt>
            <dd className="mt-1 text-body-sm text-fg tabular-nums">100,000</dd>
          </div>
          <div className="px-4">
            <dt className="text-caption text-fg-subtle">Rate limit</dt>
            <dd className="mt-1 text-body-sm whitespace-nowrap text-fg tabular-nums">600/min</dd>
          </div>
          <div className="pl-4">
            <dt className="flex items-center gap-1 text-caption text-fg-subtle">
              Overage
              <Tooltip>
                <TooltipTrigger aria-label="About overage" className="text-fg-subtle outline-none focus-visible:text-fg">
                  <Info className="size-3.5" strokeWidth={1.5} />
                </TooltipTrigger>
                <TooltipContent side="top">Overage billed at $0.50 / 1K credits after your monthly allowance.</TooltipContent>
              </Tooltip>
            </dt>
            <dd className="mt-1 text-body-sm text-fg tabular-nums">$0.50 per 1K</dd>
          </div>
        </dl>

        <div className="flex items-center gap-3 border-t border-line-subtle pt-4">
          <span aria-hidden className="grid h-6 w-9 shrink-0 place-items-center rounded-sm border border-line bg-surface text-fg-subtle">
            <CreditCard className="size-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm text-fg">Visa ···· 4242</p>
            <p className="mt-0.5 text-caption text-fg-subtle tabular-nums">Expires 08/28 · Primary</p>
          </div>
          <Button variant="outline" size="sm">
            Update card
          </Button>
        </div>
      </section>

      <SettingsSection title="Auto-Topup">
        <SettingsRow title="Auto-Topup" description="Adds 1K credits whenever you run low, billed at your overage rate." action={<Switch checked={autoTopup} onCheckedChange={setAutoTopup} aria-label="Auto-Topup" />} />
        <SettingsRow title="Spend alerts" description="Email your team as Auto-Topup spend passes selected shares of your monthly overage budget." action={<Switch checked={spendAlerts} onCheckedChange={setSpendAlerts} aria-label="Spend alerts" />} />
      </SettingsSection>

      <SettingsSection title="Invoice history">
        <div className="-mx-5">
          <div className={cn(INVOICE_GRID, "hidden border-b border-line-subtle px-5 py-2.5 text-caption text-fg-subtle md:grid")}>
            <span>Invoice</span>
            <span>Status</span>
            <span>Amount paid</span>
            <span>Created</span>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="divide-y divide-line-subtle">
            {INVOICES.map((inv) => (
              <li key={inv.number} className={cn(INVOICE_GRID, "min-h-12 px-5 py-2 text-body-sm text-fg")}>
                <div className="min-w-0">
                  <p className="truncate">{inv.number}</p>
                  <p className="truncate text-caption text-fg-subtle md:hidden">
                    {inv.amount} · {inv.created}
                  </p>
                </div>
                <span className="hidden md:block">
                  <span className={cn("inline-flex h-6 items-center rounded-sm px-2.5 text-caption", INVOICE_STATUS[inv.status] ?? "bg-wash-hover text-fg-muted")}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                </span>
                <span className="hidden truncate tabular-nums md:block">{inv.amount}</span>
                <span className="hidden truncate tabular-nums md:block">{inv.created}</span>
                <button
                  type="button"
                  aria-label={`View invoice ${inv.number}`}
                  className="grid size-8 place-items-center justify-self-end rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <ExternalLink className="size-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>

    </>
  );
}

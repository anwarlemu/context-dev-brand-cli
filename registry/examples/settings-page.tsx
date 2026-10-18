import { SettingsPage } from "@/components/blocks/settings-page";

export function Block() {
  return <SettingsPage />;
}

export function Billing() {
  return <SettingsPage defaultTab="billing" />;
}

export function Organization() {
  return <SettingsPage defaultTab="organization" />;
}

export function Referrals() {
  return <SettingsPage defaultTab="referrals" referrals={<a href="https://context.dev" target="_blank" rel="noreferrer" className="text-body-sm text-fg-brand underline">Share Context.dev with your team</a>} />;
}

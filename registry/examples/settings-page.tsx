import { SettingsPage } from "@/components/blocks/settings-page";

export function Block() {
  return <SettingsPage />;
}

export function Billing() {
  return <SettingsPage defaultTab="billing" />;
}

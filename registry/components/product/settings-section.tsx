"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Settings as the dashboard lays them out: a quiet subtle-gray title just above a card (an aside, such as a link, can
// sit at its right), rows inside the card divided by a light line, each with a title, muted text and its control at
// the right (stacked under the text on a phone). Fields stack their label over the control; a notice is a card of
// muted text for what you can't change here.
function SettingsSection({ title, aside, className, children }: { title: React.ReactNode; aside?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="settings-section" className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4 px-1">
        <h3 className="text-body-sm font-normal text-fg-subtle">{title}</h3>
        {aside}
      </div>
      <div className="divide-y divide-line-subtle rounded-card bg-surface px-5 shadow-card">{children}</div>
    </section>
  );
}

function SettingsRow({ title, description, action, muted = false, children }: { title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; muted?: boolean; children?: React.ReactNode }) {
  return (
    <div data-slot="settings-row" className="flex flex-col gap-3 py-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className={cn("min-w-0 flex-1", muted && "opacity-50")}>
          {title && <div className="text-body-sm text-fg">{title}</div>}
          {description && <div className={cn("text-body-sm text-fg-muted", title && "mt-1")}>{description}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** A field on a settings card: its label (and an aside such as a "Change" link) over the control, given the id. */
function SettingsField({ label, aside, children }: { label: React.ReactNode; aside?: React.ReactNode; children: (id: string) => React.ReactNode }) {
  const id = React.useId();
  return (
    <div data-slot="settings-field" className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-body-sm text-fg">
        <label htmlFor={id}>{label}</label>
        {aside}
      </span>
      {children(id)}
    </div>
  );
}

function SettingsNotice({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div data-slot="settings-notice" className={cn("rounded-card bg-surface p-5 text-body-sm text-fg-muted shadow-card", className)}>{children}</div>;
}

/** The solid red button a danger zone ends on; the confirming dialog then asks for a hold. */
function SettingsDangerButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="settings-danger-button"
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-control bg-danger px-4 text-body-sm whitespace-nowrap text-white outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
      {...props}
    />
  );
}

export { SettingsDangerButton, SettingsField, SettingsNotice, SettingsRow, SettingsSection };

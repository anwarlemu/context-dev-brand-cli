"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, KeyRound, MoreVertical, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/blocks/app-shell";
import { DataToolbar, DataToolbarActions, DataToolbarSearch } from "@/components/product/data-toolbar";
import { EmptyState, EmptyStateRow } from "@/components/product/empty-state";
import { PageColumn, PageHeader } from "@/components/product/page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuHoldItem, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SecretField } from "@/components/ui/secret-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlyphTile } from "@/components/visuals/glyph/glyph-tile";
import { cn } from "@/lib/utils";

export type ApiKey = { id: string; name: string; secret: string; created: string; permissions: string; enabled: boolean; credits?: number };

const SAMPLE_KEYS: ApiKey[] = [
  { id: "1", name: "Production server", secret: "ctx_live_9f2c41b7e0a84d6c2b17", created: "Oct 2, 2026", permissions: "Full access", enabled: true, credits: 41880 },
  { id: "2", name: "Staging", secret: "ctx_live_1b8d03e94c2a7f5530ae", created: "Sep 14, 2026", permissions: "2 permissions", enabled: true, credits: 1204.5 },
  { id: "3", name: "Default", secret: "ctx_live_77aa20cd5e1b9f03c4d8", created: "Mar 3, 2026", permissions: "Full access", enabled: false, credits: 0 },
];

// The secret shows its first 14 characters before the mask, enough to tell keys apart.
const VISIBLE_SECRET_CHARS = 14;
const FREE_KEY_LIMIT = 2;
const PAID_KEY_LIMIT = 50;
const credits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

// The API keys page: the centered header with the one brand action, the free plan's key allowance on a card, the
// search and a status filter, then the keys on a card: name with when it was made, the masked key, permissions,
// status, 30-day usage and a row menu whose disable and delete ask for a hold. With no keys at all the page is a
// centered empty state instead; a search that matches nothing keeps the table and says so in one row.
export function TablePage({ keys = SAMPLE_KEYS, plan = "free" }: { keys?: ApiKey[]; plan?: "free" | "paid" }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const isPaid = plan === "paid";
  const limit = isPaid ? PAID_KEY_LIMIT : FREE_KEY_LIMIT;
  const isAtLimit = keys.length >= limit;
  const q = query.trim().toLowerCase();
  const rows = keys.filter((k) => (!q || k.name.toLowerCase().includes(q) || k.secret.toLowerCase().includes(q)) && (status === "all" || (status === "active") === k.enabled));
  const createButton = (
    <Button variant="brand" size="sm" disabled={isAtLimit} onClick={() => setCreateOpen(true)}>
      <Plus className="size-3.5" strokeWidth={1.75} />
      Create API key
    </Button>
  );

  return (
    <AppShell active="API keys">
      {keys.length === 0 ? (
        <PageColumn className="flex-1">
          <EmptyState
            fill
            as="h1"
            glyph={<GlyphTile name="apiKeys" className="size-16 p-2" />}
            title="No API keys yet"
            description="Use these keys to authenticate requests to the API. Keep them secret."
            actions={createButton}
          />
        </PageColumn>
      ) : (
        <PageColumn className="gap-6">
          <PageHeader
            title="API Keys"
            description="Use these keys to authenticate requests to the API."
            action={isAtLimit ? <span title={isPaid ? `Your plan includes ${limit} keys.` : "Upgrade your plan to create more keys"}>{createButton}</span> : createButton}
          />

          {!isPaid && (
            <section className="flex items-center gap-6 rounded-card bg-surface px-5 py-4 shadow-card">
              <div className="min-w-0 flex-1">
                <p className="text-body-sm text-fg">
                  You’ve used {keys.length} of {limit} API keys on the Free plan.
                </p>
                <p className="mt-1 text-body-sm text-fg-muted">
                  {keys.length > limit ? "Existing keys keep working, but creating another key requires upgrading." : `Upgrade to create up to ${PAID_KEY_LIMIT} named keys, rotate them anytime, and scope each one to the APIs it needs.`}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View plans
                <ArrowRight className="size-3.5" strokeWidth={1.5} />
              </Button>
            </section>
          )}

          <DataToolbar>
            <DataToolbarSearch value={query} onValueChange={setQuery} placeholder="Search keys" label="Search API keys" />
            <DataToolbarActions>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger appearance="ghost" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All statuses</SelectItem>
                  {keys.some((k) => k.enabled) && <SelectItem value="active">Active</SelectItem>}
                  {keys.some((k) => !k.enabled) && <SelectItem value="disabled">Disabled</SelectItem>}
                </SelectContent>
              </Select>
            </DataToolbarActions>
          </DataToolbar>

          {/* On a phone only the name, key and actions show, in fixed columns so the key truncates inside the card. */}
          <Table aria-label="API keys" className="max-sm:table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-3">Name</TableHead>
                <TableHead className="px-3">Key</TableHead>
                <TableHead className="hidden px-3 xl:table-cell">Permissions</TableHead>
                <TableHead className="hidden px-3 sm:table-cell">Status</TableHead>
                <TableHead className="hidden px-3 lg:table-cell">Usage</TableHead>
                <TableHead className="w-12 px-3">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <EmptyStateRow colSpan={6}>No keys match these filters.</EmptyStateRow>}
              {rows.map((k) => (
                <ApiKeyRow key={k.id} apiKey={k} canDelete={keys.length > 1} canRename={isPaid} />
              ))}
            </TableBody>
          </Table>
        </PageColumn>
      )}
      <CreateKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppShell>
  );
}

function ApiKeyRow({ apiKey: k, canDelete, canRename }: { apiKey: ApiKey; canDelete: boolean; canRename: boolean }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="px-3">
        <span className="flex items-center gap-2.5">
          <KeyRound className={cn("size-4 shrink-0", k.enabled ? "text-brand" : "text-fg-subtle")} strokeWidth={1.5} />
          <span className="min-w-0">
            <span className="block truncate" title={k.name}>
              {k.name}
            </span>
            <span className="block text-caption whitespace-nowrap text-fg-subtle">Created {k.created}</span>
          </span>
        </span>
      </TableCell>
      <TableCell className="px-3">
        <SecretField secret={k.secret} visibleChars={VISIBLE_SECRET_CHARS} label={`${k.name} key`} className="w-full max-w-75" />
      </TableCell>
      <TableCell className="hidden px-3 xl:table-cell">
        <button type="button" aria-label={`Edit permissions for ${k.name}`} className="whitespace-nowrap text-fg-muted underline-offset-4 outline-none transition-colors duration-150 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-focus-ring">
          {k.permissions}
        </button>
      </TableCell>
      <TableCell className="hidden px-3 sm:table-cell">
        <span className={cn("flex items-center gap-1.5", k.enabled ? "text-success" : "text-fg-subtle")}>
          <span className={cn("size-1.5 rounded-pill", k.enabled ? "bg-success" : "bg-neutral-30")} aria-hidden />
          {k.enabled ? "Active" : "Disabled"}
        </span>
      </TableCell>
      <TableCell className="hidden px-3 lg:table-cell">
        <a href="#usage" onClick={(e) => e.preventDefault()} title="Credits consumed in the last 30 days" className="group flex items-center gap-1 whitespace-nowrap text-fg-subtle no-underline outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          {k.credits === undefined ? (
            <span className="text-fg-muted">Usage unavailable</span>
          ) : (
            <span className="tabular-nums">
              <span className="text-fg decoration-fg/25 underline-offset-4 group-hover:underline">{credits.format(k.credits)}</span> credits · 30d
            </span>
          )}
          <ArrowUpRight
            aria-hidden
            className="size-3.5 shrink-0 opacity-0 transition-[opacity,translate] duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
            strokeWidth={1.5}
          />
        </a>
      </TableCell>
      <TableCell className="px-3 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${k.name}`}
            className="grid size-8 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-focus-ring data-[state=open]:bg-wash-hover data-[state=open]:text-fg"
          >
            <MoreVertical className="size-4" strokeWidth={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil strokeWidth={1.5} />
              {canRename ? "Edit name and permissions" : "Edit permissions"}
            </DropdownMenuItem>
            {k.enabled ? (
              <DropdownMenuHoldItem onConfirm={() => {}} className="text-fg-muted data-[highlighted]:bg-wash-hover data-[highlighted]:text-fg">
                <Pause strokeWidth={1.5} />
                Disable key
              </DropdownMenuHoldItem>
            ) : (
              <DropdownMenuItem>
                <Play strokeWidth={1.5} />
                Enable key
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuHoldItem onConfirm={() => {}}>
                <Trash2 strokeWidth={1.5} />
                Delete key
              </DropdownMenuHoldItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function CreateKeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const error = tried && !name.trim() ? "Give the key a name so you can tell it apart." : undefined;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setName("");
          setTried(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>Name the key after where it’ll run, and limit it to the APIs that app needs.</DialogDescription>
        </DialogHeader>
        <form
          id="create-key"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (name.trim()) onOpenChange(false);
          }}
        >
          <DialogBody>
            <Field label="Name" htmlFor="key-name" error={error}>
              <Input id="key-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" aria-invalid={error ? true : undefined} />
            </Field>
          </DialogBody>
        </form>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="brand" size="sm" type="submit" form="create-key">
            Create key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
